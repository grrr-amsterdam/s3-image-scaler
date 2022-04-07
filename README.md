# S3 image scaler

A microservice for scaling S3-stored images on the fly.

## Usage

This service works as a 404 handler for your S3 bucket.  
That way it'll scale images on demand, and immediately write them back to the original path.

Subsequent requests to the bucket will therefore skip the Lambda function entirely and hit the static file.

### Resizing

The function will allow resizing of images, by width, height, or both dimensions. Example paths:

- `/scaled/500x500/foobar.jpg`: this would generate a 500x500 version of the image `foobar.jpg`.
- `/scaled/500x/foobar.jpg`: omitting the `height` would generate a 500px wide version of the image.
- `/scaled/x500/foobar.jpg`: omitting the `width` would generate a 500px high version of the image.

### File conversion

You can double up on the extension to force a different output format.

- `/scaled/500x500/foobar.jpg.webp`: this will create a **webp** version of the file `foobar.jpg`, scaled to 500x500.

## Installation and deployment

### Clone and install

Clone this repository, and install dependencies:

```
yarn install
```

💡 Note: SHARP binaries are built for Linux X64 platform, since that's what's running on AWS Lambda. This means these binaries cannot be used locally on MacOS.
For future reference, the following one-liner is used to install Sharp:

```
npm_config_platform=linux npm_config_arch=x64 yarn add sharp
```

### Configure

Configure a `.env` file, based on `.env.example`.

```
cp .env.example .env
```

#### Environment variables

The following environment variables are mandatory:

- `BUCKET`: the bucket in which your images are stored.
- `BUCKET_URL`: the URL that's pointing to your (website-configured) bucket. For instance: http://mybucket.s3-website.eu-central-1.amazonaws.com
- `SCALED_FOLDER`: the root folder in which your scaled images are stored. Should correspond to your `KeyPrefixEquals` below in the bucket's Redirect rules.
- `DEPLOYMENT_BUCKET`: the bucket to hold your Serverless deploys. Required when deploying using Serverless.
- `AWS_REGION`: the region to deploy the Lambda function to. Required when deploying using Serverless.
- `SERVERLESS_ROLE`: the role assumed by the Lambda function.
- `SERVICE_NAME`: the name of the Lambda function, defaults to "imageScaler".

##### Defining SERVERLESS_ROLE

Create a role with the following policy attached:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "foo",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "<YOUR-BUCKET-NAME-HERE>"
    },
    {
      "Sid": "bar",
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "<YOUR-BUCKET-NAME-HERE>/*"
    }
  ]
}
```

This allows the Lambda function to read and write from the bucket.

### Deploy

Deploy using the Serverless framework:

```
npx serverless deploy --stage staging|production
```

Note the URL in Serverless' terminal output.

### Use the microservice as a redirect rule in the bucket

In your AWS console, go to your bucket, edit its properties.
Under **Website Configuration** you can modify **Redirection Rules**.

Use the URL you got from Serverless' output to configure a redirect rule:

```json
[
  {
    "Condition": {
      "HttpErrorCodeReturnedEquals": "403",
      "KeyPrefixEquals": "scaled"
    },
    "Redirect": {
      "HostName": "0123456789.execute-api.eu-central-1.amazonaws.com",
      "HttpRedirectCode": "307",
      "Protocol": "https",
      "ReplaceKeyPrefixWith": "default/resize?key="
    }
  }
]
```

Note some things:

- The value for `HostName` is the hostname you got from Serverless.
- The value for `Condition.KeyPrefixEquals` is whatever you've configured as `SCALED_FOLDER` in the environment variables.
- The value for `HttpErrorCodeReturnedEquals` might be `403` or `404` based on your bucket and CloudFront settings.

#### Let's see if it works!

Upload an image to your bucket (make sure it's publicly readable), for example `foobar.jpg`.

Now access this URL and see if it's worked: `https://<BUCKET_URL>/scaled/500x500/foobar.jpg.webp`.  
If not, the first step in debugging is to go to the Lambda function in the AWS Console and check the CloudWatch logs.

Good luck!

## Command-line usage

A small utility is provided to resize images on from the command-line.  
This is especially helpful if you want to quickly test Sharp output, or generate fixtures for the test suite.

### Usage

```
node cli/resize-image.js my-source-image.jpg 500x500 my-output-image.jpg
```
