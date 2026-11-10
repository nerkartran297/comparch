import type { Metadata } from 'next';
import Lesson from '@/components/lesson/Lesson';
import { Note, Pitfalls, Sec, SelfCheck, Table } from '@/components/lesson/Blocks';
import BinaryPlayground from '@/components/widgets/nen-tang/BinaryPlayground';
import DecToBin from '@/components/widgets/nen-tang/DecToBin';
import BitOps from '@/components/widgets/nen-tang/BitOps';

export const metadata: Metadata = { title: 'Nền tảng: bit, nhị phân, hex' };

const HEX = Array.from({ length: 16 }, (_, i) => [i.toString(2).padStart(4, '0'), i.toString(16).toUpperCase(), String(i)]);

export default function Page() {
  return (
    <Lesson
      step="nen-tang"
      summary={[
        <>Máy tính chỉ hiểu <b>bit</b> (0 hoặc 1). 8 bit = 1 <b>byte</b>. Trong RISC-V 32 bit: halfword = 2 byte, <b>word = 4 byte</b>.</>,
        <>Nhị phân: mỗi vị trí có trọng số là lũy thừa của 2 (…, 8, 4, 2, 1). Cộng trọng số của các bit 1 là ra giá trị.</>,
        <>Đổi thập phân → nhị phân: chia 2 liên tục, đọc số dư từ dưới lên.</>,
        <>Hex: gom <b>4 bit = 1 chữ số hex</b> (0–9, A–F). Tiền tố <code>0x</code> nghĩa là số hex.</>,
        <>AND = cả hai là 1; OR = ít nhất một cái là 1; XOR = khác nhau. Dịch trái k bit = nhân 2ᵏ.</>,
      ]}
      toc={[
        { id: 'bit', title: 'Bit, byte, word' },
        { id: 'nhi-phan', title: 'Hệ nhị phân' },
        { id: 'doi', title: 'Đổi thập phân → nhị phân' },
        { id: 'hex', title: 'Hệ hex' },
        { id: 'phep-bit', title: 'Phép toán bit' },
        { id: 'kiem-tra', title: 'Tự kiểm tra' },
      ]}
    >
      <Sec id="bit" title="Bit, byte, word">
        <p>Bên trong máy tính, mọi thứ (số, chữ, ảnh, nhạc, cả chương trình) đều là các dãy <b>bit</b>. Một bit chỉ có hai giá trị: 0 hoặc 1, tương ứng với có điện hoặc không có điện.</p>
        <Table
          head={['Tên', 'Số bit', 'Số byte', 'Ví dụ trong C']}
          rows={[
            ['bit', '1', '—', '—'],
            ['byte', '8', '1', 'char'],
            ['halfword', '16', '2', 'short'],
            ['word', '32', '4', 'int, float'],
            ['doubleword', '64', '8', 'long long, double'],
          ]}
        />
        <Note kind="key"><p>Trong môn này (RISC-V 32 bit), <b>word = 4 byte = 32 bit</b>. Mỗi thanh ghi chứa đúng 1 word, mỗi lệnh dài đúng 1 word.</p></Note>
      </Sec>

      <Sec id="nhi-phan" title="Hệ nhị phân (cơ số 2)">
        <p>Hệ thập phân có trọng số 1, 10, 100, 1000… Hệ nhị phân giống hệt, chỉ khác trọng số là 1, 2, 4, 8, 16… (lũy thừa của 2), tính từ phải sang trái bắt đầu từ 2⁰ = 1.</p>
        <p><b>Nhị phân → thập phân:</b> cộng trọng số ở các vị trí có bit 1. Ví dụ <code>1011</code> = 8 + 0 + 2 + 1 = <b>11</b>.</p>
        <BinaryPlayground />
        <p>Với n bit, số không dấu chạy từ 0 đến 2ⁿ − 1. 8 bit: 0…255. 32 bit: 0…4 294 967 295. Số âm sẽ học ở <b>Bước 3 (Chương 4 phần A)</b>.</p>
      </Sec>

      <Sec id="doi" title="Đổi thập phân → nhị phân">
        <p>Chia số cho 2, ghi lại số dư (0 hoặc 1). Lấy thương chia tiếp, đến khi thương bằng 0. Đọc cột số dư <b>từ dưới lên</b>.</p>
        <DecToBin />
        <p>Cách nhanh hơn khi đã quen: tìm lũy thừa của 2 lớn nhất không vượt quá số đó, trừ đi, lặp lại. 25 = 16 + 8 + 1 → bật bit 4, 3, 0 → <code>11001</code>.</p>
      </Sec>

      <Sec id="hex" title="Hệ thập lục phân (hex, cơ số 16)">
        <p>Viết 32 bit nhị phân rất mỏi mắt và dễ sai, nên người ta gom <b>4 bit thành 1 chữ số hex</b>. 16 chữ số hex là 0–9 rồi A (10) đến F (15).</p>
        <div className="hex-grid">
          {HEX.map(([b, h, d]) => (
            <div key={h} className="hex-cell"><strong className="mono">{h}</strong><span className="mono">{b}</span><span>{d}</span></div>
          ))}
        </div>
        <p>Ví dụ: <code>0001 0011 0011</code> = <code>0x133</code> = 1×256 + 3×16 + 3 = <b>307</b>. Chiều ngược lại: mỗi chữ số hex viết ra đúng 4 bit, ví dụ <code>0xFA</code> = <code>1111 1010</code>.</p>
        <Note kind="tip"><p>Ở widget phía trên, mỗi nhóm 4 bit có một chữ số hex màu xanh bên dưới. Bấm thử vài bit để thấy chữ số hex đổi theo.</p></Note>
      </Sec>

      <Sec id="phep-bit" title="Phép toán bit và dịch bit">
        <Table
          head={['A', 'B', 'A AND B', 'A OR B', 'A XOR B', 'NOT A']}
          rows={[['0', '0', '0', '0', '0', '1'], ['0', '1', '0', '1', '1', '1'], ['1', '0', '0', '1', '1', '0'], ['1', '1', '1', '1', '0', '0']]}
        />
        <p>Các phép này làm <b>từng cặp bit</b> cùng vị trí, độc lập nhau. Dịch trái k bit = nhân 2ᵏ; dịch phải k bit = chia 2ᵏ (lấy phần nguyên). Chương 3 sẽ dùng <code>slli t1, s1, 2</code> để nhân 4 khi tính địa chỉ phần tử mảng.</p>
        <BitOps />
      </Sec>

      <Sec id="kiem-tra" title="Tự kiểm tra">
        <Pitfalls items={[
          'Đọc số dư theo thứ tự từ trên xuống (sai) thay vì từ dưới lên.',
          'Quên rằng trọng số bắt đầu từ 2⁰ = 1 ở bit phải nhất, không phải 2¹.',
          'Gom 4 bit thành hex từ trái sang khi số bit không chia hết cho 4: phải gom từ PHẢI sang.',
        ]} />
        <SelfCheck items={[
          { q: 'Đổi 125 sang nhị phân 8 bit.', a: <code>0111 1101</code> },
          { q: <><code>0000 0001 0011 0011</code> bằng bao nhiêu?</>, a: '256 + 32 + 16 + 2 + 1 = 307' },
          { q: <><code>0xFF</code> bằng bao nhiêu ở thập phân?</>, a: '15 × 16 + 15 = 255' },
          { q: <>8 (<code>0000 1000</code>) AND 14 (<code>0000 1110</code>) = ?</>, a: <><code>0000 1000</code> = 8</> },
          { q: '3 dịch trái 2 bit bằng bao nhiêu?', a: '3 × 4 = 12 (0011 → 1100)' },
        ]} />
      </Sec>
    </Lesson>
  );
}
