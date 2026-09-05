---
name: clipboard
description: Access, read, and write system clipboard contents, retrieve text copied by the user, or paste clipboard contents into the project.
---

# Clipboard Skill

This skill provides utilities and commands to interact with the operating system clipboard in Linux environments (Wayland and X11).

## Prerequisites
- `wl-clipboard` (`wl-paste`, `wl-copy`) for Wayland sessions.
- `xclip` (`xclip -selection clipboard`) for X11 / Xwayland sessions.

Both packages are installed on the system.

## Reading Clipboard Contents

To read whatever text is currently stored in the user's system clipboard:

```bash
timeout 2s wl-paste -n 2>/dev/null || timeout 2s xclip -selection clipboard -o 2>/dev/null
```

If the clipboard is empty or binary data, ensure timeout is used to prevent blocking.

## Copying Text to Clipboard

To copy text into the user's system clipboard:

```bash
printf "%s" "YOUR_TEXT" | wl-copy 2>/dev/null || printf "%s" "YOUR_TEXT" | xclip -selection clipboard 2>/dev/null
```
