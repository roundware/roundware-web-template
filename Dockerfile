FROM node:12 as builder
ARG GOOGLE_MAPS_API_KEY
ENV GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_API_KEY

COPY . /code
WORKDIR /code
RUN ls -lhta
RUN npm install
RUN npm run build

FROM nginx:stable
COPY --from=builder /code/dist /usr/share/nginx/html
COPY roundware-nginx.conf /etc/nginx/conf.d/default.conf