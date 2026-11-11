import type { Metadata } from 'next';
import Lesson from '@/components/lesson/Lesson';
import { Note, Pitfalls, Sec, SelfCheck, Steps, Table } from '@/components/lesson/Blocks';
import Code from '@/components/lesson/Code';
import Example from '@/components/lesson/Example';
import { L } from '@/components/i18n';
import { EXAMPLES } from '@/lib/examples.mjs';

export const metadata: Metadata = { title: 'Bài tập Chương 3: Thực hành RARS' };

const datamap = EXAMPLES.find((e) => e.id === 'datamap')!;
const dataPart = (src: string) => src.split('.text')[0];

function Problem({ title, children, hint }: { title: React.ReactNode; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="problem">
      <p className="problem-title">{title}</p>
      <div className="problem-body">{children}</div>
      {hint && (
        <details className="problem-hint">
          <summary><L vi="Gợi ý (mở khi bí)" en="Hint (open if you're stuck)" /></summary>
          <div>{hint}</div>
        </details>
      )}
    </div>
  );
}

function Solution({ children }: { children: React.ReactNode }) {
  return (
    <details className="solution">
      <summary><L vi="Xem lời giải" en="Show the solution" /></summary>
      <div className="solution-body">{children}</div>
    </details>
  );
}

const MAP: [string, string, string, string, string][] = [
  ['0x10010000–0F', 'arr16', '00 × 16', '16 byte trống', '16 empty bytes'],
  ['0x10010010–12', 'arr', '61 62 63', "'a' 'b' 'c'", "'a' 'b' 'c'"],
  ['0x10010013–17', 'st1', '61 62 63 64 00', '"abcd" + \'\\0\'', '"abcd" + \'\\0\''],
  ['0x10010018–1B', 'X1', 'FF FF FF FF', '0x18 chia hết 4 → không cần đệm', '0x18 is divisible by 4 → no padding needed'],
  ['0x1001001C–1F', 'st2', '65 66 67 68', '"efgh", KHÔNG có \'\\0\'', '"efgh", NO \'\\0\''],
  ['0x10010020–23', 'X2', 'FF FF FF FF', '', ''],
  ['0x10010024–28', 'st3', '31 32 33 34 00', '"1234" + \'\\0\' (\'1\' = 0x31)', '"1234" + \'\\0\' (\'1\' = 0x31)'],
  ['0x10010029–2B', '(đệm)', '00 00 00', 'căn lề cho word', 'alignment for the word'],
  ['0x1001002C–2F', 'X3', 'FF FF FF FF', '', ''],
  ['0x10010030–34', 'st4', '35 36 37 38 00', '"5678" + \'\\0\'', '"5678" + \'\\0\''],
  ['0x10010035–37', '(đệm)', '00 00 00', '', ''],
  ['0x10010038–3B', 'X4', 'FF FF FF FF', '', ''],
];

export default function Page() {
  return (
    <Lesson
      step="bai-tap-3"
      summary={[
        <L key="s1"
          vi={<>Chương trình có 2 vùng: <code>.data</code> (biến, bắt đầu 0x10010000) và <code>.text</code> (lệnh, bắt đầu 0x00400000).</>}
          en={<>A program has 2 areas: <code>.data</code> (variables, starting at 0x10010000) and <code>.text</code> (instructions, starting at 0x00400000).</>} />,
        <L key="s2"
          vi={<>Chỉ thị khai báo biến: <code>.word .half .byte .ascii .asciz .space</code>. <code>.word</code> tự căn lề tới địa chỉ chia hết cho 4.</>}
          en={<>Directives that declare variables: <code>.word .half .byte .ascii .asciz .space</code>. <code>.word</code> automatically aligns to an address divisible by 4.</>} />,
        <L key="s3"
          vi={<>Nhập/xuất bằng <code>ecall</code>: số dịch vụ vào <b>a7</b>, tham số vào a0…, gọi <code>ecall</code>, kết quả trong a0.</>}
          en={<>Input/output uses <code>ecall</code>: service number in <b>a7</b>, arguments in a0…, call <code>ecall</code>, result in a0.</>} />,
        <L key="s4"
          vi="Dịch vụ hay dùng: 1 in số, 4 in chuỗi, 5 đọc số, 8 đọc chuỗi, 10 kết thúc, 11 in ký tự, 12 đọc ký tự."
          en="Common services: 1 print integer, 4 print string, 5 read integer, 8 read string, 10 exit, 11 print character, 12 read character." />,
        <L key="s5"
          vi={<>Luôn kết thúc chương trình bằng <code>li a7, 10</code> + <code>ecall</code>, nếu không CPU sẽ chạy tuột xuống code bên dưới.</>}
          en={<>Always end the program with <code>li a7, 10</code> + <code>ecall</code>, otherwise the CPU keeps running into whatever code comes next.</>} />,
      ]}
      toc={[
        { id: 'rars', title: <L vi="RARS và Lab" en="RARS and the Lab" /> },
        { id: 'chi-thi', title: <L vi="Chỉ thị" en="Directives" /> },
        { id: 'ecall', title: <L vi="Dịch vụ hệ thống" en="System services" /> },
        { id: 'ban-do', title: <L vi="Bản đồ .data" en="The .data map" /> },
        { id: 'bt1', title: <L vi="Bài 3.1 – 3.4" en="Exercises 3.1 – 3.4" /> },
        { id: 'bt2', title: <L vi="Bài 3.5 – 3.8" en="Exercises 3.5 – 3.8" /> },
        { id: 'kiem-tra', title: <L vi="Tự kiểm tra" en="Check yourself" /> },
      ]}
    >
      <Sec id="rars" title={<L vi="RARS 1.6 và Lab trên trang này" en="RARS 1.6 and the Lab on this site" />}>
        <p><L
          vi={<>Bài tập trên lớp dùng <b>RARS 1.6</b> (trình mô phỏng RISC-V viết bằng Java). Lab ở đây làm việc giống RARS để học ở bất kỳ đâu:</>}
          en={<>Class exercises use <b>RARS 1.6</b> (a RISC-V simulator written in Java). The Lab here works like RARS, so you can practice anywhere:</>} /></p>
        <Table
          head={['RARS', <L key="h2" vi="Lab trên trang này" en="The Lab on this site" />]}
          rows={[
            [<L key="a" vi="Tab Edit — gõ code" en="Edit tab — type code" />, <L key="b" vi="Ô soạn code (có tô màu, báo lỗi theo dòng bằng tiếng Việt)" en="Code editor (syntax colouring, line-by-line error messages)" />],
            ['Assemble (F3)', <L key="b" vi="Nút ⚙ Dịch (Assemble)" en="The ⚙ Assemble button" />],
            ['Run one step (F7)', <L key="b" vi="Nút ⏭ Bước" en="The ⏭ Step button" />],
            ['Backstep (F8)', <L key="b" vi="Nút ⏮ Lùi — lùi được nhiều bước" en="The ⏮ Back button — can go back many steps" />],
            ['Run (F5)', <L key="b" vi="Nút ▶ Chạy (chọn tốc độ để xem từng lệnh chạy)" en="The ▶ Run button (pick a speed to watch each instruction run)" />],
            [<L key="a" vi="Breakpoint (cột Bkpt)" en="Breakpoint (Bkpt column)" />, <L key="b" vi="Bấm chấm tròn đầu dòng trong bảng lệnh" en="Click the dot at the start of a row in the instruction table" />],
            ['Registers / Data Segment / Run I/O', <L key="b" vi="Khung Thanh ghi / Bộ nhớ / Màn hình" en="The Registers / Memory / Console panels" />],
          ]}
        />
        <Note kind="tip"><p><L
          vi={<>Lab còn có thứ RARS không có: khung <b>“Lệnh này làm gì”</b> giải thích lệnh sắp chạy bằng giá trị thật, khung tách <b>trường bit</b> của mã máy, và <b>nhật ký lệnh</b> ghi từng thanh ghi đổi từ bao nhiêu thành bao nhiêu.</>}
          en={<>The Lab also has things RARS doesn&apos;t: a <b>“What this instruction does”</b> panel that explains the next instruction with real values, a panel that splits the machine code into <b>bit fields</b>, and an <b>instruction log</b> that records every register change from old value to new value.</>} /></p></Note>
        <Example id="hello1" />
        <Example id="hello2" />
      </Sec>

      <Sec id="chi-thi" title={<L vi="Chỉ thị (directive)" en="Directives" />}>
        <p><L
          vi={<>Chỉ thị là lệnh cho <b>assembler</b> (không phải lệnh cho CPU): cấp phát biến, chia vùng chương trình.</>}
          en={<>A directive is an order for the <b>assembler</b> (not an instruction for the CPU): it reserves variables and splits the program into areas.</>} /></p>
        <Table
          head={[<L key="h1" vi="Chỉ thị" en="Directive" />, <L key="h2" vi="Ý nghĩa" en="Meaning" />]}
          mono={[0]}
          rows={[
            ['.text / .data', <L key="b" vi="Bắt đầu vùng code / vùng dữ liệu" en="Start the code area / the data area" />],
            ['.byte / .half / .word', <L key="b" vi="Cấp phát 1 / 2 / 4 byte với giá trị cho trước (cách nhau bằng dấu phẩy)" en="Reserve 1 / 2 / 4 bytes with given values (separated by commas)" />],
            ['.ascii "abc"', <L key="b" vi="Chuỗi KHÔNG có \0 ở cuối" en="String WITHOUT a \0 at the end" />],
            ['.asciz "abc"', <L key="b" vi="Chuỗi CÓ \0 ở cuối" en="String WITH a \0 at the end" />],
            ['.space n', <L key="b" vi="Dành n byte (giá trị 0)" en="Reserve n bytes (value 0)" />],
            ['.float', <L key="b" vi="Số thực 32 bit" en="32-bit floating-point number" />],
          ]}
        />
      </Sec>

      <Sec id="ecall" title={<L vi="Dịch vụ hệ thống (ecall)" en="System services (ecall)" />}>
        <Steps items={[
          <L key="1" vi="Nạp số dịch vụ vào a7" en="Load the service number into a7" />,
          <L key="2" vi="Nạp tham số (nếu có) vào a0, a1, … (số thực: fa0)" en="Load the arguments (if any) into a0, a1, … (floats: fa0)" />,
          <L key="3" vi="Gọi ecall" en="Call ecall" />,
          <L key="4" vi="Lấy kết quả (nếu có) trong a0" en="Read the result (if any) from a0" />,
        ]} />
        <Table
          head={['a7', <L key="h2" vi="Dịch vụ" en="Service" />, <L key="h3" vi="Vào" en="Input" />, <L key="h4" vi="Ra" en="Output" />]}
          rows={[
            ['1', <L key="b" vi="In số nguyên" en="Print integer" />, <L key="c" vi="a0 = số" en="a0 = number" />, ''],
            ['2', <L key="b" vi="In số thực" en="Print float" />, <L key="c" vi="fa0 = số" en="fa0 = number" />, ''],
            ['4', <L key="b" vi="In chuỗi" en="Print string" />, <L key="c" vi="a0 = địa chỉ chuỗi" en="a0 = string address" />, ''],
            ['5', <L key="b" vi="Đọc số nguyên" en="Read integer" />, '', <L key="d" vi="a0 = số" en="a0 = number" />],
            ['8', <L key="b" vi="Đọc chuỗi" en="Read string" />, <L key="c" vi="a0 = địa chỉ vùng nhớ, a1 = độ dài tối đa" en="a0 = buffer address, a1 = maximum length" />, ''],
            ['10', <L key="b" vi="Kết thúc chương trình" en="Exit the program" />, '', ''],
            ['11', <L key="b" vi="In 1 ký tự" en="Print a character" />, <L key="c" vi="a0 = ký tự" en="a0 = character" />, ''],
            ['12', <L key="b" vi="Đọc 1 ký tự" en="Read a character" />, '', <L key="d" vi="a0 = ký tự" en="a0 = character" />],
          ]}
        />
        <Example id="hello3" />
        <p><L
          vi="Khi chương trình gọi dịch vụ đọc (5, 8, 12), Lab dừng lại và hiện ô nhập ở khung Màn hình. Gõ rồi bấm Enter là chạy tiếp."
          en="When the program calls a read service (5, 8, 12), the Lab pauses and shows an input box in the Console panel. Type your input and press Enter to continue." /></p>
      </Sec>

      <Sec id="ban-do" title={<L vi="Bài: vẽ bản đồ vùng .data (slide 8)" en="Exercise: draw the .data memory map (slide 8)" />}>
        <Problem
          title={<L vi="Đề" en="Problem" />}
          hint={<L
            vi="Biến xếp liên tiếp nhau. .asciz thêm 1 byte 0. .word phải bắt đầu ở địa chỉ chia hết cho 4; thiếu thì chèn byte đệm."
            en="Variables are laid out one after another. .asciz adds a 0 byte. A .word must start at an address divisible by 4; if it doesn't, padding bytes are inserted." />}
        >
          <Code run={false} code={dataPart(datamap.code)} codeEn={datamap.en ? dataPart(datamap.en.code) : undefined} />
        </Problem>
        <Solution>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr>
                <th><L vi="Địa chỉ" en="Address" /></th>
                <th><L vi="Nhãn" en="Label" /></th>
                <th><L vi="Nội dung (hex)" en="Contents (hex)" /></th>
                <th><L vi="Ghi chú" en="Note" /></th>
              </tr></thead>
              <tbody>
                {MAP.map(([a, l, c, nVi, nEn]) => (
                  <tr key={a}>
                    <td className="mono">{a}</td>
                    <td className="mono">{l === '(đệm)' ? <L vi="(đệm)" en="(padding)" /> : l}</td>
                    <td className="mono">{c}</td>
                    <td><L vi={nVi} en={nEn} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p><L
            vi={<>Mở trong Lab, chọn tab Bộ nhớ → <b>.data</b> → chế độ <b>Byte</b> để thấy từng byte và nhãn (gạch chân tím). Chế độ Word hiển thị theo little-endian nên <code>61 62 63 64</code> hiện thành <code>64636261</code>.</>}
            en={<>Open it in the Lab, go to the Memory tab → <b>.data</b> → <b>Byte</b> mode to see every byte and the labels (purple underline). Word mode reads little-endian, so <code>61 62 63 64</code> shows up as <code>64636261</code>.</>} /></p>
          <Example id="datamap" />
          <Note kind="warn"><p><L
            vi={<>In st2 bằng dịch vụ 4 sẽ in lố sang X2, vì <code>.ascii</code> không có byte 0 kết thúc.</>}
            en={<>Printing st2 with service 4 runs on into X2, because <code>.ascii</code> has no terminating 0 byte.</>} /></p></Note>
        </Solution>
      </Sec>

      <Sec id="bt1" title={<L vi="Bài 3.1 – 3.4" en="Exercises 3.1 – 3.4" />}>
        <Problem
          title={<L vi="Bài 3.1 — f = g + (h − 5)" en="Exercise 3.1 — f = g + (h − 5)" />}
          hint={<L vi="f, g, h ở x5, x6, x7. Dùng addi với số âm." en="f, g, h are in x5, x6, x7. Use addi with a negative number." />}
        >
          <p><L
            vi="1. Viết assembly với số lệnh ít nhất. 2. Viết chương trình đầy đủ: khai báo f, g, h, khởi tạo, tính và lưu f."
            en="1. Write the assembly with as few instructions as possible. 2. Write a full program: declare f, g, h, initialise them, compute and store f." /></p>
        </Problem>
        <Solution>
          <Code run={false}
            title={<L vi="Phần 1: 2 lệnh là tối thiểu" en="Part 1: 2 instructions is the minimum" />}
            code={`addi x5, x7, -5     # f = h - 5
add  x5, x6, x5     # f = g + f`} />
          <Example id="ex31" title={<L vi="Phần 2: chương trình đầy đủ (slide 11)" en="Part 2: the full program (slide 11)" />} />
        </Solution>

        <Problem
          title={<L vi="Bài 3.2 — B[4] = A[i − j]" en="Exercise 3.2 — B[4] = A[i − j]" />}
          hint={<L
            vi="i, j ở x28, x29; A, B ở x10, x11. Tính (i − j) × 4 rồi cộng vào địa chỉ A. B[4] ở offset 4 × 4."
            en="i, j are in x28, x29; A, B in x10, x11. Compute (i − j) × 4 and add it to A's address. B[4] is at offset 4 × 4." />}
        >
          <p><L
            vi="Viết assembly, rồi viết chương trình đầy đủ khai báo hai mảng ít nhất 6 phần tử."
            en="Write the assembly, then a full program that declares two arrays of at least 6 elements." /></p>
        </Problem>
        <Solution>
          <Example id="ex32" />
          <Note kind="slide"><p><L
            vi={<>Lời giải trên slide 13 ghi <code>sw t5, 32(a1) #store to B[8]</code>: offset 32 là <b>B[8]</b>, không phải B[4]. Đúng đề phải là <b>16</b>. (t3 = x28, t4 = x29 nên phần còn lại khớp.)</>}
            en={<>The solution on slide 13 writes <code>sw t5, 32(a1) #store to B[8]</code>: offset 32 is <b>B[8]</b>, not B[4]. For this problem it should be <b>16</b>. (t3 = x28, t4 = x29, so the rest matches.)</>} /></p></Note>
        </Solution>

        <Problem
          title={<L vi="Bài 3.3 — dịch ngược sang C" en="Exercise 3.3 — translate back to C" />}
          hint={<L
            vi="f, g ở x5, x6; A ở x10, B ở x11. slli 2 = nhân 4; addi x12, x30, 8 = cộng 8 byte = 2 phần tử."
            en="f, g are in x5, x6; A in x10, B in x11. slli 2 = multiply by 4; addi x12, x30, 8 = add 8 bytes = 2 elements." />}
        >
          <Code run={false} code={`slli x30, x5, 2
add  x30, x10, x30
slli x31, x6, 2
add  x31, x11, x31
lw   x5, 0(x30)
addi x12, x30, 8
lw   x30, 0(x12)
add  x30, x30, x5
lw   x30, 0(x31)`} />
        </Problem>
        <Solution>
          <Code lang="c"
            code={`f = A[f];                       // f bị ghi đè
B[g] = A[f_cũ + 2] + A[f_cũ];   // nếu lệnh cuối là sw`}
            codeEn={`f = A[f];                       // f gets overwritten
B[g] = A[f_old + 2] + A[f_old]; // if the last instruction is sw`} />
          <p><L
            vi={<>Lệnh cuối gần như chắc chắn là <code>sw x30, 0(x31)</code> gõ nhầm thành <code>lw</code> (bài gốc trong sách P&amp;H dùng store). Nếu đúng là <code>lw</code> thì lệnh cuối chỉ là <code>x30 = B[g]</code> và phép cộng trước đó bị bỏ phí. Nên hỏi lại giảng viên.</>}
            en={<>The last instruction is almost certainly <code>sw x30, 0(x31)</code> mistyped as <code>lw</code> (the original exercise in the P&amp;H book uses a store). If it really is <code>lw</code>, the last line just means <code>x30 = B[g]</code> and the addition before it is wasted. Worth asking your lecturer.</>} /></p>
          <Example id="ex33" title={<L vi="Chạy thử bản dùng sw (f = 1, g = 2)" en="Try the sw version (f = 1, g = 2)" />} />
        </Solution>

        <Problem title={<L vi="Bài 3.4 — mã máy của sw x5, 32(x30)" en="Exercise 3.4 — machine code of sw x5, 32(x30)" />}>
          <p><L vi="Tìm định dạng và mã máy." en="Find the format and the machine code." /></p>
        </Problem>
        <Solution>
          <Code lang="text"
            code={`S-type. imm = 32 = 0000 0010 0000 (12 bit)
imm[11:5] = 0000001,  imm[4:0] = 00000
rs2 = x5 = 00101,  rs1 = x30 = 11110,  funct3 = 010,  opcode = 0100011

[0000001][00101][11110][010][00000][0100011]
→ 0000 0010 0101 1111 0010 0000 0010 0011 = 0x025F2023`}
            codeEn={`S-type. imm = 32 = 0000 0010 0000 (12 bits)
imm[11:5] = 0000001,  imm[4:0] = 00000
rs2 = x5 = 00101,  rs1 = x30 = 11110,  funct3 = 010,  opcode = 0100011

[0000001][00101][11110][010][00000][0100011]
→ 0000 0010 0101 1111 0010 0000 0010 0011 = 0x025F2023`} />
          <p><L
            vi="Thử gõ lệnh này vào widget mã hoá lệnh ở Chương 3 để thấy từng trường được tô màu."
            en="Type this instruction into the encoding widget in Chapter 3 to see each field coloured." /></p>
        </Solution>
      </Sec>

      <Sec id="bt2" title={<L vi="Bài 3.5 – 3.8" en="Exercises 3.5 – 3.8" />}>
        <Problem
          title={<L vi="Bài 3.5 — in “odd” hoặc “even”" en="Exercise 3.5 — print “odd” or “even”" />}
          hint={<L vi="Đọc số bằng ecall 5. andi t0, a0, 1 cho bit cuối: 1 = lẻ." en="Read the number with ecall 5. andi t0, a0, 1 gives the last bit: 1 = odd." />}
        >
          <p><L vi="Nhập một số nguyên X, in “odd” nếu X lẻ, “even” nếu X chẵn." en="Read an integer X; print “odd” if X is odd and “even” if X is even." /></p>
        </Problem>
        <Solution>
          <Example id="ex35" />
          <p><L
            vi={<><code>andi</code> với 1 vẫn đúng với số âm: −3 = <code>…1101</code>, bit cuối 1 → lẻ.</>}
            en={<><code>andi</code> with 1 also works for negative numbers: −3 = <code>…1101</code>, last bit 1 → odd.</>} /></p>
        </Solution>

        <Problem
          title={<L vi="Bài 3.6 — trị tuyệt đối" en="Exercise 3.6 — absolute value" />}
          hint={<L
            vi="Hàm abs: nếu a0 ≥ 0 thì giữ nguyên, ngược lại a0 = 0 − a0. Lặp ở main đến khi đọc được 0."
            en="The abs function: if a0 ≥ 0 keep it, otherwise a0 = 0 − a0. Loop in main until you read a 0." />}
        >
          <p><L
            vi="1. Viết hàm nhận X, trả |X|. 2. Chương trình đọc một số, in trị tuyệt đối. 3. Lặp lại đến khi nhập 0."
            en="1. Write a function that takes X and returns |X|. 2. A program that reads a number and prints its absolute value. 3. Repeat until the input is 0." /></p>
        </Problem>
        <Solution>
          <Example id="ex36" />
          <Note kind="key" title={<L vi="Sao cần li a7, 10 + ecall? (câu hỏi slide 24)" en="Why do we need li a7, 10 + ecall? (slide 24 question)" />}><p><L
            vi={<>Không có nó, CPU chạy tuột xuống code hàm <code>abs</code> (CPU không biết đâu là “hết chương trình”), rồi <code>jr ra</code> nhảy về chỗ cũ → chạy sai hoặc lặp vô hạn. Thử xoá 2 dòng đó trong Lab và chạy từng bước để thấy.</>}
            en={<>Without it, the CPU falls through into the <code>abs</code> function&apos;s code (the CPU has no idea where “the end of the program” is), then <code>jr ra</code> jumps back to an old spot → wrong behaviour or an infinite loop. Delete those 2 lines in the Lab and step through to see it.</>} /></p></Note>
        </Solution>

        <Problem
          title={<L vi="Bài 3.7 — tổng 1 + 2 + … + n" en="Exercise 3.7 — the sum 1 + 2 + … + n" />}
          hint={<L
            vi="Hàm sum nhận n trong a7 (theo đề), trả tổng trong a0. Phải chép n sang a7 SAU khi ecall đọc xong."
            en="The sum function takes n in a7 (as the exercise says) and returns the sum in a0. Copy n into a7 AFTER the reading ecall is done." />}
        >
          <p><L vi="Đọc n dương, tính và in tổng 1…n bằng một hàm." en="Read a positive n, then compute and print the sum 1…n using a function." /></p>
        </Problem>
        <Solution>
          <Example id="ex37" />
          <p><L
            vi="Đề dùng a7 làm tham số khá lạ vì a7 cũng là thanh ghi chọn dịch vụ ecall. Trong thực tế nên truyền n qua a0."
            en="Using a7 as the argument is unusual, because a7 also selects the ecall service. In practice you would pass n in a0." /></p>
        </Solution>

        <Problem
          title={<L vi="Bài 3.8 — strlen" en="Exercise 3.8 — strlen" />}
          hint={<L
            vi="Đọc chuỗi bằng ecall 8 vào một vùng .space 256. Đếm từng byte đến khi gặp 0. Dịch vụ 8 giữ lại ký tự xuống dòng '\n' (mã 10), đừng đếm nó."
            en="Read the string with ecall 8 into a .space 256 buffer. Count bytes until you hit 0. Service 8 keeps the newline '\n' (code 10) — don't count it." />}
        >
          <p><L
            vi={<>Viết hàm <code>strlen</code>, đọc chuỗi tối đa 255 ký tự, in độ dài.</>}
            en={<>Write a <code>strlen</code> function, read a string of up to 255 characters, and print its length.</>} /></p>
        </Problem>
        <Solution>
          <Example id="ex38" />
        </Solution>
      </Sec>

      <Sec id="kiem-tra" title={<L vi="Tự kiểm tra" en="Check yourself" />}>
        <Pitfalls items={[
          <L key="1" vi="Quên li a7, 10 + ecall ở cuối main." en="Forgetting li a7, 10 + ecall at the end of main." />,
          <L key="2" vi="Ghi đè a0 trước khi ecall in số (ví dụ dùng a0 làm biến tạm)." en="Overwriting a0 before the print ecall (e.g. using a0 as a scratch variable)." />,
          <L key="3" vi="Dùng .ascii khi cần chuỗi có \0 (phải dùng .asciz)." en="Using .ascii when you need a string with \0 (use .asciz)." />,
          <L key="4" vi="Đọc chuỗi bằng dịch vụ 8 mà quên chuỗi có thêm \n ở cuối." en="Reading a string with service 8 and forgetting it has an extra \n at the end." />,
          <L key="5" vi="Đặt nhãn biến trên một dòng rồi .word ở dòng sau mà quên căn lề khi tự tính địa chỉ." en="Putting a label on one line and .word on the next, then forgetting alignment when working out addresses by hand." />,
        ]} />
        <SelfCheck items={[
          { q: <L vi="Muốn đọc một số nguyên từ bàn phím: a7 = ? Kết quả ở đâu?" en="To read an integer from the keyboard: a7 = ? Where is the result?" />, a: <L vi="a7 = 5; kết quả ở a0." en="a7 = 5; the result is in a0." /> },
          { q: <L vi='.asciz "Hi" chiếm mấy byte?' en='How many bytes does .asciz "Hi" take?' />, a: <L vi="3 byte: H, i, \0." en="3 bytes: H, i, \0." /> },
          { q: <L vi="Sau .byte 1, 2, 3 là .word 7. Word đó bắt đầu ở offset nào?" en="After .byte 1, 2, 3 comes .word 7. At what offset does that word start?" />, a: <L vi="Offset 4 (đệm 1 byte sau 3 byte)." en="Offset 4 (1 byte of padding after the 3 bytes)." /> },
          { q: <L vi="Vùng .text trong RARS bắt đầu ở đâu?" en="Where does the .text area start in RARS?" />, a: '0x00400000' },
        ]} />
      </Sec>
    </Lesson>
  );
}
