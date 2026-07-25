# Stage 1 — build frontend
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* yarn.lock* ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2 — serve with nginx
FROM nginx:stable-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

RUN cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
  listen 80;
  server_name localhost;

  root /usr/share/nginx/html;
  index index.html;

  location /api/ {
    proxy_pass http://backend:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
