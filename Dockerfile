FROM debian:buster-slim
WORKDIR /app
RUN echo "deb http://mirrors.ustc.edu.cn/debian/ buster main contrib non-free \
    deb http://mirrors.ustc.edu.cn/debian/ buster-updates main contrib non-free \
    deb http://mirrors.ustc.edu.cn/debian/ buster-proposed-updates main non-free contrib \
    deb http://mirrors.ustc.edu.cn/debian/ buster-backports main non-free contrib \
    deb-src http://mirrors.ustc.edu.cn/debian/ buster-updates main contrib non-free \
    deb-src http://mirrors.ustc.edu.cn/debian/ buster main contrib non-free \
    deb-src http://mirrors.ustc.edu.cn/debian/ buster-proposed-updates main contrib non-free \
    deb-src http://mirrors.ustc.edu.cn/debian/ buster-backports main contrib non-free \
    deb http://mirrors.ustc.edu.cn/debian-security/ buster/updates main non-free contrib \
    deb-src http://mirrors.ustc.edu.cn/debian-security/ buster/updates main non-free contrib" \
    > /etc/apt/sources.list
RUN apt-get update
RUN apt-get install -y libssl-dev ca-certificates
COPY ./bin/sar-blog /app/sar-blog
COPY ./web-root /app/web-root
COPY ./config/config.json /app/config.json
RUN /app/sar-blog --test
EXPOSE 3000
CMD /app/sar-blog -c /app/config.json