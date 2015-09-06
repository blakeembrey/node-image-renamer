import test = require('tape')
import moment = require('moment')
import { execSync } from 'child_process'
import { statSync, readdirSync } from 'fs'
import { join } from 'path'

const TEST_DIR = join(__dirname, '../src/__test__')

const FILE_FORMAT = 'YYYY-MM-DD--HH-mm-ss'

test('image renamer', t => {
  execSync(`cp -rp ${join(TEST_DIR, 'fixtures')} ${join(TEST_DIR, '_fixtures')}`)
  execSync(`node ${join(__dirname, 'image-renamer')} ${join(TEST_DIR, '_fixtures')}`)

  const files = readdirSync(join(TEST_DIR, '_fixtures'))

  execSync(`rm -rf ${join(TEST_DIR, '_fixtures')}`)

  const pngMtime = statSync(join(TEST_DIR, 'fixtures/random_gnome.png')).mtime
  const jpgMtime = statSync(join(TEST_DIR, 'fixtures/IMG_2977.JPG')).mtime

  t.notEqual(files.indexOf('2015-02-08--22-05-28.jpg'), -1)
  t.notEqual(files.indexOf(moment(pngMtime).utc().format(FILE_FORMAT) + '.png'), -1)
  t.notEqual(files.indexOf(moment(jpgMtime).utc().format(FILE_FORMAT) + '.JPG'), -1)

  t.end()
})
