// Author: Igor Dimitrijević (@igorskyflyer)

import type { QuickPickItem } from 'vscode'

export interface IFolderQuickPickItem extends QuickPickItem {
  label: string
  description: string
  path: string
  action: number
  alwaysShow?: boolean
}
