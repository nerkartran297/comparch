/** Câu hỏi trắc nghiệm ôn tập, bám theo ví dụ & bài tập trong slide (thi giữa/cuối kỳ là quiz online lấy từ bài tập). */
export type Q = { ch: '1' | '2' | '3' | '4'; q: string; code?: string; opts: string[]; a: number; why: string };

export const QUIZ: Q[] = [
  // Chương 1
  { ch: '1', q: 'Máy A chạy một chương trình hết 10 s, máy B chạy hết 15 s. A nhanh hơn B bao nhiêu lần?', opts: ['0.67 lần', '1.5 lần', '5 lần', '25 lần'], a: 1, why: 'n = Time_B / Time_A = 15 / 10 = 1.5.' },
  { ch: '1', q: 'Clock rate 4 GHz thì một chu kỳ dài bao lâu?', opts: ['4 ns', '250 ps', '400 ps', '25 ps'], a: 1, why: 'CC = 1 / CR = 1 / (4 × 10⁹) s = 0.25 ns = 250 ps.' },
  { ch: '1', q: 'A và B cùng ISA. A: chu kỳ 250 ps, CPI 2.0. B: chu kỳ 500 ps, CPI 1.2. Kết luận nào đúng?', opts: ['B nhanh hơn 1.2 lần', 'A nhanh hơn 1.2 lần', 'Hai máy như nhau', 'A nhanh hơn 2 lần'], a: 1, why: 'Time_A = I × 2.0 × 250 = 500I ps; Time_B = I × 1.2 × 500 = 600I ps. 600/500 = 1.2.' },
  { ch: '1', q: 'Tỉ lệ lệnh: ALU 50% (CPI 1), Load 20% (CPI 5), Store 10% (CPI 3), Branch 20% (CPI 2). CPI trung bình là?', opts: ['2.75', '2.2', '1.6', '2.0'], a: 1, why: '0.5×1 + 0.2×5 + 0.1×3 + 0.2×2 = 0.5 + 1.0 + 0.3 + 0.4 = 2.2.' },
  { ch: '1', q: 'Vẫn bảng trên, nếu Load còn 2 chu kỳ thì máy nhanh hơn bao nhiêu?', opts: ['10%', '12.8%', '37.5%', '60%'], a: 2, why: 'CPI mới = 1.6; 2.2 / 1.6 = 1.375 → nhanh hơn 37.5%.' },
  { ch: '1', q: 'Công thức CPU time nào đúng?', opts: ['IC × CPI × Clock rate', 'IC × CPI / Clock rate', 'IC / (CPI × CC)', 'CPI × CC / IC'], a: 1, why: 'CPU time = IC × CPI × CC = IC × CPI / CR.' },
  { ch: '1', q: 'Datapath + Control gọi chung là gì?', opts: ['Bộ nhớ', 'Bus', 'CPU (bộ xử lý)', 'Hệ điều hành'], a: 2, why: 'Năm thành phần: Input, Output, Memory, Datapath, Control. Datapath + Control = Processor.' },
  { ch: '1', q: 'Assembler dịch 1 lệnh assembly thành bao nhiêu lệnh máy (với lệnh thật, không phải lệnh giả)?', opts: ['Đúng 1', 'Nhiều', 'Tuỳ compiler', '0'], a: 0, why: 'Compiler: 1 dòng C → nhiều lệnh assembly. Assembler: 1 lệnh assembly → 1 lệnh máy.' },
  // Chương 2
  { ch: '2', q: 'Thanh ghi nào chứa ĐỊA CHỈ của lệnh sắp được lấy?', opts: ['IR', 'PC', 'AC', 'sp'], a: 1, why: 'PC (Program Counter) chứa địa chỉ; IR chứa nội dung lệnh vừa lấy về.' },
  { ch: '2', q: 'CPU kiểm tra có ngắt hay không vào lúc nào?', opts: ['Giữa pha fetch', 'Cuối mỗi chu trình lệnh', 'Chỉ khi chương trình kết thúc', 'Mỗi khi gọi hàm'], a: 1, why: 'Ngắt được kiểm tra ở cuối mỗi chu trình lệnh, sau khi xong pha execute.' },
  { ch: '2', q: 'Chia cho 0 khi đang chạy lệnh tạo ra loại ngắt nào?', opts: ['Timer', 'I/O', 'Phần mềm / ngoại lệ (exception)', 'Lỗi phần cứng'], a: 2, why: 'Ngắt do chương trình (chia 0, tràn số…) còn gọi là exception.' },
  { ch: '2', q: 'Vì sao dùng ngắt thay cho polling khi đọc bàn phím?', opts: ['Ngắt tốn ít CPU hơn vì CPU không phải liên tục hỏi', 'Polling không đọc được phím', 'Ngắt nhanh hơn clock', 'Bàn phím không hỗ trợ polling'], a: 0, why: 'Polling bắt CPU hỏi liên tục; với ngắt, thiết bị tự báo khi có sự kiện, CPU rảnh làm việc khác.' },
  { ch: '2', q: 'DMA là gì?', opts: ['Bộ nhớ chỉ đọc', 'Bộ điều khiển chuyển dữ liệu thẳng giữa I/O và bộ nhớ', 'Một loại thanh ghi', 'Chế độ ngắt lồng nhau'], a: 1, why: 'Direct Memory Access: DMAC chuyển dữ liệu I/O ↔ bộ nhớ, CPU không phải trực tiếp làm.' },
  { ch: '2', q: 'Trong máy giả định (opcode 4 bit, địa chỉ 12 bit), lệnh 0x5941 làm gì?', opts: ['Nạp AC từ ô 941', 'Cộng ô 941 vào AC', 'Lưu AC vào ô 941', 'Nhảy tới 941'], a: 1, why: 'Chữ số đầu 5 = opcode cộng, 941 = địa chỉ.' },
  // Chương 3
  { ch: '3', q: 's1 = 6. Sau 3 lệnh dưới, s1 = ?', code: 'addi s2, s1, 3\naddi s1, s1, -2\nsub  s1, s2, s1', opts: ['4', '5', '9', '-5'], a: 1, why: 's2 = 9; s1 = 4; s1 = 9 − 4 = 5.' },
  { ch: '3', q: 'A là mảng int, x13 = &A[0]. Đoạn code tương đương câu C nào?', code: 'lw   x10, 12(x13)\naddi x12, x10, 10\nsw   x12, 40(x13)', opts: ['A[12] = A[40] + 10', 'A[10] = A[3] + 10', 'A[3] = A[10] + 10', 'A[40] = A[12] + 10'], a: 1, why: 'Offset byte / 4 = chỉ số: 12/4 = 3, 40/4 = 10.' },
  { ch: '3', q: 's3 = 0x12004094. Lệnh lw t0, 24(s3) đọc ở địa chỉ nào?', opts: ['0x120040AC', '0x120040B8', '0x12004118', '0x12004094'], a: 0, why: '24 = 0x18; 0x94 + 0x18 = 0xAC.' },
  { ch: '3', q: 'Bộ nhớ RISC-V: X = 0x68, X+1 = 0x1B, X+2 = 0x5D, X+3 = 0xFA. Word tại X là?', opts: ['0x681B5DFA', '0xFA5D1B68', '0x1B68FA5D', '0x5DFA681B'], a: 1, why: 'Little-endian: byte ở địa chỉ thấp nhất là byte thấp nhất → đọc từ X+3 xuống X.' },
  { ch: '3', q: 'Thanh ghi nào luôn bằng 0?', opts: ['x1 (ra)', 'x2 (sp)', 'x0 (zero)', 'x10 (a0)'], a: 2, why: 'x0 nối cứng với 0, ghi vào cũng không đổi.' },
  { ch: '3', q: 'Theo quy ước, hàm bị gọi (callee) PHẢI giữ nguyên các thanh ghi nào?', opts: ['t0–t6', 'a0–a7', 's0–s11 và sp', 'ra'], a: 2, why: 'Callee-saved: sp, s0–s11. Caller tự lo t, a, ra.' },
  { ch: '3', q: 'Lệnh jal ra, func làm gì?', opts: ['Chỉ nhảy tới func', 'Lưu PC+4 vào ra rồi nhảy tới func', 'Quay về từ hàm', 'Cất ra lên stack'], a: 1, why: 'jal = jump and link: ghi địa chỉ lệnh kế tiếp vào rd (ra) rồi nhảy.' },
  { ch: '3', q: 'Vì sao hàm đệ quy fact phải cất ra lên stack?', opts: ['Vì ra là thanh ghi tạm', 'Vì lệnh jal gọi đệ quy sẽ ghi đè ra', 'Vì stack nhanh hơn thanh ghi', 'Không cần cất'], a: 1, why: 'Mỗi lần jal ghi đè ra; không cất thì mất đường quay về của lần gọi trước.' },
  { ch: '3', q: 'sw x5, 32(x30) thuộc định dạng nào và x5 nằm ở trường nào?', opts: ['I-type, rd', 'S-type, rs2', 'S-type, rs1', 'R-type, rs2'], a: 1, why: 'Store dùng S-type; thanh ghi dữ liệu là rs2, thanh ghi địa chỉ cơ sở là rs1.' },
  { ch: '3', q: 'Mã máy của add x9, x20, x21 là?', opts: ['0x015A04B3', '0x014A84B3', '0x0004A283', '0x00130313'], a: 0, why: 'funct7 0000000 | rs2 10101 | rs1 10100 | funct3 000 | rd 01001 | opcode 0110011.' },
  { ch: '3', q: 'Vì sao RISC-V không có lệnh subi?', opts: ['Vì không trừ được hằng số', 'Vì addi với số âm làm được việc đó', 'Vì subi chậm', 'Vì thiếu opcode'], a: 1, why: 'addi t0, t0, -5 chính là trừ 5. Bớt lệnh thì phần cứng đơn giản hơn.' },
  { ch: '3', q: 'Muốn in số nguyên trong a0 bằng ecall, a7 phải bằng?', opts: ['1', '4', '5', '10'], a: 0, why: '1 = in số nguyên, 4 = in chuỗi, 5 = đọc số nguyên, 10 = kết thúc.' },
  { ch: '3', q: 'Với .data bắt đầu ở 0x10010000: arr16 .space 16, arr .byte a,b,c, st1 .asciz "abcd", X1 .word ... X1 ở địa chỉ nào?', opts: ['0x10010017', '0x10010018', '0x10010014', '0x1001001C'], a: 1, why: '16 + 3 + 5 = 24 byte → 0x10010018, đã chia hết cho 4 nên không cần đệm.' },
  // Chương 4
  { ch: '4', q: '−100 dạng bù 2 16 bit là?', opts: ['1000 0000 0110 0100', '1111 1111 1001 1011', '1111 1111 1001 1100', '0000 0000 0110 0100'], a: 2, why: '100 = 0000 0000 0110 0100 → đảo bit 1111 1111 1001 1011 → +1 = 1111 1111 1001 1100.' },
  { ch: '4', q: '8 bit có dấu: 122 + 8 = ?', opts: ['130', '−126 (tràn)', '−130', '2'], a: 1, why: '130 > 127 nên tràn; 1000 0010 đọc có dấu là −126.' },
  { ch: '4', q: 'Phép nào sau đây KHÔNG BAO GIỜ tràn?', opts: ['Cộng hai số dương', 'Cộng hai số âm', 'Cộng hai số khác dấu', 'Trừ số âm khỏi số dương'], a: 2, why: 'Cộng khác dấu (hoặc trừ cùng dấu) thì kết quả nằm giữa hai số, không thể vượt phạm vi.' },
  { ch: '4', q: 'Byte y = −20 (0xEC). lbu s3, y cho s3 = ?', opts: ['−20', '20', '236', '0xFFFFFFEC'], a: 2, why: 'lbu mở rộng bằng 0: 0x000000EC = 236.' },
  { ch: '4', q: 't0 = 20, t1 = −20. bltu t1, t0, L có nhảy không?', opts: ['Có, vì −20 < 20', 'Không, vì 0xFFFFFFEC (không dấu) rất lớn', 'Lỗi', 'Tuỳ CPU'], a: 1, why: 'bltu so sánh không dấu: 4 294 967 276 < 20 là sai.' },
  { ch: '4', q: 'Full adder có A = 1, B = 1, Cin = 1. S và Cout = ?', opts: ['S = 0, Cout = 1', 'S = 1, Cout = 1', 'S = 1, Cout = 0', 'S = 0, Cout = 0'], a: 1, why: '1 + 1 + 1 = 3 = 11₂.' },
  { ch: '4', q: 'Nhân hai số 32 bit thì tích đầy đủ có bao nhiêu bit?', opts: ['32', '33', '64', '1024'], a: 2, why: 'n bit × n bit → 2n bit. RISC-V dùng mul (32 bit thấp) + mulh (32 bit cao).' },
  { ch: '4', q: '−7 / 2 bằng lệnh div và rem cho kết quả?', opts: ['thương −4, dư 1', 'thương −3, dư −1', 'thương −3, dư 1', 'thương 3, dư −1'], a: 1, why: 'Thương làm tròn về 0; số dư cùng dấu với số bị chia: −3 × 2 + (−1) = −7.' },
  { ch: '4', q: 'IEEE 754 single: 0x3F800000 là số nào?', opts: ['0.5', '1.0', '2.0', '−1.0'], a: 1, why: 'S = 0, E = 127 → mũ 0, F = 0 → 1.0 × 2⁰.' },
  { ch: '4', q: '9.6875 ở IEEE 754 single là?', opts: ['0x411B0000', '0x41180000', '0xC11B0000', '0x419B0000'], a: 0, why: '1001.1011₂ = 1.0011011 × 2³; E = 130 = 1000 0010; F = 0011011…' },
  { ch: '4', q: 'E = 1111 1111 và F ≠ 0 nghĩa là gì?', opts: ['Vô cực', 'Số 0', 'NaN', 'Số không chuẩn hoá'], a: 2, why: 'E toàn 1: F = 0 là ±∞, F ≠ 0 là NaN.' },
  { ch: '4', q: 'Khi nhân hai số thực, bước xử lý số mũ là?', opts: ['Lấy mũ lớn hơn', 'E1 + E2 − 127', 'E1 + E2 + 127', 'E1 − E2'], a: 1, why: 'Cả hai mũ đều đã cộng bias 127, nên tổng phải trừ bớt 127 một lần.' },
];
