const fs = require("fs");
const resizeImage = require("../util/resizeImage.js");
const pathToParams = require("../util/pathToParams.js");
const toSharpOptions = require("../util/toSharpOptions.js");
const { basename } = require("path");

const fileInput = process.argv[2];
if (!fileInput) {
  throw new Error("Please provide a path to an image.");
}
const desiredDimensions = process.argv[3];
if (!desiredDimensions) {
  throw new Error("Please provide the dimensions to scale the image.");
}
const fileOutput = process.argv[4];
if (!fileOutput) {
  throw new Error("Please provide a path to write the resized image.");
}

if (!fs.existsSync(fileInput)) {
  throw new Error(`${fileInput} does not exist.`);
}

const [size, , outputFormat] = pathToParams(
  `${desiredDimensions}/${basename(fileInput)}`,
  ["jpg", "gif", "png", "jfif", "webp"]
);

// Note: both dimensions are optional, but either width or height should always be present.
const dimensions = size.split("x");
const width = dimensions[0] && parseInt(dimensions[0], 10);
const height = dimensions[1] && parseInt(dimensions[1], 10);
if (!width && !height) {
  throw new Error("Unable to deduce dimensions.");
}

const options = toSharpOptions({
  width,
  height,
  fit: "cover",
});

const input = fs.readFileSync(fileInput);
resizeImage(input, outputFormat, options).then((buffer) =>
  fs.writeFileSync(fileOutput, buffer)
);
