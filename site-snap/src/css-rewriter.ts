/**
 * Rewrite url(...) references in CSS content.
 * Replaces absolute URLs that match downloaded assets with relative local paths.
 */
import { normalizeAssetUrl } from "./url-utils.js";

/**
 * Given CSS text, rewrite url() values using the provided resolver.
 * The resolver takes an absolute URL and returns the local relative path
 * (or null if the asset wasn't downloaded).
 */
export function rewriteCssUrls(
  cssText: string,
  /** Current page's local directory (relative to outDir) for computing relative paths. */
  fromDir: string,
  /** Map of original asset URL -> local path (relative to outDir). */
  assetMap: Map<string, string>,
  /** Base URL for resolving relative URLs found in the CSS. */
  cssBaseUrl: string,
): string {
  // First rewrite @import statements (both @import "..." and @import url("..."))
  let result = cssText.replace(
    /@import\s+(?:url\(\s*)?(['"]?)([^'");\s]+)\1(?:\s*\))?/g,
    (match, _quote, rawUrl: string) => {
      return rewriteUrlRef(match, rawUrl, fromDir, assetMap, cssBaseUrl, true);
    },
  );

  // Then rewrite url(...) with optional quotes
  const urlRe = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  result = result.replace(urlRe, (match, _quote, rawUrl: string) => {
    return rewriteUrlRef(match, rawUrl, fromDir, assetMap, cssBaseUrl, false);
  });

  return result;
}

function rewriteUrlRef(
  match: string,
  rawUrl: string,
  fromDir: string,
  assetMap: Map<string, string>,
  cssBaseUrl: string,
  isImport: boolean,
): string {
  const trimmed = rawUrl.trim();

  // Skip data URIs and fragment-only refs
  if (trimmed.startsWith("data:") || trimmed.startsWith("#")) {
    return match;
  }

  // Resolve relative URL to absolute
  let absoluteUrl: string;
  try {
    absoluteUrl = new URL(trimmed, cssBaseUrl).toString();
  } catch {
    return match;
  }

  // Try exact URL first, then normalised form
  const localPath = assetMap.get(absoluteUrl) ?? assetMap.get(normalizeAssetUrl(absoluteUrl));
  if (!localPath) return match;

  const relativePath = computeRelativePath(fromDir, localPath);
  if (isImport) {
    return `@import url("${relativePath}")`;
  }
  return `url("${relativePath}")`;
}

/**
 * Extract all URLs referenced in CSS text (url() and @import).
 * Returns absolute URLs resolved against cssBaseUrl.
 */
export function extractCssUrls(cssText: string, cssBaseUrl: string): string[] {
  const urls: string[] = [];

  // @import "..." or @import url("...")
  const importRe = /@import\s+(?:url\(\s*)?['"]?([^'")\s;]+)['"]?(?:\s*\))?/g;
  let match: RegExpExecArray | null;
  while ((match = importRe.exec(cssText)) !== null) {
    const raw = match[1];
    if (raw.startsWith("data:")) continue;
    try { urls.push(new URL(raw, cssBaseUrl).toString()); } catch { /* skip */ }
  }

  // url(...)
  const urlRe = /url\(\s*['"]?([^'")\s]+)['"]?\s*\)/g;
  while ((match = urlRe.exec(cssText)) !== null) {
    const raw = match[1];
    if (raw.startsWith("data:")) continue;
    try { urls.push(new URL(raw, cssBaseUrl).toString()); } catch { /* skip */ }
  }

  return [...new Set(urls)];
}

/**
 * Compute a relative path from `fromDir` to `toPath`, both relative to outDir.
 */
function computeRelativePath(fromDir: string, toPath: string): string {
  // Both paths are relative to outDir.
  // We need "../" segments to go up from fromDir, then down to toPath.
  // "." means root directory — treat as empty (no segments to traverse up)
  const fromParts = fromDir === "." ? [] : fromDir.split("/").filter(Boolean);
  const toParts = toPath.split("/").filter(Boolean);

  // Find common prefix length
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
