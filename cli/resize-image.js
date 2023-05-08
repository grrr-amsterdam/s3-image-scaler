const fs = require("fs");
const getInputFormat = require("../util/getInputFormat.js");
const getOutputFormat = require("../util/getOutputFormat.js");
const parseOptions = require("../util/parseOptions.js");
const resizeImage = require("../util/resizeImage.js");

const sourcePath = process.argv[2];
if (!sourcePath) {
  throw new Error("Please provide a path to an image.");
}

const optionsString = process.argv[3];
if (!optionsString) {
  throw new Error(
    "Please provide options to scale the image. For example: width:100"
  );
}

const destinationPath = process.argv[4];
if (!destinationPath) {
  throw new Error("Please provide a path to write the resized image.");
}

const input = fs.readFileSync(sourcePath);

const options = parseOptions(optionsString);

const inputFormat = getInputFormat(destinationPath, options.convert);
const outputFormat = getOutputFormat(destinationPath, options.convert);

resizeImage(input, inputFormat, outputFormat, options.width, options.height)
  .then((buffer) => fs.writeFileSync(destinationPath, buffer))
  .then(() => console.log(`Resized image written to ${destinationPath}`));
