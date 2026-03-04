FROM node:alpine

WORKDIR /app

RUN npm install -g serve

COPY package*.json .

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build 

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "tcp://88.222.242.191:5173"]
