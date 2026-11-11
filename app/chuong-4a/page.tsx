import type { Metadata } from 'next';
import Lesson from '@/components/lesson/Lesson';
import { Formula, Note, Pitfalls, Sec, SelfCheck, Table } from '@/components/lesson/Blocks';
import Example from '@/components/lesson/Example';
import { L } from '@/components/i18n';
import BinaryPlayground from '@/components/widgets/nen-tang/BinaryPlayground';
import Negate from '@/components/widgets/ch4/Negate';
import NumberWheel from '@/components/widgets/ch4/NumberWheel';
import SignExtend from '@/components/widgets/ch4/SignExtend';
import OverflowLab from '@/components/widgets/ch4/OverflowLab';

export const metadata: Metadata = { title: 'Chương 4A: Số nguyên, bù 2, tràn số' };

export default function Page() {
  return (
    <Lesson
      step="chuong-4a"
      summary={[
        <L key="s1"
          vi={<>n bit <b>không dấu</b>: 0 … 2ⁿ − 1. n bit <b>có dấu (bù 2)</b>: −2ⁿ⁻¹ … 2ⁿ⁻¹ − 1. 32 bit có dấu: −2 147 483 648 … 2 147 483 647.</>}
          en={<>n bits <b>unsigned</b>: 0 … 2ⁿ − 1. n bits <b>signed (two&apos;s complement)</b>: −2ⁿ⁻¹ … 2ⁿ⁻¹ − 1. 32-bit signed: −2,147,483,648 … 2,147,483,647.</>} />,
        <L key="s2"
          vi={<>Bù 2: bit trái nhất mang trọng số <b>âm</b>. Đổi dấu: <b>đảo hết bit rồi +1</b>.</>}
          en={<>Two&apos;s complement: the leftmost bit has a <b>negative</b> weight. To negate: <b>flip every bit, then add 1</b>.</>} />,
        <L key="s3"
          vi={<>Mở rộng dấu (sign extension): muốn thêm bit mà giữ giá trị thì <b>chép bit dấu sang trái</b>. <code>lb</code> mở rộng dấu, <code>lbu</code> điền 0.</>}
          en={<>Sign extension: to add bits while keeping the value, <b>copy the sign bit to the left</b>. <code>lb</code> sign-extends, <code>lbu</code> fills with 0.</>} />,
        <L key="s4"
          vi={<>Tràn số có dấu: cộng hai số <b>cùng dấu</b> mà ra kết quả <b>khác dấu</b>. Cộng khác dấu không bao giờ tràn.</>}
          en={<>Signed overflow: adding two numbers with the <b>same sign</b> gives a result with the <b>other sign</b>. Adding numbers with different signs never overflows.</>} />,
        <L key="s5"
          vi={<>RISC-V <b>không báo</b> khi tràn số; phần mềm phải tự kiểm tra.</>}
          en={<>RISC-V <b>does not report</b> overflow; software has to check for it.</>} />,
      ]}
      toc={[
        { id: 'khong-dau', title: <L vi="Số không dấu" en="Unsigned numbers" /> },
        { id: 'bu-2', title: <L vi="Số có dấu: bù 2" en="Signed: two's complement" /> },
        { id: 'doi-dau', title: <L vi="Đổi dấu" en="Negation" /> },
        { id: 'mo-rong', title: <L vi="Mở rộng dấu" en="Sign extension" /> },
        { id: 'lenh', title: <L vi="Lệnh có dấu / không dấu" en="Signed / unsigned instructions" /> },
        { id: 'tran', title: <L vi="Cộng, trừ, tràn số" en="Add, subtract, overflow" /> },
        { id: 'kiem-tra', title: <L vi="Tự kiểm tra" en="Check yourself" /> },
      ]}
    >
      <Note kind="tip" title={<L vi="Vì sao học phần này trước Chương 3?" en="Why learn this before Chapter 3?" />}>
        <p><L
          vi={<>Chương 3 dùng số âm (<code>addi s1, s1, -2</code>), số hex và mở rộng dấu (<code>lb</code>/<code>lbu</code>) liên tục. Hiểu bù 2 trước thì đọc Chương 3 không bị vấp.</>}
          en={<>Chapter 3 uses negative numbers (<code>addi s1, s1, -2</code>), hex and sign extension (<code>lb</code>/<code>lbu</code>) all the time. Understand two&apos;s complement first and Chapter 3 reads smoothly.</>} /></p>
      </Note>

      <Sec id="khong-dau" title={<L vi="Số nguyên không dấu" en="Unsigned integers" />} kicker="4.1">
        <Formula caption={<L vi="n bit biểu diễn được 0 … 2ⁿ − 1" en="n bits can represent 0 … 2ⁿ − 1" />}>x = xₙ₋₁·2ⁿ⁻¹ + … + x₁·2¹ + x₀·2⁰</Formula>
        <Table
          head={[<L key="h1" vi="Thập phân" en="Decimal" />, <L key="h2" vi="Nhị phân (phần cuối của 32 bit)" en="Binary (low end of 32 bits)" />]}
          rows={[['25', '0001 1001'], ['125', '0111 1101'], ['255', '1111 1111'], ['207', '1100 1111'], ['307', '0001 0011 0011']]}
          mono={[1]}
          caption={<L vi="Bài tập slide 7" en="Exercise, slide 7" />}
        />
      </Sec>

      <Sec id="bu-2" title={<L vi="Số nguyên có dấu: bù 2 (two's complement)" en="Signed integers: two's complement" />} kicker="4.2">
        <p><L
          vi={<>Máy tính dùng bù 2 để biểu diễn số âm. Cách đọc rất đơn giản: <b>bit trái nhất (MSB) mang trọng số âm</b>, các bit khác như bình thường.</>}
          en={<>Computers use two&apos;s complement to store negative numbers. Reading it is simple: <b>the leftmost bit (MSB) has a negative weight</b>, every other bit works as usual.</>} /></p>
        <Formula caption={<L vi="Bit dấu 0 → số dương; bit dấu 1 → số âm" en="Sign bit 0 → positive; sign bit 1 → negative" />}>x = −xₙ₋₁·2ⁿ⁻¹ + xₙ₋₂·2ⁿ⁻² + … + x₀·2⁰</Formula>
        <p><L
          vi={<>Ví dụ (slide 8): <code>1111 … 1111 1100</code> (32 bit) = −2³¹ + (2³¹ − 4) = <b>−4</b>.</>}
          en={<>Example (slide 8): <code>1111 … 1111 1100</code> (32 bits) = −2³¹ + (2³¹ − 4) = <b>−4</b>.</>} /></p>
        <BinaryPlayground signedView />
        <NumberWheel />
        <Note kind="key"><p><L
          vi={<>Cùng một dãy bit, đọc theo không dấu hay có dấu cho ra hai số khác nhau. <b>Bit không tự biết nó là số gì</b> — chính lệnh (ví dụ <code>blt</code> hay <code>bltu</code>) quyết định cách đọc.</>}
          en={<>The same bit pattern gives two different numbers depending on whether you read it as unsigned or signed. <b>Bits don&apos;t know what number they are</b> — the instruction (for example <code>blt</code> vs <code>bltu</code>) decides how to read them.</>} /></p></Note>
      </Sec>

      <Sec id="doi-dau" title={<L vi="Đổi dấu: đảo bit rồi +1" en="Negation: flip the bits, then add 1" />} kicker="4.3">
        <p><L
          vi={<>Lý do: x cộng với x-đảo-bit luôn ra <code>1111…1</code> = −1. Vậy (x đảo bit) + 1 = −x.</>}
          en={<>Why it works: x plus x-with-bits-flipped is always <code>1111…1</code> = −1. So (x flipped) + 1 = −x.</>} /></p>
        <Negate />
        <Table
          head={[<L key="h1" vi="Số" en="Number" />, <L key="h2" vi="Bù 2 16 bit" en="16-bit two's complement" />]}
          rows={[['16', '0000 0000 0001 0000'], ['−16', '1111 1111 1111 0000'], ['100', '0000 0000 0110 0100'], ['−100', '1111 1111 1001 1100']]}
          mono={[1]}
          caption={<L vi="Bài tập slide 10" en="Exercise, slide 10" />}
        />
        <Note kind="tip"><p><L
          vi={<>Đọc nhanh một số âm: đảo bit + 1 để ra số dương, rồi thêm dấu trừ. <code>1111 0000</code> → đảo <code>0000 1111</code> → +1 = <code>0001 0000</code> = 16 → đó là −16.</>}
          en={<>Quick way to read a negative number: flip the bits and add 1 to get the positive value, then put a minus sign in front. <code>1111 0000</code> → flip <code>0000 1111</code> → +1 = <code>0001 0000</code> = 16 → so it is −16.</>} /></p></Note>
      </Sec>

      <Sec id="mo-rong" title={<L vi="Mở rộng dấu (sign extension)" en="Sign extension" />} kicker="4.4">
        <p><L
          vi={<>Muốn đổi số n bit lên m bit (m &gt; n) mà giữ nguyên giá trị: <b>chép bit dấu sang trái</b>.</>}
          en={<>To widen an n-bit number to m bits (m &gt; n) without changing its value: <b>copy the sign bit to the left</b>.</>} /></p>
        <Table
          head={[<L key="h1" vi="Số" en="Number" />, <L key="h2" vi="8 bit" en="8 bits" />, <L key="h3" vi="16 bit" en="16 bits" />]}
          rows={[['+2', '0000 0010', '0000 0000 0000 0010'], ['−2', '1111 1110', '1111 1111 1111 1110']]}
          mono={[1, 2]}
        />
        <SignExtend />
      </Sec>

      <Sec id="lenh" title={<L vi="Lệnh RISC-V có dấu / không dấu" en="Signed / unsigned RISC-V instructions" />} kicker="4.5">
        <p><L
          vi={<>Vì bit không tự biết nó có dấu hay không, RISC-V có lệnh theo cặp: <code>lb/lbu</code>, <code>lh/lhu</code>, <code>blt/bltu</code>, <code>bge/bgeu</code>, <code>slt/sltu</code>, <code>div/divu</code>, <code>rem/remu</code>. Chữ <b>u</b> = unsigned.</>}
          en={<>Because bits don&apos;t know whether they are signed, RISC-V has instructions in pairs: <code>lb/lbu</code>, <code>lh/lhu</code>, <code>blt/bltu</code>, <code>bge/bgeu</code>, <code>slt/sltu</code>, <code>div/divu</code>, <code>rem/remu</code>. The <b>u</b> means unsigned.</>} /></p>
        <Example id="bltu" title={<L vi="Slide 14: chương trình in ra gì?" en="Slide 14: what does this program print?" />} />
        <p><L
          vi={<>Với <code>bltu</code>: −20 là <code>0xFFFFFFEC</code> = 4 294 967 276 khi đọc không dấu, không nhỏ hơn 20 → không nhảy → in <b>1</b>. Đổi thành <code>blt</code> (có dấu): −20 &lt; 20 → nhảy → in <b>0</b>. Mở Lab, sửa thử.</>}
          en={<>With <code>bltu</code>: −20 is <code>0xFFFFFFEC</code> = 4,294,967,276 when read as unsigned, which is not less than 20 → no branch → prints <b>1</b>. Change it to <code>blt</code> (signed): −20 &lt; 20 → branch → prints <b>0</b>. Open the Lab and try it.</>} /></p>
        <Example id="lbu" title={<L vi="Slide 15: s0, s1, s2, s3 bằng bao nhiêu?" en="Slide 15: what are s0, s1, s2, s3?" />} />
        <p><L
          vi={<>Đáp án: s0 = 20, s1 = 20, s2 = −20 (mở rộng dấu), s3 = 236 (mở rộng 0: <code>0x000000EC</code>).</>}
          en={<>Answer: s0 = 20, s1 = 20, s2 = −20 (sign-extended), s3 = 236 (zero-extended: <code>0x000000EC</code>).</>} /></p>
      </Sec>

      <Sec id="tran" title={<L vi="Cộng, trừ và tràn số" en="Addition, subtraction and overflow" />} kicker="4.6">
        <p><L
          vi={<><b>Cộng</b> giống cộng tay: từ phải sang trái, có nhớ. <b>Trừ</b> = cộng số đối: A − B = A + (đảo B + 1). Vậy chỉ cần một mạch cộng.</>}
          en={<><b>Addition</b> works like adding by hand: right to left, with carries. <b>Subtraction</b> = adding the negative: A − B = A + (flip B + 1). So one adder circuit is enough.</>} /></p>
        <Table
          head={[<L key="h1" vi="Phép" en="Operation" />, 'A', 'B', <L key="h4" vi="Tràn nếu kết quả" en="Overflow if result" />]}
          rows={[['A + B', '≥ 0', '≥ 0', '< 0'], ['A + B', '< 0', '< 0', '≥ 0'], ['A − B', '≥ 0', '< 0', '< 0'], ['A − B', '< 0', '≥ 0', '≥ 0']]}
        />
        <Note kind="key"><p><L
          vi={<><b>Carry-out</b> (nhớ ra khỏi bit cao nhất) quan trọng với số không dấu. <b>Overflow</b> (tràn) là khi kết quả có dấu vượt phạm vi. Hai thứ này khác nhau.</>}
          en={<><b>Carry-out</b> (a carry out of the top bit) matters for unsigned numbers. <b>Overflow</b> is when a signed result falls outside the range. They are not the same thing.</>} /></p></Note>
        <OverflowLab />
        <Table
          head={[<L key="h1" vi="Phép (8 bit)" en="Operation (8 bits)" />, <L key="h2" vi="Đúng ra là" en="Should be" />, <L key="h3" vi="8 bit thu được" en="8 bits we get" />, <L key="h4" vi="Tràn?" en="Overflow?" />]}
          rows={[
            ['12 + 8', '20', '0001 0100 = 20', <L key="r1" vi="Không" en="No" />],
            ['122 + 8', '130', '1000 0010 = −126', <L key="r2" vi="Có" en="Yes" />],
            ['122 + 80', '202', '1100 1010 = −54', <L key="r3" vi="Có" en="Yes" />],
            ['122 − 80', '42', '0010 1010 = 42', <L key="r4" vi="Không" en="No" />],
          ]}
          caption={<L vi="Đáp án slide 19" en="Answers to slide 19" />}
        />
        <p><L
          vi={<>Hậu quả: kết quả sai (quay vòng hoặc đổi dấu). x86 có cờ overflow; <b>RISC-V không báo gì</b>. Chạy thử ví dụ dưới trong Lab:</>}
          en={<>The consequence: a wrong result (it wraps around or flips sign). x86 has an overflow flag; <b>RISC-V reports nothing</b>. Try the example below in the Lab:</>} /></p>
        <Example id="overflow" title="0x7FFFFFFF + 1" />
      </Sec>

      <Sec id="kiem-tra" title={<L vi="Tự kiểm tra" en="Check yourself" />}>
        <Pitfalls items={[
          <L key="p1" vi="Đổi số âm sang bù 2 mà chỉ đảo bit, quên +1." en="Converting a negative number to two's complement by flipping the bits but forgetting the +1." />,
          <L key="p2" vi="Mở rộng số âm bằng 0 thay vì bằng 1." en="Extending a negative number with 0s instead of 1s." />,
          <L key="p3" vi="Nhầm carry-out với overflow." en="Confusing carry-out with overflow." />,
          <L key="p4" vi="Dùng blt khi dữ liệu là số không dấu (hoặc bltu khi là số có dấu)." en="Using blt on unsigned data (or bltu on signed data)." />,
        ]} />
        <SelfCheck items={[
          { q: <L vi="−1 trong 8 bit bù 2?" en="−1 in 8-bit two's complement?" />, a: <code>1111 1111</code> },
          { q: <L vi="100 + 50 với 8 bit có dấu có tràn không?" en="Does 100 + 50 overflow in 8-bit signed?" />, a: <L vi="150 > 127 → tràn (ra −106)." en="150 > 127 → overflow (you get −106)." /> },
          { q: <L vi="Phạm vi số có dấu 16 bit?" en="What is the range of a 16-bit signed number?" />, a: '−32 768 … 32 767' },
          { q: <L vi="Byte 0x80 nạp bằng lb và lbu được bao nhiêu?" en="What do lb and lbu give for the byte 0x80?" />, a: <L vi="lb: −128 (0xFFFFFF80). lbu: 128." en="lb: −128 (0xFFFFFF80). lbu: 128." /> },
        ]} />
      </Sec>
    </Lesson>
  );
}
