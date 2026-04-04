---
name: generate-cover-letter
description: >
  Generate a tailored cover letter for a specific role. Internal sub-skill
  called by generate-docs — not intended for direct user invocation.
user-invocable: false
model: sonnet
effort: high
---

# Generate Cover Letter

Write a compelling, personalized cover letter for a job application. This skill is invoked by the `generate-docs` skill with role data and user profile already available in context.

## Guidelines

- Write in **first person** as the candidate.
- Keep it concise — **3-4 paragraphs, roughly 250-350 words** total.
- **Opening**: Express genuine interest in the specific role and company. Mention something specific about the company if context is available.
- **Body** (1-2 paragraphs): Connect 2-3 of the candidate's most relevant accomplishments to what the role requires. Use specific metrics and outcomes from their experience. Show why they're a strong fit.
- **Closing**: Express enthusiasm, mention availability, and include a confident call to action.

## Tone and Style

- **Professional but warm.** Confident without being arrogant. Specific without being exhaustive.
- Do NOT fabricate any experience or accomplishments.
- Do NOT use cliches like "I am writing to express my interest" or "I believe I would be a great fit."
- Start with something engaging that connects the candidate's experience to the company's mission or the role's challenges.

## Signoff Format

The `signoff` field must include the closing phrase AND the candidate's full name on a new line. For example:

```
Sincerely,
Kelvan Brandt
```

## Humanizer Pass

After drafting the cover letter body, run it through the `humanizer` skill to remove AI writing patterns. Apply the humanizer process to the `body` text only (not greeting or signoff). The final body text in the output JSON should be the humanized version.

## Output JSON Schema

Produce this exact JSON structure (the parent skill will use it):

```json
{
  "greeting": "Dear Hiring Manager,",
  "body": "The full body of the cover letter, including all paragraphs. Use \\n\\n between paragraphs.",
  "signoff": "Sincerely,\nCandidate Name"
}
```
