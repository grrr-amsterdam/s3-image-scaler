const path = require("path");

module.exports = function (filename, convert) {
  const extension = path.extname(filename).replace(".", "");
  if (convert && convert !== extension) {
    throw new Error(
      `The filename '${filename}' must have '${convert}' as extension, not '${extension}'.`
    );
  }
  return extension;
};
