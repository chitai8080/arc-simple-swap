Hãy refactor dự án arc-swap-simple theo mô hình user-signed swap (production-ready), với yêu cầu bắt buộc: KHÔNG lưu/đọc/yêu cầu private key ví dev trong flow swap của web app.

Mục tiêu:
- Web cho user connect ví (MetaMask/Rabby/WalletConnect), tự ký transaction swap.
- Backend chỉ quote + build transaction data + status; không ký thay user.
- Ưu tiên Arc network, dễ mở rộng multi-chain.

Việc cần làm:
1. Audit code hiện tại, chỉ ra chỗ đang hoặc có nguy cơ dùng dev private key.
2. Chuẩn hóa lại cấu trúc thư mục web/server theo layered architecture.
3. Refactor frontend:
- connect wallet
- chọn token/amount/slippage
- gọi API quote/build-tx
- gửi tx qua ví user, nhận txHash và theo dõi trạng thái
4. Refactor backend:
- POST /api/swap/quote
- POST /api/swap/build-tx
- GET /api/swap/status/:txHash
- validate input (zod), lỗi chuẩn hóa, không signer private key cho user flow
5. Chuẩn hóa env:
- web chỉ dùng VITE_ vars an toàn
- tách và loại private key dev khỏi runtime user-facing flow
6. Bổ sung:
- rate limit cơ bản, CORS rõ ràng, structured logging (không lộ dữ liệu nhạy cảm)
- test tối thiểu cho API validation + quote/build-tx + frontend service/hook
7. Chạy lint/typecheck/build cho web và server, báo cáo kết quả.
8. Cập nhật README: kiến trúc mới, local run, swap flow user-signed, khẳng định “không cần private key ví dev”.

Acceptance criteria:
- User connect ví và tự ký swap thành công.
- Không có UI/API flow nào yêu cầu dev private key.
- Backend không ký giao dịch cho user.
- Lint/typecheck/build pass.
- README cập nhật đúng thực tế.

Output yêu cầu:
- Danh sách file changed.
- Tóm tắt trước/sau kiến trúc.
- Kết quả lệnh đã chạy.
- Rủi ro còn lại + next steps.