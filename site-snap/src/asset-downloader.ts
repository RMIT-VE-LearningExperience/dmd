import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import type { AssetRecord, FailureRecord } from "./types.js";

/**
 * Download an asset URL to the output directory under assets/<hash>.<ext>.
 * Retries up to `maxRetries` times on failure.
 * Returns the AssetRecord on success, or a FailureRecord on failure.
 */
export async function downloadAsset(
  assetUrl: string,
  outDir: string,
  userAgent: string,
  maxRetries = 2,
): Promise<{ asset?: AssetRecord; failure?: FailureRecord }> {
  const ext = guessExtension(assetUrl);
  const hash = crypto
    .createHash("sha256")
    .update(assetUrl)
    .digest("hex")
    .slice(0, 16);
  const filename = `${hash}${ext}`;
  const localPath = path.join("assets", filename);
  const fullPath = path.join(outDir, localPath);

  // Ensure parent directory exists
  await fs.mkdir(path.dirname(fullPath), { recursive: true });

  let lastError = "";
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetch(assetUrl, {
        headers: { "User-Agent": userAgent },
        signal: AbortSignal.timeout(30_000),
        redirect: "follow",
      });

      if (!resp.ok) {
        lastError = `HTTP ${resp.status}`;
        continue;
      }

      if (!resp.body) {
        lastError = "No response body";
        continue;
      }

      // Stream the response body to disk
      const readable = Readable.fromWeb(resp.body as any);
      await pipeline(readable, createWriteStream(fullPath));

      const contentType =
        resp.headers.get("content-type") || undefined;

      return {
        asset: {
          originalUrl: assetUrl,
          localPath: localPath.replace(/\\/g, "/"),
          contentType,
        },
      };
    } catch (err) {
      lastError = (err as Error).message;
    }
  }

  return {
    failure: {
      url: assetUrl,
      error: `Asset download failed after ${maxRetries + 1} attempts: ${lastError}`,
    },
  };
}

/**
 * Guess a file extension from a URL (ignoring query string).
 */
function guessExtension(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    const ext = path.extname(u.pathname).toLowerCase();
    // Only keep reasonable extensions
    if (ext && ext.length <= 8 && /^\.[a-z0-9]+$/.test(ext)) return ext;
  } catch {
    // ignore
  }
  return "";
}
