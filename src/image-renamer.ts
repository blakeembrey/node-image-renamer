import { watch } from 'chokidar'
import { create } from 'exif-parser'
import { stat, readFile, readdirSync, statSync, Stats, rename } from 'fs'
import { join, dirname, extname, basename } from 'path'
import minimist = require('minimist')
import moment = require('moment')

require('es6-promise').polyfill()

const argv = minimist(process.argv.slice(2))
const dirs = argv._
const persistent = !!argv['no-watch']
const force = !!argv['force']

/**
 * Check if the file name is a compatible image.
 */
function isImage (filename: string) {
  return /\.(?:jpe?g|png)$/i.test(filename)
}

/**
 * Handle image renaming.
 */
function handleFile (filename: string, stats: Stats) {
  return new Promise((resolve, reject) => {
    // Skip formatting non-images.
    if (!isImage(filename)) {
      return
    }

    const ext = extname(filename)

    // Skip formatting already renamed files.
    if (!force && /^\d{4}\-\d{2}\-\d{2}--\d{2}-\d{2}-\d{2}/.test(basename(filename, ext))) {
      return
    }

    // Rename the file by date.
    function renameByDate (date: Date | number) {
      const dateName = moment(date).utc().format('YYYY-MM-DD--HH-mm-ss') + ext
      const newName = join(dirname(filename), dateName)

      rename(filename, newName, (err) => err ? reject(err) : resolve())
    }

    return readFile(filename, (err: Error, contents: Buffer) => {
      if (err) {
        return renameByDate(stats.mtime)
      }

      const parser = create(contents)

      try {
        const exif = parser.parse()

        if (exif.tags.DateTimeOriginal != null) {
          return renameByDate(exif.tags.DateTimeOriginal * 1000)
        }
      } catch (err) {
        // Can not parse exif data from PNG.
      }

      return renameByDate(stats.mtime)
    })
  })
}

// Set up all listeners and initial rename script.
dirs.forEach((dir) => {
  watch(dir, { persistent, followSymlinks: false })
    .on('add', handleFile)
    .on('change', handleFile)
})
