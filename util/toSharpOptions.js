/**
 * Remove optional width and height parameters.
 * These should always be valid positive integers or otherwise be omitted.
 */
function toSharpOptions(options) {
  if (!options.width) {
    delete options.width;
  }
  if (!options.height) {
    delete options.height;
  }
  return options;
}

module.exports = toSharpOptions;
