# Speak Selection

A GNOME Shell extension that reads aloud the currently selected text using [Speech Dispatcher](https://freebsoft.org/speechd) (`spd-say`).

## Features

- **Speak Selection** – trigger text-to-speech on the primary selection (highlighted text) via a keyboard shortcut
- **Stop Speaking** – interrupt speech with a keyboard shortcut
- **Speech Rate** – adjust rate via a panel menu slider (range: −100 to +100)
- **Panel Indicator** – optional system tray icon with a speech rate slider (can be toggled in preferences)

### Default Keyboard Shortcuts

| Action          | Shortcut               |
|-----------------|------------------------|
| Speak Selection | `Super + Shift + K`    |
| Stop Speaking   | `Super + Shift + L`    |

Shortcuts can be customized in the extension preferences.

## Requirements

- GNOME Shell 49
- `speech-dispatcher` with the `spd-say` command available

Install Speech Dispatcher on Debian/Ubuntu:

```sh
sudo apt install speech-dispatcher
```

On Fedora:

```sh
sudo dnf install speech-dispatcher
```

## Building

Compile the GSettings schema before installing:

```sh
make
```

This runs `glib-compile-schemas schemas`, producing `schemas/gschemas.compiled`.

## Installation

Copy the extension directory to your GNOME Shell extensions folder and restart the shell (or log out and back in):

```sh
EXT_DIR="$HOME/.local/share/gnome-shell/extensions/speak-selection@steinbro.github.io"
mkdir -p "$EXT_DIR"
cp -r . "$EXT_DIR"
```

Then enable the extension:

```sh
gnome-extensions enable speak-selection@steinbro.github.io
```

Or use GNOME Extensions app / Extensions Manager to enable it.
