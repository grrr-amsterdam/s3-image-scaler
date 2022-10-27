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

- `AWS_REGION`: the region to deploy the Lambda function to. Required when deploying using Serverless.
- `BUCKET`: the bucket in which your images are stored.
- `DEPLOYMENT_BUCKET`: the bucket to hold your Serverless deploys. Required when deploying using Serverless.
- `PROJECT_NAME` : Give AWS resources a Project tag with this value, defaults to `SERVICE_NAME`.
- `SERVERLESS_ROLE`: the role assumed by the Lambda function.
- `SERVICE_NAME`: the name of the Lambda function, defaults to "imageScaler".

##### Defining SERVERLESS_ROLE

Create a role which Lambda functions are allowed to assume. Add the following trust relationship:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

The role must have the following policy attached:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "<YOUR-BUCKET-NAME-HERE>"
    },
    {
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

The function can work with a Website Configuration Redirection Rule or as a CloudFront Origin. It's not necessary to configure both.

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
      "ReplaceKeyPrefixWith": "default/resize?key=scaled"
    }
  }
]
```

Note some things:

- The value for `HostName` is the hostname you got from Serverless.
- The value for `Condition.KeyPrefixEquals` is whatever you've configured as `SCALED_FOLDER` in the environment variables.
- The value for `HttpErrorCodeReturnedEquals` might be `403` or `404` based on your bucket. 403 when the objects in the bucket aren't public, 404 when they are.

#### Let's see if it works!

Upload an image to your bucket (make sure it's publicly readable), for example `foobar.jpg`.

Now access this URL and see if it's working: `https://<BUCKET_URL>/scaled/500x500/foobar.jpg.webp`.  
If not, the first step in debugging is to go to the Lambda function in the AWS Console and check the CloudWatch logs.

Good luck!

### Use a CloudFront failover origin group

In your AWS console, go to your CloudFront distribution. Under <strong>Origins</strong> to can add a second origin, beside your S3 bucket.

Add an origin with the name "ImageScaler" and "Origin domain" (`0123456789.execute-api.eu-central-1.amazonaws.com`) should be the host of the API Gateway URL. Add the path of that url to "Origin path" (`default/resize?key=`).

Create an Origin group with the S3Origin as a primary. The ImageScaler orign as secondary. Name it "Image scaler fallback" and 403 as criteria.

The last step is changing the "Origin and origin group" property of the behavior. Go to Behaviors and edit the default behavior. Choose the created Origin group.

Save and wait for AWS to deploy the changes.

#### Let's see if it works!

Upload an image to your bucket, for example, `foobar.jpg`.

Now access this URL and see if it's working: `https://<CLOUDFRONT_DISTRIBUTION>/scaled/500x500/foobar.jpg.webp`. If not, the first step in debugging is to go to the Lambda function in the AWS Console and check the CloudWatch logs.

Good luck!

## Command-line usage

A small utility is provided to resize images on from the command-line.  
This is especially helpful if you want to quickly test Sharp output, or generate fixtures for the test suite.

### Usage

```
node cli/resize-image.js my-source-image.jpg 500x500 my-output-image.jpg
```

## Local image server

This package includes a local image server, allowing you to test with this image scaler locally, completely offline and independent of an AWS setup.

### Usage:

```
yarn serve
```

Then use http://localhost:8888/scaled/500x500/foo/bar.jpg for your image requests.

Currently you will get back a random image with the requested dimensions.
