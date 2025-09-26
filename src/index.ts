import { isRootDirectory, isRootDirectoryWin } from '@igorskyflyer/is-rootdir'
import { pathExists } from '@igorskyflyer/pathexists'
import { Depth, Entry, readDirSync } from '@igorskyflyer/recursive-readdir'
import { slash, u } from '@igorskyflyer/upath'
import { isValidPath } from '@igorskyflyer/valid-path'
import { Zep } from '@igorskyflyer/zep'
import { defineStrictOptions } from '@igorskyflyer/zitto'
import type { PathLike } from 'node:fs'
import { accessSync, realpathSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { isAbsolute, join, resolve } from 'node:path'
import { type QuickInputButton, ThemeIcon, window } from 'vscode'
import {
  ICON_CLEAR,
  ICON_CREATE,
  ICON_FOLDER,
  ICON_FOLDER_UP,
  ICON_NAVIGATE,
  ICON_PICK
} from './Icon.js'
import type { IFolderPickerOptions } from './interfaces/IFolderPickerOptions.js'
import type { IFolderPickerState } from './interfaces/IFolderPickerState.js'
import type { IFolderQuickPickItem } from './interfaces/IFolderQuickPickItem.js'
import { ActionType } from './types/ActionType.js'
import type { FolderPicker } from './types/FolderPicker.js'
import type { LabelIcon } from './types/LabelIcon.js'
import { ResponseSpeed } from './types/ResponseSpeed.js'

const ButtonConfig: QuickInputButton = {
  iconPath: new ThemeIcon('gear'),
  tooltip: 'Configure...'
}

function isThemeIcon(icon: LabelIcon): icon is ThemeIcon {
  return !!icon && typeof icon === 'object' && typeof icon.id === 'string'
}

function resolveIcon(icon: LabelIcon, defaultIcon: string): string {
  if (!icon) {
    return defaultIcon
  } else if (typeof icon === 'string' && icon.length > 0) {
    return icon
  } else if (isThemeIcon(icon)) {
    return `$(${icon.id})`
  }

  return defaultIcon
}

function iconify(label: string, icon: LabelIcon): string {
  return `${icon} ${label}`
}

function getDirectories(path: string, options: IFolderPickerOptions): string[] {
  if (typeof options.onFetch === 'function') {
    options.onFetch()
  }

  const entries: string[] = readDirSync(path, {
    entries: Entry.DirectoriesOnly,
    maxDepth: Depth.Root
  })

  if (!isRootDirectory(path)) {
    entries.unshift('..')
  }

  if (options.canPick) {
    entries.unshift('.')
  }

  if (typeof options.onFetched === 'function') {
    options.onFetched()
  }

  return entries
}

function canAccess(path: PathLike): boolean {
  try {
    accessSync(path)
    return true
  } catch {
    return false
  }
}

function getUpAction(entry: string, folderUp: LabelIcon) {
  return {
    label: iconify(entry, folderUp),
    description: 'parent folder',
    action: ActionType.ParentFolder,
    path: '..',
    alwaysShow: false
  }
}

function getDirectoryItems(
  entries: string[],
  options: IFolderPickerOptions
): IFolderQuickPickItem[] {
  return entries.map((entry: string) => {
    if (options.canPick && entry === '.') {
      return getPickCurrentAction(options.iconPick)
    }
    if (entry === '..') {
      return getUpAction(entry, options.iconFolderUp)
    } else {
      return {
        label: iconify(entry, options.iconFolder),
        description: 'folder',
        action: ActionType.ChildFolder,
        path: entry,
        alwaysShow: false
      }
    }
  })
}

function fillOptions(
  userOpts?: Partial<IFolderPickerOptions>
): IFolderPickerOptions {
  const defaults: IFolderPickerOptions = {
    dialogTitle: 'Pick a Folder',
    showIcons: true,
    showConfigButton: false,
    autoNavigate: false,
    iconFolder: '',
    iconFolderUp: '',
    iconCreate: '',
    iconNavigate: '',
    iconPick: '',
    iconClear: '',
    responseSpeed: ResponseSpeed.Normal,
    ignoreFocusOut: false,
    canPick: true,
    onConfigButton: undefined,
    onCreateFolder: undefined,
    onNavigateTo: undefined,
    onGoUp: undefined,
    onPickFolder: undefined,
    onError: undefined,
    onClose: undefined,
    onFetch: undefined,
    onFetched: undefined,
    onUnspecifiedAction: undefined
  }

  const options: IFolderPickerOptions = defineStrictOptions(defaults, userOpts)

  if (options.showIcons) {
    options.iconFolder = resolveIcon(options.iconFolder, ICON_FOLDER)
    options.iconFolderUp = resolveIcon(options.iconFolderUp, ICON_FOLDER_UP)
    options.iconCreate = resolveIcon(options.iconCreate, ICON_CREATE)
    options.iconNavigate = resolveIcon(options.iconNavigate, ICON_NAVIGATE)
    options.iconPick = resolveIcon(options.iconPick, ICON_PICK)
    options.iconClear = resolveIcon(options.iconClear, ICON_CLEAR)
  }

  return options
}

function getAction(
  label: string,
  description: string,
  path: string,
  alwaysShow: boolean,
  action: number
): IFolderQuickPickItem {
  return {
    label,
    description,
    path,
    alwaysShow,
    action
  }
}

function getCreateAction(
  path: string,
  description: string,
  icon: LabelIcon
): IFolderQuickPickItem {
  return getAction(
    `${resolveIcon(icon, ICON_CREATE)} ${path}`,
    description,
    path,
    true,
    ActionType.CreateFolder
  )
}

function getNavigateAction(path: string, icon: LabelIcon) {
  return getAction(
    `${resolveIcon(icon, ICON_NAVIGATE)} ${path}`,
    `Navigate to ${path}`,
    path,
    true,
    ActionType.Navigate
  )
}

function getPickCurrentAction(icon: LabelIcon): IFolderQuickPickItem {
  return getAction(
    `${resolveIcon(icon, ICON_PICK)} .`,
    'Pick current folder',
    '.',
    false,
    ActionType.PickFolder
  )
}

function getClearInputAction(description: string, icon: LabelIcon) {
  return getAction(
    `${resolveIcon(icon, ICON_CLEAR)} ${description}`,
    'Clear',
    '',
    true,
    ActionType.Clear
  )
}

function normalizeComponentsForPlatform(components: string[]): string[] {
  // On Windows, strip the drive letter (e.g. "C:")
  if (
    platform() === 'win32' &&
    components.length > 0 &&
    isRootDirectoryWin(components[0])
  ) {
    return components.slice(1)
  }

  return components
}

function isValidAbsolutePath(absolutePath: string): boolean {
  const components: string[] = normalizeComponentsForPlatform(
    absolutePath.split(slash).filter(Boolean)
  )

  for (const part of components) {
    if (!isValidPath(part, false)) {
      return false
    }
  }

  return true
}

function handleAbsolutePath(
  picker: FolderPicker,
  absolutePath: string,
  folderPath: string,
  state: IFolderPickerState,
  actions: IFolderQuickPickItem[]
): IFolderPickerState {
  if (canAccess(absolutePath)) {
    // fixes an issue with non-proper path case
    absolutePath = realpathSync.native(absolutePath)
    picker.placeholder = absolutePath
    actions.unshift(getNavigateAction(absolutePath, state.options.iconNavigate))
  } else if (isValidAbsolutePath(absolutePath)) {
    const clearAction: IFolderQuickPickItem[] = [
      getClearInputAction('Path not accessible', state.options.iconClear)
    ]
    picker.items = clearAction
  } else {
    actions.unshift(
      getCreateAction(
        folderPath,
        `Create "${folderPath}"`,
        state.options.iconCreate
      )
    )
  }
  return state
}

function pickerActions(
  picker: FolderPicker,
  state: IFolderPickerState
): IFolderPickerState {
  try {
    if (!picker.value) {
      picker.items = getDirectoryItems(state.entries, state.options)
      picker.busy = false

      return state
    }

    // ah, path-safety 😌
    const folderPath: string = u(picker.value)

    if (pathExists(folderPath, state.entries)) {
      picker.items = getDirectoryItems(state.entries, state.options)
      return state
    }

    const actions: IFolderQuickPickItem[] = []

    // run through uPath again,
    // this time add a trailing slash,
    // allows us to catch things like
    // D: on Windows
    const absolutePath: string = u(folderPath, true)

    if (isAbsolute(absolutePath)) {
      handleAbsolutePath(picker, absolutePath, folderPath, state, actions)
    } else if (isValidPath(folderPath, false)) {
      if (
        state.options.autoNavigate &&
        canAccess(join(state.currentPath, folderPath))
      ) {
        state.currentPath = join(state.currentPath, folderPath)
        actions.unshift({
          label: `Navigating to ${folderPath}...`,
          action: ActionType.Navigate,
          description: '',
          path: folderPath,
          alwaysShow: false
        })
        state.entries = getDirectories(state.currentPath, state.options)
        picker.items = getDirectoryItems(state.entries, state.options)
        picker.value = ''
      } else {
        actions.unshift(
          getCreateAction(
            folderPath,
            `Create in ${state.currentPath}`,
            state.options.iconCreate
          )
        )
      }
    } else {
      const clearAction: IFolderQuickPickItem[] = [
        getClearInputAction('Invalid folder name', state.options.iconClear)
      ]
      picker.items = clearAction
      return state
    }

    picker.items = [
      ...actions,
      ...getDirectoryItems(state.entries, state.options)
    ]

    return state
  } finally {
    picker.busy = false
  }
}

function pickerChanged(
  picker: FolderPicker,
  actionsPending: boolean,
  state: IFolderPickerState
): IFolderPickerState {
  if (picker.value === '' && !actionsPending && picker.activeItems.length > 0) {
    try {
      const activePath: string = picker.activeItems[0].path

      if (activePath === '.') {
        picker.placeholder = state.currentPath
      } else if (activePath === '..') {
        picker.placeholder = resolve(join(state.currentPath, '..'))
      } else {
        picker.placeholder = resolve(join(state.currentPath, activePath))
      }
    } catch (exp) {
      if (typeof state.options.onError === 'function') {
        state.options.onError(exp as Error)
      }
    }
  }

  return state
}

function handleChildFolder(
  picker: FolderPicker,
  state: IFolderPickerState,
  item: IFolderQuickPickItem
): IFolderPickerState {
  state.currentPath = resolve(join(state.currentPath, item.path))

  return refreshItems(picker, state)
}

function handleParentFolder(
  picker: FolderPicker,
  state: IFolderPickerState,
  item: IFolderQuickPickItem
): IFolderPickerState {
  state.currentPath = resolve(join(state.currentPath, item.path))

  if (typeof state.options.onGoUp === 'function') {
    state.options.onGoUp(state.currentPath)
  }

  return refreshItems(picker, state)
}

function handleNavigate(
  picker: FolderPicker,
  state: IFolderPickerState,
  item: IFolderQuickPickItem
): IFolderPickerState {
  if (isAbsolute(item.path)) {
    state.currentPath = item.path

    if (typeof state.options.onNavigateTo === 'function') {
      state.options.onNavigateTo(state.currentPath)
    }

    return refreshItems(picker, state)
  }

  return state
}

function handleCreateFolder(
  picker: FolderPicker,
  state: IFolderPickerState,
  item: IFolderQuickPickItem
): IFolderPickerState {
  const newFolderPath: string = isAbsolute(item.path)
    ? item.path
    : resolve(join(state.currentPath, item.path))

  if (typeof state.options.onCreateFolder === 'function') {
    state.options.onCreateFolder(newFolderPath)
    picker.hide()
  }

  return state
}

function handlePickFolder(
  picker: FolderPicker,
  state: IFolderPickerState
): IFolderPickerState {
  if (typeof state.options.onPickFolder === 'function') {
    state.options.onPickFolder(state.currentPath)
    picker.hide()
  }

  return state
}

function handleClear(
  picker: FolderPicker,
  state: IFolderPickerState
): IFolderPickerState {
  picker.value = ''
  return refreshItems(picker, state)
}

function handleUnspecified(
  picker: FolderPicker,
  state: IFolderPickerState
): IFolderPickerState {
  if (typeof state.options.onUnspecifiedAction === 'function') {
    state.options.onUnspecifiedAction(picker)
    picker.hide()
  }

  return state
}

function refreshItems(
  picker: FolderPicker,
  state: IFolderPickerState
): IFolderPickerState {
  state.entries = getDirectories(state.currentPath, state.options)
  picker.items = getDirectoryItems(state.entries, state.options)

  picker.value = ''

  return state
}

function pickerAccept(
  picker: FolderPicker,
  state: IFolderPickerState
): IFolderPickerState {
  if (picker.activeItems.length === 0) {
    if (typeof state.options.onUnspecifiedAction === 'function') {
      state.options.onUnspecifiedAction(picker)
    }

    return state
  }

  const item: IFolderQuickPickItem = picker.activeItems[0]

  switch (item.action) {
    case ActionType.ChildFolder:
      return handleChildFolder(picker, state, item)

    case ActionType.ParentFolder:
      return handleParentFolder(picker, state, item)

    case ActionType.Navigate:
      return handleNavigate(picker, state, item)

    case ActionType.CreateFolder:
      return handleCreateFolder(picker, state, item)

    case ActionType.PickFolder:
      return handlePickFolder(picker, state)

    case ActionType.Clear:
      return handleClear(picker, state)

    default:
      return handleUnspecified(picker, state)
  }
}

/**
 * Opens an interactive Folder Picker dialog with folder creation support.
 *
 * Displays a navigable UI for selecting or creating folders.
 * If no `directory` is provided, the user's home directory is shown by default.
 *
 * @public
 * @param {string} directory - Initial directory to display in the picker.
 * @param {Partial<IFolderPickerOptions>} [options] - Optional configuration to customize behavior and UI.
 * @returns {void} This function is interactive and does not return a value.
 */
export function showFolderPicker(
  directory: string,
  options?: Partial<IFolderPickerOptions>
): void {
  let state: IFolderPickerState = {
    currentPath: '',
    entries: [],
    options: fillOptions(options || {})
  }

  try {
    const picker: FolderPicker = window.createQuickPick<IFolderQuickPickItem>()
    const resolvedDirectory: string = resolve(directory || homedir())

    state.currentPath = resolvedDirectory
    refreshItems(picker, state)

    picker.title = state.options.dialogTitle
    picker.ignoreFocusOut = state.options.ignoreFocusOut
    picker.canSelectMany = false

    if (state.options.showConfigButton) {
      picker.buttons = [ButtonConfig]

      picker.onDidTriggerButton((e) => {
        if (typeof state.options.onConfigButton === 'function') {
          picker.hide()

          if (e.tooltip === ButtonConfig.tooltip) {
            state.options.onConfigButton()
          }
        }
      })
    }

    const zepActions: Zep = new Zep(() => {
      state = pickerActions(picker, state)
    }, state.options.responseSpeed)

    zepActions.onError((error) => {
      if (typeof state.options.onError === 'function') {
        state.options.onError(error as Error)
      }
    })

    const zepChanged: Zep = new Zep(() => {
      state = pickerChanged(picker, zepActions.isWaiting, state)
    }, state.options.responseSpeed)

    zepChanged.onError((error) => {
      if (typeof state.options.onError === 'function') {
        state.options.onError(error as Error)
      }
    })

    picker.onDidChangeActive(() => {
      zepChanged.run()
    })

    picker.onDidHide(() => {
      // free-up memory
      picker.dispose()

      if (typeof state.options.onClose === 'function') {
        state.options.onClose()
      }
    })

    picker.onDidChangeValue(() => {
      picker.busy = true
      zepActions.run()
    })

    picker.onDidAccept(() => {
      state = pickerAccept(picker, state)
    })

    picker.show()
  } catch (exp) {
    if (typeof state.options.onError === 'function') {
      state.options.onError(exp as Error)
    }
  }
}

export { ResponseSpeed }
