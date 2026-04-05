import St from "gi://St";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Shell from "gi://Shell";
import Meta from "gi://Meta";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as Slider from "resource:///org/gnome/shell/ui/slider.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

const KEY_SPEAK = "run-speech";
const KEY_STOP = "stop-speech";
const KEY_RATE = "speech-rate";

export default class SpeechExtension extends Extension {
  enable() {
    this._settings = this.getSettings(
      "org.gnome.shell.extensions.speak-selection",
    );
    this._indicator = null;

    // Watch for changes to the toggle
    this._settingsId = this._settings.connect("changed::show-indicator", () => {
      this._updateIndicatorVisibility();
    });

    this._updateIndicatorVisibility();

    // Keybindings
    Main.wm.addKeybinding(
      KEY_SPEAK,
      this._settings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      () => this._speakSelection(),
    );

    Main.wm.addKeybinding(
      KEY_STOP,
      this._settings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      () => this._runCommand("spd-say -S"),
    );
  }

  _updateIndicatorVisibility() {
    const shouldShow = this._settings.get_boolean("show-indicator");

    if (shouldShow && !this._indicator) {
      this._createIndicator();
    } else if (!shouldShow && this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
  }

  _createIndicator() {
    this._indicator = new PanelMenu.Button(0.5, "Speech Tools", false);
    this._indicator.add_child(
      new St.Icon({
        icon_name: "chat-bubble-text-symbolic",
        style_class: "system-status-icon",
      }),
    );

    // Create Panel Indicator
    this._indicator = new PanelMenu.Button(0.5, "Speech Tools", false);
    this._indicator.add_child(
      new St.Icon({
        icon_name: "chat-bubble-text-symbolic",
        style_class: "system-status-icon",
      }),
    );

    // Headline / Label
    let headline = new PopupMenu.PopupBaseMenuItem({
      activate: false,
      reactive: false,
    });
    headline.add_child(
      new St.Label({
        text: "Speech Rate",
        style_class: "popup-menu-header",
      }),
    );
    this._indicator.menu.addMenuItem(headline);

    // Slider container
    let sliderItem = new PopupMenu.PopupBaseMenuItem({ activate: false });

    // The slider itself (requires a value between 0 and 1)
    this._slider = new Slider.Slider(
      (this._settings.get_int(KEY_RATE) + 100) / 200,
    );

    // Set it to expand to fill the menu width
    this._slider.x_expand = true;

    // Connect the signal
    this._slider.connect("notify::value", () => {
      let rate = Math.round(this._slider.value * 200 - 100);
      this._settings.set_int(KEY_RATE, rate);
    });

    sliderItem.add_child(this._slider);
    this._indicator.menu.addMenuItem(sliderItem);

    Main.panel.addToStatusArea(this.uuid, this._indicator);
  }

  disable() {
    this._settings.disconnect(this._settingsId);
    Main.wm.removeKeybinding(KEY_SPEAK);
    Main.wm.removeKeybinding(KEY_STOP);
    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
    this._settings = null;
  }

  _runCommand(command) {
    try {
      GLib.spawn_command_line_async(command);
    } catch (e) {
      console.error(e);
    }
  }

  _speakSelection() {
    const rate = this._settings.get_int(KEY_RATE);
    const clipboard = St.Clipboard.get_default();
    clipboard.get_text(St.ClipboardType.PRIMARY, (clipboard, text) => {
      if (!text || text.trim() === "") return;
      const sanitizedText = text.replace(/"/g, '\\"').replace(/\$/g, "\\$");
      this._runCommand(`spd-say -r ${rate} "${sanitizedText}"`);
    });
  }
}
