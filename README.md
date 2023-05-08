# S3 image scaler

[![CI](https://github.com/grrr-amsterdam/s3-image-scaler/actions/workflows/ci.yml/badge.svg)](https://github.com/grrr-amsterdam/s3-image-scaler/actions/workflows/ci.yml)

### A microservice for scaling S3-stored images on the fly.

- No need to predefine image formats — all dimensions are accepted at runtime.
- Able to transform image formats on the fly.
- Even supports WebP!

### Developed with ❤️ by [GRRR](https://grrr.nl)

- GRRR is a [B Corp](https://grrr.nl/en/b-corp/)
- GRRR has a [tech blog](https://grrr.tech/)
- GRRR is [hiring](https://grrr.nl/en/jobs/)
- [@GRRRTech](https://twitter.com/grrrtech) tweets

## Table of contents

- [Usage](#usage)
  - [Resizing](#resizing)
  - [File conversion](#file-conversion)
- [Versions](#versions)
- [Installation](#installation)
- [Local development server](#local-development-server)
- [Command-line usage locally](#command-line-usage-locally)
- [Testing](#testing)
- [Deploy Lambda function](#deploy-lambda-function)
- [Connect the Lambda to your bucket](#connect-the-lambda-function-to-your-bucket)
- [Use as CloudFront failover group](#use-as-cloudfront-failover-group)
- [Debugging](#debugging)
- [Contributions](#contributions)

## Usage

This service works as a 404 handler for your S3 bucket.  
That way it'll scale images on demand, and immediately write them back to the original path.

Subsequent requests to the bucket will therefore skip the Lambda function entirely and hit the static file.

### Resizing

The function will allow resizing of images, by width, height, or both dimensions. Example paths:

- `/scaled/width:500_height:500/foobar.jpg`: this would generate a 500x500 version of the image `foobar.jpg`.
- `/scaled/width:500/foobar.jpg`: omitting the `height` would generate a 500px wide version of the image.
- `/scaled/height:500/foobar.jpg`: omitting the `width` would generate a 500px high version of the image.

### File conversion

You can convert an image to a different format.

- `/scaled/width:500_height:500_convert:webp/foobar.jpg.webp`: this will create a **webp** version of the file `foobar.jpg`, scaled to 500x500.

Notice that you have to add the `convert` parameter with a format argument and append the extension to the file name. Doing both prevents confusion when the original image has multiple extensions. And when downloading the image, the correct extension is used.

## Versions

This repository uses branches for every major version. `v1.0`, `v2.x`, `v3.x`, etc. New features should be added to the latest version branch. Bug fixes should be added to the oldest version branch that is affected.

When deploying use a git tag to pin the version. This prevents breaking changes from being deployed automatically.

`CHANGELOG.md` contains a list of all versions and their changes.

## Installation

Clone this repository, and install dependencies:

```sh
yarn install
```

💡 Note: SHARP binaries are built for Linux X64 platform, since that's what's running on AWS Lambda. This means these binaries cannot be used locally on MacOS.
For future reference, the following one-liner is used to install Sharp:

```sh
npm_config_platform=linux npm_config_arch=x64 yarn add sharp
```

Configure a `.env` file, based on `.env.example`.

```sh
cp .env.example .env
```

Mandatory environment variables are:

- `BUCKET`: the bucket in which your images are stored.
- `DEPLOYMENT_BUCKET`: the bucket to hold your Serverless deploys. Required when deploying using Serverless.
- `PROJECT_NAME` : Give AWS resources a Project tag with this value, defaults to `SERVICE_NAME`.
- `SERVERLESS_ROLE`: the role assumed by the Lambda function.
- `SERVICE_NAME`: the name of the Lambda function.

Optional environment variables are:

- `IMAGE_ACL`: the ACL applied to generated images. Default is empty. Use `public-read` when this service is deployed as S3 bucket redirect rule. When it's a CloudFront origin, use the default value.
- `QUALITY`: the format option quality setting for all image types. (integer: 1-100)

## Local development server

This package includes a local image server, allowing you to test with this image scaler locally, completely offline and independent of an AWS setup.

```sh
yarn serve
```

Then use http://localhost:8888/scaled/width:500_height:500/foo/bar.jpg for your image requests.

Currently, you will get back a random image with the requested dimensions.

## Command-line usage locally

A small utility is provided to resize images from the command-line.  
This is especially helpful if you want to quickly test Sharp output, or generate fixtures for the test suite.

```sh
node cli/resize-image.js my-source-image.jpg width:500_height:500_convert:webp my-output-image.jpg.webp
```

## Testing

You can run the unit tests using

```sh
yarn test
```

This tests a variety of actual image conversions against problems we encountered in the wild.

## Deploy Lambda function

Create an IAM role which Lambda functions are allowed to assume. Add the following trust relationship:

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
      "Action": "s3:ListBucket",
      "Resource": "<YOUR-BUCKET-NAME-HERE>"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:PutObjectAcl"],
      "Resource": "<YOUR-BUCKET-NAME-HERE>/*"
    }
  ]
}
```

This allows the Lambda function to read and write from the bucket.

Deploy using the Serverless framework:

```sh
npx serverless deploy --stage=staging|production --region eu-central-1
```

Note the URL in Serverless' terminal output.

## Connect the Lambda function to your bucket

The function can work as a Website Configuration Redirection Rule or as a CloudFront Origin. Choose one of the two.

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

Let's see if it works!

Upload an image to your bucket (make sure it's publicly readable), for example `foobar.jpg`.

Now access this URL and see if it's working: `https://<BUCKET_URL>/scaled/width:500_height:500/foobar.jpg.webp`.  
If not, the first step in debugging is to go to the Lambda function in the AWS Console and check the CloudWatch logs.

Good luck!

## Use as CloudFront failover origin group

In your AWS console, go to your CloudFront distribution. Under <strong>Origins</strong> to can add a second origin, beside your S3 bucket.

Add an origin with the name "ImageScaler" and "Origin domain" (`0123456789.execute-api.eu-central-1.amazonaws.com`) should be the host of the API Gateway URL. Add the path of that url to "Origin path" (`default/resize?key=`).

Create an Origin group with the S3Origin as a primary. The ImageScaler orign as secondary. Name it "Image scaler fallback" and 403 as criteria.

The last step is changing the "Origin and origin group" property of the behavior. Go to Behaviors and edit the default behavior. Choose the created Origin group.

Save and wait for AWS to deploy the changes.

Let's see if it works!

Upload an image to your bucket, for example, `foobar.jpg`.

Now access this URL and see if it's working: `https://<CLOUDFRONT_DISTRIBUTION>/scaled/width:500_height:500/foobar.jpg.webp`. If not, the first step in debugging is to go to the Lambda function in the AWS Console and check the CloudWatch logs.

## Debugging

The Lambda function logs to CloudWatch. You can find the logs in the AWS Console.

If you can only use the API. Use the following command to get the logs:

```sh
aws logs tail /aws/lambda/<SERVICE_NAME>-<STAGE>-main --follow
```

## Contributions

Contributions are very welcome! If you're changing any of the image conversion rules, make sure to add a unit test to document the intended behavior.  
Thanks!
