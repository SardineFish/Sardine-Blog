FROM debian:buster-slim
WORKDIR /app
COPY ./bin/sar-blog /app/sar-blog
EXPOSE 3000
CMD /app/sar-blog -c config.json