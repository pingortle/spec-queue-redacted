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

# Support for headless browser testing
RUN apt-get install -y --no-install-recommends xvfb xauth \
  x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable \
  xfonts-cyrillic x11-apps clang libdbus-1-dev libgtk2.0-dev \
  libnotify-dev libgnome-keyring-dev libgconf2-dev libasound2-dev \
  libcap-dev libcups2-dev libxtst-dev libxss1 libnss3-dev \
  gcc-multilib g++-multilib

ENV METEOR_ALLOW_SUPERUSER true

EXPOSE 3000

CMD ["/usr/local/bin/meteor"]
