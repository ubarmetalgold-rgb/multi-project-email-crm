# Chiến lược Mở rộng (Scaling)

## Mục tiêu
Hệ thống phải hoạt động mượt mà với 100.000 contact, campaign 100.000 recipients và tải file CSV >10MB mà không bị sập Vercel hoặc Timeout Database.

## 1. Mở rộng Database (PostgreSQL)
- **Index thông minh**: Mọi truy vấn đọc bảng `contacts`, lọc Segment, tìm kiếm Recipient đang rảnh, phải chạm vào Index.
- **Keyset Pagination**: Khi bảng có quá nhiều contacts, việc dùng `LIMIT / OFFSET` sẽ rất chậm. Nếu phù hợp, chuyển sang Keyset pagination (Cursor-based) ở API tải danh sách Khách hàng.
- **Không đếm (Count) liên tục**: Tính tổng số lượng danh sách Segment theo thời gian thực có thể tốn tài nguyên. Dùng logic "Estimate Count" hoặc aggregate tables cập nhật bằng trigger/cron khi số lượng quá lớn.

## 2. Serverless Workers (Edge Functions)
- **Timeouts**: Supabase Edge Function (Deno) bị giới hạn thời gian chạy (thường 2-5 phút).
- **Chia Batch nhỏ (Batching)**: Dù có 100,000 email cần gửi, Worker chỉ xử lý 50-100 emails / lần chạy. Worker xử lý xong sẽ hoàn tất HTTP request nhanh chóng, nhường chỗ cho Cron kích hoạt Worker tiếp theo, hoặc tự gọi lại chính nó qua Edge Function Invoke (Async).
- **Concurrency (Đồng thời)**: Không nên để 10 worker cùng chạy vào một Campaign nếu khóa (lock) chưa chuẩn xác, dễ dẫn đến gửi đúp email. Sử dụng `SELECT ... FOR UPDATE SKIP LOCKED` trong PostgreSQL để đảm bảo mỗi worker lấy ra một tập recipient riêng biệt độc quyền.

## 3. Mở rộng Import/Export (Queue & Chunking)
- Không dùng Vercel Route Handlers (max 10s - 60s timeout) để đọc và xử lý 100,000 dòng CSV.
- File CSV được upload thẳng lên Storage.
- Edge Function đọc file dưới dạng Stream, cắt thành các Chunk (vd 1000 dòng), rồi xử lý.
- Dùng `UPSERT` thay vì vòng lặp `INSERT` từng dòng.

## 4. Rate Limiting cho API ngoài
- API Email Provider luôn có giới hạn Request Per Second.
- Edge Function trước khi push HTTP cần check rate limit nội bộ (Dựa vào Redis hoặc Supabase Cache / Bảng DB).
- Nếu hit limit, áp dụng Exponential Backoff, worker "ngủ" hoặc đưa message lại Queue với delay.
