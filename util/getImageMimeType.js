/**
 * Naive mime-type function
 */
module.exports = (extension) => {
  extension = extension.replace(".", "");
  if (extension === "jpg") {
    return "image/jpeg";
  }
  if (extension === "svg") {
    return "image/svg+xml";
  }
  return `image/${extension}`;
};
