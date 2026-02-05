FROM alpine:latest

RUN apk add --no-cache openssl 

RUN mkdir -p /certs

RUN openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout /certs/ca.key \
  -out /certs/ca.crt \
  -subj "/CN=elastic-ca"

RUN openssl genrsa -out /certs/elastic.key 2048

RUN openssl req -new -key /certs/elastic.key \
  -out /certs/elastic.csr \
  -subj "/CN=elasticsearch"

RUN openssl x509 -req \
  -in /certs/elastic.csr \
  -CA /certs/ca.crt \
  -CAkey /certs/ca.key \
  -CAcreateserial \
  -out /certs/elastic.crt \
  -days 365 \
  -sha256

RUN rm /certs/*.csr /certs/*.srl

RUN chown -R 1000:0 /certs && \
    chmod 644 /certs/*.crt && \
    chmod 640 /certs/*.key
