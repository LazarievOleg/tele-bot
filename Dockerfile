FROM node:lts-alpine
COPY ./package.json . 
RUN npm i
COPY . . 
EXPOSE 5555