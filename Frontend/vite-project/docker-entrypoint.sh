#!/bin/sh
# Inject runtime config into nginx.conf
set -eu
: "${API_PROXY_PASS:=http://backend:8000/api}"
export API_PROXY_PASS
envsubst '${API_PROXY_PASS}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
