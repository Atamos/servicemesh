FROM kong:alpine 

WORKDIR /usr/kong/

USER root
RUN apk update && apk add git unzip luarocks gcc libc-dev g++ util-linux
RUN luarocks install kong-oidc

# Install OPA plugin
RUN git clone https://github.com/open-policy-agent/contrib &&\
  mv contrib/kong_api_authz /usr/kong/opa/ &&\
  rm -rf contrib

WORKDIR /usr/kong/opa

# switch to root to install rocks in /usr/local 
USER root

# build and install the plugin
RUN luarocks install lua-cjson  CC=gcc
RUN luarocks  install  lua-resty-jwt
RUN luarocks make

RUN cd .. &&\
  git clone https://github.com/curityio/kong-phantom-token-plugin &&\
  mv kong-phantom-token-plugin/plugin  /usr/local/share/lua/5.1/kong/plugins/phantom-token

# back to kong user
USER kong