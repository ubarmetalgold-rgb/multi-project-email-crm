# Hướng dẫn Triển khai Vercel & Supabase

## 1. Chuẩn bị Supabase
1. Đăng nhập Supabase, tạo Project mới. Chọn region gần người dùng nhất (ví dụ: Singapore).
2. Tải và cài đặt Supabase CLI.
3. Link project: `supabase link --project-ref [YOUR_PROJECT_REF]`
4. Chạy migration: `supabase db push`
5. Khởi tạo dữ liệu mẫu (tuỳ chọn): Chạy file `supabase/seed.sql`.
6. Triển khai Edge Functions: `supabase functions deploy`
7. Thiết lập biến môi trường (Secrets) cho Edge Function: 
   `supabase secrets set PROVIDER_CREDENTIALS_ENCRYPTION_KEY=my_secret_key`
8. Bật pgmq và pg_cron (nếu chưa bật) bằng SQL script hoặc Supabase Dashboard.

## 2. Chuẩn bị Vercel
1. Fork hoặc clone repository này, tạo Project trên Vercel.
2. Tại màn hình cấu hình, thiết lập các biến môi trường:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PROVIDER_CREDENTIALS_ENCRYPTION_KEY`
3. Click "Deploy".
4. Sau khi Vercel deploy thành công, truy cập URL được cấp để kiểm tra.

## 3. Kiểm tra (Health Check)
- Đăng nhập bằng Auth.
- Thử tạo 1 project và import file CSV 10 dòng.
- Theo dõi log của Edge Functions trong Supabase Dashboard để đảm bảo worker import hoạt động.
