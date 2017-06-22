FROM node
MAINTAINER Kaleb Lape

RUN apt-get update
RUN apt-get install -y --no-install-recommends bsdtar locales
RUN export tar='bsdtar'

RUN npm install -g mup pkg

RUN locale-gen en_US.UTF-8
RUN localedef -i en_GB -f UTF-8 en_US.UTF-8
ENV LC_ALL en_US.UTF-8

RUN mkdir -p /meteor
WORKDIR /meteor

RUN curl https://install.meteor.com | /bin/sh

ENV METEOR_ALLOW_SUPERUSER true

EXPOSE 3000

CMD ["/usr/local/bin/meteor"]
