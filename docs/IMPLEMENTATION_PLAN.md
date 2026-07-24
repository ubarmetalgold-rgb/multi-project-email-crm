# Kế hoạch triển khai: MultiProject Email CRM

## 1. Phân tích yêu cầu và Các giả định
- **Phân tích yêu cầu**: Xây dựng hệ thống CRM quản lý tập trung 10.000+ liên hệ, phân loại theo nhiều dự án/thương hiệu. Cung cấp các công cụ import, chuẩn hóa email, quản lý consent, thiết kế email (kéo-thả) và chạy chiến dịch qua nhiều nhà cung cấp email khác nhau.
- **Giả định**:
  - Dữ liệu khách hàng từ nhiều nguồn cần được chuẩn hóa triệt để.
  - Quản lý quota là bắt buộc và phải có cơ chế cấu hình linh hoạt không hard-code.
  - Hệ thống chạy ban đầu trên Vercel và Supabase, cần tối ưu chi phí (serverless).
  - Provider email (Brevo, Mailjet, v.v.) cung cấp HTTP API đầy đủ.

## 2. Kiến trúc tổng thể
Hệ thống tuân thủ kiến trúc Serverless, phân tách rõ ràng trách nhiệm giữa Frontend và Backend.
- **Frontend**: Next.js App Router trên Vercel.
- **Backend/Database**: Supabase PostgreSQL, Supabase Auth.
- **Background Jobs**: Supabase Queues (pgmq), Cron (pg_cron), Edge Functions.
- **Storage**: Supabase Storage.

## 3. Trách nhiệm của Vercel
- Render giao diện người dùng (Dashboard, Campaign Wizard, Email Builder, Import Wizard).
- Chạy Server Components và Server Actions cho các thao tác CRUD nhẹ.
- Xử lý xác thực session phía server (cookie-based `@supabase/ssr`).
- Tạo signed upload URL cho Supabase Storage.
- Tạo job và đưa message vào queue (không tự chạy lặp gửi hàng ngàn email trong Route Handlers).

## 4. Trách nhiệm của Supabase
- **Auth**: Quản lý tài khoản, phiên đăng nhập.
- **Database**: Phân tách dữ liệu (Multi-tenant) qua RLS nghiêm ngặt.
- **Storage**: Lưu trữ file import (private), assets của campaign.
- **Realtime**: Cập nhật tiến độ import và gửi email lên UI.
- **Queues/Cron/Edge Functions**:
  - Worker xử lý gửi email theo batch và tự quản lý quota.
  - Xử lý import dữ liệu chạy ngầm, chia chunk.
  - Nhận và map webhook từ provider.
  - Xử lý tracking (open, click) và logic unsubscribe.

## 5. Sơ đồ các module
- **Auth & Tenant**: Quản lý Organization, Project, User Roles (Owner, Admin, Marketing Manager, Editor, Viewer).
- **Contact Management**: Khách hàng, Memberships (multi-project), Tags, Lists, Segments (dynamic), Consent Ledger.
- **Campaign & Template**: Visual Email Editor (GrapesJS + MJML), Template metadata, Campaign configuration, Preflight check.
- **Email Delivery**: Provider Adapters (Brevo, Mailjet), Quota manager, Recipient Queueing, Webhooks, Suppression list (Bounce/Complaint/Unsub).

## 6. Thiết kế Database & RLS
- **Database**: Cấu trúc bảng tuân thủ chuẩn 3NF sử dụng UUID làm Primary Key, Soft delete và Foreign Keys đầy đủ. 
- **RLS**: 
  - Mọi bảng tenant có `organization_id` hoặc `project_id`.
  - Các helper function (`is_project_member`, `has_project_role`) sử dụng để check quyền truy cập.
  - Service-role key chỉ sử dụng trong worker ngầm, không xuất hiện trên frontend.

## 7. Thiết kế Storage, Queue, Cron, Edge Functions
- **Storage**: Các bucket: `crm-imports` (private), `crm-import-errors` (private), `crm-assets`, `email-template-assets`, `project-brand-assets`.
- **Queue**: Áp dụng ext `pgmq` với các hàng đợi `email-send`, `contact-import`, `email-events`.
- **Cron**: Sử dụng `pg_cron` để kích hoạt Edge Functions định kỳ đọc Queue, hoặc reconcile giới hạn quota, đồng bộ status.
- **Edge Functions**: Các function chuyên biệt, cô lập như `process-email-queue`, `process-import-queue`, `email-provider-webhook`, `unsubscribe`, `track-open`, `track-click`, `provider-health-check`.

## 8. Luồng hệ thống chính
- **Luồng import khách hàng**: Upload file -> Storage -> Ghi job vào `import_jobs` -> Push message lên queue -> `process-import-queue` xử lý theo chunk -> Ghi kết quả DB -> Thông báo Realtime UI.
- **Luồng tạo và gửi campaign**: Soạn thảo Draft -> Preflight check -> Approve -> Tính recipient (loại suppression/unsub) -> Snapshot `campaign_recipients` -> Đưa vào `email-send` queue.
- **Luồng worker gửi email**: Cron gọi `process-email-queue` -> Fetch batch -> Check quota/consent -> Build personalized HTML -> HTTP API -> Lưu `provider_message_id`.
- **Luồng webhook**: Provider post tới `email-provider-webhook` -> Xác thực signature -> Map event -> Cập nhật trạng thái `email_events` và `campaign_recipients` -> Cập nhật Suppression nếu bị Bounce.
- **Luồng unsubscribe/tracking**: Click link chứa token mã hóa -> Endpoint Edge Function không cần login xác thực token -> Redirect/Render result -> Ghi Consent event.

## 9. Các chiến lược cốt lõi
- **Chiến lược retry**: Exponential backoff với jitter cho lỗi tạm thời; không retry lỗi vĩnh viễn; có cơ chế dead-letter.
- **Chiến lược idempotency**: Dùng composite key (ví dụ `campaign_id` + `recipient_id` + `provider_id`) để không bao giờ gửi trùng email dù worker restart.
- **Quản lý quota**: Không hard-code giới hạn. Có reserved quota, lưu usage hàng ngày/tháng, tự động tính toán batch size và pause campaign khi hết quota.

## 10. Bảo mật dữ liệu
- API keys, credentials mã hóa AES-GCM, lưu an toàn.
- Ký cryptographic URL (HMAC) cho unsubscribe/tracking.
- Sanitization HTML/URL từ email builder chống XSS và Injection.

## 11. Kiểm thử, Triển khai, Monitoring
- **Kiểm thử**: Unit test (validation, dedupe, normalization), Database/RLS test, E2E test qua Playwright.
- **Triển khai**: Frontend Vercel; Backend Supabase Hosted. CLI cho DB migrations.
- **Monitoring**: Dựa trên Supabase dashboard log, và dashboard nội bộ của admin theo dõi Queue depth, Error rate, Delivery rate.

## 12. Rủi ro kỹ thuật & Tiêu chí nghiệm thu
- **Rủi ro**: 
  - Quota vượt mức do race condition ở worker.
  - CSV format lỗi làm crash worker import. 
- **Nghiệm thu**: Vận hành trơn tru với 100.000 contacts, import 10.000 dòng file nhanh chóng, phân tách bảo mật giữa các project tuyệt đối, RLS policy không bị leak data chéo tenant.
