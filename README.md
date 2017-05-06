# Node Image Renamer

[![Greenkeeper badge](https://badges.greenkeeper.io/blakeembrey/node-image-renamer.svg)](https://greenkeeper.io/)

[![Build status][travis-image]][travis-url]

> Simple node script for watching and renaming my images according to creation time.

## Usage

```sh
node lib/image-renamer.js pictures/
```

**Options**

* `--no-watch` Disable persistence of the file watcher
* `--dry-run` Skip renaming
* `--force` Rename all images, regardless if it looks like it already got renamed

## License

MIT license

[travis-image]: https://img.shields.io/travis/blakeembrey/node-image-renamer.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/node-image-renamer
