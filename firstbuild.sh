#!/bin/bash

sudo yum install -y tig jq

nvm i v8
npm i -g create-react-app
npm i -g @aws-amplify/cli

git clone https://github.com/lurkerbot/notable-lab.git

cd notable-lab

npm i
npm i aws-amplify aws-amplify-react
