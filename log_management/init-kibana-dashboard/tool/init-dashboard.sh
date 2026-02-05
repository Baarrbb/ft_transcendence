#!/bin/sh

set -e

ELASTIC_USER=${ELASTIC_USER}
ELASTIC_PASSWORD=${ELASTIC_PASSWORD}
KIBANA_HOST=${KIBANA_HOST}

echo "Waiting Kibana"

# until curl -s http://kibana:5601/api/status | grep -q '"level":"available"'; do
# 	echo "Waiting Kibana sleep 3"
# 	sleep 3
# done

#essayer avec until

while ! curl -s $KIBANA_HOST/api/status | grep -q '"level":"available"'; do
	echo "Waiting Kibana sleep 3"
	sleep 3
done

echo "Kibana running"
curl -s -u $ELASTIC_USER:$ELASTIC_PASSWORD -X POST \
	-H "kbn-xsrf: true" \
	-F file=@/dashboard.ndjson \
	$KIBANA_HOST/api/saved_objects/_import?overwrite=true

echo "Dashboard imported"
