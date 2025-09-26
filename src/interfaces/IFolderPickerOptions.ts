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
  /** Title text displayed at the top of the dialog.
  *
  * Defaults to `'Pick a Folder'`.
  */
  dialogTitle: string

  /** Whether to show icons next to folder items.
  *
  * Defaults to `true`.
  */
  showIcons: boolean

  /** Whether to display a configuration (⚙️) button in the UI.
  *
  * Defaults to `false`.
  */
  showConfigButton: boolean

  /** Whether to auto navigate to a child folder when creating new child folders.
  *
  * Defaults to `false`.
  */
  autoNavigate: boolean

  /**
   * Controls how quickly the picker responds to user input.
   * Can be a predefined `ResponseSpeed` or a custom debounce interval in ms.
   *
   * Defaults to `ResponseSpeed.Normal`.
   *
   * Setting this property to `ResponseSpeed.Instant` disables all throttling/debouncing!
   */
  responseSpeed: ResponseSpeed | number

  /** Whether the picker remains open when focus is lost.
  *
  * Defaults to `false`.
  */
  ignoreFocusOut: boolean

  /** Whether to enable picking of current folder in the Picker.
  *
  * Defaults to `true`.
  */
  canPick: boolean

  /** Icon used for folder entries. */
  iconFolder: LabelIcon

  /** Icon used for the go up (parent folder) action. */
  iconFolderUp: LabelIcon

  /** Icon used for the create new folder action. */
  iconCreate: LabelIcon

  /** Icon used for navigation actions. */
  iconNavigate: LabelIcon

  /** Icon used for the pick action. */
  iconPick: LabelIcon

  /** Icon used for the clear action. */
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

  /** Callback fired when an error occurs.
   *
   * Always receives an `Error` instance. */
  onError?: ErrorCallback

  /**
   * Callback fired for actions not covered by other handlers.
   * Provides full access to the underlying QuickPick if needed.
   */
  onUnspecifiedAction?: UnspecifiedActionCallback
}
