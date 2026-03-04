FROM node:alpine

WORKDIR /app

COPY package*.json .

RUN npm install --legacy-peer-deps

RUN npm run build

RUN npm install -g serve

COPY . .

EXPOSE 5173

CMD ["serve", "-l", "5173", "-s", "build"]
