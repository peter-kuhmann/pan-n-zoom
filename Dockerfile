FROM node:20.3-alpine as builder
WORKDIR pannzoom
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Based on https://github.com/steebchen/nginx-spa/tree/stable
FROM nginx:stable-alpine
RUN sed -i '1idaemon off;' /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder pannzoom/dist/ /app
EXPOSE 80
CMD ["nginx"]