function pathToParams(path, allowedExtensions) {
  // Allow for subfolders, by using a spread operator.
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  const [size, ...filenameParts] = cleanPath.split("/");
  const filename = filenameParts.join("/");
  const [originalFilename, outputFormat, originalExtension] = parseFilename(
    filename,
    allowedExtensions
  );
  return [size, originalFilename, outputFormat, originalExtension];
}

function parseFilename(path, allowedExtensions) {
  const parts = path.split(".");
  // Take the last part of the filename, and consider it to be an output format.
  // Example: "file.jpg.webp" yields "webp", "file.jpg" yields "jpg".
  const outputFormat = extensionToLongForm(
    parts[parts.length - 1].toLowerCase()
  );
  if (!allowedExtensions.includes(outputFormat)) {
    throw new Error(`Unable to produce output ${outputFormat}.`);
  }

  // Check whether the part before that is _also_ a valid extension.
  // In that case consider the part before to be the original extension and part of the original filename.
  // Example: "file.jpg.webp" yields "file.jpg", "file.jpg" also yields "file.jpg".
  const originalExtensionIndex =
    parts.length > 2 &&
    allowedExtensions.includes(
      extensionToLongForm(parts[parts.length - 2].toLowerCase())
    )
      ? parts.length - 2
      : parts.length - 1;
  const originalExtension = parts[originalExtensionIndex];
  const originalFilename = parts.slice(0, originalExtensionIndex + 1).join(".");
  return [originalFilename, outputFormat, originalExtension];
}

function extensionToLongForm(extension) {
  return extension === "jpg" ? "jpeg" : extension;
}

module.exports = pathToParams;
