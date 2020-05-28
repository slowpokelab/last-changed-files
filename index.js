/**
 * Copyright (c) 2020
 *
 * last-changed-files (Async)
 * Use fs.stat() to record the last modification date of the file and import the list of changed files.
 *
 * @author jun <slowpoke.cj@gmail.com>
 *
 */
const { promises: fs, constants } = require('fs');
const moment = require('moment');

const LOG_FILE_FOLDER_NAME = '.log';
const DEFAULT_LOG_FILE_NAME = 'mtime.json';

async function getFileStats(path) {
  let files;
  let stats;

  try {
    files = await fs.readdir(path, 'utf-8');
  } catch (err) {
    throw err;
  }

  if (files) {
    try {
      const result = await Promise.all(files.map((name) => fs.stat(`${path}/${name}`)));
      stats = result.map(({ mtime }, i) => ({ mtime: mtime.toISOString(), name: files[i] }));
    } catch (err) {
      throw err;
    }
  }

  return stats;
}

async function writeJson(filePath, obj) {
  try {
    const data = JSON.stringify(obj);
    await fs.writeFile(filePath, data);
  } catch (err) {
    throw err;
  }
}

async function readJson(filePath) {
  let json;
  try {
    const rawData = await fs.readFile(filePath);
    json = JSON.parse(rawData);
  } catch (err) {
    throw err;
  }

  return json;
}

/**
 * Get Last Changed Files
 * The default path for files recording the last modification date is "folderPath".
 *
 * @param {string} $folderPath
 * @param {object} $logFile (Optional) { name: '', path: '' }
 * @return {Array} changed files
 */
module.exports = async function ($folderPath, $logFile) {
  if (typeof $folderPath === 'undefined' || $folderPath === '') {
    throw new Error('No $folderPath defined');
  }

  // set log file info
  const logFile = (($f) => {
    let { path = '', name = '' } = $f || {};
    path = path === '' ? $folderPath : path;
    name = name === '' ? DEFAULT_LOG_FILE_NAME : name;

    const dir = `${path}/${LOG_FILE_FOLDER_NAME}`;
    return {
      dir,
      path: `${dir}/${name}`,
    };
  })($logFile);

  const currentStats = await getFileStats($folderPath);
  if (currentStats) {
    let manifest;
    try {
      manifest = await readJson(logFile.path);
    } catch (err) {}

    if (manifest) {
      let result = [];

      if (manifest.stats && Array.isArray(manifest.stats)) {
        result = currentStats.filter(({ mtime, name }) => {
          const target = manifest.stats.find((item) => item.name === name);

          if (target) {
            let previous = moment(target.mtime);
            let current = moment(mtime);
            return !current.isSame(previous, 'second');
          }
          return false;
        });
      }

      // If there is a changed file, update log.json.
      if (result.length) {
        const updateStats = manifest.stats.map((d) => {
          const target = result.find((item) => item.name === d.name);
          return target ? Object.assign({}, d, target) : d;
        });

        const obj = { stats: updateStats };
        await writeJson(logFile.path, obj);
      }

      return result;
    } else {
      // create log.json
      let exists = false;
      try {
        await fs.access(logFile.dir, constants.F_OK);
        exists = true;
      } catch (err) {}

      if (!exists) {
        try {
          await fs.mkdir(logFile.dir);
        } catch (err) {
          throw err;
        }
      }

      const obj = { stats: currentStats };

      try {
        await writeJson(logFile.path, obj);
      } catch (err) {
        throw err;
      }
      return currentStats;
    }
  }

  return [];
};
