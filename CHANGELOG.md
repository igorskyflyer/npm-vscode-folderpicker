# 📒 Changelog

### of [**@igorskyflyer/vscode-folderpicker**](https://github.com/igorskyflyer/npm-vscode-folderpicker)

<br>

## v3.0.0 (*26-Sep-2025*)

- **❌ breaking**: migrate from CommonJS + JSDoc typedefs to full TypeScript with ES modules
- **❌ breaking**: simplify callback signatures - most no longer expose `QuickPick`, with the exception of `UnknownActionCallback`
- **✅ fix**: normalize error handling - `ErrorCallback` now always receives an `Error` instance, powered by [**Zep**](https://www.npmjs.com/package/@igorskyflyer/zep)
- **💻 dev**: refactor `picker.onDidAccept` from inline `if/else` chain to `switch` with dedicated handler functions
- **💻 dev**: new `IFolderPickerOptions`, `IFolderPickerState`, and `IFolderQuickPickItem` types
- **💻 dev**: centralized `Callbacks.ts` with unified callback type aliases
- **💻 dev**: `ActionType` enum and `ResponseSpeed` type moved into dedicated files
- **💻 dev**: centralized icon constants (`ICON_FOLDER`, `ICON_PICK`, etc.)
- **💻 dev**: consistent option defaults via `defineStrictOptions`, powered by [**zitto**](https://www.npmjs.com/package/@igorskyflyer/zitto) instead of ad‑hoc mutation
- **💻 dev**: modularize codebase - split monolithic file into multiple focused files under `src/types/`
- **💻 dev**: improve testability by extracting pure handler functions (`handleCreateFolder`, `handleNavigate`, etc.)
- **💻 dev**: upgrade Node to `>= v22`
- **💻 dev**: upgrade dependencies
- **💻 dev**: add the changelog file
