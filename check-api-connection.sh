#!/bin/bash

# Script kiểm tra kết nối API Gateway từ máy dev
# Chạy script này để verify Gateway có thể truy cập được không

echo "🔍 Kiểm tra kết nối API Gateway..."
echo ""

# Lấy IP của máy
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "📍 IP của máy dev: $IP"
echo ""

# Test kết nối đến Gateway
echo "1️⃣ Kiểm tra Gateway từ localhost..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/api/v1/auth/login || echo "❌ Không thể kết nối đến localhost:3000"
echo ""

echo "2️⃣ Kiểm tra Gateway từ IP $IP..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://$IP:3000/api/v1/auth/login || echo "❌ Không thể kết nối đến $IP:3000"
echo ""

echo "3️⃣ Test POST request đến login endpoint..."
RESPONSE=$(curl -s -X POST http://$IP:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}')

echo "Response: $RESPONSE"
echo ""

# Kiểm tra CORS headers
echo "4️⃣ Kiểm tra CORS headers..."
curl -s -I -X OPTIONS http://$IP:3000/api/v1/auth/login \
  -H "Origin: exp://192.168.1.14:8081" \
  -H "Access-Control-Request-Method: POST" | grep -i "access-control" || echo "⚠️ Không thấy CORS headers"
echo ""

echo "✅ Kiểm tra hoàn tất!"
echo ""
echo "📝 Lưu ý:"
echo "   - Nếu HTTP Status là 401/404 → Gateway đang chạy ✅"
echo "   - Nếu HTTP Status là 000 → Gateway không thể truy cập ❌"
echo "   - Đảm bảo Docker containers đang chạy: docker ps | grep api-gateway"

