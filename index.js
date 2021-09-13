const AWS = require("aws-sdk");
const SHARP = require("sharp");

const S3 = new AWS.S3();

const BUCKET = process.env.BUCKET;
const BUCKET_URL = process.env.BUCKET_URL;
const ALLOWED_EXTENSIONS = ["jpeg", "png", "webp", "gif", "svg"];

function getExtension(path) {
  const parts = path.split(".");
  const extension = parts[parts.length - 1];
  // SHARP uses "jpeg" as decoder keyword.
  if (extension === "jpg") {
    return "jpeg";
  }
  return extension;
}

function getImageMimetype(extension) {
  return `image/${extension === "svg" ? `${extension}+xml` : extension}`;
}

module.exports.handler = async function handler(event, context, callback) {
  const keyParam = event.queryStringParameters.key;
  const key = keyParam.startsWith("/") ? keyParam.substring(1) : keyParam;
  const params = key.split("/");
  const size = params[0];
  const path = params[1];

  console.log(`Using path: ${path}`);

  try {
    const extension = getExtension(path);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      throw new Error(`Unable to resize extension ${extension}.`);
    }
    // Note: allow only a width, in which case only the width will be used to resize the image.
    if (!/(\d+)x(\d{0,})$/.test(size)) {
      throw new Error("Unable to deduce dimensions.");
    }
    const object = await S3.getObject({ Bucket: BUCKET, Key: path }).promise();

    const dimensions = size.split("x");
    const width = parseInt(dimensions[0], 10);
    const height = dimensions[1] && parseInt(dimensions[1], 10);

    const options = { width, height, fit: "contain" };
    if (!options.height) {
      // Allow scaling by width, but in that case: do not pass height as an option.
      delete options.height;
    }

    /**
     * Resize the image.
     */
    const buffer = await SHARP(object.Body)
      .resize(options)
      // TODO other formats (and what about webp?)
      .toFormat(extension)
      .toBuffer();
    console.log(`Uploading to ${key}.`);

    /**
     * Store the new image on the originally requested path in the bucket.
     */
    const storage = await S3.putObject({
      ACL: "public-read",
      Body: buffer,
      Bucket: BUCKET,
      Key: key,
      ContentType: getImageMimetype(extension),
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
