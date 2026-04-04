---
name: score-all
description: >
  Score all unscored roles in batch. Shortcut that invokes the score-role skill
  with no arguments (batch mode). Use when user says "score all", "score
  everything", "score all roles", or "batch score".
user-invocable: true
model: haiku
allowed-tools: Skill
---

# Score All Unscored Roles

Invoke the `score-role` skill with no arguments to trigger batch mode.

Use the Skill tool: `skill: "score-role"`
