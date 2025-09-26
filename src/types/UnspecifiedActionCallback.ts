// Author: Igor Dimitrijević (@igorskyflyer)

import type { QuickPick, QuickPickItem } from 'vscode'

export type UnspecifiedActionCallback<T extends QuickPickItem = QuickPickItem> =
  (ui: QuickPick<T>) => void
