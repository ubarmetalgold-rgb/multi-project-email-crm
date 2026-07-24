# UI/UX Specification: MultiProject Email CRM

## 1. Yêu cầu chung về Giao diện
- **Ngôn ngữ mặc định**: Tiếng Việt (chuẩn bị i18n cho Tiếng Anh).
- **Màu sắc & Thiết kế**: Responsive, tối giản, chuyên nghiệp, hỗ trợ Light/Dark mode.
- **Trạng thái**:
  - **Loading**: Sử dụng Skeleton loader cho dữ liệu bảng; Spinner cho nút hành động.
  - **Empty**: Empty state thân thiện (hình ảnh + text hướng dẫn + nút CTA thêm mới).
  - **Error/Success**: Sử dụng Toast notification ở góc màn hình. Error boundaries với fallback UI thay vì trắng trang.
- **Accessibility**: ARIA labels, Keyboard navigation (nhất là form và bảng), Focus trap cho Modal.

## 2. Layout và Navigation
- **Sidebar**: Chứa menu điều hướng chính, logo ứng dụng.
- **Top bar**: 
  - **Project Switcher**: (Lưu project gần nhất của người dùng).
  - Breadcrumbs.
  - User menu (Profile, Settings, Logout).
- **Mobile Behavior**: Sidebar có thể toggle (Hamburger menu).

## 3. Sitemap và Danh sách Màn hình
1. **Authentication**: `/login`, `/forgot-password`, `/reset-password`
2. **Onboarding**: `/onboarding` (Tạo Organization, Project đầu tiên).
3. **Dashboard**: `/` (Tổng quan contacts, campaigns, quota, thống kê delivery).
4. **Projects**: `/projects` (Danh sách), `/projects/settings` (Cấu hình brand, sender, tracking).
5. **Contacts**: 
   - `/contacts`: Bảng danh sách với phân trang server-side, search, filter.
   - `/contacts/[id]`: Chi tiết liên hệ, lịch sử consent, tab activity.
   - `/contacts/import`: Import wizard.
6. **Audience**: 
   - `/tags`: Quản lý thẻ.
   - `/segments`: Trình tạo Dynamic Segment (kéo thả điều kiện logic AND/OR).
7. **Templates**: 
   - `/templates`: Thư viện mẫu.
   - `/templates/editor/[id]`: Giao diện Email Builder.
8. **Campaigns**: 
   - `/campaigns`: Danh sách chiến dịch.
   - `/campaigns/wizard`: Trình hướng dẫn từng bước.
   - `/campaigns/reports/[id]`: Báo cáo chi tiết.
9. **Settings**: `/settings/providers` (Cấu hình Email Provider, Quota), `/settings/team`, `/settings/security`.

## 4. Giao diện Cốt lõi

### 4.1. Import Wizard
Luồng 5 bước cho người dùng upload khách hàng:
1. **Upload File**: Dropzone (CSV/XLSX). Client validate kích thước.
2. **Map Columns**: Khớp cột dữ liệu từ file với Data schema của CRM.
3. **Consent & Nguồn**: Khai báo bằng chứng consent, gắn Tag mặc định.
4. **Duplicate Rules**: Tùy chọn cách xử lý (Bỏ qua / Cập nhật dòng / Đè dữ liệu).
5. **Preview & Confirm**: Bảng xem trước dữ liệu và nút "Bắt đầu Import". (Hiển thị thanh progress realtime).

### 4.2. Campaign Wizard
1. **Details**: Tên, loại campaign (marketing/transactional), Subject, Sender Info.
2. **Template**: Chọn từ thư viện hoặc tạo mới. Khởi chạy Email Editor.
3. **Audience**: Chọn Segments/Lists, preview số lượng Recipients hợp lệ.
4. **Preflight**: Tự động check lỗi (quota, HTML thiếu unsubscribe, biến không hợp lệ).
5. **Schedule/Send**: Lên lịch hoặc gửi ngay.

### 4.3. Email Builder (GrapesJS)
- **Cột Trái/Phải**: Bảng công cụ kéo thả (Blocks: Heading, Text, Image, Button, Divider, Columns).
- **Chính giữa**: Khung canvas hiển thị thiết kế, có toggle để xem dạng Desktop/Mobile.
- **Top bar**: Nút Undo/Redo, Save Draft, Test Send, View Source.

### 4.4. Trình tạo Dynamic Segment (Segment Builder)
- Giao diện xây dựng logic: [Trường dữ liệu] + [Toán tử] + [Giá trị].
- Nút `+ Thêm điều kiện` (AND) / Nút `+ Thêm nhóm` (OR).
- Có panel hiển thị **"Ước lượng liên hệ (Estimated Match)"** tự động cập nhật khi đổi rule.
