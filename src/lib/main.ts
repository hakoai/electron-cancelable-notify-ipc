import { IpcMain } from 'electron';
import { IpcMainEvent } from 'electron/main';
import { Channels } from '.';

export function makeIpcMainFunctions(ipcMain: IpcMain) {
  function handle(
    channel: string,
    listener: (
      event: IpcMainEvent,
      notify: (...args: unknown[]) => void,
      cancel: Promise<unknown>,
      ...args: unknown[]
    ) => Promise<unknown[]>
  ): void {
    ipcMain.removeAllListeners(channel);
    ipcMain.on(channel, (event, channels: Channels, ...args) => {
      event.sender.send(channels.act);
      const calcelPromise = new Promise(resolve => {
        ipcMain.once(channels.cancel, (_, args) => {
          resolve(args);
        });
      });
      listener(
        event,
        (...args) => {
          event.sender.send(channels.notify, ...args);
        },
        calcelPromise,
        ...args
      )
        .then(res => {
          event.sender.send(channels.responce, ...res);
        })
        .finally(() => {
          ipcMain.removeAllListeners(channels.cancel);
        });
    });
  }

  function removeAllListeners(channel: string) {
    ipcMain.removeAllListeners(channel);
  }

  return { handle, removeAllListeners };
}
