import Gio from "gi://Gio";
import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import Gdk from "gi://Gdk";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class SpeechPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings(
      "org.gnome.shell.extensions.speak-selection",
    );
    const page = new Adw.PreferencesPage();

    // --- Shortcut Group ---
    const shortcutGroup = new Adw.PreferencesGroup({
      title: "Keyboard Shortcuts",
    });

    // Helper to create a shortcut row
    const createShortcutRow = (title, key) => {
      const row = new Adw.ActionRow({ title: title });
      const shortcutLabel = new Gtk.ShortcutLabel({
        accelerator: settings.get_strv(key)[0] || "",
        valign: Gtk.Align.CENTER,
      });

      // Update label when settings change
      settings.connect(`changed::${key}`, () => {
        shortcutLabel.accelerator = settings.get_strv(key)[0] || "";
      });

      const editBtn = new Gtk.Button({
        icon_name: "edit-symbolic",
        margin_start: 10,
        valign: Gtk.Align.CENTER,
      });

      // Click to Record logic
      editBtn.connect("clicked", () => {
        this._launchRecorder(window, (newShortcut) => {
          if (newShortcut) settings.set_strv(key, [newShortcut]);
        });
      });

      row.add_suffix(shortcutLabel);
      row.add_suffix(editBtn);
      return row;
    };

    shortcutGroup.add(createShortcutRow("Speak Selection", "run-speech"));
    shortcutGroup.add(createShortcutRow("Stop Speaking", "stop-speech"));

    // --- General Group ---
    const generalGroup = new Adw.PreferencesGroup({ title: "Interface" });
    const toggleRow = new Adw.SwitchRow({ title: "Show Panel Icon" });
    settings.bind(
      "show-indicator",
      toggleRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );
    generalGroup.add(toggleRow);

    page.add(shortcutGroup);
    page.add(generalGroup);
    window.add(page);
  }

  // A simple dialog to "capture" the keyboard press
  _launchRecorder(parent, callback) {
    const dialog = new Gtk.Window({
      title: "Set Shortcut",
      modal: true,
      transient_for: parent,
      default_width: 350,
      resizable: false,
    });

    const box = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 12,
      margin_top: 30,
      margin_bottom: 30,
      margin_start: 30,
      margin_end: 30,
    });

    const label = new Gtk.Label({
      label: "Press the desired key combination...",
      wrap: true,
    });
    const subLabel = new Gtk.Label({
      label: "(e.g., Ctrl+Alt+K)",
      css_classes: ["dim-label"],
    });

    box.append(label);
    box.append(subLabel);
    dialog.set_child(box);

    const controller = new Gtk.EventControllerKey();
    dialog.add_controller(controller);

    controller.connect("key-pressed", (ctrl, keyval, keycode, state) => {
      // 1. Get the modifier mask (Shift, Ctrl, Alt, Super)
      let mask = state & Gtk.accelerator_get_default_mod_mask();

      // 2. Check if the key pressed is ITSELF a modifier
      // We don't want to close the dialog if the user just pressed "Ctrl"
      let isModifier = [
        Gdk.KEY_Shift_L,
        Gdk.KEY_Shift_R,
        Gdk.KEY_Control_L,
        Gdk.KEY_Control_R,
        Gdk.KEY_Alt_L,
        Gdk.KEY_Alt_R,
        Gdk.KEY_Super_L,
        Gdk.KEY_Super_R,
      ].includes(keyval);

      if (keyval === Gdk.KEY_Escape) {
        dialog.destroy();
        return true;
      }

      // 3. Only finalize if a non-modifier key is pressed
      if (!isModifier) {
        let accel = Gtk.accelerator_name(keyval, mask);
        if (accel) {
          callback(accel);
          dialog.destroy();
        }
      }

      // Return true to stop event propagation
      return true;
    });

    dialog.present();
  }
}
