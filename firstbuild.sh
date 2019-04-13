#!/bin/bash

sudo yum install -y tig jq

nvm i v8
npm i -g create-react-app
npm i -g amplify-cli

git clone https://github.com/lurkerbot/notable-lab.git

cd notable-lab

npm i
npm i aws-amplify aws-amplify-react

amplify init

amplify auth add
amplify storage add
amplify api add

amplify push

# - enable 'Amazon Cognito User Pool'
# - set the region to 'US-EAST-1'
# - select the user pool
# - set the default action to 'ALLOW'

