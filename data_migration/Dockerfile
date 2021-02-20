FROM debian:buster-slim
WORKDIR /app
RUN apt-get update
RUN apt-get install -y libssl-dev
COPY ./target/debug/data_migration /app/data_migration
COPY ./config/config.json /app/config.json
CMD /app/data_migration /app/config.json