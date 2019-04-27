#!/bin/bash

# reset the lambda code
aws lambda update-function-code --function-name transcriber --zip-file fileb://docs/empty-lambda.zip
amplify delete
rm src/aws-exports.js
git reset --hard
