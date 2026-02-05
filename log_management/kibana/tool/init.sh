#!/bin/bash

set -e

ES_URL=${ELASTICSEARCH_HOSTS}
ES_USER=${ELASTICSEARCH_USERNAME}
ES_PASSWORD=${ELASTICSEARCH_PASSWORD}

echo "Waiting for Elasticsearch to be ready for Kibana..."

until curl -s -u $ES_USER:$ES_PASSWORD -f $ES_URL > /dev/null; do
	echo "Elasticsearch not accessible yet, sleeping 5s..."
	sleep 5
done

until curl -s -u $ES_USER:$ES_PASSWORD -f $ES_URL/_security/_authenticate > /dev/null; do
	echo "Elasticsearch not ready yet, sleeping 5s..."
	sleep 5
done

echo "Elasticsearch ready"

echo "Elasticsearch ready! Starting Kibana..."
# Lancer Kibana en foreground
exec /usr/local/bin/kibana-docker
