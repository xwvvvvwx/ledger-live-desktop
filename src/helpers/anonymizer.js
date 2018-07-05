// @flow

const configDir = (() => {
  const { STORYBOOK_ENV } = process.env
  if (!STORYBOOK_ENV) return '__NOTHING_TO_REPLACE__'
  const { LEDGER_CONFIG_DIRECTORY } = process.env
  if (LEDGER_CONFIG_DIRECTORY) return LEDGER_CONFIG_DIRECTORY
  const electron = require('electron')
  return (electron.app || electron.remote.app).getPath('userData') || '__NOTHING_TO_REPLACE__'
})()

const cwd = typeof process === 'object' ? process.cwd() || '.' : '__NOTHING_TO_REPLACE__'

function filepathReplace(path: string) {
  if (!cwd) return path
  return path.replace(cwd, '.').replace(configDir, '$USER_DATA')
}

function filepathRecursiveReplacer(obj: mixed) {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const item = obj[i]
        if (typeof item === 'string') {
          obj[i] = filepathReplace(item)
        } else {
          filepathRecursiveReplacer(item)
        }
      }
    } else {
      for (const k in obj) {
        if (typeof obj.hasOwnProperty === 'function' && obj.hasOwnProperty(k)) {
          const value = obj[k]
          if (typeof value === 'string') {
            obj[k] = filepathReplace(value)
          } else {
            filepathRecursiveReplacer(obj[k])
          }
        }
      }
    }
  }
}

export default {
  url: (url: string): string =>
    url
      .replace(/\/addresses\/[^/]+/g, '/addresses/<HIDDEN>')
      .replace(/blockHash=[^&]+/g, 'blockHash=<HIDDEN>'),

  appURI: (uri: string): string => uri.replace(/account\/[^/]/g, 'account/<HIDDEN>'),

  filepath: filepathReplace,

  filepathRecursiveReplacer,
}
