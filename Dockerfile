FROM debian:buster-slim
WORKDIR /app
COPY ./bin/sar-blog /app/sar-blog
COPY ./web-root /app/web-root
COPY ./config/config.json /app/config.json
COPY ./bin/data_migration /app/data_migration
COPY ./config/config-migration.json /app/config-migration.json
EXPOSE 3000
CMD /app/sar-blog -c config.json