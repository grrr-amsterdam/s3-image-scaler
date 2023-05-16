const SHARP = require("sharp");

/**
 * Resize an image.
 * Pass it the contents of the original file, the output format and further Sharp options.
 */
function resizeImage(body, outputFormat, sharpOptions, quality) {
  const options = { progressive: true };
  if (quality) {
    options.quality = quality;
  }
  return SHARP(body)
    .withMetadata()
    .resize(sharpOptions)
    .toFormat(toSharpOutputFormat(outputFormat), options)
    .toBuffer();
}

/**
 * Correct certain output formats to something that Sharp understands.
 * Note that we never change the output format in the extension of
 * the output file, since that would defeat the purpose of
 * redirecting the user back to the scaled URL.
 */
function toSharpOutputFormat(format) {
  return format === "jfif" ? "jpg" : format;
}

module.exports = resizeImage;
