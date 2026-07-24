# MultiProject Email CRM

Dự án CRM Email Marketing đa dự án dựa trên kiến trúc Serverless với Next.js và Supabase.

## 🚀 Tính năng nổi bật
- Quản lý đa dự án (Multi-tenant).
- Tích hợp Supabase Auth và Row Level Security (RLS) chặt chẽ.
- Upload/Import Khách hàng từ CSV/XLSX.
- Kéo thả thiết kế Email qua GrapesJS & MJML.
- Xử lý gửi email qua Supabase Queues và Supabase Edge Functions.

## 💻 Hướng dẫn chạy Local (Phát triển)

### 1. Yêu cầu hệ thống
- Node.js >= 18
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker Desktop (Bắt buộc để chạy Supabase local)

### 2. Thiết lập dự án
```bash
# Cài đặt dependencies
npm install

# Sao chép biến môi trường
cp .env.example .env.local

# Khởi động Supabase local
npx supabase start
```

### 3. Khởi tạo Database (Migrations & Seed)
Khi chạy `supabase start`, các file migration trong `supabase/migrations` sẽ tự động được chạy. Để nạp dữ liệu mẫu (nếu có):
```bash
npx supabase db reset
```

### 4. Chạy ứng dụng Next.js
```bash
npm run dev
```
Truy cập: [http://localhost:3000](http://localhost:3000).

## ☁️ Hướng dẫn triển khai (Production)

### 1. Triển khai Database & Backend lên Supabase
1. Đăng ký tài khoản Supabase, tạo một project mới.
2. Link project local với Supabase:
   ```bash
   npx supabase link --project-ref your-project-id
   ```
3. Đẩy Migrations lên production:
   ```bash
   npx supabase db push
   ```
4. Đẩy (Deploy) Edge Functions:
   ```bash
   npx supabase functions deploy
   ```
5. Cấu hình biến môi trường cho Supabase (Supabase Vault / Secrets):
   ```bash
   npx supabase secrets set RESEND_API_KEY=your_key --project-ref your-project-id
   ```

### 2. Triển khai Frontend lên Vercel
1. Tạo project mới trên [Vercel](https://vercel.com/new).
2. Kết nối tới GitHub Repository của dự án này.
3. Thiết lập các Biến môi trường (Environment Variables) lấy từ `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PROVIDER_CREDENTIALS_ENCRYPTION_KEY`
4. Nhấn **Deploy**.

## 🛠 Cấu hình Email Provider
Dự án được thiết kế theo hướng Provider Agnostic (không phụ thuộc vào 1 nhà cung cấp).
Trong môi trường production, bạn cần:
1. Đăng ký tài khoản Resend, Brevo hoặc Mailjet.
2. Lấy API Key và lưu vào Cài đặt Dự án (Project Settings) trên giao diện CRM (Hệ thống sẽ tự mã hóa AES-GCM và lưu vào database).
3. Đảm bảo cấu hình đúng **Webhook URL** trên Dashboard của Provider trỏ về URL Edge Function của bạn: `https://<your-project>.supabase.co/functions/v1/email-provider-webhook`.
