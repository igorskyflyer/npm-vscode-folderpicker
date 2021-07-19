## FolderPicker

<sub><em>for Visual Studio Code</em></sub>

<br>

<p align="center">Made possible with 🦎 <em>Gecko</em> - an upcoming project.</p>

<br>

> ⚠ This module is built as the core functionality of my **[New Folder](https://github.com/igorskyflyer/vscode-new-folder)** Visual Studio Code extension and is still under active development, use at own risk, if needed.

<br>

> ✨ Current major version `v.2.x.x` contains breaking changes.

<br>
<br>

Provides a custom Folder Picker API + UI for Visual Studio Code.

<br>

The module exposes a single function `showFolderPicker()` which provides a custom `QuickPick` UI rather than the _built-in_ Visual Studio Code `QuickPick` UI.

<br>

Currently, its functionalities are tightly-coupled with my extension **[New Folder](https://github.com/igorskyflyer/vscode-new-folder)** but I will make the module more generic in the future.

<br>

> 🙋‍♂️ The necessity for this module?

> 💬 When I started my beforementioned **[New Folder](https://github.com/igorskyflyer/vscode-new-folder)** extension for Visual Studio Code my goal was to implement a simple UX for creating new folders when opening a new/blank instance of Visual Studio Code since that behavior is not built-in. I started with the built-in [`vscode.window.showSaveDialog()`](https://code.visualstudio.com/api/references/vscode-api) function which works great when you set the option `files.simpleDialog.enable` to `true` but that is a global preference and not everyone - including myself - wants to change the whole UX for file/folder opening just for that. Then I reached out to our friends at [@microsoft/vscode](https://github.com/microsoft/vscode) and posted a feature request [#127201](https://github.com/microsoft/vscode/issues/127201) to override this behavior but they closed the feature request as that is by-design. Another issue that was present is that the original code only allowed to create a single-level child folder (no nested/recursive folder creation) due to limitations of the native `vscode.window.showSaveDialog()` function. Upon closure I decided to build my own UI/logic for that and this project and module are what I managed to achieve so far. 🤗

<br>

### Usage

Install it by running

```shell
npm i "@igor.dvlpr/vscode-folderpicker"
```

<br>
<br>

### API

<br>

<a id="folder-picker-responsespeed"></a>

```ts
enum ResponseSpeed
```

Used for controlling the response speed of the `InputBox` of the `QuickPick`. Since `v.2.0.0` callbacks for generating Actions are throttled/debounced when necessary and the picker now waits for the user to finish their input before generating available Actions for performance reasons. Throttling provided by [`Zep()`](https://www.npmjs.com/package/@igor.dvlpr/zep).

Available values are: `Instant`, `Fast`, `Normal` (default), `Lazy`.

Note: setting the property `responseSpeed` in the `options` parameter of `showFolderPicker()` to `Instant` will disable throttling!

<br>

```ts
showFolderPicker(directory: string, options?: FolderPickerOptions): void
```

**Parameters**

_directory_: `string` - the initial directory to show in Folder Picker UI, if none is specified default to user home directory,
_options_: `FolderPickerOptions` - additional options to pass and where you should place your callbacks, will most likely change in the near future. All properties are **optional** and callbacks are not defined.

Available properties/callbacks:

`FolderPickerOptions`

- **`[dialogTitle]`**: **string** = **'Pick a Folder'** - the Folder Picker title, shown at the top of the picker,

- **`[showIcons]`**: **boolean** = **true** - indicates whether icons will be shown in the Folder Picker. When this property is set to `false` all/any icons you set will be ignored,

Icons - grouped together for brevity

- **`[iconFolder]`**: **string** = '' - _icon_ to use for folder entries,
- **`[iconFolderUp]`**: **string** = '' - _icon_ to use for the folder up entry,
- **`[iconCreate]`**: **string** = '' - _icon_ to use for `Create folder` Action,
- **`[iconNavigate]`**: **string** = '' - _icon_ to use for `Navigate to...` Action,
- **`[iconPick]`**: **string** = '' - _icon_ to use for `Pick current directory` Action.
- **`[iconClear]`**: **string** = '' - _icon_ to use for `Clear` Action, available when the folder name is not valid.

Be aware that the term _icon_ is used here as a descriptive one, this property expects a **single** emoji or a **single** `ThemeIcon` which is a string as well, to see the list of available ThemeIcons, look at the official Visual Studio Code documentation, **[here](https://code.visualstudio.com/api/references/icons-in-labels#icon-listing)**,

- **`[responseSpeed]`**: **ResponseSpeed** = **ResponseSpeed.Normal** - used for controlling the response speed of the `InputBox` of the `QuickPick`. See [ResponseSpeed](#folder-picker-responsespeed),

- **`[ignoreFocusOut]`**: **boolean** = **true** - whether the UI should stay open even when loosing UI focus. Defaults to **true**,

- **`[showConfigButton]`**: **boolean** = **false** - whether to show a Config button in the top-right corner of the Picker. Defaults to **false**,

- **`[onCreateFolder]`**: **(folderPath: string) => void** - called when the New Folder action is triggered, here you should put your logic for folder creation,

- **`[onNavigateTo]`**: **(folderPath: string, ui: vscode.QuickPick) => void** - called when the user is navigating to an arbitrary absolute path.

- **`[onGoUp]`**: **(folderPath: string, ui: vscode.QuickPick) => void** - called when the user has clicked on the parent folder entry, that navigates one folder up the directory tree.

- **`[onPickFolder]`**: **(folderPath: string) => void** - called when the user has picked a folder.

- **`[onError]`**: **(error: Error) => void** - called when an error has occurred.

- **`[onClose]`**: **() => void** - called when the user has closed the picker, either by picking a folder, creating a new one, removed focus from the UI - if applicable - `ignoreFocusOut = false`, or pressing `Esc`.

- **`[onConfigButton]`**: **() => void** - since `v.2.0.0` a Config button is shown at the top right corner of the UI. This callback will be invoked when clicking on it.

- **`[onFetch]`**: **() => void** - called before the picker fetches directory entries. Most likely this callback will be **removed**.

- **`[onUnspecifiedAction]`**: **(ui: vscode.QuickPick) => void** - called when there is no action specified. This callback might be triggered in some rare cases - might be removed.

<br>
<br>

### Example

then call it inside your extension's code,

```js
// some magic code 🔮

showFolderPicker(directory, {
  iconFolder: '⚡',
  iconFolderUp: '🔼',
  ignoreFocusOut: true,
})

// even more magic code ✨
```

<br>

### Demo

<p align="center">
	<img src="https://raw.githubusercontent.com/igorskyflyer/npm-vscode-folderpicker/main/screenshots/explorer-command.gif" alt="Explorer View">
	<sub>Explorer View command</sub>
</p>

<br>
<br>

<p align="center">
	<img src="https://raw.githubusercontent.com/igorskyflyer/npm-vscode-folderpicker/main/screenshots/command-palette-create.gif" alt="Command Palette New Folder">
	<sub>Command palette command to create a folder in current directory</sub>
</p>

<br>
<br>

<p align="center">
	<img src="https://raw.githubusercontent.com/igorskyflyer/npm-vscode-folderpicker/main/screenshots/command-palette-navigate.gif" alt="Command Palette New Folder">
	<sub>Command Palette navigate to folder and recursive directories create</sub>
</p>

<br>
