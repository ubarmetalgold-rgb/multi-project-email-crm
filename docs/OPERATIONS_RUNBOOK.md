# Sổ tay Vận hành (Operations Runbook)

## Kiểm tra sức khỏe hệ thống
- **Supabase Dashboard > Edge Functions**: Theo dõi số lượng lời gọi hàm `process-email-queue`. Nếu có nhiều lỗi 4xx/5xx, kiểm tra log chi tiết.
- **Supabase Dashboard > Database > pg_stat_statements**: Kiểm tra có query nào chạy quá lâu (gây chậm dashboard).

## Xử lý sự cố (Troubleshooting)
1. **Email không gửi được**:
   - Kiểm tra trạng thái Campaign trên giao diện.
   - Nếu kẹt ở trạng thái "Queued", xem lại Edge Function có bị dừng hay crash không.
   - Kiểm tra số lượng tin nhắn trong queue `email-send` (`SELECT * FROM pgmq.q_email_send`).
2. **Lỗi Import File**:
   - File bị lỗi báo Status: Failed. Tải về file `import_job_errors.csv` ở bucket `crm-import-errors` để xem dòng nào bị lỗi cấu trúc hoặc thiếu email.
3. **Webhook không cập nhật báo cáo**:
   - Provider thay đổi format? Xem log Edge Function `email-provider-webhook`.
   - Secret key của Webhook bị sai/hết hạn? Update lại Secret trên CRM và Provider.
