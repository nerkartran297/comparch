import type { Metadata } from 'next';
import Lesson from '@/components/lesson/Lesson';
import { Formula, Note, Pitfalls, Sec, SelfCheck, Sub, Table } from '@/components/lesson/Blocks';
import Code from '@/components/lesson/Code';
import Example from '@/components/lesson/Example';
import { L } from '@/components/i18n';
import Gates from '@/components/widgets/ch4/Gates';
import Mux from '@/components/widgets/ch4/Mux';
import FullAdder from '@/components/widgets/ch4/FullAdder';
import CarryRace from '@/components/widgets/ch4/CarryRace';
import Multiplier from '@/components/widgets/ch4/Multiplier';
import Divider from '@/components/widgets/ch4/Divider';
import Ieee754 from '@/components/widgets/ch4/Ieee754';
import FpArith from '@/components/widgets/ch4/FpArith';
import FloatErrors from '@/components/widgets/ch4/FloatErrors';

export const metadata: Metadata = { title: 'Chương 4B: Mạch logic, nhân chia, số thực' };

export default function Page() {
  return (
    <Lesson
      step="chuong-4b"
      summary={[
        <L key="s1"
          vi={<>Phép tính trong máy được làm bằng <b>mạch logic</b> ghép từ cổng AND, OR, NOT. Luật quan trọng nhất: <b>De Morgan</b>.</>}
          en={<>Arithmetic in the machine is done by <b>logic circuits</b> built from AND, OR and NOT gates. The most important law: <b>De Morgan</b>.</>} />,
        <L key="s2"
          vi={<>Full adder: <code>S = A⊕B⊕Cin</code>, <code>Cout = AB + ACin + BCin</code>. Ripple-carry chậm (trễ tăng theo số bit); carry-lookahead nhanh.</>}
          en={<>Full adder: <code>S = A⊕B⊕Cin</code>, <code>Cout = AB + ACin + BCin</code>. Ripple-carry is slow (delay grows with the number of bits); carry-lookahead is fast.</>} />,
        <L key="s3"
          vi={<>Nhân = dịch + cộng; n bit × n bit → 2n bit. Chia = dịch + trừ. RISC-V: <code>mul/mulh</code>, <code>div/rem</code>, không báo chia cho 0.</>}
          en={<>Multiply = shift + add; n bits × n bits → 2n bits. Divide = shift + subtract. RISC-V: <code>mul/mulh</code>, <code>div/rem</code>, and no error on division by 0.</>} />,
        <L key="s4"
          vi={<>IEEE 754 single: <code>1 bit dấu | 8 bit mũ E | 23 bit F</code>, giá trị (−1)^S × 1.F × 2^(E−127).</>}
          en={<>IEEE 754 single: <code>1 sign bit | 8 exponent bits E | 23 bits F</code>, value (−1)^S × 1.F × 2^(E−127).</>} />,
        <L key="s5"
          vi={<>E = 0: số 0 / không chuẩn hoá. E = 255: ∞ (F = 0) hoặc NaN (F ≠ 0). Số thực chỉ gần đúng: đừng so sánh bằng ==.</>}
          en={<>E = 0: zero / denormalized. E = 255: ∞ (F = 0) or NaN (F ≠ 0). Floats are only approximations: don&apos;t compare them with ==.</>} />,
      ]}
      toc={[
        { id: 'logic', title: <L vi="Mạch logic" en="Logic circuits" /> },
        { id: 'cong', title: <L vi="Mạch cộng" en="Adders" /> },
        { id: 'nhan', title: <L vi="Phép nhân" en="Multiplication" /> },
        { id: 'chia', title: <L vi="Phép chia" en="Division" /> },
        { id: 'ieee', title: <L vi="Số thực IEEE 754" en="IEEE 754 floating point" /> },
        { id: 'fp-tinh', title: <L vi="Cộng, nhân số thực" en="Float add & multiply" /> },
        { id: 'rv32f', title: <L vi="Lệnh số thực RV32F" en="RV32F float instructions" /> },
        { id: 'kiem-tra', title: <L vi="Tự kiểm tra" en="Check yourself" /> },
      ]}
    >
      <Sec id="logic" title={<L vi="Cơ bản về mạch logic (Phụ lục A)" en="Logic design basics (Appendix A)" />} kicker="4.7">
        <p><L
          vi={<>Máy cộng hai số thế nào? Bằng <b>mạch logic</b>, ghép từ các <b>cổng</b> AND, OR, NOT. Lý thuyết đứng sau là <b>đại số Boole</b>: biến chỉ có 0 (FALSE) và 1 (TRUE). Thứ tự ưu tiên: NOT &gt; AND &gt; OR.</>}
          en={<>How does a machine add two numbers? With <b>logic circuits</b> built from AND, OR and NOT <b>gates</b>. The theory behind them is <b>Boolean algebra</b>: variables are only 0 (FALSE) and 1 (TRUE). Precedence: NOT &gt; AND &gt; OR.</>} /></p>
        <Gates />
        <Table
          head={[<L key="h1" vi="Luật" en="Law" />, <L key="h2" vi="Dạng AND" en="AND form" />, <L key="h3" vi="Dạng OR" en="OR form" />]}
          mono={[1, 2]}
          rows={[
            [<L key="l" vi="Giao hoán" en="Commutative" />, 'A·B = B·A', 'A+B = B+A'],
            [<L key="l" vi="Kết hợp" en="Associative" />, 'A·(B·C) = (A·B)·C', 'A+(B+C) = (A+B)+C'],
            [<L key="l" vi="Phân phối" en="Distributive" />, 'A·(B+C) = A·B + A·C', 'A+(B·C) = (A+B)·(A+C)'],
            [<L key="l" vi="Đồng nhất" en="Identity" />, '1·A = A', '0+A = A'],
            [<L key="l" vi="Triệt tiêu" en="Zero and one" />, '0·A = 0', '1+A = 1'],
            [<L key="l" vi="Bù" en="Inverse" />, 'A·Ā = 0', 'A+Ā = 1'],
            [<L key="l" vi="Luỹ đẳng" en="Idempotent" />, 'A·A = A', 'A+A = A'],
            ['De Morgan', '¬(A·B) = Ā + B̄', '¬(A+B) = Ā · B̄'],
          ]}
          caption={<L vi="Các luật đại số Boole (slide 24)" en="Laws of Boolean algebra (slide 24)" />}
        />
        <Mux />
      </Sec>

      <Sec id="cong" title={<L vi="Mạch cộng" en="Adder circuits" />} kicker="4.8">
        <FullAdder />
        <Sub title={<L vi="Bộ cộng n bit nối tiếp (ripple-carry)" en="The n-bit ripple-carry adder" />}>
          <p><L
            vi={<>Nối n full adder: Cout của bit i thành Cin của bit i+1. <b>Chậm</b> vì bit cao phải chờ số nhớ “lăn” qua tất cả bit thấp: thời gian tỉ lệ với số bit.</>}
            en={<>Chain n full adders: the Cout of bit i becomes the Cin of bit i+1. It is <b>slow</b> because the high bits must wait for the carry to “ripple” through every lower bit: the time grows with the number of bits.</>} /></p>
          <p><L
            vi={<><b>Làm nhanh cách 1 — phần cứng vô hạn:</b> khai triển công thức nhớ trực tiếp theo đầu vào, ví dụ c2 = a1·a0·b0 + a1·a0·c0 + a1·b0·c0 + b1·a0·b0 + b1·a0·c0 + b1·b0·c0 + a1·b1. Nhanh, nhưng số cổng bùng nổ khi n lớn.</>}
            en={<><b>Speed-up 1 — “infinite hardware”:</b> expand each carry formula directly in terms of the inputs, e.g. c2 = a1·a0·b0 + a1·a0·c0 + a1·b0·c0 + b1·a0·b0 + b1·a0·c0 + b1·b0·c0 + a1·b1. Fast, but the number of gates explodes as n grows.</>} /></p>
          <p><L
            vi={<><b>Làm nhanh cách 2 — carry-lookahead:</b> với mỗi bit định nghĩa</>}
            en={<><b>Speed-up 2 — carry-lookahead:</b> for each bit define</>} /></p>
          <Formula caption={<L
            vi="g: cả 2 bit là 1 thì chắc chắn sinh nhớ · p: có ít nhất 1 bit là 1 thì nhớ vào sẽ được truyền tiếp"
            en="g: if both bits are 1, a carry is definitely generated · p: if at least one bit is 1, an incoming carry is passed on" />}>
            gᵢ = aᵢ·bᵢ (generate)    pᵢ = aᵢ + bᵢ (propagate)    cᵢ₊₁ = gᵢ + pᵢ·cᵢ
          </Formula>
          <Code lang="text"
            title={<L vi="Khai triển cho 4 bit: mọi c tính song song từ a, b, c0" en="Expanded for 4 bits: every c is computed in parallel from a, b, c0" />}
            code={`c1 = g0 + p0·c0
c2 = g1 + p1·g0 + p1·p0·c0
c3 = g2 + p2·g1 + p2·p1·g0 + p2·p1·p0·c0
c4 = g3 + p3·g2 + p3·p2·g1 + p3·p2·p1·g0 + p3·p2·p1·p0·c0`} />
          <p><L
            vi={<>Với 4 bit: mọi số nhớ có sau 3 mức cổng, mọi bit tổng có sau tối đa 4 mức cổng. Với 16 bit: ghép 4 khối 4 bit, mỗi khối có “siêu” generate/propagate <code>P0 = p3·p2·p1·p0</code>, <code>G0 = g3 + p3·g2 + p3·p2·g1 + p3·p2·p1·g0</code>, rồi lại dùng đúng công thức lookahead ở tầng thứ hai: <code>C1 = G0 + P0·c0</code>…</>}
            en={<>With 4 bits: every carry is ready after 3 gate levels, and every sum bit after at most 4. With 16 bits: combine four 4-bit blocks, each with a “super” generate/propagate <code>P0 = p3·p2·p1·p0</code>, <code>G0 = g3 + p3·g2 + p3·p2·g1 + p3·p2·p1·g0</code>, then apply the very same lookahead formula at a second level: <code>C1 = G0 + P0·c0</code>…</>} /></p>
          <CarryRace />
        </Sub>
      </Sec>

      <Sec id="nhan" title={<L vi="Phép nhân" en="Multiplication" />} kicker="4.9">
        <p><L
          vi={<>Nhân nhị phân giống nhân tay, nhưng mỗi chữ số chỉ là 0 hoặc 1: nhân 1 là chép, nhân 0 là bỏ. Vậy nhân = <b>một chuỗi dịch và cộng</b>. n bit × n bit cho kết quả <b>2n bit</b>.</>}
          en={<>Binary multiplication is like long multiplication by hand, except every digit is 0 or 1: times 1 means copy, times 0 means skip. So multiplying = <b>a series of shifts and adds</b>. n bits × n bits gives a <b>2n-bit</b> result.</>} /></p>
        <Multiplier />
        <p><L
          vi={<><b>Bộ nhân nhanh</b> (slide 46–47): tạo mọi tích riêng phần <b>cùng lúc</b>, rồi cộng chúng theo <b>cây</b> (cộng từng cặp song song) → chỉ cần khoảng log₂(n) tầng cộng thay vì n lần.</>}
          en={<><b>Fast multiplier</b> (slides 46–47): form all the partial products <b>at once</b>, then add them in a <b>tree</b> (pairs added in parallel) → only about log₂(n) levels of adders instead of n additions.</>} /></p>
        <Code run={false}
          title={<L vi="Lệnh nhân RV32M" en="RV32M multiply instructions" />}
          code={`mul    t1, s0, s1   # 32 bit THẤP của tích
mulh   t1, s0, s1   # 32 bit CAO, cả hai có dấu
mulhu  t1, s0, s1   # 32 bit CAO, cả hai không dấu
mulhsu t1, s0, s1   # 32 bit CAO, s0 có dấu, s1 không dấu`}
          codeEn={`mul    t1, s0, s1   # LOW 32 bits of the product
mulh   t1, s0, s1   # HIGH 32 bits, both signed
mulhu  t1, s0, s1   # HIGH 32 bits, both unsigned
mulhsu t1, s0, s1   # HIGH 32 bits, s0 signed, s1 unsigned`} />
      </Sec>

      <Sec id="chia" title={<L vi="Phép chia" en="Division" />} kicker="4.10">
        <Formula><L vi="Số bị chia = Thương × Số chia + Số dư" en="Dividend = Quotient × Divisor + Remainder" /></Formula>
        <p><L
          vi={<>Chia = đoán từng chữ số thương, <b>dịch trái và trừ</b>.</>}
          en={<>Division = guess each quotient digit, <b>shift left and subtract</b>.</>} /></p>
        <Divider />
        <Code run={false}
          title={<L vi="Lệnh chia RV32M" en="RV32M divide instructions" />}
          code={`div  t1, t2, t3   # t1 = t2 / t3 (có dấu)
divu t1, t2, t3   # không dấu
rem  t1, t2, t3   # t1 = t2 % t3 (có dấu)
remu t1, t2, t3   # không dấu`}
          codeEn={`div  t1, t2, t3   # t1 = t2 / t3 (signed)
divu t1, t2, t3   # unsigned
rem  t1, t2, t3   # t1 = t2 % t3 (signed)
remu t1, t2, t3   # unsigned`} />
        <Note kind="warn"><p><L
          vi={<>Phần cứng <b>không báo tràn và không báo chia cho 0</b>. Phần mềm phải tự kiểm tra số chia ≠ 0. (Theo đặc tả RISC-V, chia cho 0 cho thương = −1, tức toàn bit 1, và số dư = số bị chia.)</>}
          en={<>The hardware <b>reports neither overflow nor division by 0</b>. Software must check that the divisor ≠ 0. (Per the RISC-V spec, dividing by 0 gives quotient = −1, i.e. all 1 bits, and remainder = the dividend.)</>} /></p></Note>
        <Sub title={<L vi="Nhân, chia có dấu" en="Signed multiply and divide" />}>
          <p><L
            vi={<>Làm như không dấu trên giá trị tuyệt đối, rồi sửa dấu. Nhân: hai số cùng dấu → dương, khác dấu → âm. Chia: thương theo quy tắc như nhân; <b>số dư luôn cùng dấu với số bị chia</b>.</>}
            en={<>Work on the absolute values as if unsigned, then fix the sign. Multiply: same signs → positive, different signs → negative. Divide: the quotient follows the same rule; <b>the remainder always has the sign of the dividend</b>.</>} /></p>
          <Table
            head={[<L key="h1" vi="Phép" en="Operation" />, <L key="h2" vi="Thương" en="Quotient" />, <L key="h3" vi="Dư" en="Remainder" />, <L key="h4" vi="Kiểm tra" en="Check" />]}
            rows={[['−7 / 2', '−3', '−1', '−3 × 2 + (−1) = −7'], ['7 / −2', '−3', '1', '−3 × (−2) + 1 = 7']]}
            mono={[0, 3]}
          />
          <Example id="divrem" title={<L vi="Slide 54: đọc a, b, in a / b và a % b (thử nhập −7 rồi 2)" en="Slide 54: read a, b, print a / b and a % b (try −7 then 2)" />} />
          <Example id="gcd" title={<L vi="Slide 55: UCLN và BCNN" en="Slide 55: GCD and LCM" />} />
        </Sub>
      </Sec>

      <Sec id="ieee" title={<L vi="Số thực dấu phẩy động — IEEE 754" en="Floating-point numbers — IEEE 754" />} kicker="4.11">
        <p><L
          vi={<>Số nguyên không biểu diễn được 3.14, khối lượng Trái Đất 5.97 × 10²⁴ kg hay 1.6 × 10⁻²⁷ kg. Ý tưởng: viết dạng khoa học. Thập phân: 2013.1228 = <b>2.0131228 × 10³</b>. Nhị phân: <b>1.xxxx × 2^mũ</b>. Cần lưu 3 thứ: <b>dấu</b>, <b>phần định trị</b> (mantissa) và <b>số mũ</b>.</>}
          en={<>Integers can&apos;t represent 3.14, the Earth&apos;s mass of 5.97 × 10²⁴ kg, or 1.6 × 10⁻²⁷ kg. The idea: use scientific notation. Decimal: 2013.1228 = <b>2.0131228 × 10³</b>. Binary: <b>1.xxxx × 2^exponent</b>. Three things need storing: the <b>sign</b>, the <b>mantissa</b> (significand) and the <b>exponent</b>.</>} /></p>
        <Formula caption={<L
          vi="Single precision (float, 32 bit): S 1 bit · E 8 bit · F 23 bit · bias = 127. Double (64 bit): 1 · 11 · 52, bias = 1023."
          en="Single precision (float, 32 bits): S 1 bit · E 8 bits · F 23 bits · bias = 127. Double (64 bits): 1 · 11 · 52, bias = 1023." />}>
          (−1)^S × 1.F × 2^(E − 127)
        </Formula>
        <ul>
          <li><L
            vi={<><b>E</b> là số mũ đã cộng <b>bias 127</b> để lưu được mũ âm mà không cần bù 2. Mũ thật = E − 127.</>}
            en={<><b>E</b> is the exponent with a <b>bias of 127</b> added, so negative exponents can be stored without two&apos;s complement. Real exponent = E − 127.</>} /></li>
          <li><L
            vi={<>Số “1.” đầu <b>không lưu</b> (bit ẩn), vì số chuẩn hoá luôn bắt đầu bằng 1.</>}
            en={<>The leading “1.” is <b>not stored</b> (the hidden bit), because a normalized number always starts with 1.</>} /></li>
        </ul>
        <Ieee754 />
        <Table
          head={['E', 'F', <L key="h3" vi="Ý nghĩa" en="Meaning" />]}
          mono={[0]}
          rows={[
            ['0000 0000', '0', <L key="m" vi="Số 0 (có +0 và −0)" en="Zero (there is +0 and −0)" />],
            ['0000 0000', '≠ 0', <L key="m" vi="Không chuẩn hoá: 0.F × 2⁻¹²⁶ — biểu diễn số cực nhỏ" en="Denormalized: 0.F × 2⁻¹²⁶ — for extremely small numbers" />],
            ['1 … 254', <L key="f" vi="bất kỳ" en="anything" />, <L key="m" vi="Số bình thường" en="A normal number" />],
            ['1111 1111', '0', <L key="m" vi="± vô cực (ví dụ chia cho 0)" en="± infinity (e.g. division by 0)" />],
            ['1111 1111', '≠ 0', <L key="m" vi="NaN — Not a Number (ví dụ 0/0)" en="NaN — Not a Number (e.g. 0/0)" />],
          ]}
          caption={<L vi="Các mã đặc biệt (slide 67)" en="Special encodings (slide 67)" />}
        />
        <p><L
          vi={<>Số dương nhỏ nhất (chuẩn hoá) = 1.0 × 2⁻¹²⁶ ≈ 1.18 × 10⁻³⁸. Lớn nhất = (2 − 2⁻²³) × 2¹²⁷ ≈ 3.4 × 10³⁸. <b>Overflow</b>: mũ dương quá lớn; <b>underflow</b>: mũ âm quá nhỏ, không vừa trường E.</>}
          en={<>Smallest positive (normalized) number = 1.0 × 2⁻¹²⁶ ≈ 1.18 × 10⁻³⁸. Largest = (2 − 2⁻²³) × 2¹²⁷ ≈ 3.4 × 10³⁸. <b>Overflow</b>: a positive exponent too large; <b>underflow</b>: a negative exponent too small to fit in the E field.</>} /></p>
        <Table
          head={[<L key="h1" vi="Bài" en="Exercise" />, <L key="h2" vi="Đáp án" en="Answer" />]}
          mono={[1]}
          rows={[['1.0₂ × 2⁻¹ (= 0.5)', '0 01111110 000…0 = 0x3F000000'], ['100.75 = 1.10010011 × 2⁶', '0 10000101 10010011000… = 0x42C98000'], ['9.6875 = 1.0011011 × 2³', '0x411B0000'], ['0xC1560000', '−13.375'], ['0x3F800000', '1.0']]}
          caption={<L vi="Đáp án các ví dụ slide 50–54" en="Answers to the examples on slides 50–54" />}
        />
      </Sec>

      <Sec id="fp-tinh" title={<L vi="Cộng và nhân số thực" en="Adding and multiplying floats" />} kicker="4.12">
        <FpArith />
        <Sub title={<L vi="Làm tròn" en="Rounding" />}>
          <p><L
            vi={<>Khi tính, phần cứng giữ thêm 3 bit: <b>Guard</b>, <b>Round</b> và <b>Sticky</b> (sticky = 1 nếu có bất kỳ bit 1 nào bị dịch qua nó). IEEE 754 có 4 chế độ làm tròn: luôn lên (→ +∞), luôn xuống (→ −∞), cắt bỏ, và <b>làm tròn tới số chẵn gần nhất</b> (mặc định).</>}
            en={<>While computing, the hardware keeps 3 extra bits: <b>Guard</b>, <b>Round</b> and <b>Sticky</b> (sticky = 1 if any 1 bit was shifted past it). IEEE 754 has 4 rounding modes: always up (→ +∞), always down (→ −∞), truncate, and <b>round to nearest even</b> (the default).</>} /></p>
          <FloatErrors />
          <Example id="float2" title={<L vi="Thử sai số số thực trong Lab" en="Try floating-point errors in the Lab" />} />
        </Sub>
      </Sec>

      <Sec id="rv32f" title={<L vi="Lệnh số thực RV32F" en="RV32F floating-point instructions" />} kicker="4.13">
        <p><L
          vi={<>Có 32 thanh ghi riêng <b>f0–f31</b> (tên ABI: ft0–ft11, fs0–fs11, fa0–fa7). Lệnh: <code>flw</code>/<code>fsw</code> (nạp/cất), <code>fadd.s</code>, <code>fsub.s</code>, <code>fmul.s</code>, <code>fdiv.s</code>, <code>fcvt.s.w</code> (int → float), <code>fmv.s</code> (chép). Đuôi <code>.s</code> = single, <code>.d</code> = double.</>}
          en={<>There are 32 separate registers <b>f0–f31</b> (ABI names: ft0–ft11, fs0–fs11, fa0–fa7). Instructions: <code>flw</code>/<code>fsw</code> (load/store), <code>fadd.s</code>, <code>fsub.s</code>, <code>fmul.s</code>, <code>fdiv.s</code>, <code>fcvt.s.w</code> (int → float), <code>fmv.s</code> (copy). The suffix <code>.s</code> = single, <code>.d</code> = double.</>} /></p>
        <Example id="float" title={<L vi='Slide 77–78: float x = 0.75; printf("%f", x);' en='Slides 77–78: float x = 0.75; printf("%f", x);' />} />
        <Note kind="tip"><p><L
          vi={<><code>fcvt.s.w ft1, zero</code> tạo ra 0.0, rồi <code>fadd.s fa0, ft0, ft1</code> = x + 0.0 là cách “chép” của slide. Gọn hơn: <code>fmv.s fa0, ft0</code>. Trong Lab, xem tab Thanh ghi → Số thực.</>}
          en={<><code>fcvt.s.w ft1, zero</code> makes 0.0, then <code>fadd.s fa0, ft0, ft1</code> = x + 0.0 is the slide&apos;s way of “copying”. Shorter: <code>fmv.s fa0, ft0</code>. In the Lab, open the Registers tab → Float.</>} /></p></Note>
      </Sec>

      <Sec id="kiem-tra" title={<L vi="Tự kiểm tra" en="Check yourself" />}>
        <Pitfalls items={[
          <L key="1" vi="Quên cộng/trừ bias 127." en="Forgetting to add/subtract the bias of 127." />,
          <L key="2" vi="Quên bỏ bit “1.” ẩn khi ghi F (hoặc quên thêm nó khi giải mã)." en="Forgetting to drop the hidden “1.” when writing F (or to add it back when decoding)." />,
          <L key="3" vi="Đổi phần lẻ sang nhị phân bằng cách chia 2 — phải NHÂN 2." en="Converting the fractional part to binary by dividing by 2 — you must MULTIPLY by 2." />,
          <L key="4" vi="Nhân hai số thực mà cộng E1 + E2 quên trừ 127." en="Multiplying two floats, adding E1 + E2 and forgetting to subtract 127." />,
          <L key="5" vi="Quên kiểm tra số chia bằng 0 trước khi dùng div." en="Forgetting to check for a zero divisor before using div." />,
        ]} />
        <SelfCheck items={[
          { q: <L vi="Đổi −0.75 sang IEEE 754 single." en="Convert −0.75 to IEEE 754 single." />, a: <L vi={<>−0.11₂ = −1.1 × 2⁻¹ → S = 1, E = 126 = 01111110, F = 1000… → <code>0xBF400000</code></>} en={<>−0.11₂ = −1.1 × 2⁻¹ → S = 1, E = 126 = 01111110, F = 1000… → <code>0xBF400000</code></>} /> },
          { q: <L vi="Full adder: A = 1, B = 0, Cin = 1. S, Cout = ?" en="Full adder: A = 1, B = 0, Cin = 1. S, Cout = ?" />, a: <L vi="S = 0, Cout = 1 (1 + 0 + 1 = 10₂)." en="S = 0, Cout = 1 (1 + 0 + 1 = 10₂)." /> },
          { q: <L vi="Nhân 4 bit: 3 × 7 = ? Kết quả mấy bit?" en="4-bit multiply: 3 × 7 = ? How many bits is the result?" />, a: <L vi="21 = 0001 0101, 8 bit (2n)." en="21 = 0001 0101, 8 bits (2n)." /> },
          { q: <L vi="E = 255, F = 0, S = 1 là gì?" en="What is E = 255, F = 0, S = 1?" />, a: '−∞' },
          { q: <L vi="Vì sao ripple-carry chậm?" en="Why is ripple-carry slow?" />, a: <L vi="Bit cao phải chờ số nhớ của tất cả bit thấp hơn; độ trễ tăng tuyến tính theo số bit." en="The high bits must wait for the carries of all the lower bits; the delay grows linearly with the number of bits." /> },
        ]} />
      </Sec>
    </Lesson>
  );
}
