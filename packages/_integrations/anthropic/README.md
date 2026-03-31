# @rja-integrations/anthropic

Thin wrapper around the Anthropic SDK for structured message creation.

## Exports

### `createMessage<T>(params)`

Sends a single user message to the Anthropic API and parses the response against a Zod schema.

```typescript
import { createMessage } from "@rja-integrations/anthropic/client"
import { z } from "zod"

const result = await createMessage({
  model: "claude-haiku-4-5-20251001",
  system: "You are a helpful assistant. Respond with JSON.",
  user: "What is 2 + 2?",
  schema: z.object({ answer: z.number() }),
})
// result: { answer: 4 }
```

### `TAnthropicModel`

Type alias for `Anthropic.Messages.Model` — the union of valid model ID strings.

```typescript
import type { TAnthropicModel } from "@rja-integrations/anthropic/client"
```
