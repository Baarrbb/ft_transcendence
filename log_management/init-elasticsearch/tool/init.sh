#!/bin/sh

set -e

ELASTIC_HOST=${ELASTIC_HOST}
ELASTIC_USER=${ELASTIC_USER}
ELASTIC_PASSWORD=${ELASTIC_PASSWORD}

KIBANA_VIEWER=${ELASTIC_KIBANA_VIEWER}
KIBANA_VIEWER_PASSWORD=${ELASTIC_KIBANA_VIEWER_PASSWORD}
KIBANA_VIEWER_ROLE=${ELASTIC_KIBANA_VIEWER_ROLE}

KIBANA_ADMIN=${ELASTIC_KIBANA_ADMIN}
KIBANA_ADMIN_PASSWORD=${ELASTIC_KIBANA_ADMIN_PASSWORD}
KIBANA_ADMIN_ROLE=${ELASTIC_KIBANA_ADMIN_ROLE}

LOGSTASH_WRITER=${ELASTIC_LOGSTASH_WRITER}
LOGSTASH_WRITER_PASSWORD=${ELASTIC_LOGSTASH_WRITER_PASSWORD}
LOGSTASH_WRITER_ROLE=${ELASTIC_LOGSTASH_ROLE}

KIBANA_SYSTEM=${ELASTIC_KIBANA_SYSTEM}
KIBANA_SYSTEM_PASSWORD=${ELASTIC_KIBANA_SYSTEM_PASSWORD}

LOGSTASH_SYSTEM=${ELASTIC_LOGSTASH_SYSTEM}
LOGSTASH_SYSTEM_PASSWORD=${ELASTIC_LOGSTASH_SYSTEM_PASSWORD}


# attendre demarrage de elasticsearch # utiliser _security/_authenticate ?

until curl -s -u $ELASTIC_USER:$ELASTIC_PASSWORD -f $ELASTIC_HOST > /dev/null; do
	echo "Elasticsearch not accessible yet, sleeping 5s..."
	sleep 5
done

# until curl -s -u $ELASTIC_USER:$ELASTIC_PASSWORD -f $ELASTIC_HOST/_cluster/health?pretty | grep '"status" : "green"' > /dev/null 2>&1; do
until curl -s -u $ELASTIC_USER:$ELASTIC_PASSWORD -f $ELASTIC_HOST/_security/_authenticate > /dev/null; do
	echo "Elasticsearch not ready yet, sleeping 5s..."
	sleep 5
done

echo "Elasticsearch ready"

# check si user deja si oui on zappe l'etape ?
# inutile pcq renvoie tjr 200 meme si existe deja
# if curl -s -u $ELASTIC_USER:$ELASTIC_PASSWORD \
#   $ELASTIC_HOST/_security/user/$KIBANA_VIEWER | grep -q "$KIBANA_VIEWER"; then
#   echo "User $KIBANA_VIEWER already exists"
# else
#   # create user
# fi

# tls active ajoute dans tous les curl : --cacert /ca.crt

# on cree les users dont on a besoin

curl -s -X POST -u $ELASTIC_USER:$ELASTIC_PASSWORD \
	-H "Content-Type: application/json" \
	-d '{
		"description": "Only see dashboard",
		"cluster": ["monitor"],
		"indices": [
		  {
			"names": ["logs-*", ".kibana*"],
			"privileges": ["read", "view_index_metadata"]
		  }],
		"applications": [
		  {
			"application": "kibana-*",
			"privileges": ["read"],
			"resources": ["*"]
		  }]
	}' \
	$ELASTIC_HOST/_security/role/$KIBANA_VIEWER_ROLE

echo "role kibana viewer"

curl -s -X POST -u $ELASTIC_USER:$ELASTIC_PASSWORD \
	-H "Content-Type: application/json" \
	-d "{
		\"password\": \"$KIBANA_VIEWER_PASSWORD\",
		\"roles\": [\"$KIBANA_VIEWER_ROLE\"]
	}" \
	$ELASTIC_HOST/_security/user/$KIBANA_VIEWER

echo "user kibana viewer created"


curl -s -X POST -u $ELASTIC_USER:$ELASTIC_PASSWORD \
	-H "Content-Type: application/json" \
	-d '{
		"description": "Manage dashboard",
		"cluster": ["monitor", "manage"],
		"indices": [
		  {
			"names": ["logs-*", ".kibana*"],
			"privileges": ["all"]
		  }],
		"applications": [
		  {
			"application": "kibana-*",
			"privileges": ["all"],
			"resources": ["*"]
		  }]
	}' \
	$ELASTIC_HOST/_security/role/$KIBANA_ADMIN_ROLE

echo "role kibana manage"

curl -s -X POST -u $ELASTIC_USER:$ELASTIC_PASSWORD \
	-H "Content-Type: application/json" \
	-d "{
		\"password\": \"$KIBANA_ADMIN_PASSWORD\",
		\"roles\": [\"$KIBANA_ADMIN_ROLE\"]
	}" \
	$ELASTIC_HOST/_security/user/$KIBANA_ADMIN

echo "user kibana manage created"


# creer role pour logstash writer
curl -s -X POST -u $ELASTIC_USER:$ELASTIC_PASSWORD \
	-H "Content-Type: application/json" \
	-d '{
		"description": "Write in the pipeline",
		"cluster": ["monitor", "manage_index_templates"],
		"indices": [
		  {
			"names": ["logs-*"],
			"privileges": ["create_index", "write", "create", "auto_configure"]
		  }]
	}' \
	$ELASTIC_HOST/_security/role/$LOGSTASH_WRITER_ROLE

echo "role logstash writer created"

# logstash writer
curl -s -X POST -u $ELASTIC_USER:$ELASTIC_PASSWORD \
	-H "Content-Type: application/json" \
	-d "{
		\"password\": \"$LOGSTASH_WRITER_PASSWORD\",
		\"roles\": [\"$LOGSTASH_WRITER_ROLE\"]
	}" \
	$ELASTIC_HOST/_security/user/$LOGSTASH_WRITER

echo "user logstash writer created"

# generer mdp pour user system existant
curl -s -X POST -u $ELASTIC_USER:$ELASTIC_PASSWORD \
	-H "Content-Type: application/json" \
	-d "{
		\"password\": \"$KIBANA_SYSTEM_PASSWORD\"
	}" \
	$ELASTIC_HOST/_security/user/$KIBANA_SYSTEM/_password

curl -s -X POST -u $ELASTIC_USER:$ELASTIC_PASSWORD \
	-H "Content-Type: application/json" \
	-d "{
		\"password\": \"$LOGSTASH_SYSTEM_PASSWORD\"
	}" \
	$ELASTIC_HOST/_security/user/$LOGSTASH_SYSTEM/_password


echo "Users ready"
