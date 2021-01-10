import { IpcRenderer } from 'electron';
import { makeChannel } from '.';

export function makeIpcRendererFunctions(ipcRenderer: IpcRenderer) {
  function invokeWithTimeOut(
    channel: string,
    onNotify: (...args: unknown[]) => void,
    timeout: number,
    ...args: unknown[]
  ): [(...args: unknown[]) => void, Promise<unknown[]>] {
    const channels = makeChannel(channel);
    return [
      (...args: unknown[]) => {
        ipcRenderer.send(channels.cancel, ...args);
      },
      new Promise((resolve, reject) => {
        let act = false;
        let done = false;

        ipcRenderer.once(channels.act, () => (act = true));
        ipcRenderer.on(channels.notify, (_, ...args) => {
          onNotify(...args);
        });

        ipcRenderer.once(channels.responce, (_, ...args) => {
          if (!done) {
            done = true;
            ipcRenderer.removeAllListeners(channels.act);
            ipcRenderer.removeAllListeners(channels.notify);
            ipcRenderer.removeAllListeners(channels.error);
            resolve(args);
          }
        });

        ipcRenderer.once(channels.error, (_, e) => {
          if (!done) {
            done = true;
            ipcRenderer.removeAllListeners(channels.act);
            ipcRenderer.removeAllListeners(channels.notify);
            ipcRenderer.removeAllListeners(channels.responce);
            reject(e);
          }
        });

        setTimeout(() => {
          if (!act && !done) {
            done = true;
            ipcRenderer.removeAllListeners(channels.act);
            ipcRenderer.removeAllListeners(channels.notify);
            ipcRenderer.removeAllListeners(channels.responce);
            ipcRenderer.removeAllListeners(channels.error);
            reject(new Error('ipc act timeout.'));
          }
        }, timeout);

        ipcRenderer.send(channel, channels, ...args);
      }),
    ];
  }

  function invoke(
    channel: string,
    onNotify: (...args: unknown[]) => void,
    ...args: unknown[]
  ) {
    return invokeWithTimeOut(channel, onNotify, 1000, ...args);
  }

  return { invokeWithTimeOut, invoke };
}
