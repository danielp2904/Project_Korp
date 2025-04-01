# Build da aplicação Angular
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Servindo os arquivos com Nginx
FROM nginx:alpine
COPY --from=build /app/dist/stock-app/ /usr/share/nginx/html/
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
