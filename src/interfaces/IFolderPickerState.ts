// Author: Igor Dimitrijević (@igorskyflyer)

import type { IFolderPickerOptions } from './IFolderPickerOptions.js'

export interface IFolderPickerState {
  currentPath: string
  entries: string[]
  options: IFolderPickerOptions
}
