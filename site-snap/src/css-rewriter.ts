/**
 * Rewrite url(...) references in CSS content.
 * Replaces absolute URLs that match downloaded assets with relative local paths.
 */

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
  // Regex matches url(...) with optional quotes.
  // Captures: url("..."), url('...'), url(...)
  const urlRe = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;

  return cssText.replace(urlRe, (match, _quote, rawUrl: string) => {
    const trimmed = rawUrl.trim();

    // Skip data URIs and absolute data
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

    const localPath = assetMap.get(absoluteUrl);
    if (!localPath) return match;

    const relativePath = computeRelativePath(fromDir, localPath);
    return `url("${relativePath}")`;
  });
}

/**
 * Compute a relative path from `fromDir` to `toPath`, both relative to outDir.
 */
function computeRelativePath(fromDir: string, toPath: string): string {
  // Both paths are relative to outDir.
  // We need "../" segments to go up from fromDir, then down to toPath.
  const fromParts = fromDir.split("/").filter(Boolean);
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
