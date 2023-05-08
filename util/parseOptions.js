/**
 * Parse options string into object.
 *
 * @param {string} optionsString
 * @returns {{}}
 */
module.exports = (optionsString) => {
  const options = {};

  optionsString.split("_").forEach((option) => {
    const [action, param] = option.split(":");
    // Currently only one parameter is supported.
    options[action] = param;
  });

  return options;
};
