# Obsidian Knowledge Map & Commit Protocol

## 1. Context Navigation (Zero-Waste Reading)
- Before traversing code, ALWAYS read `.obsidian-vault/INDEX.md` and `.obsidian-vault/TRACKER.md`.
- Use the wikilinks (`[[path/file]]`) in `.obsidian-vault/` to locate the exact source files needed for the active task.
- DO NOT recursively scan or inspect irrelevant directories. Check only the relevant slice defined by the vault graph.

## 2. Architecture & File Registry
When creating or refactoring files:
- Add or update the corresponding Markdown documentation in `.obsidian-vault/architecture/` or `.obsidian-vault/features/`.
- Use Markdown wikilinks (e.g., `[[architecture/auth]]`) to link related files so Obsidian renders an accurate node graph.

## 3. Post-Commit Vault Update Rule
Whenever you make a Git commit:
1. Update `.obsidian-vault/TRACKER.md`:
   - Move completed items to `## Completed`.
   - Update `## In Progress` and `## Next Plans`.
2. Append an entry to `.obsidian-vault/logs/CHANGELOG.md` with:
   - Date and commit message.
   - List of modified source files.
   - Any new connections added to the graph.
