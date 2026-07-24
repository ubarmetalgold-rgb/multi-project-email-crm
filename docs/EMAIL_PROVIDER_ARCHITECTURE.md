# Kiến trúc Tích hợp Email Provider

Hệ thống được thiết kế để không bị khóa chặt (vendor lock-in) vào bất kỳ một nhà cung cấp email (Email Provider) nào. Chúng ta sử dụng một lớp Adapter chung (Interface).

## 1. Provider Adapter Interface
Mọi nhà cung cấp (Brevo, Mailjet, Resend, Amazon SES) đều phải được wrap trong một class implement interface sau:

```typescript
interface EmailProviderAdapter {
  validateConfig(): Promise<ProviderValidationResult>;
  getQuota(): Promise<ProviderQuotaResult>;
  verifySender(): Promise<SenderVerificationResult>;
  sendEmail(input: SendEmailInput): Promise<SendEmailResult>;
  sendBatch?(input: SendBatchInput): Promise<SendBatchResult>;
  parseWebhook(request: Request): Promise<NormalizedEmailEvent[]>;
  verifyWebhook(request: Request): Promise<boolean>;
  classifyError(error: unknown): ProviderErrorClassification;
}
```

## 2. Quản lý Quota & Rate Limit
- Không hard-code hạn mức miễn phí. Admin phải tự nhập cấu hình Daily Quota, Monthly Quota và Per-minute Limit trong giao diện Settings của Provider.
- Worker gửi email (tại Edge Function) sẽ đọc cấu hình này. Hệ thống tính toán dựa trên số lượng email đã gửi thành công trong ngày.
- Nếu đạt Quota, worker sẽ tự động pause chiến dịch (dừng fetch thêm) và đợi đến ngày reset (Reset time / Timezone).

## 3. Webhook (Xử lý sự kiện trả về)
- Endpoint: `POST /api/webhooks/providers/:provider_id` (trên Edge Functions).
- Khi có sự kiện (Open, Click, Bounce, Complaint), Provider gọi webhook.
- Hệ thống gọi `verifyWebhook()` của Adapter tương ứng (thường sử dụng HMAC signature kiểm tra).
- Sau đó gọi `parseWebhook()` để chuẩn hóa cấu trúc dữ liệu về dạng `NormalizedEmailEvent` và insert vào bảng `email_events`.
- Update bảng `suppression_entries` ngay lập tức nếu sự kiện là Hard Bounce hoặc Complaint.

## 4. Bảo mật Secret
- API Keys của Provider sẽ được mã hóa (AES-GCM) ở tầng Application trước khi lưu vào PostgreSQL.
- Khóa giải mã (`PROVIDER_CREDENTIALS_ENCRYPTION_KEY`) chỉ nằm ở biến môi trường của Edge Function, đảm bảo dữ liệu trong Database bị lộ cũng không thể sử dụng để gửi email.
