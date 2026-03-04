FROM node:alpine

WORKDIR /app

COPY package*.json .

RUN npm install --legacy-peer-deps

COPY . .
ARG VITE_BASE_BACKEND_URL
ENV VITE_BASE_BACKEND_URL=$VITE_BASE_BACKEND_URL

RUN npm run build 

RUN npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:5173"]
