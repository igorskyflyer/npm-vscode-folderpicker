<div align="center">
  <img src="https://raw.githubusercontent.com/igorskyflyer/npm-vscode-folderpicker/main/media/vscode-folderpicker.png" alt="Icon of FolderPicker" width="256" height="256">
  <h1>FolderPicker</h1>
</div>

<blockquote align="center">VS Code Folder Picker • Cross‑Platform • Icons & Validation • Instant Navigation</blockquote>

<h4 align="center">
  ✨ Fast, custom cross-platform folder picker and creator for VS Code with icons, validation, and instant navigation. 🎨
</h4>

<br>

## 📃 Table of Contents

- [**Features**](#-features)
- [**Motivation**](#-motivation)
- [**Usage**](#-usage)
- [**API**](#-api)
- [**Examples**](#️-examples)
- [**Demo**](#️-demo)
- [**Changelog**](#-changelog)
- [**Support**](#-support)
- [**License**](#-license)
- [**Related**](#-related)
- [**Author**](#-author)

<br>

## 🤖 Features

- ✨ Fast Folder Selection
- 🎨 Icons With Clear Visuals
- ⚡ Instant Navigation
- ✅ Path Validation
- 🛠️ Configurable Buttons
- 🎯 Custom Handlers & Events
- 📂 Create & Navigate Folders
- 🔔 Error & Action Callbacks

<br>

## 🎯 Motivation

This module powers my **[New Folder](https://github.com/igorskyflyer/vscode-new-folder)** VS Code extension.  
It is under active development - expect ***breaking*** changes.

### The goal
Provide a simple UI/UX for creating new folders when opening a new or blank VS Code instance, since that behavior is not built‑in.

### Why not use `showSaveDialog()`?
- Works only if `files.simpleDialog.enable` is set to `true` (a global preference that changes the UX for all file/folder dialogs).
- Limited to creating a single‑level child folder - no nested/recursive folder creation.

### What happened upstream?
- I filed a feature request [#127201](https://github.com/microsoft/vscode/issues/127201) with [@microsoft/vscode](https://github.com/microsoft/vscode).
- The request was closed as *by design*.

### The result
I built my own UI and logic to overcome these limitations.  
This project is the outcome of that effort.

<br>

## 🕵🏼 Usage

Install it by executing any of the following, depending on your preferred package manager:

```bash
pnpm add @igorskyflyer/vscode-folderpicker
```

```bash
yarn add @igorskyflyer/vscode-folderpicker
```

```bash
npm i @igorskyflyer/vscode-folderpicker
```

<br>

## 🤹🏼 API

<a id="folder-picker-responsespeed"></a>

```ts
enum ResponseSpeed
```

Used for controlling the response speed of the `InputBox` of the `QuickPick`. Since `v.2.0.0` callbacks for generating Actions are throttled/debounced when necessary and the picker now waits for the user to finish their input before generating available Actions for performance reasons. Throttling is provided by [`Zep()`](https://www.npmjs.com/package/@igorskyflyer/zep).  

Available values are: `Instant`, `Fast`, `Normal` (default), `Lazy`.

<br>

> ### ℹ️ NOTE
>
> #### Throttling
>
> Setting this property to `Instant` will disable all throttling!
>

<br>

```ts
showFolderPicker(directory: string, options?: Partial<IFolderPickerOptions>): void
```

**Parameters**

_directory_: `string` - Initial directory to display in the picker.

_options_: `Partial<IFolderPickerOptions>` - Optional configuration to customize behavior and UI.  

Options:

### `IFolderPickerOptions`

#### UI/UX

- **`[dialogTitle]`**: **string** = **'Pick a Folder'** - Title text displayed at the top of the dialog. Defaults to `'Pick a Folder'`.  

- **`[showIcons]`**: **boolean** = **true** - Whether to show icons next to folder items. Defaults to `true`.  

Be aware that the term _icon_ is used here descriptively.  

This property expects either:  
- a **single emoji** (e.g. `📂`), or  
- a **VS Code ThemeIcon** (string shorthand like `'$(gear)'` or an object instance `new ThemeIcon('gear')`).  

To see the list of available ThemeIcons, look at the official [**Visual Studio Code documentation**](https://code.visualstudio.com/api/references/icons-in-labels#icon-listing).  
See the [**Icons**] section below.  

- **`[showConfigButton]`**: **boolean** = **false** - Whether to display a configuration (⚙️) button in the UI. Defaults to `false`.  

- **`[autoNavigate]`**: **boolean** = **false** - Whether to auto navigate to a child folder when creating new child folders. Defaults to `false`.  

- **`[responseSpeed]`**: **ResponseSpeed** = **ResponseSpeed.Normal** - Controls how quickly the picker responds to user input. Can be a predefined `ResponseSpeed` or a custom debounce interval in ms. See [ResponseSpeed](#folder-picker-responsespeed). Defaults to `ResponseSpeed.Normal`.  

- **`[ignoreFocusOut]`**: **boolean** = **false** - Whether the picker remains open when focus is lost. Defaults to `false`.  

- **`[canPick]`**: **boolean** = **true** - Whether to enable picking of current folder in the Picker. Defaults to `true`.  

#### Icons

- **`[iconFolder]`**: **string** = '' - Icon used for folder entries.  

- **`[iconFolderUp]`**: **string** = '' - Icon used for the go up (parent folder) action.  

- **`[iconCreate]`**: **string** = '' - Icon used for the create new folder action.  

- **`[iconNavigate]`**: **string** = '' - Icon used for navigation actions.  

- **`[iconPick]`**: **string** = '' - Icon used for the pick action.  

- **`[iconClear]`**: **string** = '' - Icon used for the clear action.  

#### Behavior

- **`[onCreateFolder]`**: **(folderPath: string) => void** - Callback fired when a new folder is created.  

- **`[onPickFolder]`**: **(folderPath: string) => void** - Callback fired when a folder is picked/selected.  

- **`[onNavigateTo]`**: **(folderPath: string) => void** - Callback fired when navigating into a folder.  

- **`[onGoUp]`**: **(folderPath: string) => void** - Callback fired when navigating up to the parent folder.  

- **`[onFetch]`**: **() => void** - Callback fired before fetching folder contents.  

- **`[onFetched]`**: **() => void** - Callback fired after folder contents have been fetched.  

- **`[onClose]`**: **() => void** - Callback fired when the picker is closed.  

- **`[onConfigButton]`**: **() => void** - Callback fired when the configuration button is pressed. Requires `showConfigButton` to be set to `true`.  

- **`[onError]`**: **(error: Error) => void** - Callback fired when an error occurs.  

- **`[onUnspecifiedAction]`**: **(ui: vscode.QuickPick) => void** - Callback fired for actions not covered by other handlers. Provides full access to the underlying QuickPick if needed.

<br>

## 🗒️ Examples

```ts
// some magic code 🔮

import { showFolderPicker } from 'vscode-folderpicker'
import { ThemeIcon } from 'vscode'

function openFolderPicker() {
  showFolderPicker('/Users/igorskyflyer/projects', {
    dialogTitle: 'Select a Project Folder',
    showIcons: true,
    showConfigButton: true,
    autoNavigate: false,
    responseSpeed: 150, // custom debounce in ms
    ignoreFocusOut: false,
    canPick: true,

    // custom icons (emoji or ThemeIcon)
    iconFolder: '📂',
    iconFolderUp: new ThemeIcon('arrow-up'),
    iconCreate: new ThemeIcon('new-folder'),
    iconNavigate: '➡️',
    iconPick: '✅',
    iconClear: '❌',

    // lifecycle callbacks
    onCreateFolder: (folderPath) => {
      console.log('Created folder:', folderPath)
    },
    onPickFolder: (folderPath) => {
      console.log('Picked folder:', folderPath)
    },
    onNavigateTo: (folderPath) => {
      console.log('Navigated into:', folderPath)
    },
    onGoUp: (folderPath) => {
      console.log('Went up to:', folderPath)
    },
    onFetch: () => {
      console.log('Fetching folder contents…')
    },
    onFetched: () => {
      console.log('Finished fetching folder contents')
    },
    onClose: () => {
      console.log('Folder picker closed')
    },
    onConfigButton: () => {
      console.log('Config button clicked')
    },
    onError: error => {
      console.error('Error in folder picker:', error)
    },
    onUnspecifiedAction: (quickPick) => {
      console.log('Unspecified action triggered', quickPick)
    }
  })
}

// even more magic code ✨

openFolderPicker()
```

<br>

### 👁️ Demo

<div align="center">
  <figure>
    <img src="https://raw.githubusercontent.com/igorskyflyer/npm-vscode-folderpicker/main/screenshots/command-palette-create-relative.gif" alt="VS Code Folder Picker - Command Palette creating a relative folder in current directory">
    <br>
    <figcaption>
      <strong>Figure 1.</strong> <em>Command Palette creating a relative folder in the current directory</em>
    </figcaption>
  </figure>

  <br>
  <br>

  <figure>
    <img src="https://raw.githubusercontent.com/igorskyflyer/npm-vscode-folderpicker/main/screenshots/command-palette-create-absolute.gif" alt="VS Code Folder Picker - Command Palette creating a folder with absolute path">
    <br>
    <figcaption>
      <strong>Figure 2.</strong> <em>Command Palette creating a folder with an absolute path</em>
    </figcaption>
  </figure>

  <br>
  <br>

  <figure>
    <img src="https://raw.githubusercontent.com/igorskyflyer/npm-vscode-folderpicker/main/screenshots/command-palette-recursive-folder.gif" alt="VS Code Folder Picker - Command Palette creating nested recursive folders">
    <br>
    <figcaption>
      <strong>Figure 3.</strong> <em>Command Palette creating folders recursively in the current directory</em>
    </figcaption>
  </figure>

  <br>
  <br>

  <figure>
    <img src="https://raw.githubusercontent.com/igorskyflyer/npm-vscode-folderpicker/main/screenshots/command-palette-invalid-folder.gif" alt="VS Code Folder Picker - Command Palette showing invalid folder name error">
    <br>
    <figcaption>
      <strong>Figure 4.</strong> <em>Invalid folder name supplied in the Command Palette</em>
    </figcaption>
  </figure>

  <br>
  <br>

  <figure>
    <img src="https://raw.githubusercontent.com/igorskyflyer/npm-vscode-folderpicker/main/screenshots/command-palette-navigate-relative.gif" alt="VS Code Folder Picker - Command Palette navigating to relative folder path">
    <br>
    <figcaption>
      <strong>Figure 5.</strong> <em>Navigation to relative‑path folders</em>
    </figcaption>
  </figure>

  <br>
  <br>

  <figure>
    <img src="https://raw.githubusercontent.com/igorskyflyer/npm-vscode-folderpicker/main/screenshots/command-palette-navigate-absolute.gif" alt="VS Code Folder Picker - Command Palette navigating to absolute folder path">
    <br>
    <figcaption>
      <strong>Figure 6.</strong> <em>Navigation to absolute‑path folders</em>
    </figcaption>
  </figure>

  <br>
  <br>

  <figure>
    <img src="https://raw.githubusercontent.com/igorskyflyer/npm-vscode-folderpicker/main/screenshots/command-palette-pick-folder.gif" alt="VS Code Folder Picker - Command Palette picking a folder">
    <br>
    <figcaption>
      <strong>Figure 7.</strong> <em>Picking a folder from the Command Palette</em>
    </figcaption>
  </figure>
</div>

<br>

## 📝 Changelog

📑 Read about the latest changes in the [**CHANGELOG**](https://github.com/igorskyflyer/npm-vscode-folderpicker/blob/main/CHANGELOG.md).

<br>

## 🪪 License

Licensed under the [**MIT license**](https://github.com/igorskyflyer/npm-vscode-folderpicker/blob/main/LICENSE).

<br>

## 💖 Support

<div align="center">
  I work hard for every project, including this one and your support means a lot to me!
  <br>
  Consider buying me a coffee. ☕
  <br>
  <br>
  <a href="https://ko-fi.com/igorskyflyer" target="_blank"><img src="https://raw.githubusercontent.com/igorskyflyer/igorskyflyer/main/assets/ko-fi.png" alt="Donate to igorskyflyer" width="180" height="46"></a>
  <br>
  <br>
  <em>Thank you for supporting my efforts!</em> 🙏😊
</div>

<br>

## 🧬 Related

[**@igorskyflyer/normalized-string**](https://www.npmjs.com/package/@igorskyflyer/normalized-string)

> _💊 NormalizedString provides you with a String type with consistent line-endings, guaranteed. 📮_

<br>

[**@igorskyflyer/valid-path**](https://www.npmjs.com/package/@igorskyflyer/valid-path)

> _🧰 Determines whether a given value can be a valid file/directory name. 🏜_

<br>

[**@igorskyflyer/comment-it**](https://www.npmjs.com/package/@igorskyflyer/comment-it)

> _📜 Formats the provided string as a comment, either a single or a multi line comment for the given programming language. 💻_

<br>

[**@igorskyflyer/jmap**](https://www.npmjs.com/package/@igorskyflyer/jmap)

> _🕶️ Reads a JSON file into a Map. 🌻_

<br>

[**@igorskyflyer/is-rootdir**](https://www.npmjs.com/package/@igorskyflyer/is-rootdir)

> _🔼 Checks whether the given path is the root of a drive or filesystem. ⛔_

<br>

## 👨🏻‍💻 Author
Created by **Igor Dimitrijević ([*@igorskyflyer*](https://github.com/igorskyflyer/))**.
