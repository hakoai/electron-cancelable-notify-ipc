import { makeIpcMainFunctions } from './lib/main';
import * as electron from 'electron';
import { makeIpcRendererFunctions } from './lib/renderer';

export const ipcMain = makeIpcMainFunctions(electron.ipcMain);

export const ipcRenderer = makeIpcRendererFunctions(electron.ipcRenderer);
