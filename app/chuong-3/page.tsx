import type { Metadata } from 'next';
import Lesson from '@/components/lesson/Lesson';
import { Formula, Note, Pitfalls, Sec, SelfCheck, Steps, Sub, Table } from '@/components/lesson/Blocks';
import Code from '@/components/lesson/Code';
import Encoder from '@/components/widgets/ch3/Encoder';
import Endian from '@/components/widgets/ch3/Endian';
import StructAlign from '@/components/widgets/ch3/StructAlign';
import AddrCalc from '@/components/widgets/ch3/AddrCalc';
import { MemoryLayout, StackPicture } from '@/components/widgets/Figures';
import { EXAMPLES } from '@/lib/examples.mjs';

export const metadata: Metadata = { title: 'Chương 3: Tập lệnh RISC-V' };
const ex = (id: string) => EXAMPLES.find((e) => e.id === id)!;
const Run = ({ id, title }: { id: string; title?: string }) => <Code code={ex(id).code} title={title ?? ex(id).title} runTitle={ex(id).title} />;

const REGS: [string, string, string, string, string][] = [
  ['x0', 'zero', 'Luôn = 0, ghi vào cũng vô ích', '—', 'g-zero'],
  ['x1', 'ra', 'Địa chỉ quay về (return address)', 'Caller', 'g-sp'],
  ['x2', 'sp', 'Con trỏ ngăn xếp (stack pointer)', 'Callee', 'g-sp'],
  ['x3', 'gp', 'Con trỏ toàn cục', '—', 'g-sp'],
  ['x4', 'tp', 'Con trỏ thread', '—', 'g-sp'],
  ['x5–x7', 't0–t2', 'Tạm (temporary)', 'Caller', 'g-t'],
  ['x8', 's0 / fp', 'Lưu (saved) / frame pointer', 'Callee', 'g-s'],
  ['x9', 's1', 'Lưu', 'Callee', 'g-s'],
  ['x10–x11', 'a0–a1', 'Tham số + giá trị trả về', 'Caller', 'g-a'],
  ['x12–x17', 'a2–a7', 'Tham số (a7: số dịch vụ ecall)', 'Caller', 'g-a'],
  ['x18–x27', 's2–s11', 'Lưu', 'Callee', 'g-s'],
  ['x28–x31', 't3–t6', 'Tạm', 'Caller', 'g-t'],
];

export default function Page() {
  return (
    <Lesson
      step="chuong-3"
      summary={[
        <><b>ISA</b> = “ngôn ngữ” CPU hiểu: danh sách lệnh, thanh ghi, cách mã hoá thành bit. Môn này dùng <b>RISC-V RV32I</b>.</>,
        <>32 thanh ghi x0–x31, mỗi cái 32 bit; <b>x0 luôn = 0</b>. Bộ nhớ đánh địa chỉ theo byte, word = 4 byte, <b>little-endian</b>.</>,
        <>Chỉ <code>lw/sw</code> (và các bản byte/half) chạm bộ nhớ: địa chỉ = thanh ghi cơ sở + offset. Mảng int: offset = chỉ số × 4.</>,
        <>Mọi lệnh dài 32 bit, có 6 định dạng <b>R, I, S, B, U, J</b>; opcode luôn ở 7 bit cuối.</>,
        <>Gọi hàm: <code>jal ra, f</code>; quay về: <code>jalr x0, 0(ra)</code>. Tham số a0–a7, kết quả a0. Callee giữ s0–s11 và sp. Stack mọc xuống.</>,
      ]}
      toc={[
        { id: 'isa', title: 'ISA & RISC-V' },
        { id: 'toan-hang', title: 'Ba loại toán hạng' },
        { id: 'lenh', title: 'Các nhóm lệnh' },
        { id: 'lenh-gia', title: 'Lệnh giả' },
        { id: 'ma-hoa', title: 'Mã hoá lệnh' },
        { id: 'hang-lon', title: 'Hằng lớn & nhảy xa' },
        { id: 'cau-truc', title: 'if / switch / for / while' },
        { id: 'ham', title: 'Hàm & stack' },
        { id: 'chuoi', title: 'Chuỗi & mảng' },
        { id: 'mo-rong', title: 'Mở rộng M, A, F, D, C' },
        { id: 'kiem-tra', title: 'Tự kiểm tra' },
      ]}
    >
      <Note kind="tip" title="Cách học chương này">
        <p>Mở file <b>RISC-V Instruction Set Summary.pdf</b> bên cạnh để tra lệnh. Mỗi khối code có nút <b>▶ Chạy từng bước trong Lab</b>: bấm “Bước” và nhìn thanh ghi đổi màu vàng. Khung dưới bảng lệnh của Lab giải thích lệnh sắp chạy bằng tiếng Việt kèm giá trị thật.</p>
      </Note>

      <Sec id="isa" title="ISA và RISC-V" kicker="3.1">
        <p>Muốn ra lệnh cho máy tính thì phải nói ngôn ngữ của nó. <b>RISC-V</b> là tập lệnh <b>mở, miễn phí bản quyền</b>, ra đời ở UC Berkeley năm 2010, nay do RISC-V International quản lý. Nó thuộc dòng <b>RISC</b> (lệnh đơn giản, đều đặn), khác x86 (CISC, lệnh phức tạp).</p>
        <Code lang="text" code={`add  a, b, c     # a ← b + c
│    │           └── comment (sau dấu #)
│    └── toán hạng: đích trước, nguồn sau
└── phép toán`} />
        <p>Ví dụ <code>f = (g + h) − (i + j)</code> cần 3 lệnh, mỗi lệnh đúng 3 toán hạng:</p>
        <Code run={false} code={`add t0, g, h     # t0 = g + h
add t1, i, j     # t1 = i + j
sub f, t0, t1    # f = t0 - t1`} />
        <Note kind="key" title="Nguyên tắc thiết kế 1: Đơn giản ưu tiên sự đều đặn"><p>Sao không có lệnh 4–5 toán hạng cho gọn? Vì lệnh nào cũng đúng 3 toán hạng thì phần cứng đơn giản hơn nhiều.</p></Note>
      </Sec>

      <Sec id="toan-hang" title="Ba loại toán hạng" kicker="3.2">
        <Sub title="a) Thanh ghi — nhanh nhất">
          <p>32 thanh ghi, mỗi cái 32 bit, mỗi cái có địa chỉ 5 bit (2⁵ = 32). Sao chỉ 32, không nhiều hơn? <b>Nguyên tắc 2: Nhỏ thì nhanh.</b> Bảng dưới cần học thuộc (có ở trang 1 file RISC-V Summary):</p>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Thanh ghi</th><th>Tên ABI</th><th>Công dụng</th><th>Ai giữ khi gọi hàm</th></tr></thead>
              <tbody>
                {REGS.map(([x, n, u, w, g]) => (
                  <tr key={x}><td className="mono">{x}</td><td className="mono"><span className={`reg-chip ${g}`}>{n}</span></td><td>{u}</td><td>{w}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <Note kind="tip"><p>Mẹo nhớ: <b>t</b> = temporary (hàm khác được phép phá), <b>s</b> = saved (hàm khác phải trả lại nguyên vẹn), <b>a</b> = argument. Đừng nhầm s1 = <b>x9</b> với x1 = ra.</p></Note>
        </Sub>
        <Sub title="b) Bộ nhớ — to nhưng chậm">
          <p>RISC-V là máy <b>load/store</b>: muốn tính với dữ liệu trong bộ nhớ thì phải <b>nạp vào thanh ghi trước</b>, tính xong <b>cất lại</b>. Bộ nhớ chậm hơn thanh ghi 100–500 lần.</p>
          <ul>
            <li>Đánh địa chỉ theo <b>byte</b>. Word thứ n nằm ở địa chỉ <b>4 × n</b>.</li>
            <li><b>Căn lề</b>: dữ liệu k byte nên đặt ở địa chỉ chia hết cho k. RISC-V không bắt buộc nhưng rất nên (compiler tự lo; RARS và Lab ở đây báo lỗi nếu <code>lw</code> lệch).</li>
          </ul>
          <StructAlign />
          <p><b>Thứ tự byte (endianness):</b> big-endian đặt byte <b>cao</b> ở địa chỉ thấp; little-endian (<b>RISC-V</b>, x86, MIPS) đặt byte <b>thấp</b> ở địa chỉ thấp.</p>
          <Endian />
        </Sub>
        <Sub title="c) Hằng số (immediate) — nằm ngay trong lệnh">
          <p>Ví dụ <code>x = y + 10</code>: số 10 được mã hoá thẳng vào lệnh <code>addi</code>. Nhanh (không phải đọc thanh ghi hay bộ nhớ), nhưng cố định, không đổi lúc chạy. Hằng số dùng nhiều nhất là 0, nên có thanh ghi <b>x0 = 0</b> (làm nhanh trường hợp phổ biến).</p>
        </Sub>
      </Sec>

      <Sec id="lenh" title="Các nhóm lệnh cơ bản (RV32I)" kicker="3.3">
        <Sub title="Số học">
          <Code run={false} code={`add  rd, rs1, rs2    # rd = rs1 + rs2
sub  rd, rs1, rs2    # rd = rs1 - rs2
addi rd, rs1, imm    # rd = rs1 + imm  (imm 12 bit có dấu: -2048..2047)`} />
          <p><code>rd</code> = thanh ghi đích, <code>rs1</code>, <code>rs2</code> = thanh ghi nguồn. <b>Sao không có subi?</b> Vì <code>addi</code> với số âm là đủ.</p>
          <Run id="arith" title="Slide 24: s1 = 6, sau 3 lệnh s1 = ?" />
        </Sub>
        <Sub title="Logic và dịch bit">
          <Code run={false} code={`and  rd, rs1, rs2  |  andi rd, rs1, imm
or   rd, rs1, rs2  |  ori  rd, rs1, imm
xor  rd, rs1, rs2  |  xori rd, rs1, imm
sll  rd, rs1, rs2  # dịch trái, thêm 0 bên phải        = nhân 2^rs2
srl  rd, rs1, rs2  # dịch phải logic, thêm 0 bên trái   = chia (không dấu)
sra  rd, rs1, rs2  # dịch phải số học, giữ bit dấu      = chia (có dấu)
slli / srli / srai # bản dùng hằng số`} />
          <Run id="logic" title="Slide 26–27: and, or, xor, dịch bit" />
          <p><code>slli t1, s1, 2</code> (nhân 4) là lệnh dùng nhiều nhất để tính offset mảng int. Mẹo: <code>andi t0, a0, 1</code> lấy bit cuối → biết số chẵn (0) hay lẻ (1).</p>
        </Sub>
        <Sub title="Truy cập bộ nhớ">
          <Code run={false} code={`lw rd,  offset(rs1)    # rd ← Mem[rs1 + offset]     (load word)
sw rs2, offset(rs1)    # Mem[rs1 + offset] ← rs2    (store word)
lb / lbu / sb          # 1 byte (lb mở rộng dấu, lbu mở rộng 0)
lh / lhu / sh          # 2 byte`} />
          <p><b>Sao không có <code>lw rd, imm</code>?</b> Vì imm chỉ 12 bit, không chứa nổi địa chỉ 32 bit. Dùng thanh ghi cơ sở thì truy cập được mảng và con trỏ (địa chỉ thay đổi lúc chạy).</p>
          <AddrCalc />
          <Run id="lwarray" title="Slide 30: dịch sang C" />
          <p>Đáp án: <code>A[10] = A[3] + 10;</code>. Quy tắc: <b>offset (byte) = chỉ số × 4</b> với mảng int.</p>
        </Sub>
        <Sub title="Rẽ nhánh và so sánh">
          <Code run={false} code={`beq  rs1, rs2, L   # nhảy tới L nếu rs1 == rs2
bne  rs1, rs2, L   # nếu rs1 != rs2
blt  rs1, rs2, L   # nếu rs1 <  rs2 (có dấu)
bge  rs1, rs2, L   # nếu rs1 >= rs2 (có dấu)
bltu / bgeu        # so sánh không dấu
j    L             # nhảy không điều kiện (lệnh giả = jal x0, L)
slt  t0, s0, s1    # t0 = (s0 < s1) ? 1 : 0     (slti, sltu, sltiu)`} />
          <Note kind="key" title="Mẹo dịch if"><p>Assembly nhảy khi điều kiện <b>ngược lại</b> để bỏ qua thân <code>if</code>. <code>if (i == j) h = i + j;</code> → <code>bne s0, s1, Exit</code> rồi <code>add s3, s0, s1</code>.</p></Note>
          <Run id="branch" title="Slide 32: s2 cuối cùng bằng mấy?" />
          <Run id="ifelse" title="Slide 35: if-else" />
          <Note kind="tip" title="Khuôn mẫu if-else"><p>Kiểm tra điều kiện ngược → nhảy tới <code>else</code>; thân if; <code>j endif</code>; <code>else:</code> thân else; <code>endif:</code>. Quên <code>j endif</code> là chạy luôn cả phần else.</p></Note>
        </Sub>
      </Sec>

      <Sec id="lenh-gia" title="Lệnh giả (pseudo-instruction)" kicker="3.4">
        <p>Lệnh giả viết cho tiện; assembler tự đổi thành lệnh thật. Trong Lab, cột “Lệnh thật” cho thấy mỗi lệnh giả biến thành gì.</p>
        <Table
          head={['Lệnh giả', 'Thật ra là', 'Ý nghĩa']}
          mono={[0, 1]}
          rows={[
            ['li rd, số', 'addi (hoặc lui + addi)', 'Nạp hằng số'],
            ['la rd, nhãn', 'auipc + addi', 'Nạp địa chỉ của biến'],
            ['mv rd, rs', 'addi rd, rs, 0', 'Chép thanh ghi'],
            ['j L', 'jal x0, L', 'Nhảy'],
            ['jr rs', 'jalr x0, 0(rs)', 'Nhảy tới địa chỉ trong rs'],
            ['ret', 'jalr x0, 0(ra)', 'Quay về từ hàm'],
            ['nop', 'addi x0, x0, 0', 'Không làm gì'],
            ['neg rd, rs', 'sub rd, x0, rs', 'Đổi dấu'],
            ['not rd, rs', 'xori rd, rs, -1', 'Đảo bit'],
            ['bgt / ble / beqz / bnez', 'blt / bge / beq / bne', 'Đổi thứ tự hoặc so với x0'],
          ]}
        />
      </Sec>

      <Sec id="ma-hoa" title="Mã hoá lệnh thành bit" kicker="3.5">
        <p>Mọi lệnh RV32I dài <b>32 bit</b>, có 6 định dạng. Sao không 1 định dạng hay 20? <b>Nguyên tắc 3: Thiết kế tốt cần thoả hiệp tốt.</b></p>
        <Code lang="text" code={`Bit:     31        25 24    20 19    15 14  12 11       7 6       0
R-type: [  funct7   ][  rs2  ][  rs1  ][funct3][   rd    ][ opcode ]
I-type: [      imm[11:0]     ][  rs1  ][funct3][   rd    ][ opcode ]
S-type: [ imm[11:5] ][  rs2  ][  rs1  ][funct3][imm[4:0] ][ opcode ]
B-type: [imm[12|10:5]][ rs2  ][  rs1  ][funct3][imm[4:1|11]][opcode]
U-type: [           imm[31:12]               ][   rd    ][ opcode ]
J-type: [    imm[20|10:1|11|19:12]           ][   rd    ][ opcode ]
            7 bit      5 bit    5 bit   3 bit    5 bit     7 bit`} />
        <Table
          head={['Định dạng', 'Dùng cho', 'Ví dụ']}
          rows={[
            ['R', '3 thanh ghi', 'add, sub, and, or, xor, sll, slt, mul'],
            ['I', '2 thanh ghi + hằng 12 bit', 'addi, andi, slli, lw, lb, jalr'],
            ['S', 'Store (không có rd)', 'sw, sh, sb'],
            ['B', 'Rẽ nhánh', 'beq, bne, blt, bge'],
            ['U', 'Hằng 20 bit phía trên', 'lui, auipc'],
            ['J', 'Nhảy xa', 'jal'],
          ]}
        />
        <ul>
          <li>opcode, rd, rs1, rs2, funct3 luôn ở cùng vị trí → phần cứng giải mã nhanh.</li>
          <li>S-type không cần rd nên dùng chỗ đó chứa 5 bit thấp của imm.</li>
          <li>B-type: imm 13 bit nhưng bit 0 luôn = 0 (địa chỉ lệnh luôn chẵn) nên chỉ lưu imm[12:1]; bit được xáo để giữ vị trí giống S-type và bit dấu luôn ở bit 31.</li>
        </ul>
        <Steps items={['Xác định định dạng (R/I/S/B/U/J)', 'Đổi tên thanh ghi ra số (t0 = x5, s1 = x9…)', 'Tra opcode / funct3 / funct7 (bảng dưới hoặc file RISC-V Summary)', 'Điền vào từng ô đúng số bit, ghép lại, gom 4 bit thành hex']} />
        <Encoder />
        <Table
          head={['Lệnh', 'Dạng', 'opcode', 'funct3', 'funct7']}
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
          caption="Bảng opcode hay dùng"
        />
        <Note kind="warn"><p>Bài 3.4 <code>sw x5, 32(x30)</code>: <b>x5 là rs2</b> (dữ liệu cần cất), <b>x30 là rs1</b> (địa chỉ cơ sở). Kết quả: <code>0x025F2023</code>. Kiểm tra bằng widget ở trên.</p></Note>
      </Sec>

      <Sec id="hang-lon" title="Hằng số lớn và nhảy xa" kicker="3.6">
        <p>Lệnh chỉ dài 32 bit nên không nhét được hằng 32 bit. Giải pháp: 2 lệnh. <code>lui</code> nạp 20 bit cao, <code>addi</code> cộng 12 bit thấp. Viết <code>li</code> thì assembler tự làm.</p>
        <Run id="widei" />
        <Note kind="warn"><p><code>addi</code> mở rộng dấu 12 bit. Nếu 12 bit thấp ≥ 0x800 thì addi cộng một số âm, nên phần <code>lui</code> phải cộng thêm 1. Xem cột “Lệnh thật” của dòng <code>li s2, 0x12345FFF</code> trong Lab.</p></Note>
        <p><b>Định địa chỉ tương đối PC:</b> lệnh rẽ nhánh không lưu địa chỉ tuyệt đối mà lưu <b>khoảng cách</b>: PC mới = PC + imm. Đó là cách CPU “nhảy tới nhãn else” (câu hỏi slide 46). Tầm nhảy: nhánh có điều kiện ±4 KB, <code>jal</code> ±1 MB, xa hơn dùng <code>auipc + jalr</code>. Nhánh quá xa thì đảo điều kiện rồi dùng <code>jal</code>.</p>
      </Sec>

      <Sec id="cau-truc" title="Cấu trúc lập trình cơ bản" kicker="3.7">
        <Run id="switch" title="Slide 47: switch-case" />
        <Run id="forsum" title="Vòng for: for (i = 0; i < n; i++) sum += A[i]" />
        <Note kind="slide"><p>Code vòng for trên slide 48 tăng <code>i</code> <b>trước</b> khi đọc A[i] và dừng khi <code>i == n</code>, nên thực tế cộng A[1]…A[n] (bỏ A[0], đọc lố A[n]). Bản ở trên là bản đúng theo code C. Khuôn mẫu: <b>kiểm tra điều kiện → thân → tăng biến → nhảy lại</b>.</p></Note>
        <Run id="while" title="Slide 49: while (A[i] == k) i = i + 1" />
      </Sec>

      <Sec id="ham" title="Hàm (procedure) và stack" kicker="3.8">
        <Sub title="Ngăn xếp (stack)">
          <p>Vùng bộ nhớ hoạt động kiểu <b>LIFO</b> (vào sau ra trước), như chồng đĩa. <b>Đáy ở địa chỉ cao, mọc xuống địa chỉ thấp.</b> <code>sp</code> trỏ vào đỉnh stack.</p>
          <StackPicture />
          <Run id="stack" title="Push / pop — xem tab Bộ nhớ → Stack trong Lab" />
        </Sub>
        <Sub title="Gọi và quay về">
          <Code run={false} code={`jal  ra, Proc      # 1) ra = PC + 4 (địa chỉ lệnh ngay sau)  2) nhảy tới Proc
jalr x0, 0(ra)     # nhảy về địa chỉ trong ra   (viết tắt: jr ra, ret)`} />
          <Note kind="idea"><p><code>jal</code> = “đi làm việc khác, nhưng ghi địa chỉ nhà vào ra”. <code>jr ra</code> = “đọc giấy, về nhà”.</p></Note>
          <ul>
            <li>Tham số: <b>a0–a7</b> (tối đa 8). Kết quả: <b>a0</b> (và a1).</li>
            <li>Hơn 8 tham số → đẩy vào stack: caller push trước khi gọi, callee đọc từ stack. Theo quy ước C/RISC-V, caller dọn vùng tham số đó.</li>
          </ul>
          <Table
            head={['Caller (người gọi) tự lưu nếu còn cần', 'Callee (hàm bị gọi) phải giữ nguyên']}
            rows={[['ra, t0–t6, a0–a7', 'sp, s0–s11']]}
            mono={[0, 1]}
          />
          <p>Nghĩa là: hàm bị gọi được phép phá t và a. Muốn dùng s0 thì phải cất s0 lên stack đầu hàm và khôi phục cuối hàm. Cất ở đâu? <b>Trên stack.</b></p>
        </Sub>
        <Sub title="6 bước thực hiện một hàm">
          <Steps items={[
            'Caller đặt tham số vào a0–a7',
            'Caller nhảy tới callee (jal)',
            'Callee xin chỗ trên stack, cất thanh ghi cần giữ',
            'Callee làm việc',
            'Callee đặt kết quả vào a0 (a1)',
            'Callee khôi phục thanh ghi, trả stack, quay về (jalr x0, 0(ra))',
          ]} />
          <Run id="leaf" title="Slide 62–63: hàm lá leaf_example (kèm main gọi nó)" />
        </Sub>
        <Sub title="Hàm lồng nhau và đệ quy">
          <p><b>Câu hỏi then chốt:</b> khi hàm A gọi hàm B, <code>jal</code> ghi đè <code>ra</code> nên mất địa chỉ quay về của A. Giải pháp: <b>cất ra lên stack trước khi gọi tiếp</b>.</p>
          <Run id="fact" title="Slide 65–66: giai thừa đệ quy (nhập n = 3 rồi chạy từng bước, xem tab Stack)" />
          <Code lang="text" code={`fact(2): cất ra_main, n=2. 1>=0 → L1. a0=1, gọi fact(1)
  fact(1): cất ra(→fact2), n=1. 0>=0 → L1. a0=0, gọi fact(0)
    fact(0): cất ra(→fact1), n=0. -1<0 → trả 1
  fact(1): a1=1, n=1 → a0 = 1×1 = 1, về fact(2)
fact(2): a1=1, n=2 → a0 = 2×1 = 2, về main`} title="Chạy tay fact(2)" />
          <p>Mỗi lần gọi có một <b>khung (frame)</b> riêng trên stack: tham số thứ 9 trở đi, địa chỉ về, thanh ghi đã cất, biến cục bộ (khi không đủ thanh ghi, ví dụ mảng <code>int v[10]</code>), và tuỳ chọn <code>fp</code> cũ.</p>
          <Run id="sort" title="Slide 71: sort gọi swap — hàm lồng nhau thật sự" />
        </Sub>
        <Sub title="Tổ chức bộ nhớ của chương trình">
          <MemoryLayout />
        </Sub>
      </Sec>

      <Sec id="chuoi" title="Chuỗi ký tự" kicker="3.9">
        <p>Chuỗi = mảng byte; chuỗi kiểu C kết thúc bằng byte 0 (<code>'\0'</code>). Mỗi ký tự 1 byte → <b>offset = i, không nhân 4</b>. Dùng <code>lbu</code>/<code>sb</code>.</p>
        <Run id="strcpy" title="Slide 70: strcpy(x, y)" />
      </Sec>

      <Sec id="mo-rong" title="Mở rộng tập lệnh" kicker="3.10">
        <p>RV32I chỉ có số nguyên, không có nhân chia. RISC-V thêm các mô-đun; tên như <b>RV32IMAFD</b> nghĩa là RV32I + M + A + F + D.</p>
        <Table
          head={['Mở rộng', 'Thêm gì']}
          rows={[
            ['M', 'Nhân / chia số nguyên: mul, mulh, div, rem… (R-type)'],
            ['A', 'Lệnh nguyên tử (atomic): làm trọn vẹn, không bị chen ngang; dùng làm mutex/semaphore cho đa luồng'],
            ['F', 'Số thực 32 bit (float), thêm 32 thanh ghi f0–f31 (Chương 4)'],
            ['D', 'Số thực 64 bit (double)'],
            ['C', 'Lệnh nén 16 bit, code nhỏ hơn 25–30%'],
          ]}
        />
        <Formula caption="Bit thấp của lệnh cho biết độ dài: 2 bit cuối khác 11 là lệnh nén 16 bit">xxxxxxxxxxxxxx<b>11</b> = lệnh 32 bit</Formula>
      </Sec>

      <Sec id="kiem-tra" title="Tự kiểm tra">
        <Pitfalls items={[
          'Quên nhân 4 khi tính địa chỉ mảng int (hoặc nhân 4 nhầm với mảng char).',
          'Trong sw, thanh ghi đầu là DỮ LIỆU (rs2), không phải địa chỉ.',
          'Dịch if mà quên đảo điều kiện; quên j endif cuối thân if.',
          'Hàm gọi hàm khác mà quên cất ra → không quay về được.',
          'Quên trả stack (addi sp, sp, +n) trước khi jr ra.',
          'Dùng t0 sau khi gọi hàm mà không cất (hàm khác được quyền phá t0).',
          'Ghi đè a7 hoặc a0 trước ecall mà quên.',
          'Mã hoá lệnh: nhầm tên ABI với số thanh ghi (s1 = x9, không phải x1).',
        ]} />
        <SelfCheck items={[
          { q: <><code>lw t0, -8(sp)</code> đọc ở địa chỉ nào?</>, a: 'sp − 8' },
          { q: 'Thanh ghi nào luôn = 0?', a: 'x0 (zero)' },
          { q: <><code>jal</code> làm 2 việc gì?</>, a: 'Ghi PC + 4 vào rd (thường là ra), rồi nhảy tới nhãn.' },
          { q: <>Mã hoá <code>addi x5, x0, 7</code>.</>, a: <>imm = 000000000111, rs1 = 00000, funct3 = 000, rd = 00101, opcode = 0010011 → <code>0x00700293</code></> },
          { q: 'Hàm leaf_example có bắt buộc phải cất t0, t1 không?', a: 'Không. t0, t1 là thanh ghi tạm, caller tự lo. Slide cất cho “an toàn”. Chỉ s0 là bắt buộc phải cất.' },
        ]} />
      </Sec>
    </Lesson>
  );
}
