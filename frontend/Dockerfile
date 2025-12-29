# Stage 1: Build
FROM node:18-alpine as build

WORKDIR /app

COPY package.json yarn.lock ./

# Usar yarn em vez de npm
RUN yarn install --frozen-lockfile

COPY . .

# Build com yarn
RUN yarn build

# Stage 2: Serve
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
