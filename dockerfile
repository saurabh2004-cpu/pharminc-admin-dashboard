# FROM node:alpine

# WORKDIR /app

# COPY package*.json .

# RUN npm install --legacy-peer-deps

# COPY . .
# ARG VITE_BASE_BACKEND_URL
# ENV VITE_BASE_BACKEND_URL=$VITE_BASE_BACKEND_URL

# RUN npm run build 

# RUN npm install -g serve

# EXPOSE 5173

# CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:5173"]


# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ARG VITE_BASE_BACKEND_URL
ENV VITE_BASE_BACKEND_URL=$VITE_BASE_BACKEND_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm -rf /usr/share/nginx/html/*

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]