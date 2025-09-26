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

export interface IFolderPickerOptions {
  dialogTitle: string
  showIcons: boolean
  showConfigButton: boolean
  autoNavigate: boolean
  responseSpeed: ResponseSpeed | number
  ignoreFocusOut: boolean
  canPick: boolean
  iconFolder: LabelIcon
  iconFolderUp: LabelIcon
  iconCreate: LabelIcon
  iconNavigate: LabelIcon
  iconPick: LabelIcon
  iconClear: LabelIcon
  onCreateFolder?: FolderActionCallback
  onPickFolder?: FolderActionCallback
  onNavigateTo?: FolderActionCallback
  onGoUp?: FolderActionCallback
  onFetch?: FetchCallback
  onFetched?: FetchCallback
  onClose?: ActionCallback
  onConfigButton?: ActionCallback
  onError?: ErrorCallback
  onUnspecifiedAction?: UnspecifiedActionCallback
}
