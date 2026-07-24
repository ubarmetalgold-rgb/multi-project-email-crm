# Privacy & Compliance: MultiProject Email CRM

> [!WARNING]
> **Khuyến cáo**: Tài liệu này mô tả các giải pháp kỹ thuật nhằm đáp ứng sự tuân thủ (GDPR, CAN-SPAM, v.v.), nhưng **không thay thế tư vấn pháp lý chuyên nghiệp**. Hệ thống hỗ trợ công cụ, nhưng việc dùng công cụ sao cho hợp pháp thuộc trách nhiệm của người vận hành.

## 1. Consent Ledger (Sổ cái chấp thuận)
Thay vì lưu 1 cột `is_subscribed = true` mong manh, hệ thống sử dụng **Consent Ledger** (bảng `consent_events`) để ghi nhận toàn bộ lịch sử chấp thuận của khách hàng, đảm bảo có bằng chứng giải trình (Audit trail).

### Dữ liệu lưu trữ mỗi sự kiện (Event):
- `contact_id`, `project_id`.
- `status`: `pending`, `opted_in`, `opted_out`, `transactional_only`, `suppressed`.
- `source`: form đăng ký, import, API, admin update, unsubscribe link.
- `timestamp`: Thời gian xảy ra.
- `ip_address`, `user_agent`: Thông tin network khi user đồng ý.
- `evidence`: Snapshot hoặc text mô tả sự đồng ý (vd: "User checked checkbox on website.com/promo").

### Quy tắc Import Khách Hàng
Khi người dùng tải lên danh sách, phải cung cấp nguồn gốc:
1. Đã có bằng chứng đồng ý marketing (Kèm lý do).
2. Chưa rõ trạng thái (Sẽ chỉ đưa vào trạng thái Pending).
3. Chỉ nhận email giao dịch (Transactional only).

*Hệ thống sẽ từ chối gửi Campaign dạng Marketing cho những contact không ở trạng thái `opted_in`.*

## 2. Suppression List (Danh sách chặn)
Bao gồm:
- **Global Suppression**: Chặn email gửi đi toàn hệ thống (VD: Invalid email, Hard Bounce, Báo cáo Spam/Complaint).
- **Project Suppression**: Khách hàng chỉ Unsubscribe khỏi 1 dự án, vẫn có thể nhận ở dự án khác trong cùng Tổ chức.

## 3. Unsubscribe Token và Workflow
- Bắt buộc mọi email marketing đều chứa biến `{{unsubscribe_url}}`.
- URL tạo ra bằng HMAC-SHA256 Token chứa thông tin: `project_id`, `contact_id`, `expiration`.
- **Tuyệt đối không:** Chứa email plaintext trong URL; Yêu cầu khách hàng đăng nhập để Hủy đăng ký.
- Hỗ trợ chuẩn `List-Unsubscribe` và `List-Unsubscribe-Post` headers trong email để các Email Client hiển thị nút "Unsubscribe" native.

## 4. Quyền bảo mật dữ liệu khách hàng (Data Minimization & Anonymization)
- **Soft Delete**: Xóa contact chỉ ẩn khỏi UI (`deleted_at`).
- **Anonymization**: Nếu có yêu cầu "Right to be forgotten" (Xóa hoàn toàn), hệ thống sẽ Replace các cột PII (Name, Email, Phone) bằng hash/UUID, giữ lại data thống kê Campaign, nhưng xóa định danh. Không xóa record vì có thể phá vỡ khóa ngoại `email_events`.
- Không tự động gửi email để warm-up danh sách. Không sử dụng các tài khoản email vòng lặp.
