
FROM node:lts-alpine AS builder

WORKDIR /app

COPY frontend/app/package*.json ./

RUN npm ci

COPY frontend/app ./
COPY ./shared ./shared/

RUN npm run build


FROM nginx AS runtime

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/certs/privkey.key -out /etc/ssl/certs/cert.crt -subj "/C=/ST=/L=/O=/OU=/CN="

COPY nginx/conf/nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/dist /usr/share/nginx/html

# EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
