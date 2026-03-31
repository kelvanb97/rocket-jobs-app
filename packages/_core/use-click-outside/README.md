# @rja-core/use-click-outside

React hook for detecting clicks outside specified DOM elements.

## Exports

- `useClickOutside(refList, onClickOutside, options)` — registers a global event listener to detect outside clicks

### Options

- `ignoreMounted` — skip detection for conditionally-rendered components
- `eventType` — `"click"` or `"pointerdown"`
- `isEnabled` — dynamically enable/disable the listener
