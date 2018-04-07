FROM node:8

LABEL MAINTAINER=RITESH<RITESH101094@GMAIL.COM>
LABEL DESCRIPTION="Node assignment for insider"

WORKDIR /home/ubuntu
EXPOSE 3000
COPY package.json package.json

RUN npm install

COPY config/default.docker.json config/default.json
# TODO: Uncomment below line for Google cloud storage in docker
# COPY config/<keyfile>.json config/<keyfile>.json
COPY routes routes
COPY static static
COPY app.js app.js
COPY services services

RUN mkdir uploads

ENTRYPOINT npm start
