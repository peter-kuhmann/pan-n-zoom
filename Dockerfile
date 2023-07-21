FROM node:20.3-alpine as builder
WORKDIR pannzoom
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM steebchen/nginx-spa:stable as runner
COPY --from=builder pannzoom/dist/ /app
EXPOSE 80
CMD ["nginx"]