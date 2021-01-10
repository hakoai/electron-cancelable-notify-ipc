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
    ) => Promise<unknown[]>,
    onError: (e: unknown) => void
  ) {
    ipcMain.removeAllListeners(channel);
    ipcMain.on(channel, (event, channels: Channels, ...args) => {
      event.sender.send(channels.act);
      const calcelPromise = new Promise(resolve => {
        ipcMain.once(channels.cancel, (_, args) => {
          resolve(args);
        });
      });
      try {
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
          .catch(e => {
            event.sender.send(channels.error, e);
            onError(e);
          })
          .finally(() => {
            ipcMain.removeAllListeners(channels.cancel);
          });
      } catch (e) {
        ipcMain.removeAllListeners(channels.cancel);
        event.sender.send(channels.error, e);
        onError(e);
      }
    });
  }

  function removeAllListeners(channel: string) {
    ipcMain.removeAllListeners(channel);
  }

  return { handle, removeAllListeners };
}
