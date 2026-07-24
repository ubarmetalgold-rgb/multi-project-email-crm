# Hướng dẫn cấu hình Email Provider

## 1. Cấu hình Brevo (Sendinblue)
1. Đăng ký tài khoản tại Brevo.
2. Vào **SMTP & API**, lấy API Key (v3).
3. Tại CRM: Vào phần Provider, Thêm Brevo, nhập API Key vừa copy.
4. Chọn **Verify Sender Domain**: Brevo sẽ cung cấp các bản ghi TXT để cấu hình SPF, DKIM vào DNS domain của bạn.
5. Setup Webhook tại Brevo trỏ về URL: `https://[YOUR_SUPABASE_PROJECT].supabase.co/functions/v1/email-provider-webhook?provider=brevo`

## 2. Cấu hình Mailjet
1. Đăng ký tài khoản Mailjet.
2. Lấy `API_KEY` và `SECRET_KEY`.
3. Nhập hai key này vào màn hình cấu hình Provider Mailjet trong CRM.
4. Thêm Sender Email hoặc Domain để được xác thực.
5. Tạo Webhook Event cho các hành động (Open, Click, Bounce, Spam) về endpoint của CRM.

## 3. Cấu hình Resend
1. Resend sử dụng Bearer Token.
2. Tạo API Key tại Resend Dashboard.
3. Nhập vào CRM. Xác minh Sender Domain bằng cách trỏ DNS.
4. Cấu hình Webhook Secret (CRM sẽ sinh ra và yêu cầu bạn nhập vào Resend, hoặc ngược lại) để đảm bảo bảo mật.
