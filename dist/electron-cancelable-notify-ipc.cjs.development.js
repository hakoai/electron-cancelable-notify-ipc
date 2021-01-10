'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var electron = require('electron');
var uuid = require('uuid');

function makeIpcMainFunctions(ipcMain) {
  function handle(channel, listener) {
    ipcMain.removeAllListeners(channel);
    ipcMain.on(channel, function (event, channels) {
      event.sender.send(channels.act);
      var calcelPromise = new Promise(function (resolve) {
        ipcMain.once(channels.cancel, function (_, args) {
          resolve(args);
        });
      });

      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      listener.apply(void 0, [event, function () {
        var _event$sender;

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        (_event$sender = event.sender).send.apply(_event$sender, [channels.notify].concat(args));
      }, calcelPromise].concat(args)).then(function (res) {
        var _event$sender2;

        (_event$sender2 = event.sender).send.apply(_event$sender2, [channels.responce].concat(res));
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
  var base = channel + "-" + uuid.v1();
  return {
    act: base + "-act",
    notify: base + "-notify",
    cancel: base + "-cancel",
    responce: base + "-responce"
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
      ipcRenderer.once(channels.responce, function (_) {
        if (!done) {
          done = true;
          ipcRenderer.removeAllListeners(channels.act);
          ipcRenderer.removeAllListeners(channels.notify);

          for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
            args[_key4 - 1] = arguments[_key4];
          }

          resolve(args);
        }
      });
      setTimeout(function () {
        if (!act && !done) {
          done = true;
          ipcRenderer.removeAllListeners(channels.act);
          ipcRenderer.removeAllListeners(channels.notify);
          ipcRenderer.removeAllListeners(channels.responce);
          reject(new Error('ipc timeout.'));
        }
      }, timeout);
      ipcRenderer.send.apply(ipcRenderer, [channel, channels].concat(args));
    })];
  }

  function invoke(channel, onNotify) {
    for (var _len5 = arguments.length, args = new Array(_len5 > 2 ? _len5 - 2 : 0), _key5 = 2; _key5 < _len5; _key5++) {
      args[_key5 - 2] = arguments[_key5];
    }

    return invokeWithTimeOut.apply(void 0, [channel, onNotify, 1000].concat(args));
  }

  return {
    invokeWithTimeOut: invokeWithTimeOut,
    invoke: invoke
  };
}

var ipcMain = /*#__PURE__*/makeIpcMainFunctions(electron.ipcMain);
var ipcRenderer = /*#__PURE__*/makeIpcRendererFunctions(electron.ipcRenderer);

exports.ipcMain = ipcMain;
exports.ipcRenderer = ipcRenderer;
//# sourceMappingURL=electron-cancelable-notify-ipc.cjs.development.js.map
