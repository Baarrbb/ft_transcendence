FROM node:23

WORKDIR /app

EXPOSE 3001

COPY ./app/package.json ./app/package-lock.json /app/

RUN npm install


CMD ["npm", "run", "dev"]

