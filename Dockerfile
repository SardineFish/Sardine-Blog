FROM debian:buster-slim
WORKDIR /app
COPY ./bin/sar-blog /app/sar-blog
COPY ./web-root /app/web-root
COPY ./config/config.json /app/config.json
EXPOSE 3000
CMD /app/sar-blog -c /app/config.json