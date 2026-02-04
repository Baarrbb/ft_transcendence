FROM node:23

WORKDIR /app

EXPOSE 3001

COPY ./app/package.json ./app/package-lock.json /app/
# ./app/nodemon.json ./app/tsconfig.json 

# ENV NODE_ENV=development

RUN npm install


CMD ["npm", "run", "dev"]
# CMD ["npm", "run", "start"]
# CMD ["tail", "-f", "/dev/null"]

## POUR V PROD
# RUN npm install
# RUN npm build
# CMD npm start



# Si pb avec node_modules il faut supp le dossier en local
# commenter le vol du docker compose
# run le container avec tail -f
# dans le container npm install
# puis remodifier ci dessus comme avant



# RUN apk update && apk add sqlite

## au premier lancement si rien dans /app (ou juste src)
# RUN npm install fastify@latest
# RUN npm install @fastify/cors

