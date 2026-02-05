#!/bin/sh

set -e

GF_USER_VIEWER=${GF_USER_VIEWER}
GF_USER_VIEWER_PASSWORD=${GF_USER_VIEWER_PASSWORD}
GF_USER_EDITOR=${GF_USER_EDITOR}
GF_USER_EDITOR_PASSWORD=${GF_USER_EDITOR_PASSWORD}
GRAFANA_HOST=${GRAFANA_HOST}
GF_ADMIN_USER=${GF_ADMIN_USER}
GF_ADMIN_PASSWORD=${GF_ADMIN_PASSWORD}

while ! curl -s $GRAFANA_HOST/api/health | grep -q '"database": "ok"'; do
	echo "Waiting grafana sleep 3"
	sleep 3
done

# create user viewer
USER_ID_VIEWER=$(curl -s -u $GF_ADMIN_USER:$GF_ADMIN_PASSWORD -X POST \
	-H "Content-Type: application/json" \
	-d "{
			\"email\": \"viewer@localhost\",
			\"login\": \"$GF_USER_VIEWER\",
			\"name\": \"Viewer42\",
			\"password\": \"$GF_USER_VIEWER_PASSWORD\"
		}
	" \
	$GRAFANA_HOST/api/admin/users | grep -o '"id":[0-9]*' | grep -o '[0-9]*')


# set user role viewer meme si normalement deja viewer par defaut
curl -s -u $GF_ADMIN_USER:$GF_ADMIN_PASSWORD -X PATCH \
	-H "Content-Type: application/json" \
	-d "{
			\"role\": \"Viewer\"
		}
	" \
	$GRAFANA_HOST/api/org/users/$USER_ID_VIEWER

# create user editor
USER_ID_EDITOR=$(curl -s -u $GF_ADMIN_USER:$GF_ADMIN_PASSWORD -X POST \
	-H "Content-Type: application/json" \
	-d "{
			\"email\": \"editor@localhost\",
			\"login\": \"$GF_USER_EDITOR\",
			\"name\": \"Editor42\",
			\"password\": \"$GF_USER_EDITOR_PASSWORD\"
		}
	" \
	$GRAFANA_HOST/api/admin/users | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

# set user role editor
curl -s -u $GF_ADMIN_USER:$GF_ADMIN_PASSWORD -X PATCH \
	-H "Content-Type: application/json" \
	-d "{
			\"role\": \"Editor\"
		}
	" \
	$GRAFANA_HOST/api/org/users/$USER_ID_EDITOR

