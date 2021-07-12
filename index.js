const vscode = require('vscode')
const { resolve, join, isAbsolute } = require('path')
const { readDirSync, Entry, Depth } = require('@igor.dvlpr/recursive-readdir')
const { u } = require('@igor.dvlpr/upath')
const { accessSync, realpathSync } = require('fs')
const { homedir } = require('os')
const { pathExists } = require('@igor.dvlpr/pathexists')
const { isRootDirectory } = require('@igor.dvlpr/is-rootdir')

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
 * @typedef FolderPickerOptions
 * @property {string} [dialogTitle='']
 * @property {string} [folderIcon='']
 * @property {string} [upFolderIcon='']
 * @property {boolean} [ignoreFocusOut=true]
 * @property {NewFolderActionCallback} [onNewFolder]
 * @property {ActionCallback} [onNavigateTo]
 * @property {ActionCallback} [onGoUp]
 * @property {PickFolderActionCallback} [onPickFolder]
 * @property {ErrorCallback} [onError]
 * @property {SimpleActionCallback} [onClose]
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
}

/**
 * Adds an icon to the given label.
 * @private
 * @param {string} label
 * @param {string} icon
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
  if (!path) {
    path = homedir()
  }

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
      return getPickCurrentAction()
    }
    if (entry === '..') {
      return {
        label: iconify(entry, options.upFolderIcon),
        description: 'parent folder',
        action: Action.ParentFolder,
        path: '..',
      }
    } else {
      return {
        label: iconify(entry, options.folderIcon),
        description: 'folder',
        action: Action.ChildFolder,
        path: entry,
      }
    }
  })
}

/**
 * Checks whether the given path exists.
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
// prettier-ignore
function fillOptions(options) {
  	options.dialogTitle = options.dialogTitle || 'Pick a Folder'
  	options.ignoreFocusOut = options.ignoreFocusOut || false
  	options.folderIcon = options.folderIcon || '$(folder)'
  	options.upFolderIcon = options.upFolderIcon || '$(folder-opened)'

  return options
}

/**
 *
 * @param {string} path
 * @returns {vscode.QuickPickItem}
 */
function getCreateAction(path, description) {
  return {
    label: '✨',
    description,
    path,
    alwaysShow: true,
    action: Action.CreateFolder,
  }
}

function getNavigateAction(path) {
  return {
    label: '🚶‍♂️',
    path,
    description: `Navigate to ${path}`,
    alwaysShow: true,
    action: Action.Navigate,
  }
}

function getPickCurrentAction() {
  return {
    label: '🆗',
    description: 'Pick current folder',
    action: Action.PickFolder,
    path: '.',
  }
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
    picker.placeholder = `Name of folder to create in ${resolve(directory)}`
    picker.title = options.dialogTitle
    picker.ignoreFocusOut = options.ignoreFocusOut
    picker.canSelectMany = false

    let currentPath = resolve(directory)
    let entries = getDirectories(currentPath, options)
    let items = getDirectoryItems(entries, options)

    picker.items = items

    picker.onDidHide(() => {
      // free-up memory
      picker.dispose()

      if (typeof options.onClose === 'function') {
        options.onClose()
      }
    })

    picker.onDidChangeValue((e) => {
      try {
        if (e.length > 0) {
          // ah, path-safety 😌
          let folderPath = u(e)

          // very useful,
          // but it is buggy 😔
          // picker.value = folderPath

          if (!pathExists(folderPath, entries)) {
            const actions = []

            // run through uPath again,
            // this time add a trailing slash,
            // allows us to catch things like
            // D: on Windows
            let absolutePath = u(folderPath, true)

            if (isAbsolute(absolutePath)) {
              if (!canAccess(absolutePath)) {
                actions.unshift(
                  getCreateAction(folderPath, `Create ${folderPath}`)
                )
              } else {
                // fixes an issue with non-proper path case
                absolutePath = realpathSync.native(absolutePath)
                picker.placeholder = absolutePath
                actions.unshift(getNavigateAction(absolutePath))
              }
            } else {
              actions.unshift(
                getCreateAction(
                  folderPath,
                  `Create ${folderPath} folder in ${currentPath}`
                )
              )
            }

            picker.items = [...actions, ...items]
          } else {
            picker.items = items
          }
        } else {
          picker.items = items
        }
      } catch (exp) {
        if (typeof options.onError === 'function') {
          options.onError(exp)
        }
      }
    })

    picker.onDidChangeActive((e) => {
      if (e.length > 0) {
        try {
          picker.placeholder = resolve(join(currentPath, e[0].path))
        } catch (exp) {
          if (typeof options.onError === 'function') {
            options.onError(exp)
          }
        }
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

        if (item.action === Action.ChildFolder) {
          currentPath = resolve(join(currentPath, item.path))
        } else if (item.action === Action.ParentFolder) {
          currentPath = resolve(join(currentPath, item.path))

          if (typeof options.onGoUp === 'function') {
            options.onGoUp(currentPath, picker)
          }
        } else if (item.action === Action.Navigate && isAbsolute(item.path)) {
          currentPath = item.path

          if (typeof options.onNavigateTo === 'function') {
            options.onNavigateTo(currentPath, picker)
          }
        } else if (item.action === Action.CreateFolder) {
          if (typeof options.onNewFolder === 'function') {
            let newFolderPath

            if (isAbsolute(item.path)) {
              newFolderPath = item.path
            } else {
              newFolderPath = resolve(join(currentPath, item.path))
            }

            options.onNewFolder(newFolderPath)
            picker.hide()
          }

          // stop execution here
          return
        } else if (item.action === Action.PickFolder) {
          if (typeof options.onPickFolder === 'function') {
            options.onPickFolder(currentPath)
          } else {
            if (typeof options.onUnspecifiedAction === 'function') {
              options.onUnspecifiedAction(picker)
            }
          }

          picker.hide()
          return
        }

        entries = getDirectories(currentPath, options)
        items = getDirectoryItems(entries, options)
        picker.items = items
        picker.value = ''
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
}
