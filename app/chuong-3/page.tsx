import type { Metadata } from 'next';
import Lesson from '@/components/lesson/Lesson';
import { Formula, Note, Pitfalls, Sec, SelfCheck, Steps, Sub, Table } from '@/components/lesson/Blocks';
import Code from '@/components/lesson/Code';
import Example from '@/components/lesson/Example';
import { L } from '@/components/i18n';
import Encoder from '@/components/widgets/ch3/Encoder';
import Endian from '@/components/widgets/ch3/Endian';
import StructAlign from '@/components/widgets/ch3/StructAlign';
import AddrCalc from '@/components/widgets/ch3/AddrCalc';
import { MemoryLayout, StackPicture } from '@/components/widgets/Figures';

export const metadata: Metadata = { title: 'Chương 3: Tập lệnh RISC-V' };

const REGS: [string, string, string, string, string, string, string][] = [
  ['x0', 'zero', 'Luôn = 0, ghi vào cũng vô ích', 'Always 0; writing to it does nothing', '—', '—', 'g-zero'],
  ['x1', 'ra', 'Địa chỉ quay về (return address)', 'Return address', 'Caller', 'Caller', 'g-sp'],
  ['x2', 'sp', 'Con trỏ ngăn xếp (stack pointer)', 'Stack pointer', 'Callee', 'Callee', 'g-sp'],
  ['x3', 'gp', 'Con trỏ toàn cục', 'Global pointer', '—', '—', 'g-sp'],
  ['x4', 'tp', 'Con trỏ thread', 'Thread pointer', '—', '—', 'g-sp'],
  ['x5–x7', 't0–t2', 'Tạm (temporary)', 'Temporaries', 'Caller', 'Caller', 'g-t'],
  ['x8', 's0 / fp', 'Lưu (saved) / frame pointer', 'Saved / frame pointer', 'Callee', 'Callee', 'g-s'],
  ['x9', 's1', 'Lưu', 'Saved', 'Callee', 'Callee', 'g-s'],
  ['x10–x11', 'a0–a1', 'Tham số + giá trị trả về', 'Arguments + return values', 'Caller', 'Caller', 'g-a'],
  ['x12–x17', 'a2–a7', 'Tham số (a7: số dịch vụ ecall)', 'Arguments (a7: ecall service number)', 'Caller', 'Caller', 'g-a'],
  ['x18–x27', 's2–s11', 'Lưu', 'Saved', 'Callee', 'Callee', 'g-s'],
  ['x28–x31', 't3–t6', 'Tạm', 'Temporaries', 'Caller', 'Caller', 'g-t'],
];

export default function Page() {
  return (
    <Lesson
      step="chuong-3"
      summary={[
        <L key="s1"
          vi={<><b>ISA</b> = “ngôn ngữ” CPU hiểu: danh sách lệnh, thanh ghi, cách mã hoá thành bit. Môn này dùng <b>RISC-V RV32I</b>.</>}
          en={<>The <b>ISA</b> is the “language” the CPU understands: its instructions, its registers, and how instructions are encoded as bits. This course uses <b>RISC-V RV32I</b>.</>} />,
        <L key="s2"
          vi={<>32 thanh ghi x0–x31, mỗi cái 32 bit; <b>x0 luôn = 0</b>. Bộ nhớ đánh địa chỉ theo byte, word = 4 byte, <b>little-endian</b>.</>}
          en={<>32 registers x0–x31, 32 bits each; <b>x0 is always 0</b>. Memory is byte-addressed, a word is 4 bytes, and it is <b>little-endian</b>.</>} />,
        <L key="s3"
          vi={<>Chỉ <code>lw/sw</code> (và các bản byte/half) chạm bộ nhớ: địa chỉ = thanh ghi cơ sở + offset. Mảng int: offset = chỉ số × 4.</>}
          en={<>Only <code>lw/sw</code> (and their byte/half versions) touch memory: address = base register + offset. For an int array, offset = index × 4.</>} />,
        <L key="s4"
          vi={<>Mọi lệnh dài 32 bit, có 6 định dạng <b>R, I, S, B, U, J</b>; opcode luôn ở 7 bit cuối.</>}
          en={<>Every instruction is 32 bits long and uses one of 6 formats: <b>R, I, S, B, U, J</b>; the opcode is always in the lowest 7 bits.</>} />,
        <L key="s5"
          vi={<>Gọi hàm: <code>jal ra, f</code>; quay về: <code>jalr x0, 0(ra)</code>. Tham số a0–a7, kết quả a0. Callee giữ s0–s11 và sp. Stack mọc xuống.</>}
          en={<>Call a function: <code>jal ra, f</code>; return: <code>jalr x0, 0(ra)</code>. Arguments in a0–a7, result in a0. The callee preserves s0–s11 and sp. The stack grows downward.</>} />,
      ]}
      toc={[
        { id: 'isa', title: <L vi="ISA & RISC-V" en="ISA & RISC-V" /> },
        { id: 'toan-hang', title: <L vi="Ba loại toán hạng" en="Three kinds of operands" /> },
        { id: 'lenh', title: <L vi="Các nhóm lệnh" en="Instruction groups" /> },
        { id: 'lenh-gia', title: <L vi="Lệnh giả" en="Pseudo-instructions" /> },
        { id: 'ma-hoa', title: <L vi="Mã hoá lệnh" en="Instruction encoding" /> },
        { id: 'hang-lon', title: <L vi="Hằng lớn & nhảy xa" en="Large constants & long jumps" /> },
        { id: 'cau-truc', title: <L vi="if / switch / for / while" en="if / switch / for / while" /> },
        { id: 'ham', title: <L vi="Hàm & stack" en="Functions & the stack" /> },
        { id: 'chuoi', title: <L vi="Chuỗi & mảng" en="Strings & arrays" /> },
        { id: 'mo-rong', title: <L vi="Mở rộng M, A, F, D, C" en="Extensions M, A, F, D, C" /> },
        { id: 'kiem-tra', title: <L vi="Tự kiểm tra" en="Check yourself" /> },
      ]}
    >
      <Note kind="tip" title={<L vi="Cách học chương này" en="How to study this chapter" />}>
        <p><L
          vi={<>Mở file <b>RISC-V Instruction Set Summary.pdf</b> bên cạnh để tra lệnh. Mỗi khối code có nút <b>▶ Chạy từng bước trong Lab</b>: bấm “Bước” và nhìn thanh ghi đổi màu vàng. Khung dưới bảng lệnh của Lab giải thích lệnh sắp chạy bằng tiếng Việt kèm giá trị thật.</>}
          en={<>Keep <b>RISC-V Instruction Set Summary.pdf</b> open next to you to look up instructions. Every code block has a <b>▶ Step through in the Lab</b> button: press “Step” and watch registers turn yellow as they change. The panel under the Lab&apos;s instruction table explains the next instruction in plain words, with the real values.</>} /></p>
      </Note>

      <Sec id="isa" title={<L vi="ISA và RISC-V" en="The ISA and RISC-V" />} kicker="3.1">
        <p><L
          vi={<>Muốn ra lệnh cho máy tính thì phải nói ngôn ngữ của nó. <b>RISC-V</b> là tập lệnh <b>mở, miễn phí bản quyền</b>, ra đời ở UC Berkeley năm 2010, nay do RISC-V International quản lý. Nó thuộc dòng <b>RISC</b> (lệnh đơn giản, đều đặn), khác x86 (CISC, lệnh phức tạp).</>}
          en={<>To give a computer orders, you have to speak its language. <b>RISC-V</b> is an <b>open, royalty-free</b> instruction set, created at UC Berkeley in 2010 and now managed by RISC-V International. It belongs to the <b>RISC</b> family (simple, regular instructions), unlike x86 (CISC, complex instructions).</>} /></p>
        <Code lang="text"
          code={`add  a, b, c     # a ← b + c
│    │           └── comment (sau dấu #)
│    └── toán hạng: đích trước, nguồn sau
└── phép toán`}
          codeEn={`add  a, b, c     # a ← b + c
│    │           └── comment (after #)
│    └── operands: destination first, then sources
└── operation`} />
        <p><L
          vi={<>Ví dụ <code>f = (g + h) − (i + j)</code> cần 3 lệnh, mỗi lệnh đúng 3 toán hạng:</>}
          en={<>For example, <code>f = (g + h) − (i + j)</code> takes 3 instructions, each with exactly 3 operands:</>} /></p>
        <Code run={false} code={`add t0, g, h     # t0 = g + h
add t1, i, j     # t1 = i + j
sub f, t0, t1    # f = t0 - t1`} />
        <Note kind="key" title={<L vi="Nguyên tắc thiết kế 1: Đơn giản ưu tiên sự đều đặn" en="Design principle 1: Simplicity favors regularity" />}>
          <p><L
            vi="Sao không có lệnh 4–5 toán hạng cho gọn? Vì lệnh nào cũng đúng 3 toán hạng thì phần cứng đơn giản hơn nhiều."
            en="Why not have 4- or 5-operand instructions to save space? Because when every instruction has exactly 3 operands, the hardware is much simpler." /></p>
        </Note>
      </Sec>

      <Sec id="toan-hang" title={<L vi="Ba loại toán hạng" en="Three kinds of operands" />} kicker="3.2">
        <Sub title={<L vi="a) Thanh ghi — nhanh nhất" en="a) Registers — the fastest" />}>
          <p><L
            vi={<>32 thanh ghi, mỗi cái 32 bit, mỗi cái có địa chỉ 5 bit (2⁵ = 32). Sao chỉ 32, không nhiều hơn? <b>Nguyên tắc 2: Nhỏ thì nhanh.</b> Bảng dưới cần học thuộc (có ở trang 1 file RISC-V Summary):</>}
            en={<>32 registers, 32 bits each, each with a 5-bit address (2⁵ = 32). Why only 32 and not more? <b>Principle 2: Smaller is faster.</b> Learn the table below by heart (it is on page 1 of the RISC-V Summary):</>} /></p>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr>
                <th><L vi="Thanh ghi" en="Register" /></th>
                <th><L vi="Tên ABI" en="ABI name" /></th>
                <th><L vi="Công dụng" en="Use" /></th>
                <th><L vi="Ai giữ khi gọi hàm" en="Who preserves it across calls" /></th>
              </tr></thead>
              <tbody>
                {REGS.map(([x, n, uVi, uEn, wVi, wEn, g]) => (
                  <tr key={x}><td className="mono">{x}</td><td className="mono"><span className={`reg-chip ${g}`}>{n}</span></td><td><L vi={uVi} en={uEn} /></td><td><L vi={wVi} en={wEn} /></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <Note kind="tip"><p><L
            vi={<>Mẹo nhớ: <b>t</b> = temporary (hàm khác được phép phá), <b>s</b> = saved (hàm khác phải trả lại nguyên vẹn), <b>a</b> = argument. Đừng nhầm s1 = <b>x9</b> với x1 = ra.</>}
            en={<>Memory trick: <b>t</b> = temporary (other functions may overwrite it), <b>s</b> = saved (other functions must give it back unchanged), <b>a</b> = argument. Don&apos;t mix up s1 = <b>x9</b> with x1 = ra.</>} /></p></Note>
        </Sub>
        <Sub title={<L vi="b) Bộ nhớ — to nhưng chậm" en="b) Memory — big but slow" />}>
          <p><L
            vi={<>RISC-V là máy <b>load/store</b>: muốn tính với dữ liệu trong bộ nhớ thì phải <b>nạp vào thanh ghi trước</b>, tính xong <b>cất lại</b>. Bộ nhớ chậm hơn thanh ghi 100–500 lần.</>}
            en={<>RISC-V is a <b>load/store</b> machine: to compute with data in memory you must first <b>load it into a register</b>, then <b>store it back</b> when done. Memory is 100–500 times slower than registers.</>} /></p>
          <ul>
            <li><L
              vi={<>Đánh địa chỉ theo <b>byte</b>. Word thứ n nằm ở địa chỉ <b>4 × n</b>.</>}
              en={<>Memory is addressed by <b>byte</b>. Word number n is at address <b>4 × n</b>.</>} /></li>
            <li><L
              vi={<><b>Căn lề</b>: dữ liệu k byte nên đặt ở địa chỉ chia hết cho k. RISC-V không bắt buộc nhưng rất nên (compiler tự lo; RARS và Lab ở đây báo lỗi nếu <code>lw</code> lệch).</>}
              en={<><b>Alignment</b>: k-byte data should sit at an address divisible by k. RISC-V doesn&apos;t require it but strongly recommends it (the compiler handles it; RARS and this Lab report an error if <code>lw</code> is misaligned).</>} /></li>
          </ul>
          <StructAlign />
          <p><L
            vi={<><b>Thứ tự byte (endianness):</b> big-endian đặt byte <b>cao</b> ở địa chỉ thấp; little-endian (<b>RISC-V</b>, x86, MIPS) đặt byte <b>thấp</b> ở địa chỉ thấp.</>}
            en={<><b>Byte order (endianness):</b> big-endian puts the <b>most significant</b> byte at the lowest address; little-endian (<b>RISC-V</b>, x86, MIPS) puts the <b>least significant</b> byte at the lowest address.</>} /></p>
          <Endian />
        </Sub>
        <Sub title={<L vi="c) Hằng số (immediate) — nằm ngay trong lệnh" en="c) Immediates — constants inside the instruction" />}>
          <p><L
            vi={<>Ví dụ <code>x = y + 10</code>: số 10 được mã hoá thẳng vào lệnh <code>addi</code>. Nhanh (không phải đọc thanh ghi hay bộ nhớ), nhưng cố định, không đổi lúc chạy. Hằng số dùng nhiều nhất là 0, nên có thanh ghi <b>x0 = 0</b> (làm nhanh trường hợp phổ biến).</>}
            en={<>For example <code>x = y + 10</code>: the number 10 is encoded right into the <code>addi</code> instruction. It is fast (no register or memory read), but fixed — it can&apos;t change at run time. The most common constant is 0, which is why there is a register <b>x0 = 0</b> (make the common case fast).</>} /></p>
        </Sub>
      </Sec>

      <Sec id="lenh" title={<L vi="Các nhóm lệnh cơ bản (RV32I)" en="Basic instruction groups (RV32I)" />} kicker="3.3">
        <Sub title={<L vi="Số học" en="Arithmetic" />}>
          <Code run={false}
            code={`add  rd, rs1, rs2    # rd = rs1 + rs2
sub  rd, rs1, rs2    # rd = rs1 - rs2
addi rd, rs1, imm    # rd = rs1 + imm  (imm 12 bit có dấu: -2048..2047)`}
            codeEn={`add  rd, rs1, rs2    # rd = rs1 + rs2
sub  rd, rs1, rs2    # rd = rs1 - rs2
addi rd, rs1, imm    # rd = rs1 + imm  (imm is 12-bit signed: -2048..2047)`} />
          <p><L
            vi={<><code>rd</code> = thanh ghi đích, <code>rs1</code>, <code>rs2</code> = thanh ghi nguồn. <b>Sao không có subi?</b> Vì <code>addi</code> với số âm là đủ.</>}
            en={<><code>rd</code> = destination register, <code>rs1</code>, <code>rs2</code> = source registers. <b>Why is there no subi?</b> Because <code>addi</code> with a negative number does the job.</>} /></p>
          <Example id="arith" title={<L vi="Slide 24: s1 = 6, sau 3 lệnh s1 = ?" en="Slide 24: s1 = 6; what is s1 after 3 instructions?" />} />
        </Sub>
        <Sub title={<L vi="Logic và dịch bit" en="Logic and shifts" />}>
          <Code run={false}
            code={`and  rd, rs1, rs2  |  andi rd, rs1, imm
or   rd, rs1, rs2  |  ori  rd, rs1, imm
xor  rd, rs1, rs2  |  xori rd, rs1, imm
sll  rd, rs1, rs2  # dịch trái, thêm 0 bên phải        = nhân 2^rs2
srl  rd, rs1, rs2  # dịch phải logic, thêm 0 bên trái   = chia (không dấu)
sra  rd, rs1, rs2  # dịch phải số học, giữ bit dấu      = chia (có dấu)
slli / srli / srai # bản dùng hằng số`}
            codeEn={`and  rd, rs1, rs2  |  andi rd, rs1, imm
or   rd, rs1, rs2  |  ori  rd, rs1, imm
xor  rd, rs1, rs2  |  xori rd, rs1, imm
sll  rd, rs1, rs2  # shift left, fill 0s on the right        = multiply by 2^rs2
srl  rd, rs1, rs2  # logical shift right, fill 0s on the left = divide (unsigned)
sra  rd, rs1, rs2  # arithmetic shift right, keep sign bit    = divide (signed)
slli / srli / srai # immediate versions`} />
          <Example id="logic" title={<L vi="Slide 26–27: and, or, xor, dịch bit" en="Slides 26–27: and, or, xor, shifts" />} />
          <p><L
            vi={<><code>slli t1, s1, 2</code> (nhân 4) là lệnh dùng nhiều nhất để tính offset mảng int. Mẹo: <code>andi t0, a0, 1</code> lấy bit cuối → biết số chẵn (0) hay lẻ (1).</>}
            en={<><code>slli t1, s1, 2</code> (multiply by 4) is the go-to instruction for computing int array offsets. Trick: <code>andi t0, a0, 1</code> grabs the last bit → tells you whether a number is even (0) or odd (1).</>} /></p>
        </Sub>
        <Sub title={<L vi="Truy cập bộ nhớ" en="Memory access" />}>
          <Code run={false}
            code={`lw rd,  offset(rs1)    # rd ← Mem[rs1 + offset]     (load word)
sw rs2, offset(rs1)    # Mem[rs1 + offset] ← rs2    (store word)
lb / lbu / sb          # 1 byte (lb mở rộng dấu, lbu mở rộng 0)
lh / lhu / sh          # 2 byte`}
            codeEn={`lw rd,  offset(rs1)    # rd ← Mem[rs1 + offset]     (load word)
sw rs2, offset(rs1)    # Mem[rs1 + offset] ← rs2    (store word)
lb / lbu / sb          # 1 byte (lb sign-extends, lbu zero-extends)
lh / lhu / sh          # 2 bytes`} />
          <p><L
            vi={<><b>Sao không có <code>lw rd, imm</code>?</b> Vì imm chỉ 12 bit, không chứa nổi địa chỉ 32 bit. Dùng thanh ghi cơ sở thì truy cập được mảng và con trỏ (địa chỉ thay đổi lúc chạy).</>}
            en={<><b>Why is there no <code>lw rd, imm</code>?</b> Because imm is only 12 bits and can&apos;t hold a 32-bit address. Using a base register also lets you access arrays and pointers (addresses that change at run time).</>} /></p>
          <AddrCalc />
          <Example id="lwarray" title={<L vi="Slide 30: dịch sang C" en="Slide 30: translate to C" />} />
          <p><L
            vi={<>Đáp án: <code>A[10] = A[3] + 10;</code>. Quy tắc: <b>offset (byte) = chỉ số × 4</b> với mảng int.</>}
            en={<>Answer: <code>A[10] = A[3] + 10;</code>. Rule: <b>offset (bytes) = index × 4</b> for an int array.</>} /></p>
        </Sub>
        <Sub title={<L vi="Rẽ nhánh và so sánh" en="Branches and comparisons" />}>
          <Code run={false}
            code={`beq  rs1, rs2, L   # nhảy tới L nếu rs1 == rs2
bne  rs1, rs2, L   # nếu rs1 != rs2
blt  rs1, rs2, L   # nếu rs1 <  rs2 (có dấu)
bge  rs1, rs2, L   # nếu rs1 >= rs2 (có dấu)
bltu / bgeu        # so sánh không dấu
j    L             # nhảy không điều kiện (lệnh giả = jal x0, L)
slt  t0, s0, s1    # t0 = (s0 < s1) ? 1 : 0     (slti, sltu, sltiu)`}
            codeEn={`beq  rs1, rs2, L   # jump to L if rs1 == rs2
bne  rs1, rs2, L   # if rs1 != rs2
blt  rs1, rs2, L   # if rs1 <  rs2 (signed)
bge  rs1, rs2, L   # if rs1 >= rs2 (signed)
bltu / bgeu        # unsigned comparisons
j    L             # unconditional jump (pseudo = jal x0, L)
slt  t0, s0, s1    # t0 = (s0 < s1) ? 1 : 0     (slti, sltu, sltiu)`} />
          <Note kind="key" title={<L vi="Mẹo dịch if" en="Translating if" />}><p><L
            vi={<>Assembly nhảy khi điều kiện <b>ngược lại</b> để bỏ qua thân <code>if</code>. <code>if (i == j) h = i + j;</code> → <code>bne s0, s1, Exit</code> rồi <code>add s3, s0, s1</code>.</>}
            en={<>In assembly you branch on the <b>opposite</b> condition to skip the <code>if</code> body. <code>if (i == j) h = i + j;</code> → <code>bne s0, s1, Exit</code> then <code>add s3, s0, s1</code>.</>} /></p></Note>
          <Example id="branch" title={<L vi="Slide 32: s2 cuối cùng bằng mấy?" en="Slide 32: what is s2 at the end?" />} />
          <Example id="ifelse" title={<L vi="Slide 35: if-else" en="Slide 35: if-else" />} />
          <Note kind="tip" title={<L vi="Khuôn mẫu if-else" en="The if-else pattern" />}><p><L
            vi={<>Kiểm tra điều kiện ngược → nhảy tới <code>else</code>; thân if; <code>j endif</code>; <code>else:</code> thân else; <code>endif:</code>. Quên <code>j endif</code> là chạy luôn cả phần else.</>}
            en={<>Test the opposite condition → jump to <code>else</code>; if body; <code>j endif</code>; <code>else:</code> else body; <code>endif:</code>. Forget <code>j endif</code> and the else part runs too.</>} /></p></Note>
        </Sub>
      </Sec>

      <Sec id="lenh-gia" title={<L vi="Lệnh giả (pseudo-instruction)" en="Pseudo-instructions" />} kicker="3.4">
        <p><L
          vi="Lệnh giả viết cho tiện; assembler tự đổi thành lệnh thật. Trong Lab, cột “Lệnh thật” cho thấy mỗi lệnh giả biến thành gì."
          en="Pseudo-instructions are shortcuts; the assembler turns them into real instructions. In the Lab, the “Real instruction” column shows what each pseudo-instruction becomes." /></p>
        <Table
          head={[<L key="h1" vi="Lệnh giả" en="Pseudo-instruction" />, <L key="h2" vi="Thật ra là" en="Really is" />, <L key="h3" vi="Ý nghĩa" en="Meaning" />]}
          mono={[0, 1]}
          rows={[
            [<L key="a" vi="li rd, số" en="li rd, number" />, <L key="b" vi="addi (hoặc lui + addi)" en="addi (or lui + addi)" />, <L key="c" vi="Nạp hằng số" en="Load a constant" />],
            [<L key="a" vi="la rd, nhãn" en="la rd, label" />, 'auipc + addi', <L key="c" vi="Nạp địa chỉ của biến" en="Load a variable's address" />],
            ['mv rd, rs', 'addi rd, rs, 0', <L key="c" vi="Chép thanh ghi" en="Copy a register" />],
            ['j L', 'jal x0, L', <L key="c" vi="Nhảy" en="Jump" />],
            ['jr rs', 'jalr x0, 0(rs)', <L key="c" vi="Nhảy tới địa chỉ trong rs" en="Jump to the address in rs" />],
            ['ret', 'jalr x0, 0(ra)', <L key="c" vi="Quay về từ hàm" en="Return from a function" />],
            ['nop', 'addi x0, x0, 0', <L key="c" vi="Không làm gì" en="Do nothing" />],
            ['neg rd, rs', 'sub rd, x0, rs', <L key="c" vi="Đổi dấu" en="Negate" />],
            ['not rd, rs', 'xori rd, rs, -1', <L key="c" vi="Đảo bit" en="Flip all bits" />],
            ['bgt / ble / beqz / bnez', 'blt / bge / beq / bne', <L key="c" vi="Đổi thứ tự hoặc so với x0" en="Swap operands or compare with x0" />],
          ]}
        />
      </Sec>

      <Sec id="ma-hoa" title={<L vi="Mã hoá lệnh thành bit" en="Encoding instructions as bits" />} kicker="3.5">
        <p><L
          vi={<>Mọi lệnh RV32I dài <b>32 bit</b>, có 6 định dạng. Sao không 1 định dạng hay 20? <b>Nguyên tắc 3: Thiết kế tốt cần thoả hiệp tốt.</b></>}
          en={<>Every RV32I instruction is <b>32 bits</b> long and uses one of 6 formats. Why not 1 format, or 20? <b>Principle 3: Good design demands good compromises.</b></>} /></p>
        <Code lang="text" code={`Bit:     31        25 24    20 19    15 14  12 11       7 6       0
R-type: [  funct7   ][  rs2  ][  rs1  ][funct3][   rd    ][ opcode ]
I-type: [      imm[11:0]     ][  rs1  ][funct3][   rd    ][ opcode ]
S-type: [ imm[11:5] ][  rs2  ][  rs1  ][funct3][imm[4:0] ][ opcode ]
B-type: [imm[12|10:5]][ rs2  ][  rs1  ][funct3][imm[4:1|11]][opcode]
U-type: [           imm[31:12]               ][   rd    ][ opcode ]
J-type: [    imm[20|10:1|11|19:12]           ][   rd    ][ opcode ]
            7 bit      5 bit    5 bit   3 bit    5 bit     7 bit`} />
        <Table
          head={[<L key="h1" vi="Định dạng" en="Format" />, <L key="h2" vi="Dùng cho" en="Used for" />, <L key="h3" vi="Ví dụ" en="Examples" />]}
          rows={[
            ['R', <L key="b" vi="3 thanh ghi" en="3 registers" />, 'add, sub, and, or, xor, sll, slt, mul'],
            ['I', <L key="b" vi="2 thanh ghi + hằng 12 bit" en="2 registers + 12-bit constant" />, 'addi, andi, slli, lw, lb, jalr'],
            ['S', <L key="b" vi="Store (không có rd)" en="Stores (no rd)" />, 'sw, sh, sb'],
            ['B', <L key="b" vi="Rẽ nhánh" en="Branches" />, 'beq, bne, blt, bge'],
            ['U', <L key="b" vi="Hằng 20 bit phía trên" en="Upper 20-bit constant" />, 'lui, auipc'],
            ['J', <L key="b" vi="Nhảy xa" en="Long jumps" />, 'jal'],
          ]}
        />
        <ul>
          <li><L
            vi="opcode, rd, rs1, rs2, funct3 luôn ở cùng vị trí → phần cứng giải mã nhanh."
            en="opcode, rd, rs1, rs2 and funct3 are always in the same place → the hardware can decode quickly." /></li>
          <li><L
            vi="S-type không cần rd nên dùng chỗ đó chứa 5 bit thấp của imm."
            en="S-type has no rd, so that spot holds the low 5 bits of imm." /></li>
          <li><L
            vi="B-type: imm 13 bit nhưng bit 0 luôn = 0 (địa chỉ lệnh luôn chẵn) nên chỉ lưu imm[12:1]; bit được xáo để giữ vị trí giống S-type và bit dấu luôn ở bit 31."
            en="B-type: imm is 13 bits but bit 0 is always 0 (instruction addresses are always even), so only imm[12:1] is stored; the bits are shuffled to match S-type positions and keep the sign bit at bit 31." /></li>
        </ul>
        <Steps items={[
          <L key="1" vi="Xác định định dạng (R/I/S/B/U/J)" en="Find the format (R/I/S/B/U/J)" />,
          <L key="2" vi="Đổi tên thanh ghi ra số (t0 = x5, s1 = x9…)" en="Turn register names into numbers (t0 = x5, s1 = x9…)" />,
          <L key="3" vi="Tra opcode / funct3 / funct7 (bảng dưới hoặc file RISC-V Summary)" en="Look up opcode / funct3 / funct7 (table below or the RISC-V Summary)" />,
          <L key="4" vi="Điền vào từng ô đúng số bit, ghép lại, gom 4 bit thành hex" en="Fill each field with the right number of bits, join them, group by 4 bits into hex" />,
        ]} />
        <Encoder />
        <Table
          head={[<L key="h1" vi="Lệnh" en="Instruction" />, <L key="h2" vi="Dạng" en="Format" />, 'opcode', 'funct3', 'funct7']}
          mono={[0, 2, 3, 4]}
          rows={[
            ['add / sub', 'R', '0110011', '000', '0000000 / 0100000'],
            ['and / or / xor', 'R', '0110011', '111 / 110 / 100', '0000000'],
            ['sll / srl / sra', 'R', '0110011', '001 / 101 / 101', '0000000 / 0000000 / 0100000'],
            ['slt', 'R', '0110011', '010', '0000000'],
            ['addi', 'I', '0010011', '000', '—'],
            ['lw / lb / lbu', 'I', '0000011', '010 / 000 / 100', '—'],
            ['sw', 'S', '0100011', '010', '—'],
            ['beq / bne / blt / bge', 'B', '1100011', '000 / 001 / 100 / 101', '—'],
            ['jal', 'J', '1101111', '—', '—'],
            ['jalr', 'I', '1100111', '000', '—'],
            ['lui', 'U', '0110111', '—', '—'],
          ]}
          caption={<L vi="Bảng opcode hay dùng" en="Common opcodes" />}
        />
        <Note kind="warn"><p><L
          vi={<>Bài 3.4 <code>sw x5, 32(x30)</code>: <b>x5 là rs2</b> (dữ liệu cần cất), <b>x30 là rs1</b> (địa chỉ cơ sở). Kết quả: <code>0x025F2023</code>. Kiểm tra bằng widget ở trên.</>}
          en={<>Exercise 3.4 <code>sw x5, 32(x30)</code>: <b>x5 is rs2</b> (the data to store), <b>x30 is rs1</b> (the base address). Result: <code>0x025F2023</code>. Check it with the widget above.</>} /></p></Note>
      </Sec>

      <Sec id="hang-lon" title={<L vi="Hằng số lớn và nhảy xa" en="Large constants and long jumps" />} kicker="3.6">
        <p><L
          vi={<>Lệnh chỉ dài 32 bit nên không nhét được hằng 32 bit. Giải pháp: 2 lệnh. <code>lui</code> nạp 20 bit cao, <code>addi</code> cộng 12 bit thấp. Viết <code>li</code> thì assembler tự làm.</>}
          en={<>An instruction is only 32 bits, so a 32-bit constant can&apos;t fit inside it. The fix: 2 instructions. <code>lui</code> loads the upper 20 bits, <code>addi</code> adds the lower 12. Write <code>li</code> and the assembler does it for you.</>} /></p>
        <Example id="widei" />
        <Note kind="warn"><p><L
          vi={<><code>addi</code> mở rộng dấu 12 bit. Nếu 12 bit thấp ≥ 0x800 thì addi cộng một số âm, nên phần <code>lui</code> phải cộng thêm 1. Xem cột “Lệnh thật” của dòng <code>li s2, 0x12345FFF</code> trong Lab.</>}
          en={<><code>addi</code> sign-extends its 12 bits. If the low 12 bits are ≥ 0x800, addi adds a negative number, so the <code>lui</code> part must be one higher. Look at the “Real instruction” column for <code>li s2, 0x12345FFF</code> in the Lab.</>} /></p></Note>
        <p><L
          vi={<><b>Định địa chỉ tương đối PC:</b> lệnh rẽ nhánh không lưu địa chỉ tuyệt đối mà lưu <b>khoảng cách</b>: PC mới = PC + imm. Đó là cách CPU “nhảy tới nhãn else” (câu hỏi slide 46). Tầm nhảy: nhánh có điều kiện ±4 KB, <code>jal</code> ±1 MB, xa hơn dùng <code>auipc + jalr</code>. Nhánh quá xa thì đảo điều kiện rồi dùng <code>jal</code>.</>}
          en={<><b>PC-relative addressing:</b> a branch doesn&apos;t store an absolute address but a <b>distance</b>: new PC = PC + imm. That is how the CPU “jumps to the else label” (slide 46). Range: conditional branches ±4 KB, <code>jal</code> ±1 MB; farther than that, use <code>auipc + jalr</code>. If a branch target is too far, flip the condition and use <code>jal</code>.</>} /></p>
      </Sec>

      <Sec id="cau-truc" title={<L vi="Cấu trúc lập trình cơ bản" en="Basic control structures" />} kicker="3.7">
        <Example id="switch" title={<L vi="Slide 47: switch-case" en="Slide 47: switch-case" />} />
        <Example id="forsum" title={<L vi="Vòng for: for (i = 0; i < n; i++) sum += A[i]" en="for loop: for (i = 0; i < n; i++) sum += A[i]" />} />
        <Note kind="slide"><p><L
          vi={<>Code vòng for trên slide 48 tăng <code>i</code> <b>trước</b> khi đọc A[i] và dừng khi <code>i == n</code>, nên thực tế cộng A[1]…A[n] (bỏ A[0], đọc lố A[n]). Bản ở trên là bản đúng theo code C. Khuôn mẫu: <b>kiểm tra điều kiện → thân → tăng biến → nhảy lại</b>.</>}
          en={<>The for loop on slide 48 increments <code>i</code> <b>before</b> reading A[i] and stops when <code>i == n</code>, so it actually adds A[1]…A[n] (skipping A[0] and reading past the end at A[n]). The version above matches the C code. Pattern: <b>check the condition → body → increment → jump back</b>.</>} /></p></Note>
        <Example id="while" title={<L vi="Slide 49: while (A[i] == k) i = i + 1" en="Slide 49: while (A[i] == k) i = i + 1" />} />
      </Sec>

      <Sec id="ham" title={<L vi="Hàm (procedure) và stack" en="Functions (procedures) and the stack" />} kicker="3.8">
        <Sub title={<L vi="Ngăn xếp (stack)" en="The stack" />}>
          <p><L
            vi={<>Vùng bộ nhớ hoạt động kiểu <b>LIFO</b> (vào sau ra trước), như chồng đĩa. <b>Đáy ở địa chỉ cao, mọc xuống địa chỉ thấp.</b> <code>sp</code> trỏ vào đỉnh stack.</>}
            en={<>A memory area that works <b>LIFO</b> (last in, first out), like a stack of plates. <b>Its bottom is at a high address and it grows toward lower addresses.</b> <code>sp</code> points at the top of the stack.</>} /></p>
          <StackPicture />
          <Example id="stack" title={<L vi="Push / pop — xem tab Bộ nhớ → Stack trong Lab" en="Push / pop — watch the Memory → Stack tab in the Lab" />} />
        </Sub>
        <Sub title={<L vi="Gọi và quay về" en="Calling and returning" />}>
          <Code run={false}
            code={`jal  ra, Proc      # 1) ra = PC + 4 (địa chỉ lệnh ngay sau)  2) nhảy tới Proc
jalr x0, 0(ra)     # nhảy về địa chỉ trong ra   (viết tắt: jr ra, ret)`}
            codeEn={`jal  ra, Proc      # 1) ra = PC + 4 (address of the next instruction)  2) jump to Proc
jalr x0, 0(ra)     # jump back to the address in ra   (shorthand: jr ra, ret)`} />
          <Note kind="idea"><p><L
            vi={<><code>jal</code> = “đi làm việc khác, nhưng ghi địa chỉ nhà vào ra”. <code>jr ra</code> = “đọc giấy, về nhà”.</>}
            en={<><code>jal</code> = “go do another job, but write your home address in ra”. <code>jr ra</code> = “read the note, go home”.</>} /></p></Note>
          <ul>
            <li><L
              vi={<>Tham số: <b>a0–a7</b> (tối đa 8). Kết quả: <b>a0</b> (và a1).</>}
              en={<>Arguments: <b>a0–a7</b> (up to 8). Result: <b>a0</b> (and a1).</>} /></li>
            <li><L
              vi="Hơn 8 tham số → đẩy vào stack: caller push trước khi gọi, callee đọc từ stack. Theo quy ước C/RISC-V, caller dọn vùng tham số đó."
              en="More than 8 arguments → push them on the stack: the caller pushes before the call, the callee reads them from the stack. By the C/RISC-V convention, the caller cleans up that argument area." /></li>
          </ul>
          <Table
            head={[<L key="h1" vi="Caller (người gọi) tự lưu nếu còn cần" en="Caller-saved (the caller saves them if it still needs them)" />, <L key="h2" vi="Callee (hàm bị gọi) phải giữ nguyên" en="Callee-saved (the called function must preserve them)" />]}
            rows={[['ra, t0–t6, a0–a7', 'sp, s0–s11']]}
            mono={[0, 1]}
          />
          <p><L
            vi={<>Nghĩa là: hàm bị gọi được phép phá t và a. Muốn dùng s0 thì phải cất s0 lên stack đầu hàm và khôi phục cuối hàm. Cất ở đâu? <b>Trên stack.</b></>}
            en={<>In other words: a called function may overwrite t and a registers. If it wants to use s0, it must save s0 on the stack at the start and restore it at the end. Where do you save it? <b>On the stack.</b></>} /></p>
        </Sub>
        <Sub title={<L vi="6 bước thực hiện một hàm" en="The 6 steps of a function call" />}>
          <Steps items={[
            <L key="1" vi="Caller đặt tham số vào a0–a7" en="The caller puts the arguments in a0–a7" />,
            <L key="2" vi="Caller nhảy tới callee (jal)" en="The caller jumps to the callee (jal)" />,
            <L key="3" vi="Callee xin chỗ trên stack, cất thanh ghi cần giữ" en="The callee makes room on the stack and saves the registers it must preserve" />,
            <L key="4" vi="Callee làm việc" en="The callee does its work" />,
            <L key="5" vi="Callee đặt kết quả vào a0 (a1)" en="The callee puts the result in a0 (a1)" />,
            <L key="6" vi="Callee khôi phục thanh ghi, trả stack, quay về (jalr x0, 0(ra))" en="The callee restores the registers, frees the stack space and returns (jalr x0, 0(ra))" />,
          ]} />
          <Example id="leaf" title={<L vi="Slide 62–63: hàm lá leaf_example (kèm main gọi nó)" en="Slides 62–63: the leaf function leaf_example (with a main that calls it)" />} />
        </Sub>
        <Sub title={<L vi="Hàm lồng nhau và đệ quy" en="Nested functions and recursion" />}>
          <p><L
            vi={<><b>Câu hỏi then chốt:</b> khi hàm A gọi hàm B, <code>jal</code> ghi đè <code>ra</code> nên mất địa chỉ quay về của A. Giải pháp: <b>cất ra lên stack trước khi gọi tiếp</b>.</>}
            en={<><b>The key question:</b> when function A calls function B, <code>jal</code> overwrites <code>ra</code>, so A loses its own return address. The fix: <b>save ra on the stack before making the call</b>.</>} /></p>
          <Example id="fact" title={<L vi="Slide 65–66: giai thừa đệ quy (nhập n = 3 rồi chạy từng bước, xem tab Stack)" en="Slides 65–66: recursive factorial (enter n = 3, then step through and watch the Stack tab)" />} />
          <Code lang="text"
            title={<L vi="Chạy tay fact(2)" en="Tracing fact(2) by hand" />}
            code={`fact(2): cất ra_main, n=2. 1>=0 → L1. a0=1, gọi fact(1)
  fact(1): cất ra(→fact2), n=1. 0>=0 → L1. a0=0, gọi fact(0)
    fact(0): cất ra(→fact1), n=0. -1<0 → trả 1
  fact(1): a1=1, n=1 → a0 = 1×1 = 1, về fact(2)
fact(2): a1=1, n=2 → a0 = 2×1 = 2, về main`}
            codeEn={`fact(2): save ra_main, n=2. 1>=0 → L1. a0=1, call fact(1)
  fact(1): save ra(→fact2), n=1. 0>=0 → L1. a0=0, call fact(0)
    fact(0): save ra(→fact1), n=0. -1<0 → return 1
  fact(1): a1=1, n=1 → a0 = 1×1 = 1, back to fact(2)
fact(2): a1=1, n=2 → a0 = 2×1 = 2, back to main`} />
          <p><L
            vi={<>Mỗi lần gọi có một <b>khung (frame)</b> riêng trên stack: tham số thứ 9 trở đi, địa chỉ về, thanh ghi đã cất, biến cục bộ (khi không đủ thanh ghi, ví dụ mảng <code>int v[10]</code>), và tuỳ chọn <code>fp</code> cũ.</>}
            en={<>Each call gets its own <b>stack frame</b>: arguments from the 9th on, the return address, saved registers, local variables (when registers aren&apos;t enough, e.g. an array <code>int v[10]</code>), and optionally the old <code>fp</code>.</>} /></p>
          <Example id="sort" title={<L vi="Slide 71: sort gọi swap — hàm lồng nhau thật sự" en="Slide 71: sort calls swap — real nested functions" />} />
        </Sub>
        <Sub title={<L vi="Tổ chức bộ nhớ của chương trình" en="How a program's memory is laid out" />}>
          <MemoryLayout />
        </Sub>
      </Sec>

      <Sec id="chuoi" title={<L vi="Chuỗi ký tự" en="Strings" />} kicker="3.9">
        <p><L
          vi={<>Chuỗi = mảng byte; chuỗi kiểu C kết thúc bằng byte 0 (<code>&apos;\0&apos;</code>). Mỗi ký tự 1 byte → <b>offset = i, không nhân 4</b>. Dùng <code>lbu</code>/<code>sb</code>.</>}
          en={<>A string is an array of bytes; a C string ends with a 0 byte (<code>&apos;\0&apos;</code>). Each character is 1 byte → <b>offset = i, no multiplying by 4</b>. Use <code>lbu</code>/<code>sb</code>.</>} /></p>
        <Example id="strcpy" title={<L vi="Slide 70: strcpy(x, y)" en="Slide 70: strcpy(x, y)" />} />
      </Sec>

      <Sec id="mo-rong" title={<L vi="Mở rộng tập lệnh" en="Instruction set extensions" />} kicker="3.10">
        <p><L
          vi={<>RV32I chỉ có số nguyên, không có nhân chia. RISC-V thêm các mô-đun; tên như <b>RV32IMAFD</b> nghĩa là RV32I + M + A + F + D.</>}
          en={<>RV32I only handles integers and has no multiply or divide. RISC-V adds modules on top; a name like <b>RV32IMAFD</b> means RV32I + M + A + F + D.</>} /></p>
        <Table
          head={[<L key="h1" vi="Mở rộng" en="Extension" />, <L key="h2" vi="Thêm gì" en="What it adds" />]}
          rows={[
            ['M', <L key="m" vi="Nhân / chia số nguyên: mul, mulh, div, rem… (R-type)" en="Integer multiply / divide: mul, mulh, div, rem… (R-type)" />],
            ['A', <L key="a" vi="Lệnh nguyên tử (atomic): làm trọn vẹn, không bị chen ngang; dùng làm mutex/semaphore cho đa luồng" en="Atomic instructions: done in one piece, never interrupted halfway; used to build mutexes/semaphores for multithreading" />],
            ['F', <L key="f" vi="Số thực 32 bit (float), thêm 32 thanh ghi f0–f31 (Chương 4)" en="32-bit floating point (float), plus 32 registers f0–f31 (Chapter 4)" />],
            ['D', <L key="d" vi="Số thực 64 bit (double)" en="64-bit floating point (double)" />],
            ['C', <L key="c" vi="Lệnh nén 16 bit, code nhỏ hơn 25–30%" en="16-bit compressed instructions, code 25–30% smaller" />],
          ]}
        />
        <Formula caption={<L vi="Bit thấp của lệnh cho biết độ dài: 2 bit cuối khác 11 là lệnh nén 16 bit" en="The low bits tell the length: if the last 2 bits aren't 11, it's a 16-bit compressed instruction" />}>
          xxxxxxxxxxxxxx<b>11</b> = <L vi="lệnh 32 bit" en="32-bit instruction" />
        </Formula>
      </Sec>

      <Sec id="kiem-tra" title={<L vi="Tự kiểm tra" en="Check yourself" />}>
        <Pitfalls items={[
          <L key="1" vi="Quên nhân 4 khi tính địa chỉ mảng int (hoặc nhân 4 nhầm với mảng char)." en="Forgetting to multiply by 4 for an int array (or multiplying by 4 for a char array by mistake)." />,
          <L key="2" vi="Trong sw, thanh ghi đầu là DỮ LIỆU (rs2), không phải địa chỉ." en="In sw, the first register is the DATA (rs2), not the address." />,
          <L key="3" vi="Dịch if mà quên đảo điều kiện; quên j endif cuối thân if." en="Translating an if without flipping the condition; forgetting j endif at the end of the if body." />,
          <L key="4" vi="Hàm gọi hàm khác mà quên cất ra → không quay về được." en="A function that calls another function but forgets to save ra → it can't return." />,
          <L key="5" vi="Quên trả stack (addi sp, sp, +n) trước khi jr ra." en="Forgetting to free the stack (addi sp, sp, +n) before jr ra." />,
          <L key="6" vi="Dùng t0 sau khi gọi hàm mà không cất (hàm khác được quyền phá t0)." en="Using t0 after a call without saving it (the other function is allowed to overwrite t0)." />,
          <L key="7" vi="Ghi đè a7 hoặc a0 trước ecall mà quên." en="Accidentally overwriting a7 or a0 right before ecall." />,
          <L key="8" vi="Mã hoá lệnh: nhầm tên ABI với số thanh ghi (s1 = x9, không phải x1)." en="When encoding: mixing up ABI names and register numbers (s1 = x9, not x1)." />,
        ]} />
        <SelfCheck items={[
          { q: <L vi={<><code>lw t0, -8(sp)</code> đọc ở địa chỉ nào?</>} en={<>Which address does <code>lw t0, -8(sp)</code> read?</>} />, a: 'sp − 8' },
          { q: <L vi="Thanh ghi nào luôn = 0?" en="Which register is always 0?" />, a: 'x0 (zero)' },
          { q: <L vi={<><code>jal</code> làm 2 việc gì?</>} en={<>What two things does <code>jal</code> do?</>} />, a: <L vi="Ghi PC + 4 vào rd (thường là ra), rồi nhảy tới nhãn." en="Writes PC + 4 into rd (usually ra), then jumps to the label." /> },
          { q: <L vi={<>Mã hoá <code>addi x5, x0, 7</code>.</>} en={<>Encode <code>addi x5, x0, 7</code>.</>} />, a: <>imm = 000000000111, rs1 = 00000, funct3 = 000, rd = 00101, opcode = 0010011 → <code>0x00700293</code></> },
          { q: <L vi="Hàm leaf_example có bắt buộc phải cất t0, t1 không?" en="Does leaf_example really have to save t0 and t1?" />, a: <L vi="Không. t0, t1 là thanh ghi tạm, caller tự lo. Slide cất cho “an toàn”. Chỉ s0 là bắt buộc phải cất." en="No. t0 and t1 are temporaries; the caller takes care of them. The slide saves them “to be safe”. Only s0 must be saved." /> },
        ]} />
      </Sec>
    </Lesson>
  );
}
