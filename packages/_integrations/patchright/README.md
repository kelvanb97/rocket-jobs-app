# @rja-integrations/patchright

Browser automation wrapper around [patchright](https://github.com/nicedomain/patchright) with human-like interaction utilities and bot-detection handling.

## Exports

### `./browser`

Browser context lifecycle management.

| Export                   | Description                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `createBrowserContext()` | Launch a persistent Chrome context (`~/.chrome-profile`). Viewport 1280x900, locale `en-US`, timezone `America/Los_Angeles`. Accepts optional `{ headless?: boolean }`. |
| `closeBrowserContext()`  | Close a browser context.                                                                             |
| `BrowserOptions`         | Type: `{ headless?: boolean }`.                                                                      |

### `./interaction`

Human-like input and scroll utilities.

| Export             | Signature                                                                               | Description                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `randomWait`       | `(min: number, max: number) => Promise<void>`                                           | Sleep for a random duration between `min` and `max` ms.                                                            |
| `humanType`        | `(page, selector, text) => Promise<void>`                                               | Click a field then type text character-by-character with 50-150ms delays.                                          |
| `humanClick`       | `(page, selector) => Promise<void>`                                                     | Scroll element into view, wait 200-600ms, then click.                                                              |
| `humanScroll`      | `(page, deltaY) => Promise<void>`                                                       | Scroll by `deltaY` pixels via mouse wheel with a short random delay.                                               |
| `scrollToBottom`   | `(page, options?) => Promise<void>`                                                     | Repeatedly scroll to the bottom of the page until no new content loads. Handles infinite-scroll / lazy-load pages. Options: `{ scrollDelta?, waitMin?, waitMax? }`. |

### `./page`

Page-level utilities and block detection.

| Export              | Signature                                           | Description                                                                      |
| ------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------- |
| `checkForBlocks`    | `(page) => Promise<void>`                           | Throws `CaptchaDetectedError` or `BotBlockedError` if a block page is detected.  |
| `waitForSelector`   | `(page, selector, timeout?) => Promise<void>`       | Wait for a CSS selector to appear (default 10s timeout).                         |
| `extractText`       | `(page, selector) => Promise<string \| null>`       | Get inner text of the first matching visible element, or `null`.                 |
| `extractAttribute`  | `(page, selector, attribute) => Promise<string \| null>` | Get an attribute from the first matching visible element, or `null`.             |
| `Page`              | Type re-export from patchright.                     |                                                                                  |

### `./errors`

Custom error classes for bot detection.

| Export                  | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `CaptchaDetectedError`  | Thrown when a CAPTCHA page is detected.                 |
| `BotBlockedError`       | Thrown when an "unusual traffic" block is encountered.  |
