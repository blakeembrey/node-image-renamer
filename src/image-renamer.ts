#!/usr/bin/env node

import { watch } from 'chokidar'
import { stat, readFile, readdirSync, Stats, rename } from 'fs'
import { join, resolve, dirname, extname, basename } from 'path'
import minimist = require('minimist')
import moment = require('moment')

require('es6-promise').polyfill()

const argv = minimist(process.argv.slice(2))
const dirs = argv._
const persistent = !!argv['no-watch']
const skipRename = !!argv['dry-run']
const force = !!argv['force']

export const FILE_FORMAT = 'YYYY-MM-DD--HH-mm-ss'

/**
 * Check if the file name is a compatible image.
 */
function isImage (filename: string) {
  return /\.(?:jpe?g|png)$/i.test(filename)
}

/**
 * Handle image renaming.
 */
function handleFile (path: string, stats: Stats) {
  return new Promise((resolve, reject) => {
    // Skip formatting non-images.
    if (!isImage(path)) {
      return resolve()
    }

    const ext = extname(path)
    const done = (err: Error) => err ? reject(err) : resolve()

    // Skip formatting already renamed files.
    if (!force && /^\d{4}\-\d{2}\-\d{2}--\d{2}-\d{2}-\d{2}(?:-\d)?/.test(basename(path, ext))) {
      return resolve()
    }

    console.log('Image Path: %s', path)

    function renameWithCheck (name: string, offset: number, cb: (err: Error) => any) {
      const newFilename = offset === 0 ? `${name}${ext}` : `${name}-${offset}${ext}`
      const newPath = join(dirname(path), newFilename)

      if (path === newPath) {
        console.log('Path already equal: "%s"', path)

        return cb(null)
      }

      stat(newPath, function (err) {
        if (err && err.code === 'ENOENT') {
          console.log('Rename: "%s" -> "%s"', path, newPath)

          if (skipRename) {
            return cb(null)
          }

          return rename(path, newPath, cb)
        }

        renameWithCheck(name, offset + 1, cb)
      })
    }

    // Rename the file by date.
    function renameByDate (date: Date | number, cb: (err: Error) => any) {
      const dateFilename = moment(date).utc().format(FILE_FORMAT)

      renameWithCheck(dateFilename, 0, cb)
    }

    return renameByDate(stats.birthtime || stats.mtime, done)
  })
}

// Set up all listeners and initial rename script.
dirs.forEach((dir) => {
  watch(resolve(dir), { persistent, followSymlinks: false })
    .on('add', handleFile)
    .on('change', handleFile)
})
