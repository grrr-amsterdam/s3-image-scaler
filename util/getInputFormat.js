const path = require("path");

module.exports = function (filename, convert) {
  if (convert) {
    // Remove the extension when converting.
    filename = path.basename(filename, `.${convert}`);
  }
  return path.extname(filename).replace(".", "");
};
