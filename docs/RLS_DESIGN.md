# RLS Design: MultiProject Email CRM

## 1. Ma trận phân quyền (Role Matrix)

Hệ thống có các mức độ phân quyền (Role) tại cấp độ **Organization** và **Project**.
*Lưu ý: Mọi user đều nằm trong một Organization.*

- **Owner**: Toàn quyền trong Organization (Billing, Users, Providers, Settings).
- **Admin**: Quản lý Project, Contacts, Templates, Campaigns.
- **Marketing Manager**: Quản lý Contacts, Segments, Templates, Tạo và Gửi Campaigns.
- **Editor**: Soạn thảo Templates, tạo Draft Campaigns (Không thể gửi/Schedule).
- **Viewer**: Chỉ xem (Read-only) báo cáo, danh sách.

## 2. Row Level Security (RLS) Helper Functions

Bởi vì Supabase Auth `auth.users()` không lưu role cụ thể của tenant, chúng ta tạo các hàm SQL nội bộ (Helpers) chạy dưới quyền bảo mật (Security Definer) để kiểm tra cho Policy.

```sql
-- Kiểm tra xem User có quyền trong một Project hay không
CREATE OR REPLACE FUNCTION public.has_project_role(project_id UUID, allowed_roles text[])
RETURNS boolean AS $$
  -- Logic SELECT từ project_members JOIN organization_members ...
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Kiểm tra xem User có quyền trong Organization
CREATE OR REPLACE FUNCTION public.has_org_role(org_id UUID, allowed_roles text[])
...
```

## 3. Chính sách RLS cho các bảng chính

- **Mặc định**: Bật RLS cho tất cả bảng (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
- Không sử dụng `USING (true)` ngoại trừ các bảng tra cứu công khai (public lookup tables).

### 3.1. Bảng `organizations` & `projects`
- **SELECT**: `USING (has_org_role(id, array['owner', 'admin', 'marketing', 'editor', 'viewer']))`
- **UPDATE**: `USING (has_org_role(id, array['owner', 'admin']))`
- **INSERT/DELETE**: Chỉ thông qua Edge Functions/Database RPC an toàn.

### 3.2. Bảng `contacts` & `contact_project_memberships`
- **SELECT**: `USING (has_project_role(project_id, array['owner', 'admin', 'marketing', 'editor', 'viewer']))`
- **INSERT/UPDATE/DELETE**: `USING (has_project_role(project_id, array['owner', 'admin', 'marketing']))`
- **Ghi chú**: Bảng `contacts` có thể là global trong tổ chức, nên RLS dựa vào `organization_id`. Bảng memberships dựa vào `project_id`.

### 3.3. Bảng `campaigns`
- **SELECT**: Tương tự `contacts`.
- **INSERT/UPDATE**: `USING (has_project_role(project_id, array['owner', 'admin', 'marketing', 'editor']))`
- **Bảo mật gửi**: Thao tác *Send* (Cập nhật `status = 'queued'`) chỉ được thực hiện bởi Admin/Marketing thông qua API hoặc RPC. Editor không thể gọi lệnh này.

### 3.4. RLS cho Storage
- Khởi tạo policy trên `storage.objects` table:
- **SELECT**: Chỉ user có quyền vào project đó mới được tải xuống (`crm-imports`).
- Các asset công khai (`crm-assets`) có thể SELECT `using (true)`.

## 4. Các trường hợp Bypass RLS
Trong các worker background, ta sử dụng **Service Role Key** (bypass mọi RLS).
**Lý do**:
1. `process-email-queue`: Đọc dữ liệu campaign recipient và provider token để gửi (cần toàn quyền).
2. `email-provider-webhook`: Nhận HTTP post từ bên thứ 3 (không có Auth Token của người dùng), cần ghi vào bảng `email_events`.
3. `unsubscribe` & `track-*`: Endpoint công khai, nhận signed URL (chứa HMAC) để update contact.

*Điều kiện*: Mọi endpoint bypass RLS đều phải tự xử lý logic bảo mật (như kiểm tra HMAC Signature, kiểm tra payload Webhook), và tuyệt đối **không** được tiết lộ qua client API.

## 5. RLS Test Plan
- Tạo script bằng `pgTAP` (hoặc mock client từ `@supabase/supabase-js`) để kiểm tra:
  - User thuộc Project A SELECT bảng `contacts` không trả về dòng nào của Project B.
  - User mang role Editor cố gắng UPDATE status của Campaign thành "queued" sẽ nhận lỗi `Access Denied / RLS Violation`.
