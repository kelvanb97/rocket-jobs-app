---
name: generate-resume
description: >
  Generate a tailored resume for a specific role. Internal sub-skill called by
  generate-docs — not intended for direct user invocation.
user-invocable: false
model: sonnet
---

# Generate Resume

Generate an ATS-optimized, tailored resume from the candidate's profile for a specific job posting. This skill is invoked by the `generate-docs` skill with role data, user profile, and extracted keywords already available in context.

## Instructions

You will have the candidate's complete profile (work history, skills, highlights) and a target job posting in context. Produce a tailored resume by:

1. **Summary**: Rewrite the professional summary (2-3 sentences) to emphasize the skills and experience most relevant to this specific role. Do not fabricate experience.

2. **Skills**: Select 15-25 skills from the candidate's skill list that are most relevant to the role. Group them into categories (e.g., "Languages", "Frontend", "Backend & Infrastructure"). Order categories and items within them by relevance to the role. Only include skills the candidate actually has.

3. **Work Experience**: Include ALL work experiences but reorder highlights within each role to lead with the most relevant ones. Select the 3-5 most impactful highlights per role. You may lightly reword highlights to emphasize relevant aspects, but do not fabricate accomplishments.

4. **Education**: Include all education entries as-is.

## Keyword Integration

When extracted keywords are available in context, use them as follows:

- **Skills**: Prioritize skills matching requiredSkills first, then preferredSkills. Group skills into logical categories — you decide the categories based on what fits the role best.
- **Summary**: Address requiredQualifications and weave in industryTerms where they naturally fit. The summary should signal domain familiarity.
- **Highlights**: When rewording highlights, incorporate keyPhrases naturally where the candidate's actual accomplishments support them. Do not force a phrase where it doesn't fit.
- **Industry Terms**: Use industryTerms in the summary and relevant highlights to demonstrate domain fluency.
- If keyword lists are sparse or empty, fall back to general tailoring based on the job description.

## Important Rules

- **Never** invent skills, experiences, or accomplishments the candidate doesn't have.
- Keep the professional tone and specificity of the original highlights.
- Quantified results (percentages, metrics) must be preserved exactly.
- The resume should feel naturally tailored, not keyword-stuffed.

## Output JSON Schema

Produce this exact JSON structure (the parent skill will use it):

```json
{
  "summary": "Professional summary string",
  "skills": [
    { "category": "Languages", "items": ["TypeScript", "Python", "Go"] },
    { "category": "Frontend", "items": ["React", "Next.js", "Tailwind"] }
  ],
  "workExperience": [
    {
      "company": "Acme Corp",
      "title": "Senior Engineer",
      "startDate": "2022-01",
      "endDate": "Present",
      "highlights": [
        "Led migration to microservices, reducing deploy time by 60%",
        "Built real-time analytics pipeline processing 1M events/day"
      ]
    }
  ],
  "education": [
    {
      "degree": "B.S.",
      "field": "Computer Science",
      "institution": "MIT"
    }
  ]
}
```
