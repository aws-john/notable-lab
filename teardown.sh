#!/bin/bash

# reset the lambda code
aws lambda update-function-code --function-name transcriber --zip-file fileb://docs/empty-lambda.zip
amplify delete
aws s3 rb s3://lab-content-notable --force
rm src/aws-exports.js
git reset --hard
