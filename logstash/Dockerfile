FROM docker.elastic.co/logstash/logstash:8.17.0

COPY postgresql-42.7.4.jar /usr/share/logstash/logstash-core/lib/jars/

RUN rm -f /usr/share/logstash/pipeline/logstash.conf
COPY pipeline/ /usr/share/logstash/pipeline/