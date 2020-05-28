# last-changed-files [![npm version](https://badge.fury.io/js/last-changed-files.svg)](https://badge.fury.io/js/last-changed-files)

## Install

```sh
$ npm i --save last-changed-files
```

## Usage

> async

```js
const lastChangedFiles = require('last-changed-files');
const path = './example'; // test1.txt, test2.txt, test3.txt ...

lastChangedFiles(path)
  .then((list) => {
    // =>[ {"mtime":"2020-05-27T04:41:07.029Z","name":"test1.txt"} ... ]
  })
  .catch((err) => {});
```

## Dependencies

- moment

## License

Copyright © 2020 Jun.
Released under the MIT license.
