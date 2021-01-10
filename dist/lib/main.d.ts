import { IpcMain } from 'electron';
import { IpcMainEvent } from 'electron/main';
export declare function makeIpcMainFunctions(ipcMain: IpcMain): {
    handle: (channel: string, listener: (event: IpcMainEvent, notify: (...args: unknown[]) => void, cancel: Promise<unknown>, ...args: unknown[]) => Promise<unknown[]>, onError: (e: unknown) => void) => void;
    removeAllListeners: (channel: string) => void;
};
