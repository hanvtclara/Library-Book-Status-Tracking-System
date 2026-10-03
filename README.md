# Library Book Status Tracking System

Công cụ web nhỏ giúp nhà trường **chia sẻ số sách giáo khoa đang có** cho nhiều lớp trong lúc sách chưa cung ứng đủ, và theo dõi việc mượn–trả theo từng tiết học.

## Bài toán

Một số môn học chưa có đủ sách giáo khoa cho mọi học sinh. Cần một giải pháp **hợp pháp (không sao chép sách), chi phí thấp, triển khai nhanh** để học sinh vẫn có tài liệu học.

## Cách giải quyết

Thay vì mỗi em một quyển, hệ thống **xoay vòng số sách thư viện đang có** theo thời khóa biểu: tiết nào lớp nào học môn nào thì sách được xuất cho lớp đó, hết tiết thì trả lại để tiết sau dùng tiếp. Không in, không scan, không cần mua thêm gì.

## Tính năng

- **Phân bổ công bằng tự động**: mỗi tiết, từng quyển được giao cho lớp đang có tỷ lệ được phục vụ tích lũy thấp nhất, nên không lớp nào bị bỏ rơi.
- **Dùng chung 1–3 học sinh/quyển** để tăng độ phủ khi sách còn thiếu nhiều.
- **Bảng điều khiển**: tỷ lệ học sinh có sách, số lượt còn thiếu, độ phủ theo từng lớp.
- **Lịch mượn–trả theo tiết**, kèm trạng thái: Chưa phát → Đang mượn → Đã trả.
- **Ba vai trò xem riêng**: thủ thư (xem tất cả), giáo viên chủ nhiệm (theo lớp), giáo viên bộ môn (theo môn).
- **Tin nhắn nhắc lịch** theo ngày, sao chép một chạm để dán vào Zalo/nhóm lớp, có cảnh báo các suất chưa ghi nhận trả.
- **Nhập liệu linh hoạt**: số sách từng môn, số học sinh thiếu theo lớp, thêm lớp, thêm/xóa tiết học.
- Dữ liệu lưu ngay trên trình duyệt, không cần máy chủ hay đăng nhập.

## Cách chạy

1. Tải thư mục `Ver1` về máy.
2. Mở file `index.html` bằng Chrome hoặc Edge.

Hoặc mở bản web qua GitHub Pages (nếu đã bật).

## Hạn chế hiện tại

- Dữ liệu chỉ nằm trên trình duyệt của từng máy, chưa đồng bộ giữa nhiều người dùng.
- Dữ liệu mẫu chỉ là ví dụ, cần nhập số liệu thực tế của trường.
