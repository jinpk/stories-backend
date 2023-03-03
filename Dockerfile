FROM node:16.19.0-alpine 

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml package-lock.json ./

RUN pnpm install 

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start:prod"]