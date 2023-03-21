FROM 844548817563.dkr.ecr.us-east-1.amazonaws.com/stories-backend-nodejs:latest

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml package-lock.json ./

RUN pnpm install 

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start:prod"]
