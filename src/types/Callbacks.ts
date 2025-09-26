// Author: Igor Dimitrijević (@igorskyflyer)

import type { QuickPick, QuickPickItem } from 'vscode'

export type UnspecifiedActionCallback<T extends QuickPickItem = QuickPickItem> =
  (ui: QuickPick<T>) => void
export type ErrorCallback = (error: Error) => void
export type FolderActionCallback = (folderPath: string) => void
export type ActionCallback = () => void
export type FetchCallback = ActionCallback
