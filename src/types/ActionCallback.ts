// Author: Igor Dimitrijević (@igorskyflyer)

import type { QuickPick, QuickPickItem } from 'vscode'

export type ActionCallback<T extends QuickPickItem = QuickPickItem> = (
  folderPath: string,
  ui: QuickPick<T>
) => void
