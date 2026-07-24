# Cẩm nang Bảo mật: MultiProject Email CRM

## 1. Xác thực (Authentication) & Phiên
- Sử dụng `@supabase/ssr` để quản lý session phía server bằng cookies httpOnly, chống lại tấn công XSS ăn cắp token từ `localStorage`.
- Mọi Server Actions và Route Handlers phải kiểm tra session người dùng trước khi truy xuất Data API.

## 2. Row Level Security (RLS)
- Mọi bảng đều bật RLS. RLS hoạt động như tuyến phòng thủ thứ hai sau lớp Application Logic.
- Nếu hacker có lấy được token của một Project Viewer, họ cũng không thể tự ý UPDATE bảng Campaigns nhờ vào Policy được đặt chặt chẽ ở cấp độ DB.

## 3. Quản lý Secret & Credentials
- **API Keys của Provider (Brevo, Mailjet)**: KHÔNG bao giờ lưu dạng plaintext.
- Được mã hóa bằng AES-GCM tại Edge Functions / Server Action.
- Chìa khóa mã hóa (Encryption Key) lưu trong Biến môi trường (`PROVIDER_CREDENTIALS_ENCRYPTION_KEY`) của server Vercel và Supabase Edge Functions. Không bao giờ tiết lộ ra frontend (`NEXT_PUBLIC_`).
- Cột lưu trữ là `encrypted_credentials`, giao diện chỉ hiển thị `****`.

## 4. Bảo vệ Webhook và Endpoints
- Các webhook do Provider gọi đến không có JWT của Supabase. Chúng được xác thực bằng HTTP Signature (chữ ký số) độc quyền của từng Provider để ngăn chặn giả mạo payload.
- Tracking Links (Mở, Click) và Unsubscribe Links sử dụng HMAC-SHA256 để ký URL.
- Edge function kiểm tra nếu token hết hạn, sai project_id, hoặc sai HMAC sẽ trả về 403 Forbidden. Cấm mọi Open Redirect (chỉ redirect đến các domain được cấu hình trong `projects`).

## 5. Chống Injection
- **SQL Injection**: Sử dụng PostgREST và parameterized query qua thư viện `@supabase/supabase-js`, không nối chuỗi SQL.
- **CSV Injection**: Khi export CSV ra cho người dùng, thêm các dấu `'` phía trước các giá trị bắt đầu bằng `=`, `+`, `-`, `@` để tránh thực thi công thức trên Excel.
- **XSS**: HTML sinh ra từ Email Builder được làm sạch (Sanitize) qua DOMPurify. Frontend Next.js cũng mặc định escape nội dung.

## 6. Storage Security
- Hình ảnh upload lên nằm ở private buckets ngoại trừ `crm-assets` (public nhưng cấm list files).
- Export/Import files được download qua Signed URL có hiệu lực ngắn (ví dụ 10 phút), ngăn chặn truy cập trái phép bằng link chia sẻ.
