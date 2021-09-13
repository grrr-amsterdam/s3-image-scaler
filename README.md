# S3 image scaler

A microservice for scaling S3-stored images on the fly.

## Usage

TO DO

## Installation and deployment

Clone this repository, and install dependencies:

```
yarn install
```

Configure a `.env` file, based on `.env.example`.

Deploy using serverless:

```
serverless deploy --stage development
```

Note the URL in Serverless' terminal output.

Use that URL when configuring redirect rules in the bucket's website configuration:

```json
[
  {
    "Condition": {
      "HttpErrorCodeReturnedEquals": "403"
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

Note that the value for `HttpErrorCodeReturnedEquals` might be `403` or `404` based on your bucket and CloudFront settings.
