import * as cheerio from "cheerio";
import path from "node:path";
import { rewriteCssUrls } from "./css-rewriter.js";

/**
 * Attributes that may contain asset URLs, grouped by element tag.
 * We process each to rewrite URLs to local copies.
 */
const ASSET_ATTRS: Array<{ selector: string; attr: string }> = [
  { selector: "img[src]", attr: "src" },
  { selector: "img[srcset]", attr: "srcset" },
  { selector: "source[src]", attr: "src" },
  { selector: "source[srcset]", attr: "srcset" },
  { selector: "video[src]", attr: "src" },
  { selector: "video[poster]", attr: "poster" },
  { selector: "audio[src]", attr: "src" },
  { selector: "script[src]", attr: "src" },
  { selector: 'link[rel="stylesheet"][href]', attr: "href" },
  { selector: 'link[rel="icon"][href]', attr: "href" },
  { selector: 'link[rel="shortcut icon"][href]', attr: "href" },
  { selector: 'link[rel="apple-touch-icon"][href]', attr: "href" },
  { selector: "object[data]", attr: "data" },
  { selector: "embed[src]", attr: "src" },
];

/** Attributes that contain page links (for crawl + rewriting). */
const LINK_ATTRS: Array<{ selector: string; attr: string }> = [
  { selector: "a[href]", attr: "href" },
];

export interface RewriteResult {
  /** Rewritten HTML string. */
  html: string;
  /** Absolute URLs of assets found in the page. */
  assetUrls: string[];
  /** Absolute URLs of same-origin links found (for crawling). */
  linkUrls: string[];
}

/**
 * Rewrite an HTML document:
 * - Remove <base> tags
 * - Rewrite internal links to relative local paths
 * - Rewrite asset references to local downloaded copies
 * - Rewrite inline CSS url() references
 */
export function rewriteHtml(
  html: string,
  pageUrl: string,
  /** Local path of this page relative to outDir (e.g. "about/index.html"). */
  localPagePath: string,
  /** Map of normalised asset URL -> local path relative to outDir. */
  assetMap: Map<string, string>,
  /** Map of normalised page URL -> local path relative to outDir. */
  pageMap: Map<string, string>,
): RewriteResult {
  const $ = cheerio.load(html);
  const assetUrls: string[] = [];
  const linkUrls: string[] = [];

  // The directory of the current page file, for computing relative paths
  const pageDir = path.posix.dirname(localPagePath);

  // Remove <base> tags
  $("base").remove();

  // --- Collect and rewrite asset references ---
  for (const { selector, attr } of ASSET_ATTRS) {
    $(selector).each((_i, el) => {
      const $el = $(el);
      const rawValue = $el.attr(attr);
      if (!rawValue) return;

      if (attr === "srcset") {
        // srcset is comma-separated: "url size, url size"
        const rewritten = rewriteSrcset(
          rawValue,
          pageUrl,
          pageDir,
          assetMap,
          assetUrls,
        );
        $el.attr(attr, rewritten);
      } else {
        const result = rewriteAssetRef(
          rawValue,
          pageUrl,
          pageDir,
          assetMap,
        );
        if (result.absoluteUrl) assetUrls.push(result.absoluteUrl);
        if (result.rewritten) $el.attr(attr, result.rewritten);
      }
    });
  }

  // --- Collect and rewrite internal page links ---
  for (const { selector, attr } of LINK_ATTRS) {
    $(selector).each((_i, el) => {
      const $el = $(el);
      const href = $el.attr(attr);
      if (!href) return;

      const trimmed = href.trim();
      // Skip non-http links
      if (
        trimmed.startsWith("mailto:") ||
        trimmed.startsWith("tel:") ||
        trimmed.startsWith("javascript:") ||
        trimmed.startsWith("data:") ||
        trimmed === "#"
      ) {
        return;
      }

      let absoluteUrl: URL;
      try {
        absoluteUrl = new URL(trimmed, pageUrl);
      } catch {
        return;
      }

      // Collect for crawling (without hash)
      const noHash = new URL(absoluteUrl.toString());
      noHash.hash = "";
      linkUrls.push(noHash.toString());

      // Rewrite same-origin links to local relative paths
      const targetKey = noHash.toString();
      const targetLocal = pageMap.get(targetKey);
      if (targetLocal) {
        let rel = computeRelativePath(pageDir, targetLocal);
        // Preserve hash fragment in the link
        if (absoluteUrl.hash) {
          rel += absoluteUrl.hash;
        }
        $el.attr(attr, rel);
      }
    });
  }

  // --- Rewrite inline <style> blocks ---
  $("style").each((_i, el) => {
    const $el = $(el);
    const cssText = $el.html();
    if (cssText) {
      const rewritten = rewriteCssUrls(cssText, pageDir, assetMap, pageUrl);
      $el.html(rewritten);
    }
  });

  // --- Rewrite style attributes ---
  $("[style]").each((_i, el) => {
    const $el = $(el);
    const styleVal = $el.attr("style");
    if (styleVal && styleVal.includes("url(")) {
      const rewritten = rewriteCssUrls(styleVal, pageDir, assetMap, pageUrl);
      $el.attr("style", rewritten);
    }
  });

  return { html: $.html(), assetUrls, linkUrls };
}

/**
 * Extract all asset URLs from HTML without rewriting.
 * Used for the initial asset discovery pass.
 */
export function extractAssetUrls(html: string, pageUrl: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];

  for (const { selector, attr } of ASSET_ATTRS) {
    $(selector).each((_i, el) => {
      const rawValue = $(el).attr(attr);
      if (!rawValue) return;

      if (attr === "srcset") {
        for (const entry of rawValue.split(",")) {
          const parts = entry.trim().split(/\s+/);
          if (parts[0]) {
            try {
              urls.push(new URL(parts[0], pageUrl).toString());
            } catch { /* skip */ }
          }
        }
      } else {
        try {
          urls.push(new URL(rawValue.trim(), pageUrl).toString());
        } catch { /* skip */ }
      }
    });
  }

  // Also extract url() from inline styles and <style> blocks
  const cssRegex = /url\(\s*['"]?([^'")\s]+)['"]?\s*\)/g;
  const fullHtml = $.html();
  let match: RegExpExecArray | null;
  while ((match = cssRegex.exec(fullHtml)) !== null) {
    const raw = match[1];
    if (raw.startsWith("data:")) continue;
    try {
      urls.push(new URL(raw, pageUrl).toString());
    } catch { /* skip */ }
  }

  return [...new Set(urls)];
}

// --- Helpers ---

function rewriteAssetRef(
  rawValue: string,
  pageUrl: string,
  pageDir: string,
  assetMap: Map<string, string>,
): { absoluteUrl?: string; rewritten?: string } {
  const trimmed = rawValue.trim();
  if (trimmed.startsWith("data:")) return {};

  let absoluteUrl: string;
  try {
    absoluteUrl = new URL(trimmed, pageUrl).toString();
  } catch {
    return {};
  }

  const localPath = assetMap.get(absoluteUrl);
  if (localPath) {
    return {
      absoluteUrl,
      rewritten: computeRelativePath(pageDir, localPath),
    };
  }
  return { absoluteUrl };
}

function rewriteSrcset(
  srcset: string,
  pageUrl: string,
  pageDir: string,
  assetMap: Map<string, string>,
  assetUrls: string[],
): string {
  return srcset
    .split(",")
    .map((entry) => {
      const parts = entry.trim().split(/\s+/);
      if (!parts[0]) return entry;
      const result = rewriteAssetRef(parts[0], pageUrl, pageDir, assetMap);
      if (result.absoluteUrl) assetUrls.push(result.absoluteUrl);
      if (result.rewritten) {
        parts[0] = result.rewritten;
        return parts.join(" ");
      }
      return entry;
    })
    .join(", ");
}

function computeRelativePath(fromDir: string, toPath: string): string {
  const fromParts = fromDir.split("/").filter(Boolean);
  const toParts = toPath.split("/").filter(Boolean);

  let common = 0;
  while (
    common < fromParts.length &&
    common < toParts.length &&
    fromParts[common] === toParts[common]
  ) {
    common++;
  }

  const ups = fromParts.length - common;
  const downs = toParts.slice(common);
  const segments = [...Array(ups).fill(".."), ...downs];
  return segments.join("/") || ".";
}
