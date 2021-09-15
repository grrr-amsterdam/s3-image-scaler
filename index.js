const AWS = require("aws-sdk");
const SHARP = require("sharp");

const S3 = new AWS.S3();

const BUCKET = process.env.BUCKET;
const BUCKET_URL = process.env.BUCKET_URL;
const ALLOWED_EXTENSIONS = ["jpeg", "png", "webp", "gif", "svg"];

module.exports.handler = async function handler(event, context, callback) {
  try {
    const keyParam = event.queryStringParameters.key;
    const key = keyParam.startsWith("/") ? keyParam.substring(1) : keyParam;
    const [size, path, outputFormat] = pathToParams(key);

    console.log(`Using path: ${path}`);
    console.log(`Using dimensions: ${size}`);
    console.log(`Using output-format: ${outputFormat}`);

    // Note: both dimensions are optional, but either width or height should always be present.
    const dimensions = size.split("x");
    const width = dimensions[0] && parseInt(dimensions[0], 10);
    const height = dimensions[1] && parseInt(dimensions[1], 10);
    if (!width && !height) {
      throw new Error("Unable to deduce dimensions.");
    }

    const object = await S3.getObject({ Bucket: BUCKET, Key: path }).promise();

    /**
     * Resize the image.
     */
    const options = toSharpOptions({ width, height, fit: "contain" });
    const buffer = await SHARP(object.Body)
      .resize(options)
      .toFormat(outputFormat)
      .toBuffer();
    console.log(`Scaling successful. Uploading to ${key}.`);

    /**
     * Store the new image on the originally requested path in the bucket.
     */
    const storage = await S3.putObject({
      ACL: "public-read",
      Body: buffer,
      Bucket: BUCKET,
      Key: key,
      ContentType: getImageMimetype(outputFormat),
      ContentDisposition: "inline", // Display images inline.
    }).promise();

    console.log(`PutObject response:`, storage);

    /**
     * Redirect the user back to the originally requested path.
     * There should be a newly created image awaiting them.
     */
    console.log(`Redirecting to ${BUCKET_URL}/${key}`);
    callback(null, {
      statusCode: "301",
      headers: { location: `${BUCKET_URL}/${key}` },
      body: "",
    });
  } catch (err) {
    console.error(err);
    callback(null, {
      statusCode: "404",
      // TODO show generic error instead of real error.
      body: err.toString(), // "Object not found",
    });
  }
};

function parseFilename(path) {
  const parts = path.split(".");
  // Take the last part of the filename, and consider it to be an output format.
  // Example: "file.jpg.webp" yields "webp", "file.jpg" yields "jpg".
  const outputFormat = extensionToLongForm(parts[parts.length - 1]);
  if (!ALLOWED_EXTENSIONS.includes(outputFormat)) {
    throw new Error(`Unable to produce output ${outputFormat}.`);
  }

  // Check whether the part before that is _also_ a valid extension.
  // In that case consider the part before to be the original extension and part of the original filename.
  // Example: "file.jpg.webp" yields "file.jpg", "file.jpg" also yields "file.jpg".
  const originalExtensionIndex =
    parts.length > 2 &&
    ALLOWED_EXTENSIONS.includes(extensionToLongForm(parts[parts.length - 2]))
      ? -1
      : parts.length;

  const originalFilename = parts.slice(0, originalExtensionIndex).join(".");
  return [originalFilename, outputFormat];
}

/**
 * Naive mime-type function, only to suffix SVG mimetype with "+xml".
 */
function getImageMimetype(extension) {
  return `image/${extension === "svg" ? `${extension}+xml` : extension}`;
}

function extensionToLongForm(extension) {
  return extension === "jpg" ? "jpeg" : extension;
}

/**
 * Remove optional width and height parameters.
 * These should always be valid positive integers or otherwise be omitted.
 */
function toSharpOptions(options) {
  if (!options.width) {
    delete options.width;
  }
  if (!options.height) {
    delete options.height;
  }
  return options;
}

function pathToParams(path) {
  const [size, filename] = path.split("/");
  const [originalFilename, outputFormat] = parseFilename(filename);
  return [size, originalFilename, outputFormat];
}
