# Upgrade to V3

The function uses NodeJS 18 so update your NodeJS version in the deploy workflow.

Environment variable `AWS_REGION` has been removed. Use the Serverless flag `--region`. For example: `npx serverless deploy --region eu-central-1`.

# Upgrade to V2

Upgrading to this version requires a change in the S3 Static website configuration. "ReplaceKeyPrefixWith": "default/resize?key=" must become "ReplaceKeyPrefixWith": "default/resize?key=scaled". This compensates for the removed SCALED_FOLDER env var.
