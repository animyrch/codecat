# CodeCat

Computer-assisted-translation (cat tool) extension for Visual Studio Code to translate your documentation, extracted strings and code with the power of automated translation as well as manual translation with translation memory and vocabulary management.

## Features

Save any file that you want to translate as an .xcat file and open it with this extension installed. Extension will take over and present a custom editor where you file is divided into translatable line. 

As you translate line by line, the document will be updated with the translations.

At the end of the translation, you can change back the extension of the file to its original state.

## Development

### Start Contributing

At the root of the project, enter 

`yarn install`
### Creating a local extension package

At the root of the project, enter

`vsce package`

This will create a `vsix` file automatically named according to the package.json version.

Then, go to extensions of VS Code and select 'Install from VSIX' from the '...' context menu.
