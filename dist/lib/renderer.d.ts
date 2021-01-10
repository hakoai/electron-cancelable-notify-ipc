import { IpcRenderer } from 'electron';
export declare function makeIpcRendererFunctions(ipcRenderer: IpcRenderer): {
    invokeWithTimeOut: (channel: string, onNotify: (...args: unknown[]) => void, timeout: number, ...args: unknown[]) => [(...args: unknown[]) => void, Promise<unknown[]>];
    invoke: (channel: string, onNotify: (...args: unknown[]) => void, ...args: unknown[]) => [(...args: unknown[]) => void, Promise<unknown[]>];
};
