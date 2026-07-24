# Supabase Queues & Cron Design

## 1. Công nghệ sử dụng
- **Supabase Queues (pgmq)**: Extension của PostgreSQL dành cho hàng đợi tin nhắn nhẹ, ACID-compliant, hoạt động mượt mà trong hệ sinh thái Supabase.
- **Supabase Cron (pg_cron)**: Extension lập lịch chạy các hàm định kỳ bên trong cơ sở dữ liệu.

## 2. Các Queues chính
1. `email-send`: Nhận các message chứa `campaign_recipient_id` cần gửi email.
2. `contact-import`: Nhận các chunk báo cáo dòng CSV/XLSX cần xử lý dedupe và lưu vào DB.
3. `email-events`: (Optional) Nhận dữ liệu webhook thô cần xử lý bất đồng bộ để tránh timeout từ webhook request của provider.

## 3. Worker (Supabase Edge Functions)
Các worker không chạy ngầm liên tục kiểu daemon (không hợp với serverless). Thay vào đó, chúng được kích hoạt định kỳ.

### 3.1. `process-email-queue`
- **Trigger**: Cron job (mỗi 1 phút) gọi qua HTTP.
- **Quy trình**:
  1. Pop batch (vd: 50 messages) từ `email-send` queue (Lock nguyên tử).
  2. Lấy thông tin Campaign & Provider Credentials.
  3. Kiểm tra Quota còn lại. Nếu hết, đánh dấu các messages về trạng thái "pending" và pause cron, hoặc requeue.
  4. Render email (thay thế biến {{first_name}}).
  5. Gọi HTTP API (Brevo/Mailjet) cho 50 liên hệ đó.
  6. Lưu `provider_message_id`.
  7. Xóa message khỏi queue. (Hoặc chuyển sang queue archive).
- **Idempotency**: Message có composite key. Khi worker crash giữa chừng, lần sau chạy nó kiểm tra DB xem `campaign_recipient` này đã có `provider_message_id` chưa. Nếu có, skip và xóa queue message.
- **Retry**: Nếu Provider API lỗi `429 Too Many Requests`, requeue message với `delay` (Exponential backoff). Lỗi `401 Unauthorized` -> Dừng toàn bộ Campaign và báo admin.

### 3.2. `process-import-queue`
- **Quy trình**: Đọc file chunk từ storage -> Validate email -> Dedupe theo Project -> Insert/Update Batch vào DB. Báo cáo Error vào bảng `import_job_errors`. Cập nhật trường `processed_count` của job qua Realtime.

## 4. Các Cron Job
Định nghĩa qua `cron.schedule`:
- **Every 1 min**: Gọi Edge Function `process-email-queue` nếu có tin nhắn.
- **Every 5 mins**: Gọi Edge Function `process-import-queue`.
- **Every 1 hour**: Chạy RPC `reconcile_campaign_status` (Chốt sổ các campaign đã hoàn thành hoặc thất bại).
- **Daily at Midnight**: Reset provider usage counters.

## 5. Security & Constraints
- Cron jobs sử dụng **Anon key/Service key + Secret header** để xác thực với Edge Functions. Không cho phép trình duyệt kích hoạt trực tiếp hàm worker này nếu không có Secret Header cấu hình sẵn.
