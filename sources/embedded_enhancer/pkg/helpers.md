# `helpers.js`

these shared variables/classes/functions (used for consistency of error handling and
cross-platform functionality) were previously documented in the [module-creation docs](../DOCUMENTATION.md).
however, to ensure things can be toggled on/off no non-core code is executed on enhancement.
this does made certain modding more difficult, but with some clever code the same results can be achieved.

it is unlikely any of these will need to be used, so they were removed from the main docs in
an attempt to keep things as simple as possible.

---

```js
class EnhancerError(message) {}
```

use `throw new helpers.EnhancerError(message)` if ever something occurs that would cause enhancement to fail,
but is not caused by faulty programming: e.g. if a file that is known to exist cannot be found.

---

```js
const is_wsl;
```

use `helpers.is_wsl` to check if the enhancer was run from the windows subsystem for linux.

primarily used for internal handling of filepaths (e.g. in the `helpers.realpath` function).

---

```js
const __data;
```

use `helpers.__data` to get the absolute path of the directory configuration
data is saved to by the enhancer.

if used immediately after being accessed, it should always work. however, if fetching its value during enhancement
and then inserting it into something that will not be executed until the app is opened, it must be put through
`helpers.realpath` before insertion.

---

```js
function realpath(hack_path) {
  return runtime_path;
}
```

use `helpers.realpath(hack_path)` to transform a path valid at enhancement time into one valid when the app is opened.
this is particularly useful for wsl compatibility, so every filepath that is fetched during enhancement
and then inserted into something that will not be executed until the app is opened should be put through this.

primarily used for internal handling of filepaths (e.g. for the modloader).

---

```js
function getNotionResources() {
  return __notionResourcesFolder;
}
```

use `helpers.getNotionResources()` to get the absolute path of the notion app parent folder.

primarily used for internal modding of the app (e.g. to apply the modloader and patch launch scripts).

if used immediately after being accessed, it should always work. however, if fetching its value during enhancement
and then inserting it into something that will not be executed until the app is opened, it must be put through
`helpers.realpath` before insertion.

---

```js
function getEnhancements() {
  return { loaded, invalid, dirs, IDs };
}
```

use `helpers.getEnhancements()` to list all available extensions/themes.

primarily used for internal moadloading/configuration of the app (e.g. in the menu).

---

```js
function getJSON(from) {
  return data;
}
```

use `helpers.getJSON(from)` to read/parse a JSON file. if the file has invalid contents or does not exist,
an empty object will be returned.

primarily used for internal data management (e.g. in the module `store()`).

---

```js
function readline() {
  return Promise(input);
}
```

use `helpers.readline()` to receive user input from the terminal/shell/prompt during enhancement.

example usage:

```js
console.warn(' * conflicting file found.');
let overwrite;
while (
  typeof overwrite !== 'string' ||
  !['y', 'n', ''].includes(overwrite.toLowerCase())
) {
  // using stdout.write means that there is no newline
  // between prompt and input.
  process.stdout.write(' > delete? [Y/n]: ');
  // ask for a Y/n until a valid answer is received.
  // pressing enter without input is assumed to be a "yes".
  overwrite = await helpers.readline();
}
if (overwrite.toLowerCase() === 'n') {
  console.info(' -- keeping file: skipping step.');
} else {
  // do stuff
  console.info(' -- overwriting file.');
}
```

---

```js
function createElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}
```

use `helpers.createElement(html)` to turn a html-valid string into an element to add to the page.
