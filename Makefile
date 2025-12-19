

COMPOSE=docker-compose.yml


all: down build up

build:
	docker compose -f ${COMPOSE} build

down:
	docker compose -f ${COMPOSE} down

up:
	docker compose -f ${COMPOSE} up -d



clean-vol:
	docker volume ls -q | xargs docker volume rm 2> /dev/null || true

clean-img:
	docker images -qa | xargs docker rmi -f 2> /dev/null || true
