const SHARP = require("sharp");

/**
 * Resize an image.
 * @param {Buffer} body
 * @param {string} inputFormat
 * @param {string} outputFormat
 * @param {number} width
 * @param {number} height
 * @param {string} fit
 * @param {number} quality
 */
function resizeImage(
  body,
  inputFormat,
  outputFormat,
  width,
  height,
  fit = "cover",
  quality = 80
) {
  /**
   * Note: resizing SVG doesn't make sense.
   * In that case, simply return the original image
   */
  if (inputFormat === "svg" && outputFormat === "svg") {
    return body;
  }

  const resizeOptions = { fit: fit };

  const parsedWidth = width ? parseInt(width, 10) : 0;
  if (parsedWidth > 0) {
    resizeOptions.width = parsedWidth;
  }

  const parsedHeight = height ? parseInt(height, 10) : 0;
  if (parsedHeight > 0) {
    resizeOptions.height = parsedHeight;
  }

  const sharp = SHARP(body).withMetadata().resize(resizeOptions);

  if (outputFormat) {
    const formatOptions = { progressive: true };
    if (quality) {
      formatOptions.quality = quality;
    }
    sharp.toFormat(toSharpOutputFormat(outputFormat), formatOptions);
  }

  return sharp.toBuffer();
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
