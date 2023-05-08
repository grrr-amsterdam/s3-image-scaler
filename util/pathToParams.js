const cleanupPath = require("./cleanupPath");
const parseOptions = require("./parseOptions");

/**
 * @param {string} path
 * @returns {({}|string)[]}
 */
function pathToParams(path) {
  // Allow for subfolders, by using a spread operator.
  const [, options, ...filenameParts] = cleanupPath(path).split("/");
  const filename = filenameParts.join("/");
  return [parseOptions(options), filename];
}

module.exports = pathToParams;
