const express = require("express");
const fs = require("fs");
const pathToParams = require("../util/pathToParams.js");
const toSharpOptions = require("../util/toSharpOptions.js");
const resizeImage = require("../util/resizeImage.js");
const getImageMimetype = require("../util/get-image-mime-type.js");

const app = express();

// TODO nice to make the port configurable.
const port = 8888;
const ALLOWED_EXTENSIONS = ["jpeg", "jpg", "png", "webp", "gif", "svg", "jfif"];

console.log(`Local image server is listening on port ${port}`);

/**
 * Example request:
 * /scaled/550x/pictures/1234/5678.jpeg
 *
 * This route loosely follows index.js, but of course focusing on being offline
 * all the while.
 */
app.get("*", async function (req, res, next) {
  if (req.path === "/favicon.ico") {
    res.sendStatus(404);
    return;
  }
  try {
    const key = req.path.startsWith("/") ? req.path.substring(1) : req.path;

    const [size, path, outputFormat, originalExtension] = pathToParams(
      key,
      ALLOWED_EXTENSIONS
    );
    if (!size || !path || !outputFormat || !originalExtension) {
      res.sendStatus(404);
      return;
    }

    console.log(`Using path: ${path}`);
    console.log(`Using dimensions: ${size}`);
    console.log(`Using output-format: ${outputFormat}`);

    // Note: both dimensions are optional, but either width or height should always be present.
    const dimensions = size.split("x");
    const width = dimensions[0] && parseInt(dimensions[0], 10);
    const height = dimensions[1] && parseInt(dimensions[1], 10);
    if (!width && !height) {
      console.error("Unable to deduce dimensions.");
    }

    /**
     * Resize the image.
     */
    const options = toSharpOptions({
      width,
      height,
      fit: "cover",
    });

    /**
     * Grab a random image as output.
     */
    const imageOptions = ["belltower.jpg", "drawing.jpg", "mountain-range.jpg"];
    const chosenImage =
      imageOptions[Math.floor(Math.random() * imageOptions.length)];
    const objectBody = fs.readFileSync(`${__dirname}/images/${chosenImage}`);

    /**
     * Note: resizing SVG doesn't make sense.
     * In that case, simply re-upload the original image to the new destination.
     */
    const buffer =
      outputFormat === "svg" && originalExtension === "svg"
        ? objectBody
        : await resizeImage(objectBody, outputFormat, options);

    /**
     * Redirect the user back to the originally requested path.
     * There should be a newly created image awaiting them.
     */
    res.writeHead(200, {
      "Content-Type": getImageMimetype(outputFormat),
      "Content-Disposition": "inline",
      "Content-Length": buffer.length,
    });
    res.end(buffer);
  } catch (err) {
    next(err);
  }
});

app.listen(port);
