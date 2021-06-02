# base image
FROM node:erbium-alpine

WORKDIR /app

COPY ./frontend /app

RUN yarn add global @vue/cli
RUN yarn add @vue/cli-plugin-babel
RUN yarn add babel-loader
RUN yarn

EXPOSE 8080

CMD ["yarn", "serve"]
