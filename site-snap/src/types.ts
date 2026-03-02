/** Configuration options for site-snap. */
export interface SiteSnapOptions {
  /** The starting URL to crawl. */
  url: string;
  /** Output directory for the snapshot. */
  out: string;
  /** Maximum number of pages to crawl. */
  maxPages: number;
  /** Number of concurrent page loads. */
  concurrency: number;
  /** Delay in milliseconds between navigations. */
  delayMs: number;
  /** Whether to include subdomains of the start URL. */
  includeSubdomains: boolean;
  /** Whether to respect robots.txt rules. */
  respectRobots: boolean;
  /** User-Agent string sent with requests. */
  userAgent: string;
  /** Timeout in ms for Playwright page rendering. */
  renderTimeoutMs: number;
}

/** A downloaded asset record. */
export interface AssetRecord {
  /** Original absolute URL of the asset. */
  originalUrl: string;
  /** Local path relative to the output directory. */
  localPath: string;
  /** Content type, if known. */
  contentType?: string;
}

/** A crawled page record. */
export interface PageRecord {
  /** Original URL that was crawled. */
  originalUrl: string;
  /** Final URL after redirects. */
  finalUrl: string;
  /** Local path relative to the output directory. */
  localPath: string;
  /** HTTP status code. */
  status: number;
  /** Page title if available. */
  title?: string;
}

/** A failure record. */
export interface FailureRecord {
  /** The URL that failed. */
  url: string;
  /** Error message. */
  error: string;
}

/** Redirect mapping. */
export interface RedirectRecord {
  /** Original requested URL. */
  from: string;
  /** URL after redirect. */
  to: string;
}

/** The manifest written to out/manifest.json. */
export interface Manifest {
  /** Crawl start time (ISO 8601). */
  startTime: string;
  /** Crawl end time (ISO 8601). */
  endTime?: string;
  /** The start URL. */
  startUrl: string;
  /** Pages crawled successfully. */
  pages: PageRecord[];
  /** Assets downloaded. */
  assets: AssetRecord[];
  /** URLs that failed. */
  failures: FailureRecord[];
  /** Redirect map. */
  redirects: RedirectRecord[];
  /** Notes (e.g. robots.txt fetch failure). */
  notes: string[];
}
