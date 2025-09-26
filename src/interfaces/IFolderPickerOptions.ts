// Author: Igor Dimitrijević (@igorskyflyer)

import type { ActionCallback } from '../types/ActionCallback.js'
import type { ErrorCallback } from '../types/ErrorCallback.js'
import type { FetchCallback } from '../types/FetchCallback.js'
import type { Icon } from '../types/Icon.js'
import type { NewFolderActionCallback } from '../types/NewFolderActionCallback.js'
import type { PickFolderActionCallback } from '../types/PickFolderActionCallback.js'
import type { ResponseSpeed } from '../types/ResponseSpeed.js'
import type { SimpleActionCallback } from '../types/SimpleActionCallback.js'
import type { UnspecifiedActionCallback } from '../types/UnspecifiedActionCallback.js'

export interface IFolderPickerOptions {
  dialogTitle: string
  showIcons: boolean
  showConfigButton: boolean
  autoNavigate: boolean
  responseSpeed: ResponseSpeed | number
  ignoreFocusOut: boolean
  canPick: boolean
  iconFolder: Icon
  iconFolderUp: Icon
  iconCreate: Icon
  iconNavigate: Icon
  iconPick: Icon
  iconClear: Icon
  onCreateFolder?: NewFolderActionCallback
  onNavigateTo?: ActionCallback
  onGoUp?: ActionCallback
  onPickFolder?: PickFolderActionCallback
  onError?: ErrorCallback
  onClose?: SimpleActionCallback
  onConfigButton?: SimpleActionCallback
  onFetch?: FetchCallback
  onFetched?: FetchCallback
  onUnspecifiedAction?: UnspecifiedActionCallback
}
