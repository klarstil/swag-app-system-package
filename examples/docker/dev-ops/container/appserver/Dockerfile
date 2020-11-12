FROM node:14.5-alpine

ARG GROUPID
ARG USERID

RUN addgroup -S -g ${GROUPID} appuser || true
RUN adduser -S -u ${USER_ID} -G ${GROUPID} appuser || true

WORKDIR /app

CMD npm run watch