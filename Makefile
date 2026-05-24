UUID = speak-selection@steinbro.github.io

default:
	glib-compile-schemas schemas

zip: default
	zip -r $(UUID).shell-extension.zip \
		extension.js prefs.js metadata.json \
		schemas/org.gnome.shell.extensions.speak-selection.gschema.xml
