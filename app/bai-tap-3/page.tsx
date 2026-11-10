import type { Metadata } from 'next';
import Lesson from '@/components/lesson/Lesson';
import { Note, Pitfalls, Sec, SelfCheck, Steps, Sub, Table } from '@/components/lesson/Blocks';
import Code from '@/components/lesson/Code';
import { EXAMPLES } from '@/lib/examples.mjs';

export const metadata: Metadata = { title: 'Bài tập Chương 3: Thực hành RARS' };
const ex = (id: string) => EXAMPLES.find((e) => e.id === id)!;
const Run = ({ id, title }: { id: string; title?: string }) => <Code code={ex(id).code} title={title ?? ex(id).title} runTitle={ex(id).title} />;

function Problem({ title, children, hint }: { title: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="problem">
      <p className="problem-title">{title}</p>
      <div className="problem-body">{children}</div>
      {hint && (
        <details className="problem-hint">
          <summary>Gợi ý (mở khi bí)</summary>
          <div>{hint}</div>
        </details>
      )}
    </div>
  );
}

function Solution({ children }: { children: React.ReactNode }) {
  return (
    <details className="solution">
      <summary>Xem lời giải</summary>
      <div className="solution-body">{children}</div>
    </details>
  );
}

const MAP: [string, string, string, string][] = [
  ['0x10010000–0F', 'arr16', '00 × 16', '16 byte trống'],
  ['0x10010010–12', 'arr', '61 62 63', "'a' 'b' 'c'"],
  ['0x10010013–17', 'st1', '61 62 63 64 00', '"abcd" + \'\\0\''],
  ['0x10010018–1B', 'X1', 'FF FF FF FF', '0x18 chia hết 4 → không cần đệm'],
  ['0x1001001C–1F', 'st2', '65 66 67 68', '"efgh", KHÔNG có \'\\0\''],
  ['0x10010020–23', 'X2', 'FF FF FF FF', ''],
  ['0x10010024–28', 'st3', '31 32 33 34 00', '"1234" + \'\\0\' (\'1\' = 0x31)'],
  ['0x10010029–2B', '(đệm)', '00 00 00', 'căn lề cho word'],
  ['0x1001002C–2F', 'X3', 'FF FF FF FF', ''],
  ['0x10010030–34', 'st4', '35 36 37 38 00', '"5678" + \'\\0\''],
  ['0x10010035–37', '(đệm)', '00 00 00', ''],
  ['0x10010038–3B', 'X4', 'FF FF FF FF', ''],
];

export default function Page() {
  return (
    <Lesson
      step="bai-tap-3"
      summary={[
        <>Chương trình có 2 vùng: <code>.data</code> (biến, bắt đầu 0x10010000) và <code>.text</code> (lệnh, bắt đầu 0x00400000).</>,
        <>Chỉ thị khai báo biến: <code>.word .half .byte .ascii .asciz .space</code>. <code>.word</code> tự căn lề tới địa chỉ chia hết cho 4.</>,
        <>Nhập/xuất bằng <code>ecall</code>: số dịch vụ vào <b>a7</b>, tham số vào a0…, gọi <code>ecall</code>, kết quả trong a0.</>,
        <>Dịch vụ hay dùng: 1 in số, 4 in chuỗi, 5 đọc số, 8 đọc chuỗi, 10 kết thúc, 11 in ký tự, 12 đọc ký tự.</>,
        <>Luôn kết thúc chương trình bằng <code>li a7, 10</code> + <code>ecall</code>, nếu không CPU sẽ chạy tuột xuống code bên dưới.</>,
      ]}
      toc={[
        { id: 'rars', title: 'RARS và Lab' },
        { id: 'chi-thi', title: 'Chỉ thị' },
        { id: 'ecall', title: 'Dịch vụ hệ thống' },
        { id: 'ban-do', title: 'Bản đồ .data' },
        { id: 'bt1', title: 'Bài 3.1 – 3.4' },
        { id: 'bt2', title: 'Bài 3.5 – 3.8' },
        { id: 'kiem-tra', title: 'Tự kiểm tra' },
      ]}
    >
      <Sec id="rars" title="RARS 1.6 và Lab trên trang này">
        <p>Bài tập trên lớp dùng <b>RARS 1.6</b> (trình mô phỏng RISC-V viết bằng Java). Lab ở đây làm việc giống RARS để học ở bất kỳ đâu:</p>
        <Table
          head={['RARS', 'Lab trên trang này']}
          rows={[
            ['Tab Edit — gõ code', 'Ô soạn code (có tô màu, báo lỗi theo dòng bằng tiếng Việt)'],
            ['Assemble (F3)', 'Nút ⚙ Dịch (Assemble)'],
            ['Run one step (F7)', 'Nút ⏭ Bước'],
            ['Backstep (F8)', 'Nút ⏮ Lùi — lùi được nhiều bước'],
            ['Run (F5)', 'Nút ▶ Chạy (chọn tốc độ để xem từng lệnh chạy)'],
            ['Breakpoint (cột Bkpt)', 'Bấm chấm tròn đầu dòng trong bảng lệnh'],
            ['Registers / Data Segment / Run I/O', 'Khung Thanh ghi / Bộ nhớ / Màn hình'],
          ]}
        />
        <Note kind="tip"><p>Lab còn có thứ RARS không có: khung <b>“Lệnh này làm gì”</b> giải thích lệnh sắp chạy bằng giá trị thật, khung tách <b>trường bit</b> của mã máy, và <b>nhật ký lệnh</b> ghi từng thanh ghi đổi từ bao nhiêu thành bao nhiêu.</p></Note>
        <Run id="hello1" />
        <Run id="hello2" />
      </Sec>

      <Sec id="chi-thi" title="Chỉ thị (directive)">
        <p>Chỉ thị là lệnh cho <b>assembler</b> (không phải lệnh cho CPU): cấp phát biến, chia vùng chương trình.</p>
        <Table
          head={['Chỉ thị', 'Ý nghĩa']}
          mono={[0]}
          rows={[
            ['.text / .data', 'Bắt đầu vùng code / vùng dữ liệu'],
            ['.byte / .half / .word', 'Cấp phát 1 / 2 / 4 byte với giá trị cho trước (cách nhau bằng dấu phẩy)'],
            ['.ascii "abc"', 'Chuỗi KHÔNG có \\0 ở cuối'],
            ['.asciz "abc"', 'Chuỗi CÓ \\0 ở cuối'],
            ['.space n', 'Dành n byte (giá trị 0)'],
            ['.float', 'Số thực 32 bit'],
          ]}
        />
      </Sec>

      <Sec id="ecall" title="Dịch vụ hệ thống (ecall)">
        <Steps items={['Nạp số dịch vụ vào a7', 'Nạp tham số (nếu có) vào a0, a1, … (số thực: fa0)', 'Gọi ecall', 'Lấy kết quả (nếu có) trong a0']} />
        <Table
          head={['a7', 'Dịch vụ', 'Vào', 'Ra']}
          rows={[
            ['1', 'In số nguyên', 'a0 = số', ''],
            ['2', 'In số thực', 'fa0 = số', ''],
            ['4', 'In chuỗi', 'a0 = địa chỉ chuỗi', ''],
            ['5', 'Đọc số nguyên', '', 'a0 = số'],
            ['8', 'Đọc chuỗi', 'a0 = địa chỉ vùng nhớ, a1 = độ dài tối đa', ''],
            ['10', 'Kết thúc chương trình', '', ''],
            ['11', 'In 1 ký tự', 'a0 = ký tự', ''],
            ['12', 'Đọc 1 ký tự', '', 'a0 = ký tự'],
          ]}
        />
        <Run id="hello3" />
        <p>Khi chương trình gọi dịch vụ đọc (5, 8, 12), Lab dừng lại và hiện ô nhập ở khung Màn hình. Gõ rồi bấm Enter là chạy tiếp.</p>
      </Sec>

      <Sec id="ban-do" title="Bài: vẽ bản đồ vùng .data (slide 8)">
        <Problem title="Đề" hint="Biến xếp liên tiếp nhau. .asciz thêm 1 byte 0. .word phải bắt đầu ở địa chỉ chia hết cho 4; thiếu thì chèn byte đệm.">
          <Code run={false} code={ex('datamap').code.split('.text')[0]} />
        </Problem>
        <Solution>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Địa chỉ</th><th>Nhãn</th><th>Nội dung (hex)</th><th>Ghi chú</th></tr></thead>
              <tbody>
                {MAP.map(([a, l, c, n]) => <tr key={a}><td className="mono">{a}</td><td className="mono">{l}</td><td className="mono">{c}</td><td>{n}</td></tr>)}
              </tbody>
            </table>
          </div>
          <p>Mở trong Lab, chọn tab Bộ nhớ → <b>.data</b> → chế độ <b>Byte</b> để thấy từng byte và nhãn (gạch chân tím). Chế độ Word hiển thị theo little-endian nên <code>61 62 63 64</code> hiện thành <code>64636261</code>.</p>
          <Run id="datamap" />
          <Note kind="warn"><p>In st2 bằng dịch vụ 4 sẽ in lố sang X2, vì <code>.ascii</code> không có byte 0 kết thúc.</p></Note>
        </Solution>
      </Sec>

      <Sec id="bt1" title="Bài 3.1 – 3.4">
        <Problem title="Bài 3.1 — f = g + (h − 5)" hint="f, g, h ở x5, x6, x7. Dùng addi với số âm.">
          <p>1. Viết assembly với số lệnh ít nhất. 2. Viết chương trình đầy đủ: khai báo f, g, h, khởi tạo, tính và lưu f.</p>
        </Problem>
        <Solution>
          <Code run={false} code={`addi x5, x7, -5     # f = h - 5
add  x5, x6, x5     # f = g + f`} title="Phần 1: 2 lệnh là tối thiểu" />
          <Run id="ex31" title="Phần 2: chương trình đầy đủ (slide 11)" />
        </Solution>

        <Problem title="Bài 3.2 — B[4] = A[i − j]" hint="i, j ở x28, x29; A, B ở x10, x11. Tính (i − j) × 4 rồi cộng vào địa chỉ A. B[4] ở offset 4 × 4.">
          <p>Viết assembly, rồi viết chương trình đầy đủ khai báo hai mảng ít nhất 6 phần tử.</p>
        </Problem>
        <Solution>
          <Run id="ex32" />
          <Note kind="slide"><p>Lời giải trên slide 13 ghi <code>sw t5, 32(a1) #store to B[8]</code>: offset 32 là <b>B[8]</b>, không phải B[4]. Đúng đề phải là <b>16</b>. (t3 = x28, t4 = x29 nên phần còn lại khớp.)</p></Note>
        </Solution>

        <Problem title="Bài 3.3 — dịch ngược sang C" hint="f, g ở x5, x6; A ở x10, B ở x11. slli 2 = nhân 4; addi x12, x30, 8 = cộng 8 byte = 2 phần tử.">
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
          <Code lang="c" code={`f = A[f];                       // f bị ghi đè
B[g] = A[f_cũ + 2] + A[f_cũ];   // nếu lệnh cuối là sw`} />
          <p>Lệnh cuối gần như chắc chắn là <code>sw x30, 0(x31)</code> gõ nhầm thành <code>lw</code> (bài gốc trong sách P&amp;H dùng store). Nếu đúng là <code>lw</code> thì lệnh cuối chỉ là <code>x30 = B[g]</code> và phép cộng trước đó bị bỏ phí. Nên hỏi lại giảng viên.</p>
          <Run id="ex33" title="Chạy thử bản dùng sw (f = 1, g = 2)" />
        </Solution>

        <Problem title="Bài 3.4 — mã máy của sw x5, 32(x30)">
          <p>Tìm định dạng và mã máy.</p>
        </Problem>
        <Solution>
          <Code lang="text" code={`S-type. imm = 32 = 0000 0010 0000 (12 bit)
imm[11:5] = 0000001,  imm[4:0] = 00000
rs2 = x5 = 00101,  rs1 = x30 = 11110,  funct3 = 010,  opcode = 0100011

[0000001][00101][11110][010][00000][0100011]
→ 0000 0010 0101 1111 0010 0000 0010 0011 = 0x025F2023`} />
          <p>Thử gõ lệnh này vào widget mã hoá lệnh ở Chương 3 để thấy từng trường được tô màu.</p>
        </Solution>
      </Sec>

      <Sec id="bt2" title="Bài 3.5 – 3.8">
        <Problem title="Bài 3.5 — in “odd” hoặc “even”" hint="Đọc số bằng ecall 5. andi t0, a0, 1 cho bit cuối: 1 = lẻ.">
          <p>Nhập một số nguyên X, in “odd” nếu X lẻ, “even” nếu X chẵn.</p>
        </Problem>
        <Solution>
          <Run id="ex35" />
          <p><code>andi</code> với 1 vẫn đúng với số âm: −3 = <code>…1101</code>, bit cuối 1 → lẻ.</p>
        </Solution>

        <Problem title="Bài 3.6 — trị tuyệt đối" hint="Hàm abs: nếu a0 ≥ 0 thì giữ nguyên, ngược lại a0 = 0 − a0. Lặp ở main đến khi đọc được 0.">
          <p>1. Viết hàm nhận X, trả |X|. 2. Chương trình đọc một số, in trị tuyệt đối. 3. Lặp lại đến khi nhập 0.</p>
        </Problem>
        <Solution>
          <Run id="ex36" />
          <Note kind="key" title="Sao cần li a7, 10 + ecall? (câu hỏi slide 24)"><p>Không có nó, CPU chạy tuột xuống code hàm <code>abs</code> (CPU không biết đâu là “hết chương trình”), rồi <code>jr ra</code> nhảy về chỗ cũ → chạy sai hoặc lặp vô hạn. Thử xoá 2 dòng đó trong Lab và chạy từng bước để thấy.</p></Note>
        </Solution>

        <Problem title="Bài 3.7 — tổng 1 + 2 + … + n" hint="Hàm sum nhận n trong a7 (theo đề), trả tổng trong a0. Phải chép n sang a7 SAU khi ecall đọc xong.">
          <p>Đọc n dương, tính và in tổng 1…n bằng một hàm.</p>
        </Problem>
        <Solution>
          <Run id="ex37" />
          <p>Đề dùng a7 làm tham số khá lạ vì a7 cũng là thanh ghi chọn dịch vụ ecall. Trong thực tế nên truyền n qua a0.</p>
        </Solution>

        <Problem title="Bài 3.8 — strlen" hint="Đọc chuỗi bằng ecall 8 vào một vùng .space 256. Đếm từng byte đến khi gặp 0. Dịch vụ 8 giữ lại ký tự xuống dòng '\n' (mã 10), đừng đếm nó.">
          <p>Viết hàm <code>strlen</code>, đọc chuỗi tối đa 255 ký tự, in độ dài.</p>
        </Problem>
        <Solution>
          <Run id="ex38" />
        </Solution>
      </Sec>

      <Sec id="kiem-tra" title="Tự kiểm tra">
        <Pitfalls items={[
          'Quên li a7, 10 + ecall ở cuối main.',
          'Ghi đè a0 trước khi ecall in số (ví dụ dùng a0 làm biến tạm).',
          'Dùng .ascii khi cần chuỗi có \\0 (phải dùng .asciz).',
          'Đọc chuỗi bằng dịch vụ 8 mà quên chuỗi có thêm \\n ở cuối.',
          'Đặt nhãn biến trên một dòng rồi .word ở dòng sau mà quên căn lề khi tự tính địa chỉ.',
        ]} />
        <SelfCheck items={[
          { q: 'Muốn đọc một số nguyên từ bàn phím: a7 = ? Kết quả ở đâu?', a: 'a7 = 5; kết quả ở a0.' },
          { q: '.asciz "Hi" chiếm mấy byte?', a: '3 byte: H, i, \\0.' },
          { q: 'Sau .byte 1, 2, 3 là .word 7. Word đó bắt đầu ở offset nào?', a: 'Offset 4 (đệm 1 byte sau 3 byte).' },
          { q: 'Vùng .text trong RARS bắt đầu ở đâu?', a: '0x00400000' },
        ]} />
      </Sec>
    </Lesson>
  );
}
