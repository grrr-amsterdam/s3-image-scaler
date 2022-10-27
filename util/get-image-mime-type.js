/**
 * Naive mime-type function, only to suffix SVG mimetype with "+xml".
 */
module.exports = function getImageMimetype(extension) {
  return `image/${extension === "svg" ? `${extension}+xml` : extension}`;
};
