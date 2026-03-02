/**
 * Minimal robots.txt parser.
 * Supports User-agent, Disallow, and Allow directives.
 */

interface RobotsRule {
  userAgent: string;
  disallow: string[];
  allow: string[];
}

export class RobotsChecker {
  private rules: RobotsRule[] = [];
  private loaded = false;
  public fetchError: string | null = null;

  /**
   * Fetch and parse robots.txt for the given origin.
   * If the fetch fails, we note the error but allow crawling.
   */
  async load(origin: string, userAgent: string): Promise<void> {
    try {
      const robotsUrl = new URL("/robots.txt", origin).toString();
      const resp = await fetch(robotsUrl, {
        headers: { "User-Agent": userAgent },
        signal: AbortSignal.timeout(10_000),
      });
      if (!resp.ok) {
        this.fetchError = `robots.txt returned status ${resp.status}`;
        this.loaded = true;
        return;
      }
      const text = await resp.text();
      this.parse(text);
      this.loaded = true;
    } catch (err) {
      this.fetchError = `Failed to fetch robots.txt: ${(err as Error).message}`;
      this.loaded = true;
    }
  }

  private parse(text: string): void {
    let current: RobotsRule | null = null;
    for (const rawLine of text.split("\n")) {
      const line = rawLine.trim();
      if (line === "" || line.startsWith("#")) continue;

      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;

      const directive = line.slice(0, colonIdx).trim().toLowerCase();
      const value = line.slice(colonIdx + 1).trim();

      if (directive === "user-agent") {
        current = { userAgent: value.toLowerCase(), disallow: [], allow: [] };
        this.rules.push(current);
      } else if (directive === "disallow" && current && value) {
        current.disallow.push(value);
      } else if (directive === "allow" && current && value) {
        current.allow.push(value);
      }
    }
  }

  /**
   * Check whether the given path is allowed.
   * We check both "*" and the specific user-agent.
   */
  isAllowed(urlPath: string, userAgent: string): boolean {
    if (!this.loaded) return true;

    const ua = userAgent.toLowerCase();
    // Find matching rule sets: specific UA first, then wildcard
    const matchingSets = this.rules.filter(
      (r) => r.userAgent === ua || r.userAgent === "*",
    );

    if (matchingSets.length === 0) return true;

    // Collect all disallow/allow from matching sets and use longest-match
    let longestDisallow = "";
    let longestAllow = "";

    for (const ruleSet of matchingSets) {
      for (const d of ruleSet.disallow) {
        if (urlPath.startsWith(d) && d.length > longestDisallow.length) {
          longestDisallow = d;
        }
      }
      for (const a of ruleSet.allow) {
        if (urlPath.startsWith(a) && a.length > longestAllow.length) {
          longestAllow = a;
        }
      }
    }

    if (!longestDisallow) return true;
    // If allow is more specific (longer), allow
    if (longestAllow.length >= longestDisallow.length) return true;
    return false;
  }
}
