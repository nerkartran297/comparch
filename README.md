# KTMT từ số 0 — web học Kiến trúc Máy tính (IT3030E)

Web học 4 chương đầu môn Kiến trúc Máy tính: lộ trình, giải thích chi tiết, ví dụ có lời giải lấy từ slide, mô phỏng tương tác, và **Lab RISC-V** chạy code từng lệnh ngay trên trình duyệt (kiểu RARS).

Song ngữ **Tiếng Việt / English**: bấm nút **VI / EN** ở thanh bên trái (trên điện thoại: thanh trên cùng) để đổi ngôn ngữ cho toàn bộ trang, kể cả Lab và thông báo lỗi của trình mô phỏng.

## Chạy

Cần Node.js 20.9 trở lên (project dùng Next.js 16).

```bash
npm install
npm run dev        # mở http://localhost:3000
```

Bản production:

```bash
npm run build
npm start
```

Kiểm tra trình mô phỏng RISC-V (dịch + chạy mọi chương trình mẫu ở cả bản Việt và Anh, so kết quả, kiểm tra mã máy và thông báo lỗi hai thứ tiếng):

```bash
npm test
```

## Các trang (theo thứ tự nên học)

| Đường dẫn | Nội dung |
|---|---|
| `/` | Lộ trình, bức tranh toàn cảnh |
| `/nen-tang` | Bước 0 — bit, nhị phân, hex, phép toán bit |
| `/chuong-1` | Giới thiệu, hiệu năng, CPI, đếm lệnh |
| `/chuong-2` | Thành phần máy tính, chu trình lệnh, ngắt, bus |
| `/chuong-4a` | Số nguyên, bù 2, mở rộng dấu, tràn số (học trước Chương 3) |
| `/chuong-3` | Tập lệnh RISC-V, mã hoá lệnh, hàm và stack |
| `/bai-tap-3` | Bài tập thực hành kiểu RARS, có gợi ý và lời giải |
| `/chuong-4b` | Mạch logic, mạch cộng, nhân, chia, IEEE 754 |
| `/on-thi` | Tóm tắt cả môn, checklist, trắc nghiệm |
| `/lab` | Lab RISC-V toàn màn hình |

## Cấu trúc code

```
app/                    mỗi chương một route (page.tsx), layout.tsx gắn font + khung
components/
  Shell.tsx             thanh lộ trình bên trái, menu điện thoại, đổi sáng/tối
  lab/                  Lab RISC-V: Lab.tsx (trạng thái, vòng chạy), Editor, ExecView,
                        RegPanel, MemPanel, ConsolePanel, FieldBreakdown, LabProvider (ngăn kéo)
  lesson/               khối bài học: Lesson, Sec, Note, Code (có nút chạy trong Lab), SelfCheck…
  widgets/<chương>/     mỗi mô phỏng một file
lib/
  riscv.mjs             assembler + CPU RV32IM (+ một phần F), lùi bước, ecall kiểu RARS
  riscv.d.mts           khai báo kiểu cho riscv.mjs
  examples.mjs          các chương trình mẫu của Lab (kèm input/kết quả mong đợi cho test)
  describe.ts           giải thích lệnh bằng tiếng Việt theo giá trị thanh ghi hiện tại
  highlight.ts          tô màu cú pháp assembly / C
  quiz.ts               câu hỏi trắc nghiệm
  nav.ts, storage.ts    lộ trình; lưu tiến độ trong localStorage
styles/                 tokens (màu, chữ) → base → shell → lesson → widgets → lab → parts
scripts/test-riscv.mjs  test của trình mô phỏng
```

## Thêm một chương trình mẫu vào Lab

Thêm một mục vào `lib/examples.mjs` (`id`, `group`, `title`, `code`, tuỳ chọn `input` và `expect`), chạy `npm test`. Trong trang bài học, hiện nó bằng `<Code code={...} />`: khối code tự có nút “Chạy từng bước trong Lab”.

## Lab hỗ trợ gì

- Lệnh RV32I + M (nhân/chia) + một phần F (`flw`, `fsw`, `fadd.s`, `fsub.s`, `fmul.s`, `fdiv.s`, `fcvt`, `fmv`, so sánh).
- Lệnh giả: `li`, `la`, `mv`, `j`, `jr`, `ret`, `call`, `nop`, `not`, `neg`, `beqz`, `bnez`, `bgt`, `ble`, `bgtu`, `bleu`, `seqz`, `snez`, `lw rd, nhãn`…
- Chỉ thị: `.text .data .word .half .byte .ascii .asciz .string .space .align .float .eqv`.
- ecall: 1, 2, 4, 5, 6, 8, 10, 11, 12, 34, 35, 36, 93 (số giống RARS).
- Địa chỉ giống RARS: `.text` 0x00400000, `.data` 0x10010000, `sp` = 0x7FFFEFFC.
- Báo lỗi theo dòng bằng tiếng Việt; báo lỗi căn lề khi `lw/sw` lệch; chặn vòng lặp vô hạn sau 5 triệu lệnh.
- Bước, lùi bước (tới 20 000 bước), chạy với tốc độ chọn được, điểm dừng (breakpoint).

Nội dung tóm tắt từ slide IT3030E Fall 2024 (SoICT, HUST). Chỗ slide có vẻ in nhầm được ghi chú trong bài — nên hỏi lại giảng viên.
