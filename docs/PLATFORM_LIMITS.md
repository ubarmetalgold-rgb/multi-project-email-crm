# Giới hạn Nền tảng (Platform Limits)

*Ngày kiểm tra: 24/07/2026*

Tài liệu này ghi nhận các giới hạn chính thức từ Vercel và Supabase ảnh hưởng đến kiến trúc của hệ thống MultiProject Email CRM, cũng như cách thiết kế để tuân thủ các giới hạn này.

## 1. Giới hạn của Supabase

### Edge Functions
* **Thời gian tính toán (CPU Time):** Tối đa 200 milliseconds CPU time chủ động cho mỗi request.
* **Thời gian thực thi tối đa (Wall Clock Duration):** 400 giây (có thể bị giới hạn thấp hơn tùy cấu hình mạng).
* **Bộ nhớ (Memory):** 256 MB RAM.
* **Rate Limits:** Gọi quá nhiều hàm trong khoảng thời gian ngắn có thể gây lỗi `EF009: Rate Limit Exceeded`.

**Ảnh hưởng & Giải pháp:**
* Không thể gửi toàn bộ 10.000 email trong một Edge Function invocation duy nhất vì sẽ vượt quá CPU time và thời gian thực thi.
* Phải chia nhỏ chiến dịch (campaign) thành từng batch (chunk) và dùng Supabase Queues + pg_cron.
* Việc xử lý import CSV cũng cần phải xử lý theo từng chunk nhỏ hoặc stream cẩn thận không để tràn RAM (256 MB).
* Cần cơ chế retry với exponential backoff khi gặp lỗi rate limit.

### PostgreSQL Database
* **Kết nối (Connections):** Kết nối trực tiếp thường là 500. Nên sử dụng Supavisor pooler cho các Serverless API có thể lên đến 12,000 kết nối.
* **Kích thước lưu trữ (Free Plan):** 500 MB (khi đạt giới hạn này, DB sẽ chuyển sang chế độ Read-Only).
* **Cron Jobs:** `pg_cron` xử lý lập lịch nhưng nên tránh tạo quá nhiều job. Ưu tiên một vài job dùng chung (worker) thay vì mỗi chiến dịch một job.

### Authentication
* **Rate Limit:** Endpoint API Auth dùng thuật toán token bucket (thường là 30 requests theo IP).
* Các giới hạn về reset password, sign-ups.

**Ảnh hưởng & Giải pháp:**
* Mọi thao tác Auth cần phải batch khi cần thiết, nhưng với CRM hiện tại, chủ yếu user của chúng ta đăng nhập (Dashboard), không liên quan đến người nhận email (Recipient). Unsubscribe link không sử dụng Supabase Auth mà sử dụng signed token để tránh limit của Supabase Auth.

## 2. Giới hạn của Vercel

### Serverless Functions
* **Thời gian thực thi (Execution Timeout):** 
  * Hobby Plan: 10 giây (max 60s).
  * Pro Plan: Tối đa 300 giây (5 phút).
* **Bộ nhớ:** Tối đa 1024 MB (Hobby), 3008 MB (Pro).
* **Payload Request/Response:** Giới hạn 4.5 MB. Không gửi file lớn trực tiếp lên Server Actions.

**Ảnh hưởng & Giải pháp:**
* Việc import file CSV/XLSX: Không thể gửi thẳng file lớn qua API của Vercel (vì dễ vượt 4.5 MB và timeout). Giải pháp: Vercel tạo Signed URL, sau đó client upload trực tiếp file lên Supabase Storage. Worker của Supabase sẽ đọc và xử lý dần.
* Gửi Email: Không thể giữ kết nối Vercel function trong quá trình gửi hàng nghìn email. Vercel chỉ nhận lệnh "Schedule" (đưa vào Database) và phản hồi ngay lập tức, việc gửi email sẽ nhường cho Supabase Queue/Edge Functions đảm nhiệm.

### Vercel Cron
* Hobby Plan: Chạy tối đa 1 lần/ngày, rất hạn chế để làm queue worker.
* Pro/Enterprise: Hỗ trợ linh hoạt hơn nhưng vẫn đắt và độ chính xác không cao so với DB Cron.

**Ảnh hưởng & Giải pháp:**
* Tuyệt đối không dùng Vercel Cron làm worker chính để gửi email.
* Chỉ sử dụng Supabase pg_cron để trigger Edge Functions hoặc Database Functions để lấy job trong Queue gửi email.

## 3. Khi nào cần nâng cấp Plan (Upgrade)

* **Supabase:** Khi file/data import đạt hoặc vượt mức 500MB, cần upgrade lên Pro (8$/tháng hoặc 25$/tháng) để có đủ lưu trữ và tăng compute size. Ngoài ra cần cân nhắc nâng cấp nếu tần suất gửi qua Edge Functions liên tục đạt đỉnh rate limit.
* **Vercel:** Khi số lượng request truy cập dashboard/marketing page tăng cao, hoặc khi triển khai production nghiêm túc, nên sử dụng gói Pro (20$/user) để không bị ngắt Serverless function sớm và giới hạn quota băng thông.
