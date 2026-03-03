import fs from "node:fs/promises";
import path from "node:path";
import { chromium, type Browser, type BrowserContext } from "playwright";
import pLimit from "p-limit";
import type {
  SiteSnapOptions,
  Manifest,
  PageRecord,
  AssetRecord,
  FailureRecord,
  RedirectRecord,
} from "./types.js";
import {
  normalizeUrl,
  normalizeAssetUrl,
  isSameOrigin,
  isSkippableUrl,
  isNonHttpLink,
  urlToLocalPagePath,
} from "./url-utils.js";
import { RobotsChecker } from "./robots.js";
import { downloadAsset } from "./asset-downloader.js";
import { extractAssetUrls, rewriteHtml } from "./html-rewriter.js";
import { rewriteCssUrls, extractCssUrls } from "./css-rewriter.js";

/**
 * Main crawler class.
 * Orchestrates BFS crawling with Playwright, asset downloading, and HTML rewriting.
 */
export class Crawler {
  private opts: SiteSnapOptions;
  private manifest: Manifest;
  private visited = new Set<string>(); // normalised URLs already visited or queued
  private queue: string[] = []; // BFS queue of URLs to crawl
  private pageMap = new Map<string, string>(); // normalised page URL -> local path
  private assetMap = new Map<string, string>(); // asset URL -> local path
  private assetDownloading = new Set<string>(); // assets currently being downloaded
  private robots: RobotsChecker;
  private shuttingDown = false;
  private browser: Browser | null = null;

  constructor(opts: SiteSnapOptions) {
    this.opts = opts;
    this.robots = new RobotsChecker();
    this.manifest = {
      startTime: new Date().toISOString(),
      startUrl: opts.url,
      pages: [],
      assets: [],
      failures: [],
      redirects: [],
      notes: [],
    };
  }

  /**
   * Run the crawl. Returns the manifest.
   */
  async run(): Promise<Manifest> {
    const { opts } = this;

    // Set up graceful shutdown
    const shutdownHandler = async () => {
      if (this.shuttingDown) return;
      this.shuttingDown = true;
      console.log("\nGraceful shutdown requested. Writing manifest...");
      await this.writeManifest();
      await this.cleanup();
      process.exit(0);
    };
    process.on("SIGINT", shutdownHandler);
    process.on("SIGTERM", shutdownHandler);

    try {
      // Ensure output directory exists
      await fs.mkdir(opts.out, { recursive: true });

      // Load robots.txt if configured
      if (opts.respectRobots) {
        const origin = new URL(opts.url).origin;
        console.log(`Fetching robots.txt from ${origin}...`);
        await this.robots.load(origin, opts.userAgent);
        if (this.robots.fetchError) {
          console.log(`  Warning: ${this.robots.fetchError}`);
          this.manifest.notes.push(this.robots.fetchError);
        } else {
          console.log("  robots.txt loaded successfully.");
        }
      }

      // Launch Playwright browser
      console.log("Launching browser...");
      this.browser = await chromium.launch({ headless: true });
      const context = await this.browser.newContext({
        userAgent: opts.userAgent,
        ignoreHTTPSErrors: true,
      });

      // Seed the queue with the start URL
      const startNorm = normalizeUrl(opts.url);
      this.queue.push(startNorm);
      this.visited.add(startNorm);

      // BFS with concurrency control
      const limit = pLimit(opts.concurrency);

      console.log(`Starting crawl from ${opts.url}`);
      console.log(
        `  maxPages=${opts.maxPages}, concurrency=${opts.concurrency}, delay=${opts.delayMs}ms`,
      );

      while (this.queue.length > 0 && !this.shuttingDown) {
        // Take a batch from the queue
        const batch = this.queue.splice(0, opts.concurrency);
        const tasks = batch.map((url) =>
          limit(() => this.processPage(context, url)),
        );
        await Promise.allSettled(tasks);
      }

      // Now do a second pass: rewrite all saved HTML files with final asset + page maps
      if (!this.shuttingDown) {
        console.log("\nRewriting HTML files with final asset and page maps...");
        await this.rewriteAllPages();
      }

      this.manifest.endTime = new Date().toISOString();
      await this.writeManifest();
      await this.cleanup();

      console.log("\nCrawl complete!");
      console.log(
        `  Pages: ${this.manifest.pages.length}, Assets: ${this.manifest.assets.length}, Failures: ${this.manifest.failures.length}`,
      );

      return this.manifest;
    } finally {
      process.off("SIGINT", shutdownHandler);
      process.off("SIGTERM", shutdownHandler);
    }
  }

  /**
   * Process a single page: navigate, extract content, discover links and assets.
   */
  private async processPage(context: BrowserContext, url: string): Promise<void> {
    if (this.shuttingDown) return;
    if (this.manifest.pages.length >= this.opts.maxPages) return;

    // Check robots.txt
    if (this.opts.respectRobots) {
      try {
        const u = new URL(url);
        if (!this.robots.isAllowed(u.pathname, this.opts.userAgent)) {
          console.log(`  [robots] Skipping disallowed: ${url}`);
          return;
        }
      } catch { /* proceed */ }
    }

    const page = await context.newPage();
    try {
      console.log(`  [${this.manifest.pages.length + 1}/${this.opts.maxPages}] ${url}`);

      // Navigate with timeout
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: this.opts.renderTimeoutMs,
      });

      if (!response) {
        this.manifest.failures.push({ url, error: "No response from page" });
        return;
      }

      const status = response.status();
      const finalUrl = page.url();

      // Record redirect if different
      if (normalizeUrl(finalUrl) !== normalizeUrl(url)) {
        this.manifest.redirects.push({ from: url, to: finalUrl });
      }

      // Skip non-HTML responses
      const contentType = response.headers()["content-type"] || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
        // This might be a PDF or other asset, download it instead
        if (status >= 200 && status < 400) {
          await this.enqueueAssetDownload(finalUrl);
        }
        return;
      }

      // Wait a bit for any remaining JS rendering
      await page.waitForTimeout(500);

      // Get the rendered HTML
      const html = await page.content();
      const title = await page.title();

      // Determine local path for this page
      const localPath = urlToLocalPagePath(finalUrl);
      const fullPath = path.join(this.opts.out, localPath);

      // Save raw HTML (will be rewritten later in the second pass)
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, html, "utf-8");

      // Register in page map (both original and final URL)
      this.pageMap.set(normalizeUrl(url), localPath);
      this.pageMap.set(normalizeUrl(finalUrl), localPath);

      // Record in manifest
      const record: PageRecord = {
        originalUrl: url,
        finalUrl,
        localPath,
        status,
        title,
      };
      this.manifest.pages.push(record);

      // Extract asset URLs and enqueue downloads
      const assetUrls = extractAssetUrls(html, finalUrl);
      for (const assetUrl of assetUrls) {
        await this.enqueueAssetDownload(assetUrl);
      }

      // Extract links for further crawling
      const { linkUrls } = rewriteHtml(
        html,
        finalUrl,
        localPath,
        new Map(),
        new Map(),
      );

      for (const linkUrl of linkUrls) {
        this.enqueuePageUrl(linkUrl);
      }

      // Respect delay between navigations
      if (this.opts.delayMs > 0) {
        await delay(this.opts.delayMs);
      }
    } catch (err) {
      this.manifest.failures.push({
        url,
        error: (err as Error).message,
      });
      console.log(`  [FAIL] ${url}: ${(err as Error).message}`);
    } finally {
      await page.close();
    }
  }

  /**
   * Add a page URL to the crawl queue if it hasn't been seen.
   */
  private enqueuePageUrl(rawUrl: string): void {
    if (isNonHttpLink(rawUrl)) return;
    if (isSkippableUrl(rawUrl)) return;
    if (!isSameOrigin(rawUrl, this.opts.url, this.opts.includeSubdomains)) return;
    if (this.manifest.pages.length + this.queue.length >= this.opts.maxPages) return;

    const norm = normalizeUrl(rawUrl);
    if (this.visited.has(norm)) return;

    this.visited.add(norm);
    this.queue.push(norm);
  }

  /**
   * Download an asset if not already downloaded.
   * Normalizes the URL before checking/storing in the asset map for consistent lookups.
   */
  private async enqueueAssetDownload(assetUrl: string): Promise<void> {
    // Skip data URIs
    if (assetUrl.startsWith("data:")) return;

    const normUrl = normalizeAssetUrl(assetUrl);
    if (this.assetMap.has(normUrl)) return;
    if (this.assetDownloading.has(normUrl)) return;

    this.assetDownloading.add(normUrl);

    const result = await downloadAsset(
      assetUrl,
      this.opts.out,
      this.opts.userAgent,
    );

    if (result.asset) {
      // Store under both the normalised URL and the raw URL for reliable lookups
      this.assetMap.set(normUrl, result.asset.localPath);
      if (assetUrl !== normUrl) {
        this.assetMap.set(assetUrl, result.asset.localPath);
      }
      this.manifest.assets.push(result.asset);

      // If it's a CSS file, parse it for further url() references
      if (result.asset.contentType?.includes("text/css") || assetUrl.endsWith(".css")) {
        await this.processCssAsset(assetUrl, result.asset.localPath);
      }
    }
    if (result.failure) {
      this.manifest.failures.push(result.failure);
    }
  }

  /**
   * Parse a downloaded CSS file and download any url()/@import assets it references.
   */
  private async processCssAsset(cssUrl: string, localCssPath: string): Promise<void> {
    try {
      const fullPath = path.join(this.opts.out, localCssPath);
      const cssText = await fs.readFile(fullPath, "utf-8");
      const urls = extractCssUrls(cssText, cssUrl);
      for (const u of urls) {
        await this.enqueueAssetDownload(u);
      }
    } catch { /* skip read errors */ }
  }

  /**
   * Second pass: rewrite all saved HTML pages with the complete asset and page maps.
   */
  private async rewriteAllPages(): Promise<void> {
    for (const pageRecord of this.manifest.pages) {
      const fullPath = path.join(this.opts.out, pageRecord.localPath);
      try {
        const html = await fs.readFile(fullPath, "utf-8");
        const { html: rewritten } = rewriteHtml(
          html,
          pageRecord.finalUrl,
          pageRecord.localPath,
          this.assetMap,
          this.pageMap,
        );
        await fs.writeFile(fullPath, rewritten, "utf-8");
      } catch (err) {
        console.log(`  Warning: Failed to rewrite ${pageRecord.localPath}: ${(err as Error).message}`);
      }
    }

    // Also rewrite CSS files
    for (const assetRecord of this.manifest.assets) {
      if (
        assetRecord.contentType?.includes("text/css") ||
        assetRecord.localPath.endsWith(".css")
      ) {
        const fullPath = path.join(this.opts.out, assetRecord.localPath);
        try {
          const cssText = await fs.readFile(fullPath, "utf-8");
          const cssDir = path.posix.dirname(assetRecord.localPath);
          const rewritten = rewriteCssUrls(
            cssText,
            cssDir,
            this.assetMap,
            assetRecord.originalUrl,
          );
          await fs.writeFile(fullPath, rewritten, "utf-8");
        } catch { /* skip */ }
      }
    }
  }

  /**
   * Write manifest.json to the output directory.
   */
  private async writeManifest(): Promise<void> {
    const manifestPath = path.join(this.opts.out, "manifest.json");
    await fs.writeFile(
      manifestPath,
      JSON.stringify(this.manifest, null, 2),
      "utf-8",
    );
    console.log(`Manifest written to ${manifestPath}`);
  }

  /**
   * Close the browser.
   */
  private async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
