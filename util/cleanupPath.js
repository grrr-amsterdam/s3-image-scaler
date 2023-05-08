/**
 * Prepares a path for use.
 *
 * @param {string} path
 * @returns {string}
 */
module.exports = (path) => {
  path = decodeURI(path);
  return path.startsWith("/") ? path.substring(1) : path;
};
