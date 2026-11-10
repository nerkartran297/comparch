import type { Metadata } from 'next';
import Lesson from '@/components/lesson/Lesson';
import { Formula, Note, Pitfalls, Sec, SelfCheck, Sub, Table } from '@/components/lesson/Blocks';
import Code from '@/components/lesson/Code';
import Gates from '@/components/widgets/ch4/Gates';
import Mux from '@/components/widgets/ch4/Mux';
import FullAdder from '@/components/widgets/ch4/FullAdder';
import CarryRace from '@/components/widgets/ch4/CarryRace';
import Multiplier from '@/components/widgets/ch4/Multiplier';
import Divider from '@/components/widgets/ch4/Divider';
import Ieee754 from '@/components/widgets/ch4/Ieee754';
import FpArith from '@/components/widgets/ch4/FpArith';
import FloatErrors from '@/components/widgets/ch4/FloatErrors';
import { EXAMPLES } from '@/lib/examples.mjs';

export const metadata: Metadata = { title: 'Chương 4B: Mạch logic, nhân chia, số thực' };
const ex = (id: string) => EXAMPLES.find((e) => e.id === id)!;
const Run = ({ id, title }: { id: string; title?: string }) => <Code code={ex(id).code} title={title ?? ex(id).title} runTitle={ex(id).title} />;

export default function Page() {
  return (
    <Lesson
      step="chuong-4b"
      summary={[
        <>Phép tính trong máy được làm bằng <b>mạch logic</b> ghép từ cổng AND, OR, NOT. Luật quan trọng nhất: <b>De Morgan</b>.</>,
        <>Full adder: <code>S = A⊕B⊕Cin</code>, <code>Cout = AB + ACin + BCin</code>. Ripple-carry chậm (trễ tăng theo số bit); carry-lookahead nhanh.</>,
        <>Nhân = dịch + cộng; n bit × n bit → 2n bit. Chia = dịch + trừ. RISC-V: <code>mul/mulh</code>, <code>div/rem</code>, không báo chia cho 0.</>,
        <>IEEE 754 single: <code>1 bit dấu | 8 bit mũ E | 23 bit F</code>, giá trị (−1)^S × 1.F × 2^(E−127).</>,
        <>E = 0: số 0 / không chuẩn hoá. E = 255: ∞ (F = 0) hoặc NaN (F ≠ 0). Số thực chỉ gần đúng: đừng so sánh bằng ==.</>,
      ]}
      toc={[
        { id: 'logic', title: 'Mạch logic' },
        { id: 'cong', title: 'Mạch cộng' },
        { id: 'nhan', title: 'Phép nhân' },
        { id: 'chia', title: 'Phép chia' },
        { id: 'ieee', title: 'Số thực IEEE 754' },
        { id: 'fp-tinh', title: 'Cộng, nhân số thực' },
        { id: 'rv32f', title: 'Lệnh số thực RV32F' },
        { id: 'kiem-tra', title: 'Tự kiểm tra' },
      ]}
    >
      <Sec id="logic" title="Cơ bản về mạch logic (Phụ lục A)" kicker="4.7">
        <p>Máy cộng hai số thế nào? Bằng <b>mạch logic</b>, ghép từ các <b>cổng</b> AND, OR, NOT. Lý thuyết đứng sau là <b>đại số Boole</b>: biến chỉ có 0 (FALSE) và 1 (TRUE). Thứ tự ưu tiên: NOT &gt; AND &gt; OR.</p>
        <Gates />
        <Table
          head={['Luật', 'Dạng AND', 'Dạng OR']}
          mono={[1, 2]}
          rows={[
            ['Giao hoán', 'A·B = B·A', 'A+B = B+A'],
            ['Kết hợp', 'A·(B·C) = (A·B)·C', 'A+(B+C) = (A+B)+C'],
            ['Phân phối', 'A·(B+C) = A·B + A·C', 'A+(B·C) = (A+B)·(A+C)'],
            ['Đồng nhất', '1·A = A', '0+A = A'],
            ['Triệt tiêu', '0·A = 0', '1+A = 1'],
            ['Bù', 'A·Ā = 0', 'A+Ā = 1'],
            ['Luỹ đẳng', 'A·A = A', 'A+A = A'],
            ['De Morgan', '¬(A·B) = Ā + B̄', '¬(A+B) = Ā · B̄'],
          ]}
          caption="Các luật đại số Boole (slide 24)"
        />
        <Mux />
      </Sec>

      <Sec id="cong" title="Mạch cộng" kicker="4.8">
        <FullAdder />
        <Sub title="Bộ cộng n bit nối tiếp (ripple-carry)">
          <p>Nối n full adder: Cout của bit i thành Cin của bit i+1. <b>Chậm</b> vì bit cao phải chờ số nhớ “lăn” qua tất cả bit thấp: thời gian tỉ lệ với số bit.</p>
          <p><b>Làm nhanh cách 1 — phần cứng vô hạn:</b> khai triển công thức nhớ trực tiếp theo đầu vào, ví dụ c2 = a1·a0·b0 + a1·a0·c0 + a1·b0·c0 + b1·a0·b0 + b1·a0·c0 + b1·b0·c0 + a1·b1. Nhanh, nhưng số cổng bùng nổ khi n lớn.</p>
          <p><b>Làm nhanh cách 2 — carry-lookahead:</b> với mỗi bit định nghĩa</p>
          <Formula caption="g: cả 2 bit là 1 thì chắc chắn sinh nhớ · p: có ít nhất 1 bit là 1 thì nhớ vào sẽ được truyền tiếp">gᵢ = aᵢ·bᵢ (generate)    pᵢ = aᵢ + bᵢ (propagate)    cᵢ₊₁ = gᵢ + pᵢ·cᵢ</Formula>
          <Code lang="text" code={`c1 = g0 + p0·c0
c2 = g1 + p1·g0 + p1·p0·c0
c3 = g2 + p2·g1 + p2·p1·g0 + p2·p1·p0·c0
c4 = g3 + p3·g2 + p3·p2·g1 + p3·p2·p1·g0 + p3·p2·p1·p0·c0`} title="Khai triển cho 4 bit: mọi c tính song song từ a, b, c0" />
          <p>Với 4 bit: mọi số nhớ có sau 3 mức cổng, mọi bit tổng có sau tối đa 4 mức cổng. Với 16 bit: ghép 4 khối 4 bit, mỗi khối có “siêu” generate/propagate <code>P0 = p3·p2·p1·p0</code>, <code>G0 = g3 + p3·g2 + p3·p2·g1 + p3·p2·p1·g0</code>, rồi lại dùng đúng công thức lookahead ở tầng thứ hai: <code>C1 = G0 + P0·c0</code>…</p>
          <CarryRace />
        </Sub>
      </Sec>

      <Sec id="nhan" title="Phép nhân" kicker="4.9">
        <p>Nhân nhị phân giống nhân tay, nhưng mỗi chữ số chỉ là 0 hoặc 1: nhân 1 là chép, nhân 0 là bỏ. Vậy nhân = <b>một chuỗi dịch và cộng</b>. n bit × n bit cho kết quả <b>2n bit</b>.</p>
        <Multiplier />
        <p><b>Bộ nhân nhanh</b> (slide 46–47): tạo mọi tích riêng phần <b>cùng lúc</b>, rồi cộng chúng theo <b>cây</b> (cộng từng cặp song song) → chỉ cần khoảng log₂(n) tầng cộng thay vì n lần.</p>
        <Code run={false} code={`mul    t1, s0, s1   # 32 bit THẤP của tích
mulh   t1, s0, s1   # 32 bit CAO, cả hai có dấu
mulhu  t1, s0, s1   # 32 bit CAO, cả hai không dấu
mulhsu t1, s0, s1   # 32 bit CAO, s0 có dấu, s1 không dấu`} title="Lệnh nhân RV32M" />
      </Sec>

      <Sec id="chia" title="Phép chia" kicker="4.10">
        <Formula>Số bị chia = Thương × Số chia + Số dư</Formula>
        <p>Chia = đoán từng chữ số thương, <b>dịch trái và trừ</b>.</p>
        <Divider />
        <Code run={false} code={`div  t1, t2, t3   # t1 = t2 / t3 (có dấu)
divu t1, t2, t3   # không dấu
rem  t1, t2, t3   # t1 = t2 % t3 (có dấu)
remu t1, t2, t3   # không dấu`} title="Lệnh chia RV32M" />
        <Note kind="warn"><p>Phần cứng <b>không báo tràn và không báo chia cho 0</b>. Phần mềm phải tự kiểm tra số chia ≠ 0. (Theo đặc tả RISC-V, chia cho 0 cho thương = −1, tức toàn bit 1, và số dư = số bị chia.)</p></Note>
        <Sub title="Nhân, chia có dấu">
          <p>Làm như không dấu trên giá trị tuyệt đối, rồi sửa dấu. Nhân: hai số cùng dấu → dương, khác dấu → âm. Chia: thương theo quy tắc như nhân; <b>số dư luôn cùng dấu với số bị chia</b>.</p>
          <Table head={['Phép', 'Thương', 'Dư', 'Kiểm tra']} rows={[['−7 / 2', '−3', '−1', '−3 × 2 + (−1) = −7'], ['7 / −2', '−3', '1', '−3 × (−2) + 1 = 7']]} mono={[0, 3]} />
          <Run id="divrem" title="Slide 54: đọc a, b, in a / b và a % b (thử nhập −7 rồi 2)" />
          <Run id="gcd" title="Slide 55: UCLN và BCNN" />
        </Sub>
      </Sec>

      <Sec id="ieee" title="Số thực dấu phẩy động — IEEE 754" kicker="4.11">
        <p>Số nguyên không biểu diễn được 3.14, khối lượng Trái Đất 5.97 × 10²⁴ kg hay 1.6 × 10⁻²⁷ kg. Ý tưởng: viết dạng khoa học. Thập phân: 2013.1228 = <b>2.0131228 × 10³</b>. Nhị phân: <b>1.xxxx × 2^mũ</b>. Cần lưu 3 thứ: <b>dấu</b>, <b>phần định trị</b> (mantissa) và <b>số mũ</b>.</p>
        <Formula caption="Single precision (float, 32 bit): S 1 bit · E 8 bit · F 23 bit · bias = 127. Double (64 bit): 1 · 11 · 52, bias = 1023.">(−1)^S × 1.F × 2^(E − 127)</Formula>
        <ul>
          <li><b>E</b> là số mũ đã cộng <b>bias 127</b> để lưu được mũ âm mà không cần bù 2. Mũ thật = E − 127.</li>
          <li>Số “1.” đầu <b>không lưu</b> (bit ẩn), vì số chuẩn hoá luôn bắt đầu bằng 1.</li>
        </ul>
        <Ieee754 />
        <Table
          head={['E', 'F', 'Ý nghĩa']}
          mono={[0]}
          rows={[
            ['0000 0000', '0', 'Số 0 (có +0 và −0)'],
            ['0000 0000', '≠ 0', 'Không chuẩn hoá: 0.F × 2⁻¹²⁶ — biểu diễn số cực nhỏ'],
            ['1 … 254', 'bất kỳ', 'Số bình thường'],
            ['1111 1111', '0', '± vô cực (ví dụ chia cho 0)'],
            ['1111 1111', '≠ 0', 'NaN — Not a Number (ví dụ 0/0)'],
          ]}
          caption="Các mã đặc biệt (slide 67)"
        />
        <p>Số dương nhỏ nhất (chuẩn hoá) = 1.0 × 2⁻¹²⁶ ≈ 1.18 × 10⁻³⁸. Lớn nhất = (2 − 2⁻²³) × 2¹²⁷ ≈ 3.4 × 10³⁸. <b>Overflow</b>: mũ dương quá lớn; <b>underflow</b>: mũ âm quá nhỏ, không vừa trường E.</p>
        <Table head={['Bài', 'Đáp án']} mono={[1]} rows={[['1.0₂ × 2⁻¹ (= 0.5)', '0 01111110 000…0 = 0x3F000000'], ['100.75 = 1.10010011 × 2⁶', '0 10000101 10010011000… = 0x42C98000'], ['9.6875 = 1.0011011 × 2³', '0x411B0000'], ['0xC1560000', '−13.375'], ['0x3F800000', '1.0']]} caption="Đáp án các ví dụ slide 50–54" />
      </Sec>

      <Sec id="fp-tinh" title="Cộng và nhân số thực" kicker="4.12">
        <FpArith />
        <Sub title="Làm tròn">
          <p>Khi tính, phần cứng giữ thêm 3 bit: <b>Guard</b>, <b>Round</b> và <b>Sticky</b> (sticky = 1 nếu có bất kỳ bit 1 nào bị dịch qua nó). IEEE 754 có 4 chế độ làm tròn: luôn lên (→ +∞), luôn xuống (→ −∞), cắt bỏ, và <b>làm tròn tới số chẵn gần nhất</b> (mặc định).</p>
          <FloatErrors />
          <Run id="float2" title="Thử sai số số thực trong Lab" />
        </Sub>
      </Sec>

      <Sec id="rv32f" title="Lệnh số thực RV32F" kicker="4.13">
        <p>Có 32 thanh ghi riêng <b>f0–f31</b> (tên ABI: ft0–ft11, fs0–fs11, fa0–fa7). Lệnh: <code>flw</code>/<code>fsw</code> (nạp/cất), <code>fadd.s</code>, <code>fsub.s</code>, <code>fmul.s</code>, <code>fdiv.s</code>, <code>fcvt.s.w</code> (int → float), <code>fmv.s</code> (chép). Đuôi <code>.s</code> = single, <code>.d</code> = double.</p>
        <Run id="float" title="Slide 77–78: float x = 0.75; printf(&quot;%f&quot;, x);" />
        <Note kind="tip"><p><code>fcvt.s.w ft1, zero</code> tạo ra 0.0, rồi <code>fadd.s fa0, ft0, ft1</code> = x + 0.0 là cách “chép” của slide. Gọn hơn: <code>fmv.s fa0, ft0</code>. Trong Lab, xem tab Thanh ghi → Số thực.</p></Note>
      </Sec>

      <Sec id="kiem-tra" title="Tự kiểm tra">
        <Pitfalls items={[
          'Quên cộng/trừ bias 127.',
          'Quên bỏ bit “1.” ẩn khi ghi F (hoặc quên thêm nó khi giải mã).',
          'Đổi phần lẻ sang nhị phân bằng cách chia 2 — phải NHÂN 2.',
          'Nhân hai số thực mà cộng E1 + E2 quên trừ 127.',
          'Quên kiểm tra số chia bằng 0 trước khi dùng div.',
        ]} />
        <SelfCheck items={[
          { q: 'Đổi −0.75 sang IEEE 754 single.', a: <>−0.11₂ = −1.1 × 2⁻¹ → S = 1, E = 126 = 01111110, F = 1000… → <code>0xBF400000</code></> },
          { q: 'Full adder: A = 1, B = 0, Cin = 1. S, Cout = ?', a: 'S = 0, Cout = 1 (1 + 0 + 1 = 10₂).' },
          { q: 'Nhân 4 bit: 3 × 7 = ? Kết quả mấy bit?', a: '21 = 0001 0101, 8 bit (2n).' },
          { q: 'E = 255, F = 0, S = 1 là gì?', a: '−∞' },
          { q: 'Vì sao ripple-carry chậm?', a: 'Bit cao phải chờ số nhớ của tất cả bit thấp hơn; độ trễ tăng tuyến tính theo số bit.' },
        ]} />
      </Sec>
    </Lesson>
  );
}
