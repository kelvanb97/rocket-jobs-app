---
name: extract-keywords
description: >
  Extract ATS keywords from a job description. Internal sub-skill called by
  generate-docs — not intended for direct user invocation.
user-invocable: false
model: haiku
---

# Extract Keywords

Analyze a job description and extract the exact terminology the employer uses. This skill is invoked by the `generate-docs` skill with role data already available in context.

## Instructions

Extract keywords into these 6 categories:

1. **requiredSkills** — Technical skills, tools, languages, or frameworks explicitly marked as required or listed in a "requirements" section.
2. **preferredSkills** — Technical skills listed as "nice to have", "preferred", or "bonus".
3. **requiredQualifications** — Non-skill requirements like years of experience, degree requirements, clearances, or certifications that are mandatory.
4. **preferredQualifications** — Non-skill qualifications listed as preferred or nice-to-have.
5. **keyPhrases** — Recurring phrases or action verbs the JD emphasizes (e.g., "cross-functional collaboration", "data-driven decisions", "customer-facing").
6. **industryTerms** — Domain-specific vocabulary, acronyms, or jargon (e.g., "CI/CD", "SOC 2", "ETL", "SaaS").

## Rules

- Use the **EXACT terminology** from the job description. Do not paraphrase or generalize.
- If the JD is vague or short, return fewer items rather than guessing.
- Do not infer skills that are not mentioned.
- **Deduplicate** across categories — each term appears in only one category.

## Output JSON Schema

Produce this exact JSON structure (the parent skill will use it):

```json
{
  "requiredSkills": ["..."],
  "preferredSkills": ["..."],
  "requiredQualifications": ["..."],
  "preferredQualifications": ["..."],
  "keyPhrases": ["..."],
  "industryTerms": ["..."]
}
```
