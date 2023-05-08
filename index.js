const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const cleanupPath = require("./util/cleanupPath.js");
const consoleLogDebug = require("./util/consoleLogDebug.js");
const deflateImage = require("./util/deflateImage.js");
const getImageMimetype = require("./util/getImageMimeType");
const getInputFormat = require("./util/getInputFormat.js");
const getOutputFormat = require("./util/getOutputFormat.js");
const getSourcePath = require("./util/getSourcePath.js");
const pathToParams = require("./util/pathToParams.js");
const resizeImage = require("./util/resizeImage.js");

const S3 = new S3Client();

const { BUCKET, IMAGE_ACL, IMAGE_QUALITY } = process.env;
const quality = parseInt(IMAGE_QUALITY);

module.exports.handler = async function handler(event, context, callback) {
  try {
    const finalObjectKey = cleanupPath(event.queryStringParameters.key);

    const [options, path] = pathToParams(finalObjectKey);

    const inputFormat = getInputFormat(path, options.convert);
    const outputFormat = getOutputFormat(path, options.convert);

    consoleLogDebug(path, options, inputFormat, outputFormat, quality);

    const buffer = await S3.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: getSourcePath(path, options.convert),
      })
    )
      .then(async (object) => {
        const body = await object.Body.transformToByteArray();
        return object.ContentEncoding === "gzip" ? deflateImage(body) : body;
      })
      .then((body) =>
        resizeImage(
          body,
          inputFormat,
          outputFormat,
          options.width,
          options.height,
          "cover",
          quality
        )
      );

    /**
     * Store the new image on the originally requested path in the bucket.
     */
    const s3Options = {
      Body: buffer,
      Bucket: BUCKET,
      Key: finalObjectKey,
      ContentType: getImageMimetype(outputFormat),
      ContentDisposition: "inline", // Display images inline.
    };
    // Add ACL if defined in the environment.
    if (IMAGE_ACL) {
      console.log(`Using ACL: ${IMAGE_ACL}`);
      s3Options.ACL = IMAGE_ACL;
    }
    const storage = await S3.send(new PutObjectCommand(s3Options));

    console.log(`PutObject response:`, storage);

    /**
     * Redirect the user back to the originally requested path.
     * There should be a newly created image awaiting them.
     */
    callback(null, {
      statusCode: "200",
      headers: {
        "Content-Type": getImageMimetype(outputFormat),
        "Content-Disposition": "inline",
      },
      isBase64Encoded: true,
      body: buffer.toString("base64"),
    });
  } catch (err) {
    console.error(err);
    callback(null, {
      statusCode: "404",
      // TODO show generic error instead of real error.
      body: `An application error occurred: ${err.toString()}`, // "Object not found",
    });
  }
};
