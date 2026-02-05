FROM curlimages/curl

COPY ./tool/init-dashboard.sh /init.sh
COPY ./dashboard/dashboard.ndjson /dashboard.ndjson

ENTRYPOINT ["/init.sh"]
