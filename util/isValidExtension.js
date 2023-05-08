const ALLOWED_EXTENSIONS = ["jpeg", "jpg", "png", "webp", "gif", "svg", "jfif"];

/**
 * @param {string} extension
 * @returns {boolean}
 */
module.exports = (extension) => {
  return ALLOWED_EXTENSIONS.includes(extension);
};
