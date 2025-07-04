# Sử dụng Node.js phiên bản 20 làm hình ảnh cơ sở
FROM node:20-alpine

# Đặt thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt các phụ thuộc của ứng dụng
RUN npm install

# Sao chép mã nguồn của ứng dụng vào container
COPY . .

# Biên dịch ứng dụng NestJS
RUN npm run build

# Mở cổng 3000 để ứng dụng có thể truy cập
EXPOSE 3000

# Lệnh để chạy ứng dụng trong môi trường sản xuất
CMD ["node", "dist/main.js"]
