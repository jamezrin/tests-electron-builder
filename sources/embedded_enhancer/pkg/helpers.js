/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';

const os = require('os'),
  path = require('path'),
  fs = require('fs-extra'),
  { execSync } = require('child_process');

// used to differentiate between "enhancer failed" and "code broken" errors.
class EnhancerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EnhancerError';
  }
}

// patched: stripped unnecessary logic for WSL
// ~/.notion-enhancer absolute path.
const __data = `${os.homedir()}/.notion-enhancer`

// patched: stripped unnecessary logic for WSL
function realpath(hack_path) {
  return hack_path.replace(/\\/g, '/');
}

// patched: stripped unnecessary logic for runtime path detection
function getNotionResources() {
  return path.resolve(__dirname, '../../../');
}

// lists/fetches all available extensions + themes
function getEnhancements() {
  const modules = {
    loaded: [],
    invalid: [],
    dirs: fs
      .readdirSync(path.resolve(`${__dirname}/../mods`))
      .filter((dir) => !dir.startsWith('.')),
    IDs: [],
  };
  for (let dir of modules.dirs) {
    try {
      const mod = require(`../mods/${dir}/mod.js`);
      if (!mod.tags) mod.tags = [];
      if (
        !mod.id ||
        modules.IDs.includes(mod.id) ||
        !mod.name ||
        !mod.version ||
        !mod.author ||
        !mod.tags.every((tag) => typeof tag === 'string') ||
        (mod.fonts && !mod.fonts.every((font) => typeof font === 'string')) ||
        (mod.options &&
          !mod.options.every((opt) =>
            ['toggle', 'select', 'input', 'file', 'color'].includes(opt.type)
          ))
      )
        throw Error;
      mod.defaults = {};
      for (let opt of mod.options || []) {
        if (
          Object.keys(opt.platformOverwrite || {}).some(
            (platform) => process.platform === platform
          )
        ) {
          mod.defaults[opt.key] = opt.platformOverwrite[process.platform];
        } else
          mod.defaults[opt.key] = Array.isArray(opt.value)
            ? opt.value[0]
            : opt.value;
      }
      modules.IDs.push(mod.id);
      modules.loaded.push({
        ...mod,
        dir,
      });
      if (!mod.tags.includes('core')) mod.alwaysActive = false;
    } catch (err) {
      // console.error(err);
      modules.invalid.push(dir);
    }
  }
  modules.loaded = modules.loaded.sort((a, b) => a.name.localeCompare(b.name));
  const priority = require('./store.js')('mods', { priority: [] }).priority;
  modules.loaded = [
    ...modules.loaded.filter((m) => m.tags.includes('core')),
    ...modules.loaded.filter(
      (m) => !m.tags.includes('core') && !priority.includes(m.id)
    ),
    ...priority
      .map((id) => modules.loaded.find((m) => m.id === id))
      .filter((m) => m),
  ];
  return modules;
}

// attempts to read a JSON file, falls back to empty object.
function getJSON(from) {
  try {
    return fs.readJsonSync(from);
  } catch (err) {
    return {};
  }
}

// wait for console input, returns keys when enter pressed.
function readline() {
  return new Promise((res, rej) => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (key) => {
      if (key === '\u0003') process.exit(); // CTRL+C
      process.stdin.pause();
      res(key.trim());
    });
  });
}

// construct a HTMLElement from a string
function createElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

module.exports = {
  EnhancerError,
  __data,
  realpath,
  getNotionResources,
  getEnhancements,
  getJSON,
  readline,
  createElement,
};
