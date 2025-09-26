// Author: Igor Dimitrijević (@igorskyflyer)

import type {
  ActionCallback,
  ErrorCallback,
  FetchCallback,
  FolderActionCallback,
  UnspecifiedActionCallback
} from '../types/Callbacks.js'
import type { LabelIcon } from '../types/LabelIcon.js'
import type { ResponseSpeed } from '../types/ResponseSpeed.js'

/**
 * Configuration options for the interactive Folder Picker dialog.
 *
 * Controls UI appearance, navigation behavior, icons, and lifecycle callbacks.
 * All options are strongly typed and can be partially overridden.
 *
 * @public
 */
export interface IFolderPickerOptions {
  /** Title text displayed at the top of the dialog. */
  dialogTitle: string

  /** Whether to show icons next to folder items. */
  showIcons: boolean

  /** Whether to display a configuration (⚙️) button in the UI. */
  showConfigButton: boolean

  /** Automatically navigate into the first folder when opened. */
  autoNavigate: boolean

  /**
   * Controls how quickly the picker responds to user input.
   * Can be a predefined `ResponseSpeed` or a custom debounce interval in ms.
   */
  responseSpeed: ResponseSpeed | number

  /** If true, the picker remains open when focus is lost. */
  ignoreFocusOut: boolean

  /** Whether folder items can be picked/selected directly. */
  canPick: boolean

  /** Icon used for regular folders. */
  iconFolder: LabelIcon

  /** Icon used for the "go up" (parent folder) action. */
  iconFolderUp: LabelIcon

  /** Icon used for the "create new folder" action. */
  iconCreate: LabelIcon

  /** Icon used for navigation actions. */
  iconNavigate: LabelIcon

  /** Icon used for the "pick/confirm" action. */
  iconPick: LabelIcon

  /** Icon used for the "clear/reset" action. */
  iconClear: LabelIcon

  /** Callback fired when a new folder is created. */
  onCreateFolder?: FolderActionCallback

  /** Callback fired when a folder is picked/selected. */
  onPickFolder?: FolderActionCallback

  /** Callback fired when navigating into a folder. */
  onNavigateTo?: FolderActionCallback

  /** Callback fired when navigating up to the parent folder. */
  onGoUp?: FolderActionCallback

  /** Callback fired before fetching folder contents. */
  onFetch?: FetchCallback

  /** Callback fired after folder contents have been fetched. */
  onFetched?: FetchCallback

  /** Callback fired when the picker is closed. */
  onClose?: ActionCallback

  /** Callback fired when the configuration button is pressed. */
  onConfigButton?: ActionCallback

  /** Callback fired when an error occurs. Always receives an `Error` instance. */
  onError?: ErrorCallback

  /**
   * Callback fired for actions not covered by other handlers.
   * Provides full access to the underlying QuickPick if needed.
   */
  onUnspecifiedAction?: UnspecifiedActionCallback
}
