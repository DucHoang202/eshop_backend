# Food & Home backend

Backend Express + Prisma cho API món ăn và đồ gia dụng. Cổng mặc định: `5002`.

Swagger UI: `https://webcuatoi.io.vn/api-docs` (hoặc `http://localhost:5002/api-docs` khi chạy local).

1. Kiểm tra API trên máy chủ hoặc từ máy khác:

   ```bash
   curl http://localhost:5002/api/health
   ```

   Kết quả thành công là `{"status":"ok"}`

## API sản phẩm

Các API nằm dưới `/api/products`; danh mục gồm `FOOD_FRESH`, `FOOD_PACKAGED`, `FOOD_BEVERAGE`, `HOME_KITCHEN`, `HOME_CLEANING`, `HOME_APPLIANCE`. Có danh sách/lọc, tìm kiếm, danh mục, chi tiết, tạo đơn lẻ, tạo hàng loạt, cập nhật, cập nhật tồn kho, bật/tắt và xóa. Xem request/response đầy đủ trong Swagger UI.

Auth hiện có `POST /api/auth/register` và `POST /api/auth/login`.
