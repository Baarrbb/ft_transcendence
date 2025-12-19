FROM node:lts-alpine

WORKDIR /app

COPY ./app/package.json ./app/package-lock.json /app/
COPY ./app/tsconfig.json /app/

RUN npm install

CMD ["npm", "run", "dev"]
