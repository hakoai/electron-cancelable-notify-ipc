
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./electron-cancelable-notify-ipc.cjs.production.min.js')
} else {
  module.exports = require('./electron-cancelable-notify-ipc.cjs.development.js')
}
