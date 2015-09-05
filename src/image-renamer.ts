import { watch } from 'chokidar'
import { create } from 'exif-parser'
import { stat, readFile, readdirSync, statSync, Stats, rename } from 'fs'
import { join, dirname, extname, basename } from 'path'
import minimist = require('minimist')
import moment = require('moment')

const argv = minimist(process.argv.slice(2))
const dirs = argv._
const persistent = !!argv['no-watch']

/**
 * Check if the file name is a compatible image.
 */
function isImage (filename: string) {
  return /\.(?:jpe?g|png)$/.test(filename)
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
    if (/^\d{4}\-\d{2}\-\d{2}--\d{2}-\d{2}-\d{2}/.test(basename(filename, ext))) {
      return
    }

    // Rename the file by date.
    function renameByDate (date: Date | number) {
      const dateName = moment(date).utc().format('YYYY-MM-DD--H-mm-ss') + ext
      const newName = join(dirname(filename), dateName)

      rename(filename, newName, (err) => err ? resolve() : reject(err))
    }

    return readFile(filename, (err: Error, contents: Buffer) => {
      if (err) {
        return renameByDate(stats.mtime)
      }

      const parser = create(contents)
      const exif = parser.parse()

      if (exif.tags.DateTimeOriginal == null) {
        return renameByDate(stats.mtime)
      }

      return renameByDate(exif.tags.DateTimeOriginal)
    })
  })
}

// Set up all listeners and initial rename script.
dirs.forEach((dir) => {
  watch(dir, { persistent, followSymlinks: false })
    .on('add', handleFile)
    .on('change', handleFile)
})
