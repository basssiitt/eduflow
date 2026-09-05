---
name: ultimate-bug-scanner
description: Run Ultimate Bug Scanner (ubs) to detect 1000+ bug patterns, security vulnerabilities, AST defects, and taint flows across the codebase.
---

# Ultimate Bug Scanner (UBS) Skill

This skill integrates [Ultimate Bug Scanner](https://github.com/Dicklesworthstone/ultimate_bug_scanner) (`ubs`) for automated code auditing, security scanning, and quality guardrails.

## Capabilities
- Detects security vulnerabilities (SQL injection, XSS, insecure cookies, prototype pollution, open redirects, timing-attack risks).
- Validates AST patterns, resource lifecycles (event listeners, database handles, streams).
- Scans JS/TS, Python, Go, Rust, and more using `@ast-grep/cli` and `ripgrep`.

## Quick Commands

### Run Full Scan
```bash
ubs .
```

### Run Output as SARIF (for machine parsing)
```bash
ubs . --format=sarif
```

### Run Output as JSON
```bash
ubs . --format=json
```

### Scan Only Modified / Staged Files
```bash
ubs --staged
ubs --diff
```

### Verify Dependencies & Modules
```bash
ubs doctor
```
