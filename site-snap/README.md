# site-snap

A static site copier that downloads a public website and saves it locally as a browsable offline HTML snapshot. It captures pages, CSS, JS, images, PDFs and other assets — without copying any CMS or backend.

Uses Playwright (Chromium) to render JavaScript-heavy pages, so the snapshot includes dynamically generated content.

## Requirements

- Node.js 20+
- Playwright Chromium browser (installed automatically via `npx playwright install chromium`)

## Installation

```bash
cd site-snap
npm install
npx playwright install chromium
npm run build
```

## Usage

```bash
# Basic usage
node dist/cli.js --url https://example.com --out ./snapshot

# With options
node dist/cli.js \
  --url https://example.com \
  --out ./snapshot \
  --maxPages 50 \
  --concurrency 5 \
  --delayMs 500

# If linked globally (npm link)
site-snap --url https://example.com --out ./snapshot
```

### CLI Options

| Option               | Default          | Description                                      |
|----------------------|------------------|--------------------------------------------------|
| `--url`              | *(required)*     | Start URL to crawl                               |
| `--out`              | *(required)*     | Output directory for the snapshot                 |
| `--maxPages`         | `200`            | Maximum number of pages to crawl                  |
| `--concurrency`      | `3`              | Number of concurrent page loads                   |
| `--delayMs`          | `300`            | Delay in milliseconds between navigations         |
| `--includeSubdomains`| `false`          | Also crawl subdomains of the start URL            |
| `--respectRobots`    | `true`           | Respect robots.txt rules                          |
| `--userAgent`        | `"site-snap/1.0"`| User-Agent string for requests                    |
| `--renderTimeoutMs`  | `60000`          | Timeout in ms for page rendering                  |

## Output Structure

```
snapshot/
├── index.html                  # Homepage
├── about/
│   └── index.html              # /about page
├── contact/
│   └── index.html              # /contact page
├── assets/
│   ├── a1b2c3d4e5f6g7h8.css   # Hashed asset filenames
│   ├── b2c3d4e5f6g7h8i9.js
│   └── c3d4e5f6g7h8i9j0.png
└── manifest.json                # Crawl metadata
```

### manifest.json

Contains:
- **pages**: List of crawled pages with original URL, final URL (after redirects), local path, status code, and title.
- **assets**: List of downloaded assets with original URL, local path, and content type.
- **failures**: URLs that failed to download with error messages.
- **redirects**: Map of original URLs to their final redirect destinations.
- **notes**: Any warnings (e.g., robots.txt fetch failure).

## How It Works

1. **Robots.txt**: If `--respectRobots` is enabled, fetches and parses robots.txt before crawling.
2. **BFS Crawl**: Uses a breadth-first queue with `p-limit` for concurrency control.
3. **Playwright Rendering**: Each page is loaded in Chromium and waits for `domcontentloaded`. The rendered HTML (after JS execution) is captured.
4. **Asset Discovery**: Parses HTML for asset references (images, CSS, JS, fonts, etc.) and CSS files for `url()` references.
5. **Asset Download**: Downloads assets with `fetch()`, streaming to disk. Retries up to 2 times on failure.
6. **HTML Rewriting** (second pass): After all pages and assets are collected, rewrites all HTML to use relative local paths. Also rewrites CSS `url()` references.
7. **Manifest**: Writes `manifest.json` with all crawl metadata.

## Limitations

- **Forms and dynamic endpoints**: The crawler does not submit forms or interact with the page beyond initial load. POST-based content is not captured.
- **Infinite scroll / lazy loading**: Only content rendered on initial page load (after `domcontentloaded`) is captured. Scroll-triggered content is not loaded.
- **Authentication**: Protected pages behind login walls are not accessible. The crawler only captures public-facing content.
- **Single-page applications (SPAs)**: Client-side routing may result in only the shell being captured. Pages that require JavaScript navigation to render content may be incomplete.
- **Large sites**: The `--maxPages` limit prevents unbounded crawling, but very large sites may still take a long time.
- **External assets**: Assets hosted on third-party CDNs are downloaded if referenced in the HTML, but links to external sites are not followed.
- **WebSocket / real-time content**: Real-time data and WebSocket connections are not captured.
- **Cookie consent / popups**: Modal dialogs and cookie banners will appear in the snapshot as they did on page load.

## Development

```bash
# Watch mode for development
npm run dev

# Build
npm run build

# Run directly
npm start -- --url https://example.com --out ./snapshot
```

## License

MIT
