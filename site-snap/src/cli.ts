#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Crawler } from "./crawler.js";
import type { SiteSnapOptions } from "./types.js";

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .scriptName("site-snap")
    .usage("$0 --url <startUrl> --out <dir> [options]")
    .option("url", {
      type: "string",
      demandOption: true,
      describe: "Start URL to crawl",
    })
    .option("out", {
      type: "string",
      demandOption: true,
      describe: "Output directory for the snapshot",
    })
    .option("maxPages", {
      type: "number",
      default: 200,
      describe: "Maximum number of pages to crawl",
    })
    .option("concurrency", {
      type: "number",
      default: 3,
      describe: "Number of concurrent page loads",
    })
    .option("delayMs", {
      type: "number",
      default: 300,
      describe: "Delay in milliseconds between navigations",
    })
    .option("includeSubdomains", {
      type: "boolean",
      default: false,
      describe: "Also crawl subdomains of the start URL",
    })
    .option("respectRobots", {
      type: "boolean",
      default: true,
      describe: "Respect robots.txt rules",
    })
    .option("userAgent", {
      type: "string",
      default: "site-snap/1.0",
      describe: "User-Agent string for requests",
    })
    .option("renderTimeoutMs", {
      type: "number",
      default: 60000,
      describe: "Timeout in ms for Playwright page rendering",
    })
    .help()
    .alias("h", "help")
    .version()
    .alias("v", "version")
    .strict()
    .parse();

  // Validate the start URL
  try {
    const u = new URL(argv.url);
    if (!u.protocol.startsWith("http")) {
      console.error("Error: --url must be an HTTP or HTTPS URL.");
      process.exit(1);
    }
  } catch {
    console.error("Error: --url must be a valid URL.");
    process.exit(1);
  }

  const opts: SiteSnapOptions = {
    url: argv.url,
    out: argv.out,
    maxPages: argv.maxPages,
    concurrency: argv.concurrency,
    delayMs: argv.delayMs,
    includeSubdomains: argv.includeSubdomains,
    respectRobots: argv.respectRobots,
    userAgent: argv.userAgent,
    renderTimeoutMs: argv.renderTimeoutMs,
  };

  console.log("site-snap v1.0.0");
  console.log("=".repeat(50));

  const crawler = new Crawler(opts);
  const manifest = await crawler.run();

  // Exit with non-zero code if there were failures
  if (manifest.failures.length > 0) {
    console.log(
      `\nCompleted with ${manifest.failures.length} failure(s). See manifest.json for details.`,
    );
    process.exit(0); // Still exit 0; failures are expected for some resources
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
