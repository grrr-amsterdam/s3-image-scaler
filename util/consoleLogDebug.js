/**
 * Print debug information to the console.
 *
 * @param {string} path
 * @param {object} options
 * @param {string} inputFormat
 * @param {string} outputFormat
 * @param {number} quality
 */
module.exports = (path, options, inputFormat, outputFormat, quality) => {
  console.log(`Using path: ${path}`);
  console.log(`Using width: ${options.width}`);
  console.log(`Using height: ${options.height}`);
  console.log(`Using input-format: ${inputFormat}`);
  console.log(`Using output-format: ${outputFormat}`);
  console.log(`Using quality: ${quality ? quality : "Sharps default"}`);
};
