FROM debian:buster-slim
WORKDIR /app
RUN apt-get update
RUN apt-get install -y libssl-dev ca-certificates
COPY ./bin/sar-blog /app/sar-blog
COPY ./web-root /app/web-root
COPY ./config/config.json /app/config.json
EXPOSE 3000
CMD /app/sar-blog -c /app/config.json