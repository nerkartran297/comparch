import type { Metadata } from 'next';
import Lesson from '@/components/lesson/Lesson';
import { Formula, Note, Pitfalls, Sec, SelfCheck, Table } from '@/components/lesson/Blocks';
import Code from '@/components/lesson/Code';
import BinaryPlayground from '@/components/widgets/nen-tang/BinaryPlayground';
import Negate from '@/components/widgets/ch4/Negate';
import NumberWheel from '@/components/widgets/ch4/NumberWheel';
import SignExtend from '@/components/widgets/ch4/SignExtend';
import OverflowLab from '@/components/widgets/ch4/OverflowLab';
import { EXAMPLES } from '@/lib/examples.mjs';

export const metadata: Metadata = { title: 'Chương 4A: Số nguyên, bù 2, tràn số' };
const ex = (id: string) => EXAMPLES.find((e) => e.id === id)!;

export default function Page() {
  return (
    <Lesson
      step="chuong-4a"
      summary={[
        <>n bit <b>không dấu</b>: 0 … 2ⁿ − 1. n bit <b>có dấu (bù 2)</b>: −2ⁿ⁻¹ … 2ⁿ⁻¹ − 1. 32 bit có dấu: −2 147 483 648 … 2 147 483 647.</>,
        <>Bù 2: bit trái nhất mang trọng số <b>âm</b>. Đổi dấu: <b>đảo hết bit rồi +1</b>.</>,
        <>Mở rộng dấu (sign extension): muốn thêm bit mà giữ giá trị thì <b>chép bit dấu sang trái</b>. <code>lb</code> mở rộng dấu, <code>lbu</code> điền 0.</>,
        <>Tràn số có dấu: cộng hai số <b>cùng dấu</b> mà ra kết quả <b>khác dấu</b>. Cộng khác dấu không bao giờ tràn.</>,
        <>RISC-V <b>không báo</b> khi tràn số; phần mềm phải tự kiểm tra.</>,
      ]}
      toc={[
        { id: 'khong-dau', title: 'Số không dấu' },
        { id: 'bu-2', title: 'Số có dấu: bù 2' },
        { id: 'doi-dau', title: 'Đổi dấu' },
        { id: 'mo-rong', title: 'Mở rộng dấu' },
        { id: 'lenh', title: 'Lệnh có dấu / không dấu' },
        { id: 'tran', title: 'Cộng, trừ, tràn số' },
        { id: 'kiem-tra', title: 'Tự kiểm tra' },
      ]}
    >
      <Note kind="tip" title="Vì sao học phần này trước Chương 3?"><p>Chương 3 dùng số âm (<code>addi s1, s1, -2</code>), số hex và mở rộng dấu (<code>lb</code>/<code>lbu</code>) liên tục. Hiểu bù 2 trước thì đọc Chương 3 không bị vấp.</p></Note>

      <Sec id="khong-dau" title="Số nguyên không dấu" kicker="4.1">
        <Formula caption="n bit biểu diễn được 0 … 2ⁿ − 1">x = xₙ₋₁·2ⁿ⁻¹ + … + x₁·2¹ + x₀·2⁰</Formula>
        <Table head={['Thập phân', 'Nhị phân (phần cuối của 32 bit)']} rows={[['25', '0001 1001'], ['125', '0111 1101'], ['255', '1111 1111'], ['207', '1100 1111'], ['307', '0001 0011 0011']]} mono={[1]} caption="Bài tập slide 7" />
      </Sec>

      <Sec id="bu-2" title="Số nguyên có dấu: bù 2 (two's complement)" kicker="4.2">
        <p>Máy tính dùng bù 2 để biểu diễn số âm. Cách đọc rất đơn giản: <b>bit trái nhất (MSB) mang trọng số âm</b>, các bit khác như bình thường.</p>
        <Formula caption="Bit dấu 0 → số dương; bit dấu 1 → số âm">x = −xₙ₋₁·2ⁿ⁻¹ + xₙ₋₂·2ⁿ⁻² + … + x₀·2⁰</Formula>
        <p>Ví dụ (slide 8): <code>1111 … 1111 1100</code> (32 bit) = −2³¹ + (2³¹ − 4) = <b>−4</b>.</p>
        <BinaryPlayground signedView />
        <NumberWheel />
        <Note kind="key"><p>Cùng một dãy bit, đọc theo không dấu hay có dấu cho ra hai số khác nhau. <b>Bit không tự biết nó là số gì</b> — chính lệnh (ví dụ <code>blt</code> hay <code>bltu</code>) quyết định cách đọc.</p></Note>
      </Sec>

      <Sec id="doi-dau" title="Đổi dấu: đảo bit rồi +1" kicker="4.3">
        <p>Lý do: x cộng với x-đảo-bit luôn ra <code>1111…1</code> = −1. Vậy (x đảo bit) + 1 = −x.</p>
        <Negate />
        <Table head={['Số', 'Bù 2 16 bit']} rows={[['16', '0000 0000 0001 0000'], ['−16', '1111 1111 1111 0000'], ['100', '0000 0000 0110 0100'], ['−100', '1111 1111 1001 1100']]} mono={[1]} caption="Bài tập slide 10" />
        <Note kind="tip"><p>Đọc nhanh một số âm: đảo bit + 1 để ra số dương, rồi thêm dấu trừ. <code>1111 0000</code> → đảo <code>0000 1111</code> → +1 = <code>0001 0000</code> = 16 → đó là −16.</p></Note>
      </Sec>

      <Sec id="mo-rong" title="Mở rộng dấu (sign extension)" kicker="4.4">
        <p>Muốn đổi số n bit lên m bit (m &gt; n) mà giữ nguyên giá trị: <b>chép bit dấu sang trái</b>.</p>
        <Table head={['Số', '8 bit', '16 bit']} rows={[['+2', '0000 0010', '0000 0000 0000 0010'], ['−2', '1111 1110', '1111 1111 1111 1110']]} mono={[1, 2]} />
        <SignExtend />
      </Sec>

      <Sec id="lenh" title="Lệnh RISC-V có dấu / không dấu" kicker="4.5">
        <p>Vì bit không tự biết nó có dấu hay không, RISC-V có lệnh theo cặp: <code>lb/lbu</code>, <code>lh/lhu</code>, <code>blt/bltu</code>, <code>bge/bgeu</code>, <code>slt/sltu</code>, <code>div/divu</code>, <code>rem/remu</code>. Chữ <b>u</b> = unsigned.</p>
        <Code code={ex('bltu').code} title="Slide 14: chương trình in ra gì?" runTitle={ex('bltu').title} />
        <p>Với <code>bltu</code>: −20 là <code>0xFFFFFFEC</code> = 4 294 967 276 khi đọc không dấu, không nhỏ hơn 20 → không nhảy → in <b>1</b>. Đổi thành <code>blt</code> (có dấu): −20 &lt; 20 → nhảy → in <b>0</b>. Mở Lab, sửa thử.</p>
        <Code code={ex('lbu').code} title="Slide 15: s0, s1, s2, s3 bằng bao nhiêu?" runTitle={ex('lbu').title} />
        <p>Đáp án: s0 = 20, s1 = 20, s2 = −20 (mở rộng dấu), s3 = 236 (mở rộng 0: <code>0x000000EC</code>).</p>
      </Sec>

      <Sec id="tran" title="Cộng, trừ và tràn số" kicker="4.6">
        <p><b>Cộng</b> giống cộng tay: từ phải sang trái, có nhớ. <b>Trừ</b> = cộng số đối: A − B = A + (đảo B + 1). Vậy chỉ cần một mạch cộng.</p>
        <Table
          head={['Phép', 'A', 'B', 'Tràn nếu kết quả']}
          rows={[['A + B', '≥ 0', '≥ 0', '< 0'], ['A + B', '< 0', '< 0', '≥ 0'], ['A − B', '≥ 0', '< 0', '< 0'], ['A − B', '< 0', '≥ 0', '≥ 0']]}
        />
        <Note kind="key"><p><b>Carry-out</b> (nhớ ra khỏi bit cao nhất) quan trọng với số không dấu. <b>Overflow</b> (tràn) là khi kết quả có dấu vượt phạm vi. Hai thứ này khác nhau.</p></Note>
        <OverflowLab />
        <Table head={['Phép (8 bit)', 'Đúng ra là', '8 bit thu được', 'Tràn?']} rows={[['12 + 8', '20', '0001 0100 = 20', 'Không'], ['122 + 8', '130', '1000 0010 = −126', 'Có'], ['122 + 80', '202', '1100 1010 = −54', 'Có'], ['122 − 80', '42', '0010 1010 = 42', 'Không']]} caption="Đáp án slide 19" />
        <p>Hậu quả: kết quả sai (quay vòng hoặc đổi dấu). x86 có cờ overflow; <b>RISC-V không báo gì</b>. Chạy thử ví dụ dưới trong Lab:</p>
        <Code code={ex('overflow').code} title="0x7FFFFFFF + 1" runTitle={ex('overflow').title} />
      </Sec>

      <Sec id="kiem-tra" title="Tự kiểm tra">
        <Pitfalls items={[
          'Đổi số âm sang bù 2 mà chỉ đảo bit, quên +1.',
          'Mở rộng số âm bằng 0 thay vì bằng 1.',
          'Nhầm carry-out với overflow.',
          'Dùng blt khi dữ liệu là số không dấu (hoặc bltu khi là số có dấu).',
        ]} />
        <SelfCheck items={[
          { q: '−1 trong 8 bit bù 2?', a: <code>1111 1111</code> },
          { q: '100 + 50 với 8 bit có dấu có tràn không?', a: '150 > 127 → tràn (ra −106).' },
          { q: 'Phạm vi số có dấu 16 bit?', a: '−32 768 … 32 767' },
          { q: 'Byte 0x80 nạp bằng lb và lbu được bao nhiêu?', a: 'lb: −128 (0xFFFFFF80). lbu: 128.' },
        ]} />
      </Sec>
    </Lesson>
  );
}
