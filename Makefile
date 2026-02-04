

COMPOSE_DEV=docker-compose.dev.yml
COMPOSE_PROD=docker-compose.prod.yml


all: down build up


dev: down-dev build-dev up-dev

build-dev:
	docker compose -f ${COMPOSE_DEV}  build

down-dev:
	docker compose -f ${COMPOSE_DEV} down

up-dev:
	docker compose -f ${COMPOSE_DEV} up -d


prod: down build up

build:
	docker compose -f ${COMPOSE_PROD} build

down:
	docker compose -f ${COMPOSE_PROD} down

up:
	docker compose -f ${COMPOSE_PROD} up -d



clean-vol:
	docker volume ls -q | xargs docker volume rm 2> /dev/null || true

clean-img:
	docker images -qa | xargs docker rmi -f 2> /dev/null || true
