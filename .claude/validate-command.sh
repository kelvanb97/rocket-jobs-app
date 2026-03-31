#!/bin/bash
input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command')

if echo "$command" | grep -qE '&&|\|\||;|\|'; then
  echo '{"decision": "deny", "message": "Command chaining not allowed"}'
  exit 2
fi
