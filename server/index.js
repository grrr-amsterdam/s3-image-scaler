const dotenv = require("dotenv");
const express = require("express");
const fs = require("fs");
const cleanupPath = require("../util/cleanupPath.js");
const consoleLogDebug = require("../util/consoleLogDebug.js");
const getImageMimetype = require("../util/getImageMimeType.js");
const getInputFormat = require("../util/getInputFormat.js");
const getOutputFormat = require("../util/getOutputFormat.js");
const isValidExtension = require("../util/isValidExtension.js");
const pathToParams = require("../util/pathToParams.js");
const resizeImage = require("../util/resizeImage.js");

dotenv.config();
const { IMAGE_QUALITY } = process.env;
const quality = parseInt(IMAGE_QUALITY);

const app = express();

// TODO nice to make the port configurable.
const port = 8888;

console.log(`Local image server is listening on port ${port}`);

/**
 * This route loosely follows index.js, but of course focusing on being offline
 * all the while.
 */
app.get("*", async function (req, res, next) {
  try {
    const key = cleanupPath(req.path);

    const [options, path] = pathToParams(key);
    if (!options || !path) {
      res.sendStatus(404);
      return;
    }

    const inputFormat = getInputFormat(path, options.convert);
    const outputFormat = getOutputFormat(path, options.convert);

    consoleLogDebug(path, options, inputFormat, outputFormat, quality);

    if (!isValidExtension(inputFormat) || !isValidExtension(outputFormat)) {
      return res
        .status(500)
        .send(
          `Input format "${inputFormat}" or output format "${outputFormat}" is not supported.`
        );
    }

    if (!options.width && !options.height) {
      return res
        .status(500)
        .send("At least provide the width or height parameter.");
    }

    /**
     * Grab a random image as output.
     */
    const imageOptions = ["belltower.jpg", "drawing.jpg", "mountain-range.jpg"];
    const chosenImage =
      imageOptions[Math.floor(Math.random() * imageOptions.length)];
    const objectBody = fs.readFileSync(`${__dirname}/images/${chosenImage}`);

    /**
     * Resize the image.
     */
    const buffer = await resizeImage(
      objectBody,
      inputFormat,
      outputFormat,
      options.width,
      options.height,
      "cover",
      quality
    );

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
