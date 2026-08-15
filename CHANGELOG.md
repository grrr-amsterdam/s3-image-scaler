# Upgrade to V5

Breaking: the node runtime has been updated to version 24.
Update `runtime` in your copy of `serverless.example.yml` to `nodejs24.x` and ensure your deploy workflows use the correct node version.

All dependencies have been updated, resolving all known `yarn audit` vulnerabilities. Notably Sharp (0.33 → 0.35, image output differs slightly; test fixtures were regenerated) and oss-serverless (3 → 4, the legacy `variablesResolutionMode` and `lambdaHashingVersion` options are no longer supported).

Before packaging a deploy, run `yarn install --ignore-platform` to include the Linux binaries for Lambda. The previously documented `npm_config_platform=linux npm_config_arch=x64 yarn add sharp` one-liner no longer works.

# Upgrade to V4.3.0

The node runtime has been updated to version 22.
Ensure your deploy workflows use the correct node version.

We also started using [oss-serverless](https://github.com/oss-serverless/serverless) instead of serverless. This allows us to keep using Serverless Framework version 3.

# Upgrade to V4.2.0

The node runtime has been updated to version 20.  
Ensure your deploy workflows use the correct node version.

# Upgrade to V4

The URL structure has changed to make it possible to add more options. The old URL structure is not supported anymore. But can easily be converted to the new structure.

Some examples:

- `/scaled/500x500/foobar.jpg` -> `/scaled/width:500_height:500/foobar.jpg`
- `/scaled/x400/foobar.jpg.webp` -> `/scaled/height:400_convert:webp/foobar.jpg.webp`

Notice that you have to add the `convert` parameter with a format argument and append the extension to the file name. Doing both prevents confusion when the original image has multiple extensions. And when downloading the image, the correct extension is used.

# Upgrade to V3

The function uses NodeJS 18 so update your NodeJS version in the deploy workflow.

Environment variable `AWS_REGION` has been removed. Use the Serverless flag `--region`. For example: `npx serverless deploy --region eu-central-1`.

# Upgrade to V2

Upgrading to this version requires a change in the S3 Static website configuration. "ReplaceKeyPrefixWith": "default/resize?key=" must become "ReplaceKeyPrefixWith": "default/resize?key=scaled". This compensates for the removed SCALED_FOLDER env var.
