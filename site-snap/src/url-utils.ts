import path from "node:path";

/**
 * Normalise a URL for deduplication:
 * strip hash fragment, sort query params, remove trailing slash (except root).
 */
export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    // Remove fragment
    u.hash = "";
    // Sort search params
    u.searchParams.sort();
    // Remove trailing slash except for root "/"
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch {
    return raw;
  }
}

/**
 * Returns true if the URL is on the same origin (or allowed subdomain).
 */
export function isSameOrigin(
  candidateUrl: string,
  startUrl: string,
  includeSubdomains: boolean,
): boolean {
  try {
    const cand = new URL(candidateUrl);
    const start = new URL(startUrl);

    // Must be http(s)
    if (!cand.protocol.startsWith("http")) return false;

    if (includeSubdomains) {
      // candidate host must end with the start host
      // e.g. blog.example.com ends with example.com
      return (
        cand.hostname === start.hostname ||
        cand.hostname.endsWith("." + start.hostname)
      );
    }
    return cand.hostname === start.hostname;
  } catch {
    return false;
  }
}

/**
 * Returns true if the URL looks like an admin/login/backoffice path
 * or contains session-related query parameters.
 */
export function isSkippableUrl(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl);
    const lower = u.pathname.toLowerCase();

    // Admin / login patterns
    const blocked = [
      "/wp-admin",
      "/wdadmin",
      "/admin",
      "/login",
      "/logout",
      "/signin",
      "/signout",
      "/sign-in",
      "/sign-out",
      "/register",
      "/backoffice",
      "/dashboard",
      "/account",
      "/wp-login",
    ];
    for (const b of blocked) {
      if (lower === b || lower.startsWith(b + "/")) return true;
    }

    // Session-related query params
    const sessionParams = [
      "sid",
      "session",
      "sessionid",
      "session_id",
      "token",
      "auth",
      "jsessionid",
    ];
    for (const p of sessionParams) {
      if (u.searchParams.has(p)) return true;
    }

    return false;
  } catch {
    return true;
  }
}

/**
 * Returns true if the href should be skipped entirely
 * (mailto, tel, javascript, data URIs, etc.).
 */
export function isNonHttpLink(href: string): boolean {
  const lower = href.trim().toLowerCase();
  return (
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("#")
  );
}

/**
 * Convert a URL to a safe local file path within the output directory.
 * e.g. https://example.com/about -> about/index.html
 *      https://example.com/      -> index.html
 */
export function urlToLocalPagePath(pageUrl: string): string {
  const u = new URL(pageUrl);
  let p = decodeURIComponent(u.pathname);

  // Remove leading slash
  if (p.startsWith("/")) p = p.slice(1);

  // If root, just index.html
  if (p === "" || p === "/") return "index.html";

  // Remove trailing slash
  if (p.endsWith("/")) p = p.slice(0, -1);

  // If path already ends with .html or .htm, keep it
  const ext = path.extname(p).toLowerCase();
  if (ext === ".html" || ext === ".htm") {
    return sanitizePath(p);
  }

  // Otherwise, treat as directory -> dir/index.html
  return sanitizePath(p + "/index.html");
}

/**
 * Sanitise path segments for Windows safety.
 * Replace illegal characters with underscores.
 */
export function sanitizePath(p: string): string {
  return p
    .split("/")
    .map((seg) => seg.replace(/[<>:"|?*\\]/g, "_"))
    .join("/");
}
