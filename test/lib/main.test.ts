import createIPCMock from 'electron-mock-ipc';
import { makeIpcMainFunctions } from '../../src/lib/main';
import { makeIpcRendererFunctions } from '../../src/lib/renderer';

const mocked = createIPCMock();

const ipcMain = makeIpcMainFunctions(mocked.ipcMain);
const ipcRenderer = makeIpcRendererFunctions(mocked.ipcRenderer);

describe('ipcMain.on', () => {
  const invokeParam = 'invoke';
  const notifyParam = 'notify';
  const cancelParam = 'cancel';
  const responseParam = 'response';
  const responseParam2 = 'response2';
  const ignore = (_: unknown) => {};
  it('works', async () => {
    const channel = 'works';
    let first = true;
    const mockHandle = jest.fn((_0, notifyFunc, _1, ..._2) => {
      notifyFunc(notifyParam);
      if (first) {
        first = false;
        return new Promise<string>(resolve => {
          setTimeout(() => {
            notifyFunc(notifyParam);
            resolve(responseParam);
          }, 2000);
        });
      }
      return Promise.resolve(responseParam2);
    });
    const notifyHandle = jest.fn(ignore);
    const resHandle = jest.fn(ignore);

    ipcMain.handle(channel, mockHandle, ignore);

    const res = ipcRenderer.invoke(channel, notifyHandle, invokeParam);
    const res2 = ipcRenderer.invoke(channel, notifyHandle, invokeParam);

    await res[1].then(resHandle);
    await res2[1].then(resHandle);

    expect(mockHandle.mock.calls.length).toBe(2);
    expect(notifyHandle.mock.calls.length).toBe(3);
    expect(resHandle.mock.calls.length).toBe(2);
    expect(mockHandle.mock.calls[0][3]).toBe(invokeParam);
    expect(mockHandle.mock.calls[1][3]).toBe(invokeParam);
    expect(notifyHandle.mock.calls[0][0]).toBe(notifyParam);
    expect(notifyHandle.mock.calls[1][0]).toBe(notifyParam);
    expect(notifyHandle.mock.calls[2][0]).toBe(notifyParam);
    expect(resHandle.mock.calls[0][0]).toStrictEqual(responseParam);
    expect(resHandle.mock.calls[1][0]).toStrictEqual(responseParam2);

    ipcMain.removeAllListeners(channel);
  });

  it('timeout', async () => {
    const channel = 'timeout';
    expect.assertions(1);
    const res = ipcRenderer.invoke(channel, ignore, invokeParam);
    await res[1].catch((e: Error) => {
      expect(e.message).toMatch(/timeout/);
    });
  });

  it('cancel', async () => {
    const channel = 'cancel';
    ipcMain.handle(
      channel,
      (_0, _1, cancel, _2) => {
        return cancel.then(v => [v]);
      },
      ignore
    );

    const [cancelFanction, res] = ipcRenderer.invoke(
      channel,
      ignore,
      invokeParam
    );

    cancelFanction(cancelParam);
    await res.then(([value]) => {
      expect(value).toBe(cancelParam);
    });

    ipcMain.removeAllListeners(channel);
  });

  it('handle function error catch', async () => {
    const channel = 'handle function error catch';
    const errorString = 'error';
    expect.assertions(5);
    const errorHandle = jest.fn(ignore);

    ipcMain.handle(
      channel,
      (_0, _1, _2, _3) => {
        throw errorString;
      },
      errorHandle
    );

    const res = ipcRenderer.invoke(channel, ignore, invokeParam);
    const res2 = ipcRenderer.invoke(channel, ignore, invokeParam);
    await res[1].catch((e: string) => {
      expect(e).toBe(errorString);
    });

    await res2[1].catch((e: string) => {
      expect(e).toBe(errorString);
    });

    expect(errorHandle.mock.calls.length).toBe(2);
    expect(errorHandle.mock.calls[0][0]).toBe(errorString);
    expect(errorHandle.mock.calls[1][0]).toBe(errorString);

    ipcMain.removeAllListeners(channel);
  });

  it('handle function error catch promise', async () => {
    const channel = 'handle function error catch promise';
    const errorString = 'error';
    expect.assertions(5);
    const errorHandle = jest.fn(ignore);

    ipcMain.handle(
      channel,
      (_0, _1, _2, _3) => {
        return Promise.reject(errorString);
      },
      errorHandle
    );

    const res = ipcRenderer.invoke(channel, ignore, invokeParam);
    const res2 = ipcRenderer.invoke(channel, ignore, invokeParam);
    await res[1].catch((e: string) => {
      expect(e).toBe(errorString);
    });

    await res2[1].catch((e: string) => {
      expect(e).toBe(errorString);
    });

    expect(errorHandle.mock.calls.length).toBe(2);
    expect(errorHandle.mock.calls[0][0]).toBe(errorString);
    expect(errorHandle.mock.calls[1][0]).toBe(errorString);

    ipcMain.removeAllListeners(channel);
  });
});
