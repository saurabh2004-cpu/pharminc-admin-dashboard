FROM node:alpine

WORKDIR /app

COPY package*.json .

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

RUN npm install -g serve


EXPOSE 5173

CMD ["serve", "-l", "5173", "-s", "build"]
