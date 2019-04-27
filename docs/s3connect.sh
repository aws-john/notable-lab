#!/bin/bash

pushd docs

# get the lambda arn so we can inject inject it into the notification json
FNARN=`aws lambda get-function-configuration --function-name transcriber | jq '.FunctionArn'`
cat s3notification.json | jq --argjson FNARN "$FNARN" '.LambdaFunctionConfigurations[0].LambdaFunctionArn = $FNARN' > temp.json

aws lambda add-permission --function-name transcriber --principal s3.amazonaws.com \
--statement-id abc123 --action "lambda:InvokeFunction" \
--source-arn arn:aws:s3:::$1-notable

# connect the s3 object events for our content bucket to the transcriber labmda
aws s3api put-bucket-notification-configuration \
--bucket $1-notable \
--notification-configuration file://temp.json

popd
