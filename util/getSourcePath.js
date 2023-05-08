const path = require("path");

/**
 * Get the path of the original file. This is the path without the new extension when converting.
 *
 * @param {string} filename
 * @param {string} convert
 * @returns {string}
 */
module.exports = (filename, convert) => {
  const parts = path.parse(filename);

  return path.format({
    dir: parts.dir,
    // Remove the extension when converting.
    name: convert ? parts.name : parts.base,
  });
};
