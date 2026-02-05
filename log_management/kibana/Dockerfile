
ARG ELK_VERSION
FROM kibana:${ELK_VERSION}

COPY ./tool/init.sh /usr/local/bin/init.sh

ENTRYPOINT ["/usr/local/bin/init.sh"]
