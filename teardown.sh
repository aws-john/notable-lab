#!/bin/bash

# reset the lambda code
aws lambda update-function-code --function-name transcriber --zip-file fileb://docs/empty-lambda.zip

# detach the appsync resolvers
#export API_ID="$(jq '.api.lab.output.GraphQLAPIIdOutput' amplify/backend/amplify-meta.json | tr -d '"')"
#
#aws appsync delete-resolver --api-id $API_ID --type Query --field-name allNotes
#aws appsync delete-resolver --api-id $API_ID --type Query --field-name getNote
#aws appsync delete-resolver --api-id $API_ID --type Mutation --field-name newNote
#aws appsync delete-resolver --api-id $API_ID --type Mutation --field-name modifyNote
#aws appsync delete-resolver --api-id $API_ID --type Mutation --field-name deleteNote
#
## delete the users
##export POOL_ID="$(grep 'aws_user_pools_id' src/aws-exports.js | tr ':' '\n' | tr -d " '," | tail -n1)"
#export POOL_ID="$(grep 'aws_user_pools_id' src/aws-exports.js | tr ':' '\n' | tr -d " '," | tail -n1)"
#export USERS=USERS="$(aws cognito-idp list-users  --user-pool-id ${POOL_ID} | grep Username | awk -F: '{print $2}' | sed -e 's/\"//g' | sed -e 's/,//g')"
#
#if [ ! "x$USERS" = "x" ] ; then
#    for user in $USERS; do
#	echo "Deleting user $user"
#	aws cognito-idp admin-delete-user --user-pool-id ${POOL_ID} --username ${user}
#	echo "Result code: $?"
#	echo "Done"
#	done
#else
#    echo "Done, no more users"
#    RUN=0
#fi
#
## delete the data
#export TABLE_NAME=NoteTable
#export KEY=id
#aws dynamodb scan --table-name $TABLE_NAME --attributes-to-get "$KEY"   --query "Items[].$KEY.S" --output text |   tr "\t" "\n" |   xargs -t -I keyvalue aws dynamodb delete-item --table-name $TABLE_NAME   --key "{\"$KEY\": {\"S\": \"keyvalue\"}}"
#echo "cleared data"

amplify delete
