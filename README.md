hustmemo (1)/
├── dist/                          # Thư mục chứa mã nguồn Frontend đã biên dịch (Production)
├── server/                        # Mã nguồn phía Backend (Node.js/Express)
│   ├── controllers/               # Xử lý nghiệp vụ chính (Xác thực, CRUD bộ thẻ, ôn tập)
│   │   ├── authController.ts
│   │   └── deckController.ts
│   ├── cron/                      # Quét lịch chạy ngầm rà soát thẻ đến hạn ôn tập
│   │   └── cronJob.ts
│   ├── middleware/                # Bộ lọc xác thực và phân quyền người dùng
│   │   └── authMiddleware.ts
│   ├── models/                    # Khởi tạo mô hình dữ liệu & ORM giả lập đọc ghi file JSON
│   │   └── db.ts
│   └── routes/                    # Định nghĩa các đầu API Endpoint cho Client gọi tới
│       ├── authRoutes.ts
│       └── deckRoutes.ts
├── src/                           # Mã nguồn phía Frontend (React/Vite)
│   ├── components/                # Các màn hình chức năng chính của ứng dụng
│   │   ├── Dashboard.tsx          # Bảng điều khiển bộ thẻ học, thống kê, thông báo nhắc nhở
│   │   ├── DeckDetail.tsx         # Chi tiết thẻ học, thêm thủ công, nhập hàng loạt (CSV/Text)
│   │   ├── LandingPage.tsx        # Trang giới thiệu ứng dụng, form đăng ký/đăng nhập
│   │   └── StudySession.tsx       # Phiên ôn bài lặp ngắt quãng SM-2, lật thẻ 3D Y-axis
│   ├── index.css                  # Cấu hình phong cách giao diện Tailwind CSS v4
│   ├── main.tsx                   # Điểm khởi động Client React
│   └── types.ts                   # Định nghĩa các kiểu dữ liệu dùng chung (User, Card, Deck)
├── index.html                     # File template HTML chính của trang SPA
├── package.json                   # Quản lý thư viện cài đặt & Script chạy (dev, build, start)
├── server-db.json                 # Tệp cơ sở dữ liệu dạng JSON lưu trữ thông tin thực tế
├── server.ts                      # Tệp khởi chạy Express Server chính (gắn kết Vite dev server)
└── vite.config.ts                 # Cấu hình đóng gói Vite và chặn HMR các file database/backend
