FROM node:12 as builder
COPY . /code
WORKDIR /code
RUN ls -lhta
RUN npm install
RUN npm run build

FROM nginx:stable
COPY --from=builder /code/build /usr/share/nginx/html
