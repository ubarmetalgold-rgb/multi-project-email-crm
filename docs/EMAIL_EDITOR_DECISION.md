# Quyết định chọn Email Editor

## 1. Yêu cầu
- Cho phép người dùng kéo thả thiết kế email (Drag and drop).
- Không yêu cầu kỹ năng code HTML.
- Hỗ trợ responsive, tương thích tốt với nhiều trình duyệt email (Gmail, Outlook, Yahoo).
- Cho phép lưu dưới dạng JSON (để chỉnh sửa lại) và HTML (để gửi).
- Có thể tích hợp dễ dàng vào Next.js (chạy client-side).
- Giấy phép phù hợp cho mục đích thương mại.

## 2. Các ứng cử viên
- **GrapesJS**: Rất mạnh mẽ, giấy phép MIT, dễ tùy biến. Tuy nhiên xuất HTML thuần không phải lúc nào cũng tương thích tốt với Email clients.
- **MJML**: Framework tối ưu nhất để tạo HTML cho email, nhưng bản thân nó chỉ là markup language, không có UI kéo thả sẵn.
- **GrapesJS MJML**: Plugin kết hợp sức mạnh kéo thả của GrapesJS và render HTML chuẩn của MJML. Giấy phép MIT.
- **React Email**: Rất tốt cho developer viết code React để ra email, nhưng không có sẵn UI builder kéo thả (visual editor) mạnh mẽ cho end-user.
- **Unlayer**: Builder cực kỳ đẹp và tốt, nhưng giấy phép thương mại (có bản free giới hạn chức năng và bị gắn logo).
- **EmailJS / Mosaico**: Các thư viện cũ hơn, khó tích hợp với React/Next.js.

## 3. Quyết định
Chọn **GrapesJS + Plugin GrapesJS MJML**.

### Lý do:
- **Giấy phép**: MIT, hoàn toàn miễn phí cho thương mại.
- **Tính năng**: 
  - Có giao diện kéo thả blocks có sẵn (Text, Image, 1-3 columns, Button).
  - Tích hợp xuất MJML code và HTML render. 
  - Khả năng quản lý trạng thái qua JSON (lưu vào database dễ dàng).
- **Khả năng tương thích Email**: HTML được sinh ra từ MJML đảm bảo tương thích với các trình duyệt khó tính như Outlook, Gmail.
- **Tích hợp Next.js**: GrapesJS chạy hoàn toàn trên client (Browser), phù hợp với việc bọc trong một Client Component của Next.js.
- **Bảo mật**: HTML render ra có thể sanitize thêm bằng DOMPurify ở phía server trước khi lưu hoặc gửi.

## 4. Rủi ro và hạn chế
- **Bundle size**: GrapesJS khá nặng. 
  - *Biện pháp*: Dùng `next/dynamic` để lazy load component editor này, không làm chậm trang Dashboard.
- **Độ phức tạp tùy biến**: Cần phải định nghĩa thêm các custom block (Hero, Social links, Unsubscribe footer) theo đúng chuẩn MJML.
