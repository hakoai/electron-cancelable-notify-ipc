import { ipcMain as ipcMain$1, ipcRenderer as ipcRenderer$1 } from 'electron';
import { v1 } from 'uuid';

function makeIpcMainFunctions(ipcMain) {
  function handle(channel, listener, onError) {
    ipcMain.removeAllListeners(channel);
    ipcMain.on(channel, function (event, channels) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      event.sender.send(channels.act);
      var calcelPromise = new Promise(function (resolve) {
        ipcMain.once(channels.cancel, function (_, args) {
          resolve(args);
        });
      });
      Promise.resolve().then(function () {
        return listener.apply(void 0, [event, function () {
          var _event$sender;

          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          (_event$sender = event.sender).send.apply(_event$sender, [channels.notify].concat(args));
        }, calcelPromise].concat(args));
      }).then(function (res) {
        event.sender.send(channels.responce, res);
      })["catch"](function (e) {
        event.sender.send(channels.error, e);
        onError(e);
      })["finally"](function () {
        ipcMain.removeAllListeners(channels.cancel);
      });
    });
  }

  function removeAllListeners(channel) {
    ipcMain.removeAllListeners(channel);
  }

  return {
    handle: handle,
    removeAllListeners: removeAllListeners
  };
}

function makeChannel(channel) {
  var base = channel + "-" + v1();
  return {
    act: base + "-act",
    notify: base + "-notify",
    cancel: base + "-cancel",
    responce: base + "-responce",
    error: base + "-error"
  };
}

function makeIpcRendererFunctions(ipcRenderer) {
  function invokeWithTimeOut(channel, onNotify, timeout) {
    for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      args[_key - 3] = arguments[_key];
    }

    var channels = makeChannel(channel);
    return [function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      ipcRenderer.send.apply(ipcRenderer, [channels.cancel].concat(args));
    }, new Promise(function (resolve, reject) {
      var act = false;
      var done = false;
      ipcRenderer.once(channels.act, function () {
        return act = true;
      });
      ipcRenderer.on(channels.notify, function (_) {
        for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }

        onNotify.apply(void 0, args);
      });
      ipcRenderer.once(channels.responce, function (_, args) {
        if (!done) {
          done = true;
          ipcRenderer.removeAllListeners(channels.act);
          ipcRenderer.removeAllListeners(channels.notify);
          ipcRenderer.removeAllListeners(channels.error);
          resolve(args);
        }
      });
      ipcRenderer.once(channels.error, function (_, e) {
        if (!done) {
          done = true;
          ipcRenderer.removeAllListeners(channels.act);
          ipcRenderer.removeAllListeners(channels.notify);
          ipcRenderer.removeAllListeners(channels.responce);
          reject(e);
        }
      });
      setTimeout(function () {
        if (!act && !done) {
          done = true;
          ipcRenderer.removeAllListeners(channels.act);
          ipcRenderer.removeAllListeners(channels.notify);
          ipcRenderer.removeAllListeners(channels.responce);
          ipcRenderer.removeAllListeners(channels.error);
          reject(new Error('ipc act timeout.'));
        }
      }, timeout);
      ipcRenderer.send.apply(ipcRenderer, [channel, channels].concat(args));
    })];
  }

  function invoke(channel, onNotify) {
    for (var _len4 = arguments.length, args = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
      args[_key4 - 2] = arguments[_key4];
    }

    return invokeWithTimeOut.apply(void 0, [channel, onNotify, 1000].concat(args));
  }

  return {
    invokeWithTimeOut: invokeWithTimeOut,
    invoke: invoke
  };
}

var ipcMain = /*#__PURE__*/makeIpcMainFunctions(ipcMain$1);
var ipcRenderer = /*#__PURE__*/makeIpcRendererFunctions(ipcRenderer$1);

export { ipcMain, ipcRenderer };
//# sourceMappingURL=electron-cancelable-notify-ipc.esm.js.map
