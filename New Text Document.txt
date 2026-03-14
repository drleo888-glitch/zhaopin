# 📋 Tài Liệu Hệ Thống: Quản Lý Khám Sức Khỏe Tuyển Dụng
# 📋 系统文档：招聘体检管理系统

> **Phiên bản / 版本:** 1.0
> **Ngày tạo / 创建日期:** 2026-03-13
> **Trạng thái / 状态:** Draft / 草稿

---

## 1. Tổng Quan Hệ Thống
## 1. 系统概述

Hệ thống quản lý quy trình **khám sức khỏe tuyển dụng** giữa 4 bên tham gia: HR, Phòng Y tế, Bệnh viện và Người lao động. Mục tiêu là số hóa toàn bộ luồng xử lý từ khi phát sinh yêu cầu khám đến khi có kết quả cuối cùng.

本系统管理**招聘体检**流程，涉及四方参与者：人力资源部（HR）、医务室、医院及劳动者。目标是将整个处理流程数字化，从体检需求产生到最终结果输出全程覆盖。

---

## 2. Các Bên Tham Gia (Actors)
## 2. 参与方（角色）

| Actor / 角色 | Vai trò / 职责 | Quyền hạn trong hệ thống / 系统权限 |
|---|---|---|
| **HR / 人力资源部** | Phòng Nhân sự / 人事部门 | Tạo yêu cầu khám, nhận & thông báo kết quả cuối / 创建体检申请，接收并通知最终结果 |
| **Người lao động / 劳动者** | Ứng viên / NLĐ mới / 应聘者/新员工 | Xem yêu cầu, chọn bệnh viện, đến khám / 查看申请，选择医院，前往体检 |
| **Bệnh viện / 医院** | Cơ sở y tế đối tác / 合作医疗机构 | Xác nhận lịch khám, nhập & gửi kết quả / 确认体检预约，录入并提交结果 |
| **Phòng Y tế / 医务室** | Bộ phận y tế nội bộ / 内部医疗部门 | Duyệt kết quả, xác nhận Đạt / Không đạt / 审核结果，确认合格/不合格 |

---

## 3. Sơ Đồ Luồng Quy Trình
## 3. 流程图

```mermaid
flowchart TD
    A([🏢 HR / 人力资源部]) -->|"1. Tạo yêu cầu khám\n1. 创建体检申请"| B["Hệ thống thông báo NLĐ\n系统通知劳动者"]
    B --> C([👤 Người lao động / 劳动者])
    C -->|"2. Chọn Bệnh viện\n2. 选择医院"| D["Hệ thống thông báo BV\n系统通知医院"]
    D --> E([🏥 Bệnh viện / 医院])
    E -->|"3. Xác nhận lịch khám\n3. 确认体检预约"| F["Hệ thống xác nhận → NLĐ\n系统确认 → 劳动者"]
    F --> C
    C -->|"4. Đến khám theo lịch\n4. 按时前往体检"| E
    E -->|"5. Gửi kết quả lên hệ thống\n5. 提交体检结果"| G["Hệ thống thông báo Y tế\n系统通知医务室"]
    G --> H([🩺 Phòng Y tế / 医务室])
    H -->|"6. Xem xét & xác nhận\n6. 审核并确认"| I{"Kết quả? / 结果?"}
    I -->|"✅ Đạt / 合格"| J["Trạng thái: ĐẠT\n状态：合格"]
    I -->|"❌ Không đạt / 不合格"| K["Trạng thái: KHÔNG ĐẠT\n状态：不合格"]
    J --> L([🏢 HR nhận thông báo ĐẠT / HR收到合格通知])
    K --> M([🏢 HR nhận thông báo KĐ / HR收到不合格通知])
    L -->|"7a. Thông báo đi làm\n7a. 通知入职"| C
    M -->|"7b. Thông báo không đạt\n7b. 通知未通过"| C
```

---

## 4. Mô Tả Chi Tiết Các Bước
## 4. 各步骤详细说明

---

### Bước 1 — HR Tạo Yêu Cầu Khám
### 第一步 — 人力资源部创建体检申请

| | Tiếng Việt / 越南语 | 中文 |
|---|---|---|
| **Người thực hiện / 执行人** | HR | 人力资源部 |
| **Mô tả / 说明** | HR tạo phiếu yêu cầu khám sức khỏe tuyển dụng trên hệ thống, gắn với từng NLĐ cụ thể | HR在系统中创建体检申请单，关联至具体劳动者 |
| **Đầu vào / 输入** | Họ tên, CCCD, vị trí tuyển dụng | 姓名、身份证号、应聘岗位 |
| **Đầu ra / 输出** | Thông báo gửi tới NLĐ qua hệ thống | 系统向劳动者发送通知 |

---

### Bước 2 — Người Lao Động Chọn Bệnh Viện
### 第二步 — 劳动者选择医院

| | Tiếng Việt / 越南语 | 中文 |
|---|---|---|
| **Người thực hiện / 执行人** | Người lao động | 劳动者 |
| **Mô tả / 说明** | NLĐ đăng nhập hệ thống, xem danh sách BV đối tác, chọn bệnh viện và khung giờ phù hợp | 劳动者登录系统，查看合作医院列表，选择医院及合适时间段 |
| **Đầu vào / 输入** | Danh sách bệnh viện từ hệ thống | 系统提供的医院列表 |
| **Đầu ra / 输出** | Yêu cầu xác nhận lịch gửi tới bệnh viện | 预约确认请求发送至所选医院 |

---

### Bước 3 — Bệnh Viện Xác Nhận Lịch Khám
### 第三步 — 医院确认体检预约

| | Tiếng Việt / 越南语 | 中文 |
|---|---|---|
| **Người thực hiện / 执行人** | Bệnh viện | 医院 |
| **Mô tả / 说明** | Bệnh viện nhận yêu cầu, kiểm tra lịch và xác nhận hoặc đề xuất lịch thay thế | 医院接收请求，检查日程后确认或提出备选时间 |
| **Đầu vào / 输入** | Yêu cầu khám từ NLĐ | 来自劳动者的体检请求 |
| **Đầu ra / 输出** | Lịch khám xác nhận gửi tới NLĐ | 确认的体检时间发送至劳动者 |

---

### Bước 4 — Người Lao Động Đến Khám
### 第四步 — 劳动者前往体检

| | Tiếng Việt / 越南语 | 中文 |
|---|---|---|
| **Người thực hiện / 执行人** | Người lao động (ngoại tuyến) | 劳动者（线下操作） |
| **Mô tả / 说明** | NLĐ đến BV theo lịch đã xác nhận, thực hiện khám theo danh mục quy định | 劳动者按确认时间前往医院，按规定项目完成体检 |
| **Lưu ý / 备注** | Hệ thống theo dõi trạng thái "Chờ kết quả" | 系统跟踪状态为"等待结果" |

---

### Bước 5 — Bệnh Viện Gửi Kết Quả
### 第五步 — 医院提交体检结果

| | Tiếng Việt / 越南语 | 中文 |
|---|---|---|
| **Người thực hiện / 执行人** | Bệnh viện | 医院 |
| **Mô tả / 说明** | Sau khi có kết quả, nhân viên BV nhập thông tin kết quả khám vào hệ thống | 体检完成后，医院工作人员将结果录入系统并提交 |
| **Đầu vào / 输入** | Phiếu kết quả khám thực tế | 实际体检结果单 |
| **Đầu ra / 输出** | Kết quả lưu trên hệ thống, Phòng Y tế nhận thông báo | 结果保存至系统，医务室收到通知 |

---

### Bước 6 — Phòng Y Tế Xác Nhận Kết Quả
### 第六步 — 医务室审核确认结果

| | Tiếng Việt / 越南语 | 中文 |
|---|---|---|
| **Người thực hiện / 执行人** | Phòng Y tế | 医务室 |
| **Mô tả / 说明** | Nhân viên y tế xem xét kết quả từ BV, đưa ra xác nhận chính thức: **Đạt** hoặc **Không đạt** | 医务人员审核医院提交的结果，给出正式确认：**合格**或**不合格** |
| **Đầu vào / 输入** | Kết quả khám từ bệnh viện | 医院提交的体检结果 |
| **Đầu ra / 输出** | Trạng thái xác nhận cuối cùng | 最终确认状态 |

---

### Bước 7 — HR Thông Báo Kết Quả
### 第七步 — 人力资源部通知结果

| | Tiếng Việt / 越南语 | 中文 |
|---|---|---|
| **Người thực hiện / 执行人** | HR | 人力资源部 |
| **Nếu Đạt / 如合格** | Thông báo NLĐ ngày đi làm và thủ tục tiếp theo | 通知劳动者入职日期及后续手续 |
| **Nếu Không Đạt / 如不合格** | Thông báo NLĐ kết quả không đạt, lý do (nếu có) | 通知劳动者未通过及原因（如有） |

---

## 5. Bảng Trạng Thái Hồ Sơ Khám
## 5. 体检档案状态表

| Mã / 状态码 | Tên (VI) / 越南语 | 名称 (ZH) / 中文 | Mô tả / 说明 | Người cập nhật / 更新方 |
|---|---|---|---|---|
| `PENDING` | Chờ chọn bệnh viện | 等待选择医院 | Yêu cầu đã tạo, NLĐ chưa chọn BV / 申请已创建，劳动者尚未选择医院 | Hệ thống / 系统 |
| `HOSPITAL_SELECTED` | Đã chọn bệnh viện | 已选择医院 | NLĐ đã chọn, chờ BV xác nhận / 劳动者已选择，等待医院确认 | NLĐ / 劳动者 |
| `APPOINTMENT_CONFIRMED` | Lịch đã xác nhận | 预约已确认 | BV đã xác nhận lịch khám / 医院已确认体检时间 | Bệnh viện / 医院 |
| `EXAMINED` | Đã khám xong | 已完成体检 | NLĐ đã khám, chờ kết quả / 劳动者已完成体检，等待结果 | Bệnh viện / 医院 |
| `RESULT_SUBMITTED` | Đã có kết quả | 结果已提交 | BV đã gửi kết quả, chờ Y tế duyệt / 医院已提交结果，等待医务室审核 | Bệnh viện / 医院 |
| `PASSED` | ✅ Đạt | ✅ 合格 | Phòng Y tế xác nhận đạt / 医务室确认合格 | Phòng Y tế / 医务室 |
| `FAILED` | ❌ Không đạt | ❌ 不合格 | Phòng Y tế xác nhận không đạt / 医务室确认不合格 | Phòng Y tế / 医务室 |
| `NOTIFIED` | Đã thông báo | 已通知 | HR đã thông báo kết quả tới NLĐ / HR已将结果通知劳动者 | HR |

---

## 6. Các Use Case Chính
## 6. 主要用例

---

### UC-01: Tạo Yêu Cầu Khám / 创建体检申请

| Mục / 项目 | Tiếng Việt | 中文 |
|---|---|---|
| **Actor chính / 主要参与方** | HR | 人力资源部 |
| **Tiền điều kiện / 前置条件** | NLĐ đã có thông tin trong hệ thống | 劳动者信息已录入系统 |
| **Hậu điều kiện / 后置条件** | Hồ sơ khám được tạo, NLĐ nhận thông báo | 体检档案已创建，劳动者收到通知 |
| **Luồng chính / 主流程** | HR nhập thông tin → Hệ thống tạo hồ sơ → Gửi thông báo NLĐ | HR录入信息 → 系统创建档案 → 发送通知至劳动者 |

### UC-02: Chọn Bệnh Viện / 选择医院

| Mục / 项目 | Tiếng Việt | 中文 |
|---|---|---|
| **Actor chính / 主要参与方** | Người lao động | 劳动者 |
| **Tiền điều kiện / 前置条件** | Hồ sơ ở trạng thái `PENDING` | 档案状态为 `PENDING` |
| **Hậu điều kiện / 后置条件** | Trạng thái chuyển sang `HOSPITAL_SELECTED` | 状态变更为 `HOSPITAL_SELECTED` |
| **Luồng chính / 主流程** | NLĐ xem danh sách → Chọn BV → Hệ thống thông báo BV | 劳动者查看列表 → 选择医院 → 系统通知医院 |

### UC-03: Xác Nhận Lịch Khám / 确认体检预约

| Mục / 项目 | Tiếng Việt | 中文 |
|---|---|---|
| **Actor chính / 主要参与方** | Bệnh viện | 医院 |
| **Tiền điều kiện / 前置条件** | Hồ sơ ở trạng thái `HOSPITAL_SELECTED` | 档案状态为 `HOSPITAL_SELECTED` |
| **Hậu điều kiện / 后置条件** | Trạng thái chuyển sang `APPOINTMENT_CONFIRMED` | 状态变更为 `APPOINTMENT_CONFIRMED` |
| **Luồng chính / 主流程** | BV nhận yêu cầu → Xác nhận → Hệ thống thông báo NLĐ | 医院接收请求 → 确认 → 系统通知劳动者 |

### UC-04: Gửi Kết Quả Khám / 提交体检结果

| Mục / 项目 | Tiếng Việt | 中文 |
|---|---|---|
| **Actor chính / 主要参与方** | Bệnh viện | 医院 |
| **Tiền điều kiện / 前置条件** | Hồ sơ ở trạng thái `APPOINTMENT_CONFIRMED` | 档案状态为 `APPOINTMENT_CONFIRMED` |
| **Hậu điều kiện / 后置条件** | Trạng thái chuyển sang `RESULT_SUBMITTED` | 状态变更为 `RESULT_SUBMITTED` |
| **Luồng chính / 主流程** | BV nhập kết quả → Gửi lên hệ thống → Thông báo Phòng Y tế | 医院录入结果 → 提交至系统 → 通知医务室 |

### UC-05: Xác Nhận Kết Quả / 审核确认结果

| Mục / 项目 | Tiếng Việt | 中文 |
|---|---|---|
| **Actor chính / 主要参与方** | Phòng Y tế | 医务室 |
| **Tiền điều kiện / 前置条件** | Hồ sơ ở trạng thái `RESULT_SUBMITTED` | 档案状态为 `RESULT_SUBMITTED` |
| **Hậu điều kiện / 后置条件** | Trạng thái chuyển sang `PASSED` hoặc `FAILED` | 状态变更为 `PASSED` 或 `FAILED` |
| **Luồng chính / 主流程** | Y tế xem kết quả → Xác nhận Đạt/Không đạt → Thông báo HR | 医务室查看结果 → 确认合格/不合格 → 通知HR |

### UC-06: Thông Báo Kết Quả Cuối / 通知最终结果

| Mục / 项目 | Tiếng Việt | 中文 |
|---|---|---|
| **Actor chính / 主要参与方** | HR | 人力资源部 |
| **Tiền điều kiện / 前置条件** | Hồ sơ ở trạng thái `PASSED` hoặc `FAILED` | 档案状态为 `PASSED` 或 `FAILED` |
| **Hậu điều kiện / 后置条件** | NLĐ được thông báo, trạng thái chuyển `NOTIFIED` | 劳动者已被通知，状态变更为 `NOTIFIED` |
| **Luồng chính / 主流程** | HR nhận thông báo → Gửi thông báo tới NLĐ | HR收到通知 → 通知劳动者 |

---

## 7. Yêu Cầu Phi Chức Năng
## 7. 非功能性需求

| Yêu cầu / 需求 | Mô tả (VI) / 越南语说明 | 说明 (ZH) / 中文说明 |
|---|---|---|
| **Bảo mật / 安全性** | Kết quả khám là dữ liệu nhạy cảm, phải mã hóa khi lưu trữ và truyền tải | 体检结果属敏感数据，存储与传输须加密处理 |
| **Phân quyền / 权限控制** | Mỗi actor chỉ thấy và thao tác dữ liệu trong phạm vi của mình | 每个角色仅能查看和操作其权限范围内的数据 |
| **Thông báo / 通知** | Hệ thống gửi thông báo tự động khi trạng thái hồ sơ thay đổi | 档案状态变更时，系统自动推送通知 |
| **Audit log / 操作日志** | Ghi lại toàn bộ lịch sử thao tác để truy vết | 记录全部操作历史，便于追溯审查 |
| **Hiệu năng / 性能** | Hỗ trợ xử lý đồng thời nhiều hồ sơ trong mùa tuyển dụng cao điểm | 招聘旺季支持多档案并发处理 |

---

## 8. Ghi Chú Bổ Sung
## 8. 补充说明

> **VI:** Trường hợp NLĐ không thể đến khám theo lịch đã xác nhận → cần có luồng **hủy / đổi lịch**.
> **ZH:** 若劳动者无法按确认时间前往体检 → 需提供**取消/改期**流程。

> **VI:** Trường hợp bệnh viện không xác nhận trong thời gian quy định → cần cơ chế **tự động nhắc nhở / chuyển BV khác**.
> **ZH:** 若医院未在规定时间内确认 → 需具备**自动提醒/切换医院**机制。

> **VI:** Cân nhắc tích hợp tính năng **upload file kết quả PDF** từ phía bệnh viện thay vì nhập tay.
> **ZH:** 建议集成医院端**PDF结果文件上传**功能，替代手动录入。

---

*VI: Tài liệu này là nền tảng cho giai đoạn phân tích & thiết kế hệ thống. Mọi thay đổi cần được phê duyệt bởi Product Owner.*

*ZH: 本文档为系统分析与设计阶段的基础文件。任何变更须经产品负责人审批。*
