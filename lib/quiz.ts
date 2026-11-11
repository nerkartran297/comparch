import type { Bi } from '@/components/i18n';

/** Câu hỏi trắc nghiệm ôn tập, bám theo ví dụ & bài tập trong slide (thi giữa/cuối kỳ là quiz online lấy từ bài tập). */
export type Q = { ch: '1' | '2' | '3' | '4'; q: Bi; code?: string; opts: Bi[]; a: number; why: Bi };

/** Đáp án giống nhau ở cả hai ngôn ngữ (số, mã máy…). */
const same = (...xs: string[]): Bi[] => xs.map((x) => ({ vi: x, en: x }));
const b = (vi: string, en: string): Bi => ({ vi, en });

export const QUIZ: Q[] = [
  // Chương 1
  {
    ch: '1',
    q: b('Máy A chạy một chương trình hết 10 s, máy B chạy hết 15 s. A nhanh hơn B bao nhiêu lần?', 'Machine A runs a program in 10 s, machine B in 15 s. How many times faster is A than B?'),
    opts: [b('0.67 lần', '0.67 times'), b('1.5 lần', '1.5 times'), b('5 lần', '5 times'), b('25 lần', '25 times')], a: 1,
    why: b('n = Time_B / Time_A = 15 / 10 = 1.5.', 'n = Time_B / Time_A = 15 / 10 = 1.5.'),
  },
  {
    ch: '1',
    q: b('Clock rate 4 GHz thì một chu kỳ dài bao lâu?', 'With a 4 GHz clock rate, how long is one cycle?'),
    opts: same('4 ns', '250 ps', '400 ps', '25 ps'), a: 1,
    why: b('CC = 1 / CR = 1 / (4 × 10⁹) s = 0.25 ns = 250 ps.', 'CC = 1 / CR = 1 / (4 × 10⁹) s = 0.25 ns = 250 ps.'),
  },
  {
    ch: '1',
    q: b('A và B cùng ISA. A: chu kỳ 250 ps, CPI 2.0. B: chu kỳ 500 ps, CPI 1.2. Kết luận nào đúng?', 'A and B share the same ISA. A: 250 ps cycle, CPI 2.0. B: 500 ps cycle, CPI 1.2. Which statement is correct?'),
    opts: [b('B nhanh hơn 1.2 lần', 'B is 1.2 times faster'), b('A nhanh hơn 1.2 lần', 'A is 1.2 times faster'), b('Hai máy như nhau', 'They are equally fast'), b('A nhanh hơn 2 lần', 'A is 2 times faster')], a: 1,
    why: b('Time_A = I × 2.0 × 250 = 500I ps; Time_B = I × 1.2 × 500 = 600I ps. 600/500 = 1.2.', 'Time_A = I × 2.0 × 250 = 500I ps; Time_B = I × 1.2 × 500 = 600I ps. 600/500 = 1.2.'),
  },
  {
    ch: '1',
    q: b('Tỉ lệ lệnh: ALU 50% (CPI 1), Load 20% (CPI 5), Store 10% (CPI 3), Branch 20% (CPI 2). CPI trung bình là?', 'Instruction mix: ALU 50% (CPI 1), Load 20% (CPI 5), Store 10% (CPI 3), Branch 20% (CPI 2). What is the average CPI?'),
    opts: same('2.75', '2.2', '1.6', '2.0'), a: 1,
    why: b('0.5×1 + 0.2×5 + 0.1×3 + 0.2×2 = 0.5 + 1.0 + 0.3 + 0.4 = 2.2.', '0.5×1 + 0.2×5 + 0.1×3 + 0.2×2 = 0.5 + 1.0 + 0.3 + 0.4 = 2.2.'),
  },
  {
    ch: '1',
    q: b('Vẫn bảng trên, nếu Load còn 2 chu kỳ thì máy nhanh hơn bao nhiêu?', 'Same mix: if Load drops to 2 cycles, how much faster is the machine?'),
    opts: same('10%', '12.8%', '37.5%', '60%'), a: 2,
    why: b('CPI mới = 1.6; 2.2 / 1.6 = 1.375 → nhanh hơn 37.5%.', 'New CPI = 1.6; 2.2 / 1.6 = 1.375 → 37.5% faster.'),
  },
  {
    ch: '1',
    q: b('Công thức CPU time nào đúng?', 'Which CPU time formula is correct?'),
    opts: same('IC × CPI × Clock rate', 'IC × CPI / Clock rate', 'IC / (CPI × CC)', 'CPI × CC / IC'), a: 1,
    why: b('CPU time = IC × CPI × CC = IC × CPI / CR.', 'CPU time = IC × CPI × CC = IC × CPI / CR.'),
  },
  {
    ch: '1',
    q: b('Datapath + Control gọi chung là gì?', 'What do Datapath + Control together make up?'),
    opts: [b('Bộ nhớ', 'Memory'), b('Bus', 'The bus'), b('CPU (bộ xử lý)', 'The CPU (processor)'), b('Hệ điều hành', 'The operating system')], a: 2,
    why: b('Năm thành phần: Input, Output, Memory, Datapath, Control. Datapath + Control = Processor.', 'The five components: Input, Output, Memory, Datapath, Control. Datapath + Control = Processor.'),
  },
  {
    ch: '1',
    q: b('Assembler dịch 1 lệnh assembly thành bao nhiêu lệnh máy (với lệnh thật, không phải lệnh giả)?', 'How many machine instructions does the assembler turn 1 assembly instruction into (a real instruction, not a pseudo-instruction)?'),
    opts: [b('Đúng 1', 'Exactly 1'), b('Nhiều', 'Many'), b('Tuỳ compiler', 'Depends on the compiler'), b('0', '0')], a: 0,
    why: b('Compiler: 1 dòng C → nhiều lệnh assembly. Assembler: 1 lệnh assembly → 1 lệnh máy.', 'Compiler: 1 line of C → many assembly instructions. Assembler: 1 assembly instruction → 1 machine instruction.'),
  },
  // Chương 2
  {
    ch: '2',
    q: b('Thanh ghi nào chứa ĐỊA CHỈ của lệnh sắp được lấy?', 'Which register holds the ADDRESS of the next instruction to fetch?'),
    opts: same('IR', 'PC', 'AC', 'sp'), a: 1,
    why: b('PC (Program Counter) chứa địa chỉ; IR chứa nội dung lệnh vừa lấy về.', 'PC (Program Counter) holds the address; IR holds the contents of the instruction just fetched.'),
  },
  {
    ch: '2',
    q: b('CPU kiểm tra có ngắt hay không vào lúc nào?', 'When does the CPU check whether an interrupt is pending?'),
    opts: [b('Giữa pha fetch', 'In the middle of the fetch phase'), b('Cuối mỗi chu trình lệnh', 'At the end of every instruction cycle'), b('Chỉ khi chương trình kết thúc', 'Only when the program ends'), b('Mỗi khi gọi hàm', 'Every time a function is called')], a: 1,
    why: b('Ngắt được kiểm tra ở cuối mỗi chu trình lệnh, sau khi xong pha execute.', 'Interrupts are checked at the end of every instruction cycle, after the execute phase.'),
  },
  {
    ch: '2',
    q: b('Chia cho 0 khi đang chạy lệnh tạo ra loại ngắt nào?', 'Dividing by 0 while running an instruction causes which kind of interrupt?'),
    opts: [b('Timer', 'Timer'), b('I/O', 'I/O'), b('Phần mềm / ngoại lệ (exception)', 'Program / exception'), b('Lỗi phần cứng', 'Hardware failure')], a: 2,
    why: b('Ngắt do chương trình (chia 0, tràn số…) còn gọi là exception.', 'Interrupts caused by the program itself (division by 0, overflow…) are also called exceptions.'),
  },
  {
    ch: '2',
    q: b('Vì sao dùng ngắt thay cho polling khi đọc bàn phím?', 'Why use interrupts instead of polling to read the keyboard?'),
    opts: [
      b('Ngắt tốn ít CPU hơn vì CPU không phải liên tục hỏi', 'Interrupts use less CPU time because the CPU does not have to keep asking'),
      b('Polling không đọc được phím', 'Polling cannot read keys'),
      b('Ngắt nhanh hơn clock', 'Interrupts are faster than the clock'),
      b('Bàn phím không hỗ trợ polling', 'Keyboards do not support polling'),
    ], a: 0,
    why: b('Polling bắt CPU hỏi liên tục; với ngắt, thiết bị tự báo khi có sự kiện, CPU rảnh làm việc khác.', 'Polling makes the CPU ask over and over; with interrupts the device reports when something happens, leaving the CPU free for other work.'),
  },
  {
    ch: '2',
    q: b('DMA là gì?', 'What is DMA?'),
    opts: [b('Bộ nhớ chỉ đọc', 'Read-only memory'), b('Bộ điều khiển chuyển dữ liệu thẳng giữa I/O và bộ nhớ', 'A controller that moves data directly between I/O and memory'), b('Một loại thanh ghi', 'A kind of register'), b('Chế độ ngắt lồng nhau', 'A nested-interrupt mode')], a: 1,
    why: b('Direct Memory Access: DMAC chuyển dữ liệu I/O ↔ bộ nhớ, CPU không phải trực tiếp làm.', 'Direct Memory Access: the DMAC moves data I/O ↔ memory so the CPU does not have to do it itself.'),
  },
  {
    ch: '2',
    q: b('Trong máy giả định (opcode 4 bit, địa chỉ 12 bit), lệnh 0x5941 làm gì?', 'In the hypothetical machine (4-bit opcode, 12-bit address), what does instruction 0x5941 do?'),
    opts: [b('Nạp AC từ ô 941', 'Load AC from word 941'), b('Cộng ô 941 vào AC', 'Add word 941 to AC'), b('Lưu AC vào ô 941', 'Store AC to word 941'), b('Nhảy tới 941', 'Jump to 941')], a: 1,
    why: b('Chữ số đầu 5 = opcode cộng, 941 = địa chỉ.', 'The first digit 5 = the add opcode, 941 = the address.'),
  },
  // Chương 3
  {
    ch: '3',
    q: b('s1 = 6. Sau 3 lệnh dưới, s1 = ?', 's1 = 6. After the 3 instructions below, s1 = ?'),
    code: 'addi s2, s1, 3\naddi s1, s1, -2\nsub  s1, s2, s1',
    opts: same('4', '5', '9', '-5'), a: 1,
    why: b('s2 = 9; s1 = 4; s1 = 9 − 4 = 5.', 's2 = 9; s1 = 4; s1 = 9 − 4 = 5.'),
  },
  {
    ch: '3',
    q: b('A là mảng int, x13 = &A[0]. Đoạn code tương đương câu C nào?', 'A is an int array, x13 = &A[0]. Which C statement is this code equivalent to?'),
    code: 'lw   x10, 12(x13)\naddi x12, x10, 10\nsw   x12, 40(x13)',
    opts: same('A[12] = A[40] + 10', 'A[10] = A[3] + 10', 'A[3] = A[10] + 10', 'A[40] = A[12] + 10'), a: 1,
    why: b('Offset byte / 4 = chỉ số: 12/4 = 3, 40/4 = 10.', 'Byte offset / 4 = index: 12/4 = 3, 40/4 = 10.'),
  },
  {
    ch: '3',
    q: b('s3 = 0x12004094. Lệnh lw t0, 24(s3) đọc ở địa chỉ nào?', 's3 = 0x12004094. Which address does lw t0, 24(s3) read from?'),
    opts: same('0x120040AC', '0x120040B8', '0x12004118', '0x12004094'), a: 0,
    why: b('24 = 0x18; 0x94 + 0x18 = 0xAC.', '24 = 0x18; 0x94 + 0x18 = 0xAC.'),
  },
  {
    ch: '3',
    q: b('Bộ nhớ RISC-V: X = 0x68, X+1 = 0x1B, X+2 = 0x5D, X+3 = 0xFA. Word tại X là?', 'RISC-V memory: X = 0x68, X+1 = 0x1B, X+2 = 0x5D, X+3 = 0xFA. What is the word at X?'),
    opts: same('0x681B5DFA', '0xFA5D1B68', '0x1B68FA5D', '0x5DFA681B'), a: 1,
    why: b('Little-endian: byte ở địa chỉ thấp nhất là byte thấp nhất → đọc từ X+3 xuống X.', 'Little-endian: the byte at the lowest address is the least significant byte → read from X+3 down to X.'),
  },
  {
    ch: '3',
    q: b('Thanh ghi nào luôn bằng 0?', 'Which register is always 0?'),
    opts: same('x1 (ra)', 'x2 (sp)', 'x0 (zero)', 'x10 (a0)'), a: 2,
    why: b('x0 nối cứng với 0, ghi vào cũng không đổi.', 'x0 is hard-wired to 0; writing to it changes nothing.'),
  },
  {
    ch: '3',
    q: b('Theo quy ước, hàm bị gọi (callee) PHẢI giữ nguyên các thanh ghi nào?', 'By convention, which registers MUST the called function (callee) preserve?'),
    opts: same('t0–t6', 'a0–a7', 's0–s11, sp', 'ra'), a: 2,
    why: b('Callee-saved: sp, s0–s11. Caller tự lo t, a, ra.', 'Callee-saved: sp, s0–s11. The caller takes care of t, a and ra itself.'),
  },
  {
    ch: '3',
    q: b('Lệnh jal ra, func làm gì?', 'What does jal ra, func do?'),
    opts: [b('Chỉ nhảy tới func', 'Just jumps to func'), b('Lưu PC+4 vào ra rồi nhảy tới func', 'Saves PC+4 in ra, then jumps to func'), b('Quay về từ hàm', 'Returns from a function'), b('Cất ra lên stack', 'Pushes ra onto the stack')], a: 1,
    why: b('jal = jump and link: ghi địa chỉ lệnh kế tiếp vào rd (ra) rồi nhảy.', 'jal = jump and link: it writes the address of the next instruction into rd (ra), then jumps.'),
  },
  {
    ch: '3',
    q: b('Vì sao hàm đệ quy fact phải cất ra lên stack?', 'Why must the recursive function fact save ra on the stack?'),
    opts: [b('Vì ra là thanh ghi tạm', 'Because ra is a temporary register'), b('Vì lệnh jal gọi đệ quy sẽ ghi đè ra', 'Because the recursive jal call overwrites ra'), b('Vì stack nhanh hơn thanh ghi', 'Because the stack is faster than registers'), b('Không cần cất', 'It does not need to')], a: 1,
    why: b('Mỗi lần jal ghi đè ra; không cất thì mất đường quay về của lần gọi trước.', 'Every jal overwrites ra; without saving it, the way back to the previous call is lost.'),
  },
  {
    ch: '3',
    q: b('sw x5, 32(x30) thuộc định dạng nào và x5 nằm ở trường nào?', 'Which format is sw x5, 32(x30), and which field holds x5?'),
    opts: same('I-type, rd', 'S-type, rs2', 'S-type, rs1', 'R-type, rs2'), a: 1,
    why: b('Store dùng S-type; thanh ghi dữ liệu là rs2, thanh ghi địa chỉ cơ sở là rs1.', 'Stores use S-type; the data register is rs2 and the base address register is rs1.'),
  },
  {
    ch: '3',
    q: b('Mã máy của add x9, x20, x21 là?', 'What is the machine code of add x9, x20, x21?'),
    opts: same('0x015A04B3', '0x014A84B3', '0x0004A283', '0x00130313'), a: 0,
    why: b('funct7 0000000 | rs2 10101 | rs1 10100 | funct3 000 | rd 01001 | opcode 0110011.', 'funct7 0000000 | rs2 10101 | rs1 10100 | funct3 000 | rd 01001 | opcode 0110011.'),
  },
  {
    ch: '3',
    q: b('Vì sao RISC-V không có lệnh subi?', 'Why does RISC-V have no subi instruction?'),
    opts: [b('Vì không trừ được hằng số', 'Because you cannot subtract a constant'), b('Vì addi với số âm làm được việc đó', 'Because addi with a negative number does the job'), b('Vì subi chậm', 'Because subi is slow'), b('Vì thiếu opcode', 'Because it ran out of opcodes')], a: 1,
    why: b('addi t0, t0, -5 chính là trừ 5. Bớt lệnh thì phần cứng đơn giản hơn.', 'addi t0, t0, -5 is exactly “subtract 5”. Fewer instructions means simpler hardware.'),
  },
  {
    ch: '3',
    q: b('Muốn in số nguyên trong a0 bằng ecall, a7 phải bằng?', 'To print the integer in a0 with ecall, what must a7 be?'),
    opts: same('1', '4', '5', '10'), a: 0,
    why: b('1 = in số nguyên, 4 = in chuỗi, 5 = đọc số nguyên, 10 = kết thúc.', '1 = print integer, 4 = print string, 5 = read integer, 10 = exit.'),
  },
  {
    ch: '3',
    q: b(
      'Với .data bắt đầu ở 0x10010000: arr16 .space 16, arr .byte a,b,c, st1 .asciz "abcd", X1 .word ... X1 ở địa chỉ nào?',
      'With .data starting at 0x10010000: arr16 .space 16, arr .byte a,b,c, st1 .asciz "abcd", X1 .word ... What is the address of X1?',
    ),
    opts: same('0x10010017', '0x10010018', '0x10010014', '0x1001001C'), a: 1,
    why: b('16 + 3 + 5 = 24 byte → 0x10010018, đã chia hết cho 4 nên không cần đệm.', '16 + 3 + 5 = 24 bytes → 0x10010018, already divisible by 4, so no padding is needed.'),
  },
  // Chương 4
  {
    ch: '4',
    q: b('−100 dạng bù 2 16 bit là?', "What is −100 in 16-bit two's complement?"),
    opts: same('1000 0000 0110 0100', '1111 1111 1001 1011', '1111 1111 1001 1100', '0000 0000 0110 0100'), a: 2,
    why: b('100 = 0000 0000 0110 0100 → đảo bit 1111 1111 1001 1011 → +1 = 1111 1111 1001 1100.', '100 = 0000 0000 0110 0100 → flip the bits 1111 1111 1001 1011 → +1 = 1111 1111 1001 1100.'),
  },
  {
    ch: '4',
    q: b('8 bit có dấu: 122 + 8 = ?', '8-bit signed: 122 + 8 = ?'),
    opts: [b('130', '130'), b('−126 (tràn)', '−126 (overflow)'), b('−130', '−130'), b('2', '2')], a: 1,
    why: b('130 > 127 nên tràn; 1000 0010 đọc có dấu là −126.', '130 > 127, so it overflows; 1000 0010 read as signed is −126.'),
  },
  {
    ch: '4',
    q: b('Phép nào sau đây KHÔNG BAO GIỜ tràn?', 'Which of these can NEVER overflow?'),
    opts: [b('Cộng hai số dương', 'Adding two positive numbers'), b('Cộng hai số âm', 'Adding two negative numbers'), b('Cộng hai số khác dấu', 'Adding two numbers of opposite sign'), b('Trừ số âm khỏi số dương', 'Subtracting a negative number from a positive one')], a: 2,
    why: b('Cộng khác dấu (hoặc trừ cùng dấu) thì kết quả nằm giữa hai số, không thể vượt phạm vi.', 'Adding opposite signs (or subtracting same signs) gives a result between the two numbers, so it cannot leave the range.'),
  },
  {
    ch: '4',
    q: b('Byte y = −20 (0xEC). lbu s3, y cho s3 = ?', 'Byte y = −20 (0xEC). After lbu s3, y, s3 = ?'),
    opts: same('−20', '20', '236', '0xFFFFFFEC'), a: 2,
    why: b('lbu mở rộng bằng 0: 0x000000EC = 236.', 'lbu zero-extends: 0x000000EC = 236.'),
  },
  {
    ch: '4',
    q: b('t0 = 20, t1 = −20. bltu t1, t0, L có nhảy không?', 't0 = 20, t1 = −20. Does bltu t1, t0, L branch?'),
    opts: [b('Có, vì −20 < 20', 'Yes, because −20 < 20'), b('Không, vì 0xFFFFFFEC (không dấu) rất lớn', 'No, because 0xFFFFFFEC (unsigned) is huge'), b('Lỗi', 'It is an error'), b('Tuỳ CPU', 'Depends on the CPU')], a: 1,
    why: b('bltu so sánh không dấu: 4 294 967 276 < 20 là sai.', 'bltu compares unsigned: 4,294,967,276 < 20 is false.'),
  },
  {
    ch: '4',
    q: b('Full adder có A = 1, B = 1, Cin = 1. S và Cout = ?', 'A full adder has A = 1, B = 1, Cin = 1. What are S and Cout?'),
    opts: same('S = 0, Cout = 1', 'S = 1, Cout = 1', 'S = 1, Cout = 0', 'S = 0, Cout = 0'), a: 1,
    why: b('1 + 1 + 1 = 3 = 11₂.', '1 + 1 + 1 = 3 = 11₂.'),
  },
  {
    ch: '4',
    q: b('Nhân hai số 32 bit thì tích đầy đủ có bao nhiêu bit?', 'Multiplying two 32-bit numbers gives a full product of how many bits?'),
    opts: same('32', '33', '64', '1024'), a: 2,
    why: b('n bit × n bit → 2n bit. RISC-V dùng mul (32 bit thấp) + mulh (32 bit cao).', 'n bits × n bits → 2n bits. RISC-V uses mul (low 32 bits) + mulh (high 32 bits).'),
  },
  {
    ch: '4',
    q: b('−7 / 2 bằng lệnh div và rem cho kết quả?', 'What do div and rem give for −7 / 2?'),
    opts: [b('thương −4, dư 1', 'quotient −4, remainder 1'), b('thương −3, dư −1', 'quotient −3, remainder −1'), b('thương −3, dư 1', 'quotient −3, remainder 1'), b('thương 3, dư −1', 'quotient 3, remainder −1')], a: 1,
    why: b('Thương làm tròn về 0; số dư cùng dấu với số bị chia: −3 × 2 + (−1) = −7.', 'The quotient rounds toward 0; the remainder has the sign of the dividend: −3 × 2 + (−1) = −7.'),
  },
  {
    ch: '4',
    q: b('IEEE 754 single: 0x3F800000 là số nào?', 'IEEE 754 single: which number is 0x3F800000?'),
    opts: same('0.5', '1.0', '2.0', '−1.0'), a: 1,
    why: b('S = 0, E = 127 → mũ 0, F = 0 → 1.0 × 2⁰.', 'S = 0, E = 127 → exponent 0, F = 0 → 1.0 × 2⁰.'),
  },
  {
    ch: '4',
    q: b('9.6875 ở IEEE 754 single là?', 'What is 9.6875 in IEEE 754 single precision?'),
    opts: same('0x411B0000', '0x41180000', '0xC11B0000', '0x419B0000'), a: 0,
    why: b('1001.1011₂ = 1.0011011 × 2³; E = 130 = 1000 0010; F = 0011011…', '1001.1011₂ = 1.0011011 × 2³; E = 130 = 1000 0010; F = 0011011…'),
  },
  {
    ch: '4',
    q: b('E = 1111 1111 và F ≠ 0 nghĩa là gì?', 'What does E = 1111 1111 with F ≠ 0 mean?'),
    opts: [b('Vô cực', 'Infinity'), b('Số 0', 'Zero'), b('NaN', 'NaN'), b('Số không chuẩn hoá', 'A denormalized number')], a: 2,
    why: b('E toàn 1: F = 0 là ±∞, F ≠ 0 là NaN.', 'E all ones: F = 0 means ±∞, F ≠ 0 means NaN.'),
  },
  {
    ch: '4',
    q: b('Khi nhân hai số thực, bước xử lý số mũ là?', 'When multiplying two floating-point numbers, how is the exponent handled?'),
    opts: [b('Lấy mũ lớn hơn', 'Take the larger exponent'), b('E1 + E2 − 127', 'E1 + E2 − 127'), b('E1 + E2 + 127', 'E1 + E2 + 127'), b('E1 − E2', 'E1 − E2')], a: 1,
    why: b('Cả hai mũ đều đã cộng bias 127, nên tổng phải trừ bớt 127 một lần.', 'Both exponents already include the bias 127, so the sum must subtract 127 once.'),
  },
];
