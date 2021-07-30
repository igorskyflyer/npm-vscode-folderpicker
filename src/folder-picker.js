const { resolve, join, isAbsolute } = require('path')
const { accessSync, realpathSync } = require('fs')
const { homedir, platform } = require('os')

const vscode = require('vscode')

const { readDirSync, Entry, Depth } = require('@igor.dvlpr/recursive-readdir')
const { u, slash } = require('@igor.dvlpr/upath')
const { pathExists } = require('@igor.dvlpr/pathexists')
const { isRootDirectory, isRootDirectoryWin } = require('@igor.dvlpr/is-rootdir')
const { isValidPath } = require('@igor.dvlpr/valid-path')
const Zep = require('@igor.dvlpr/zep')

/* 🦎 Developed using Gecko 🦎 */

/**
 * @callback ActionCallback
 * @param {string} folderPath
 * @param {vscode.QuickPick} ui
 * @returns {void}
 */

/**
 * @callback NewFolderActionCallback
 * @param {string} folderPath
 * @returns {void}
 */

/**
 * @callback SimpleActionCallback
 * @returns {void}
 */

/**
 * @callback PickFolderActionCallback
 * @param {string} folderPath
 * @returns {void}
 */

/**
 * @callback FetchCallback
 * @returns {void}
 */

/**
 * @callback UnspecifiedActionCallback
 * @param {vscode.QuickPick} ui
 * @returns {void}
 */

/**
 * @callback ErrorCallback
 * @param {Error} error
 * @returns {void}
 */

/**
 * @enum {number}
 */
const ResponseSpeed = {
  Instant: 0,
  Fast: 120,
  Normal: 480,
  Lazy: 1000,
}

/**
 * @typedef FolderPickerOptions
 * @property {string} [dialogTitle='Pick a Folder']
 * @property {boolean} [showIcons=true]
 * @property {boolean} [showConfigButton=false]
 * @property {string|vscode.ThemeIcon} [iconFolder='']
 * @property {string|vscode.ThemeIcon} [iconFolderUp='']
 * @property {string|vscode.ThemeIcon} [iconCreate='']
 * @property {string|vscode.ThemeIcon} [iconNavigate='']
 * @property {string|vscode.ThemeIcon} [iconPick='']
 * @property {string|vscode.ThemeIcon} [iconClear='']
 * @property {ResponseSpeed} [responseSpeed=ResponseSpeed.Normal]
 * @property {boolean} [ignoreFocusOut=true]
 * @property {NewFolderActionCallback} [onCreateFolder]
 * @property {ActionCallback} [onNavigateTo]
 * @property {ActionCallback} [onGoUp]
 * @property {PickFolderActionCallback} [onPickFolder]
 * @property {ErrorCallback} [onError]
 * @property {SimpleActionCallback} [onClose]
 * @property {SimpleActionCallback} [onConfigButton]
 * @property {FetchCallback} [onFetch]
 * @property {UnspecifiedActionCallback} [onUnspecifiedAction]
 */

/**
 * @enum {number}
 */
const Action = {
  Unspecified: -2,
  Close: -1,
  Navigate: 0,
  CreateFolder: 1,
  ChildFolder: 2,
  ParentFolder: 3,
  PickFolder: 4,
  Clear: 5,
}

/**
 * @private
 * Resolves a ThemeIcon.
 * @param {string|vscode.ThemeIcon} icon
 * @returns {string}
 */
function resolveIcon(icon) {
  if (!icon) {
    return ''
  }

  if (typeof icon === 'string' || !icon.id) {
    return icon
  }

  return `$(${icon.id})`
}

/**
 * Adds an icon to the given label.
 * @private
 * @param {string} label
 * @param {string|vscode.ThemeIcon} icon
 * @returns {string}
 */
function iconify(label, icon) {
  return `${icon} ${label}`
}

/**
 * Gets directory entries.
 * @private
 * @param {string} path
 * @param {FolderPickerOptions} options
 * @returns {string[]}
 */
function getDirectories(path, options) {
  if (typeof options.onFetch === 'function') {
    options.onFetch()
  }

  const entries = readDirSync(path, {
    entries: Entry.DirectoriesOnly,
    maxDepth: Depth.Root,
  })

  if (!isRootDirectory(path)) {
    entries.unshift('..')
  }

  entries.unshift('.')

  return entries
}

/**
 * Creates QuickPickItems for the given directory entries.
 * @private
 * @param {string[]} entries
 * @param {FolderPickerOptions} options
 * @returns {vscode.QuickPickItem[]}
 */
function getDirectoryItems(entries, options) {
  return entries.map((entry) => {
    if (entry === '.') {
      return getPickCurrentAction(options.iconPick)
    }
    if (entry === '..') {
      return {
        label: iconify(entry, options.iconFolderUp),
        description: 'parent folder',
        action: Action.ParentFolder,
        path: '..',
      }
    } else {
      return {
        label: iconify(entry, options.iconFolder),
        description: 'folder',
        action: Action.ChildFolder,
        path: entry,
      }
    }
  })
}

/**
 * Checks whether the given path exists.
 * @private
 * @param {string} path
 * @returns {boolean}
 */
function canAccess(path) {
  try {
    accessSync(path)
    return true
  } catch {
    return false
  }
}

/**
 * Fills options with predefined values.
 * @private
 * @param {FolderPickerOptions} options
 * @returns {FolderPickerOptions}
 */
function fillOptions(options) {
  options.dialogTitle = options.dialogTitle || 'Pick a Folder'
  options.showIcons = options.showIcons == false ? false : true
  options.showConfigButton = options.showConfigButton || false
  options.ignoreFocusOut = options.ignoreFocusOut || false

  if (options.showIcons) {
    options.iconFolder = resolveIcon(options.iconFolder) || '$(folder)'
    options.iconFolderUp = resolveIcon(options.iconFolderUp) || '$(folder-opened)'
    options.iconCreate = resolveIcon(options.iconCreate) || '$(new-folder)'
    options.iconNavigate = resolveIcon(options.iconNavigate) || '$(chevron-right)'
    options.iconPick = resolveIcon(options.iconPick) || '$(check)'
    options.iconClear = resolveIcon(options.iconClear) || '$(close)'
  } else {
    options.iconFolder = ''
    options.iconFolderUp = ''
    options.iconCreate = ''
    options.iconNavigate = ''
    options.iconPick = ''
    options.iconClear = ''
  }

  // allows passing of ResponseSpeed.Instant = 0
  options.responseSpeed = options.responseSpeed == undefined ? ResponseSpeed.Normal : options.responseSpeed

  return options
}

/**
 * Creates an Action.
 * @param {string} [label='']
 * @param {string} [description='']
 * @param {string} [path='']
 * @param {boolean} [alwaysShow=false]
 * @param {number} [action=Action.Unspecified]
 * @returns {vscode.QuickPickItem}
 */
function getAction(label, description, path, alwaysShow, action) {
  return {
    label,
    description,
    path,
    alwaysShow,
    action,
  }
}

/**
 *  @private
 * @param {string} path
 * @param {string} description
 * @param {string|vscode.ThemeIcon} icon
 * @returns {vscode.QuickPickItem}
 */
function getCreateAction(path, description, icon) {
  return getAction(`${resolveIcon(icon)} ${path}`, description, path, true, Action.CreateFolder)
}

/**
 * @private
 * @param {string} path
 * @param {string|vscode.ThemeIcon} icon
 * @returns
 */
function getNavigateAction(path, icon) {
  return getAction(resolveIcon(icon), `Navigate to ${path}`, path, true, Action.Navigate)
}

/**
 * @private
 * @param {string|vscode.ThemeIcon} icon
 */
function getPickCurrentAction(icon) {
  return getAction(`${resolveIcon(icon)} .`, 'Pick current folder', '.', false, Action.PickFolder)
}

/**
 * @private
 * @param {string} description
 * @param {string|vscode.ThemeIcon} icon
 */
function getClearInputAction(description, icon) {
  return getAction(`${resolveIcon(icon)} ${description}`, 'Clear', '', true, Action.Clear)
}

/**
 * @private
 * @param {string} absolutePath
 *@returns {boolean}
 */
function isValidAbsolutePath(absolutePath) {
  const components = absolutePath.split(slash).filter(Boolean)
  let componentsCount = components.length
  let isInvalid = false

  if (componentsCount > 0) {
    // need to remove the drive letter from the path on Windows to check its validity
    if (platform() === 'win32' && isRootDirectoryWin(components[0])) {
      components.shift()
      componentsCount--
    }

    for (let i = 0; i < componentsCount; i++) {
      if (!isValidPath(components[i], false)) {
        isInvalid = true
        break
      }
    }
  }

  return isInvalid
}

/**
 * Shows an interactive Folder Picker and Creator dialog.
 * @public
 * @param {string} directory the initial directory to show in Folder Picker UI, if none is specified default to user home directory
 * @param {FolderPickerOptions} [options={}] additional options
 * @returns {void} no return value since everything is done in an interactive manner
 */
function showFolderPicker(directory, options) {
  try {
    options = fillOptions(options || {})

    const picker = vscode.window.createQuickPick()
    picker.title = options.dialogTitle
    picker.ignoreFocusOut = options.ignoreFocusOut
    picker.canSelectMany = false

    if (!directory) {
      directory = homedir()
    }

    const resolvedDirectory = resolve(directory)
    const clearAction = [getClearInputAction('Invalid folder name', options.iconClear)]
    let currentPath = resolvedDirectory

    picker.busy = true

    let entries = getDirectories(currentPath, options)
    let items = getDirectoryItems(entries, options)
    picker.items = items

    picker.busy = false

    if (options.showConfigButton) {
      picker.buttons = [{ iconPath: new vscode.ThemeIcon('gear'), tooltip: 'Configure...' }]

      picker.onDidTriggerButton((e) => {
        if (typeof options.onConfigButton === 'function') {
          picker.hide()

          if (e.tooltip === 'Configure...') {
            options.onConfigButton()
          }
        }
      })
    }

    const zepActions = new Zep((self, e) => {
      if (e !== picker.value) {
        return
      }

      // ah, path-safety 😌
      let folderPath = u(e)

      if (!pathExists(folderPath, entries)) {
        const actions = []

        // run through uPath again,
        // this time add a trailing slash,
        // allows us to catch things like
        // D: on Windows
        let absolutePath = u(folderPath, true)

        if (isAbsolute(absolutePath)) {
          if (!canAccess(absolutePath)) {
            if (!isValidAbsolutePath(absolutePath)) {
              actions.unshift(getCreateAction(folderPath, `Create "${folderPath}"`, options.iconCreate))
            } else {
              picker.items = clearAction
              picker.busy = false
              return
            }
          } else {
            // fixes an issue with non-proper path case
            absolutePath = realpathSync.native(absolutePath)
            picker.placeholder = absolutePath
            actions.unshift(getNavigateAction(absolutePath, options.iconNavigate))
          }
        } else {
          if (isValidPath(folderPath, false)) {
            actions.unshift(getCreateAction(folderPath, `Create in ${currentPath}`, options.iconCreate))
          } else {
            picker.items = clearAction
            picker.busy = false
            return
          }
        }

        picker.items = [...actions, ...items]
      } else {
        picker.items = items
      }

      picker.busy = false
    }, options.responseSpeed)

    zepActions.onError((self, error) => {
      if (typeof options.onError === 'function') {
        options.onError(error)
      }
    })

    const zepChanged = new Zep((self, items) => {
      // wait for Zep to do its magic 🔮
      if (picker.value === '' && !zepActions.isWaiting) {
        try {
          picker.placeholder = resolve(join(currentPath, items[0].path))
        } catch (exp) {
          if (typeof options.onError === 'function') {
            options.onError(exp)
          }
        }
      }
    }, options.responseSpeed)

    zepChanged.onError((self, error) => {
      if (typeof options.onError === 'function') {
        options.onError(error)
      }
    })

    picker.onDidChangeActive((e) => {
      if (e.length > 0) {
        zepChanged.run(e)
      }
    })

    picker.onDidHide(() => {
      // free-up memory
      picker.dispose()

      if (typeof options.onClose === 'function') {
        options.onClose()
      }
    })

    picker.onDidChangeValue((e) => {
      picker.busy = true

      if (!e) {
        picker.items = items
        picker.busy = false
      } else {
        zepActions.run(e)
      }
    })

    picker.onDidAccept(() => {
      try {
        if (picker.activeItems.length === 0) {
          if (typeof options.onUnspecifiedAction === 'function') {
            options.onUnspecifiedAction(picker)
          }

          return
        }

        // we have canSelectMany disabled
        const item = picker.activeItems[0]
        const action = item.action

        if (action === Action.ChildFolder) {
          currentPath = resolve(join(currentPath, item.path))
        } else if (action === Action.ParentFolder) {
          currentPath = resolve(join(currentPath, item.path))

          if (typeof options.onGoUp === 'function') {
            options.onGoUp(currentPath, picker)
          }
        } else if (action === Action.Navigate && isAbsolute(item.path)) {
          currentPath = item.path

          if (typeof options.onNavigateTo === 'function') {
            options.onNavigateTo(currentPath, picker)
          }
        } else if (action === Action.CreateFolder) {
          if (typeof options.onCreateFolder === 'function') {
            let newFolderPath

            if (isAbsolute(item.path)) {
              newFolderPath = item.path
            } else {
              newFolderPath = resolve(join(currentPath, item.path))
            }

            options.onCreateFolder(newFolderPath)
            picker.hide()
          }

          // stop execution here
          return
        } else if (action === Action.PickFolder) {
          if (typeof options.onPickFolder === 'function') {
            options.onPickFolder(currentPath)
          }

          picker.hide()
          return
        } else if (action === Action.Clear) {
          picker.value = ''
        } else {
          if (typeof options.onUnspecifiedAction === 'function') {
            options.onUnspecifiedAction(picker)
          }

          picker.hide()
          return
        }

        picker.value = ''
        entries = getDirectories(currentPath, options)
        items = getDirectoryItems(entries, options)
        picker.items = items
      } catch (exp) {
        if (typeof options.onError === 'function') {
          options.onError(exp)
        }
      }
    })

    picker.show()
  } catch (exp) {
    if (typeof options.onError === 'function') {
      options.onError(exp)
    }
  }
}

// here 👇 you should export VS Code dependent API
module.exports = {
  showFolderPicker,
  ResponseSpeed,
}
