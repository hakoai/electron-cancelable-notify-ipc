import * as electron from 'electron';
export declare const ipcMain: {
    handle: (channel: string, listener: (event: electron.IpcMainEvent, notify: (...args: unknown[]) => void, cancel: Promise<unknown>, ...args: unknown[]) => Promise<unknown[]>, onError: (e: unknown) => void) => void;
    removeAllListeners: (channel: string) => void;
};
export declare const ipcRenderer: {
    invokeWithTimeOut: (channel: string, onNotify: (...args: unknown[]) => void, timeout: number, ...args: unknown[]) => [(...args: unknown[]) => void, Promise<unknown[]>];
    invoke: (channel: string, onNotify: (...args: unknown[]) => void, ...args: unknown[]) => [(...args: unknown[]) => void, Promise<unknown[]>];
};
