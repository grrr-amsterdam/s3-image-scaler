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
