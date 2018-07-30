#!/bin/bash

sudo yum install -y tig jq

nvm i v8
npm i -g create-react-app
npm i -g awsmobile-cli

git clone https://github.com/lurkerbot/notable-lab.git

cd notable-lab

npm i
npm i aws-amplify aws-amplify-react

awsmobile init

awsmobile appsync enable
awsmobile user-signin enable
awsmobile user-files enable

awsmobile push
awsmobile appsync console

# - enable 'Amazon Cognito User Pool'
# - set the region to 'US-EAST-1'
# - select the user pool
# - set the default action to 'ALLOW'

awsmobile pull
