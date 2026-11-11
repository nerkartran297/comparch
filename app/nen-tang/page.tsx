import type { Metadata } from 'next';
import Lesson from '@/components/lesson/Lesson';
import { Note, Pitfalls, Sec, SelfCheck, Table } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
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
        <L key="s1"
          vi={<>Máy tính chỉ hiểu <b>bit</b> (0 hoặc 1). 8 bit = 1 <b>byte</b>. Trong RISC-V 32 bit: halfword = 2 byte, <b>word = 4 byte</b>.</>}
          en={<>A computer only understands <b>bits</b> (0 or 1). 8 bits = 1 <b>byte</b>. In 32-bit RISC-V: halfword = 2 bytes, <b>word = 4 bytes</b>.</>} />,
        <L key="s2"
          vi={<>Nhị phân: mỗi vị trí có trọng số là lũy thừa của 2 (…, 8, 4, 2, 1). Cộng trọng số của các bit 1 là ra giá trị.</>}
          en={<>Binary: every position has a weight that is a power of 2 (…, 8, 4, 2, 1). Add up the weights of the 1 bits to get the value.</>} />,
        <L key="s3"
          vi={<>Đổi thập phân → nhị phân: chia 2 liên tục, đọc số dư từ dưới lên.</>}
          en={<>Decimal → binary: keep dividing by 2 and read the remainders from bottom to top.</>} />,
        <L key="s4"
          vi={<>Hex: gom <b>4 bit = 1 chữ số hex</b> (0–9, A–F). Tiền tố <code>0x</code> nghĩa là số hex.</>}
          en={<>Hex: group <b>4 bits = 1 hex digit</b> (0–9, A–F). The prefix <code>0x</code> means the number is in hex.</>} />,
        <L key="s5"
          vi={<>AND = cả hai là 1; OR = ít nhất một cái là 1; XOR = khác nhau. Dịch trái k bit = nhân 2ᵏ.</>}
          en={<>AND = both are 1; OR = at least one is 1; XOR = they differ. Shifting left by k bits = multiplying by 2ᵏ.</>} />,
      ]}
      toc={[
        { id: 'bit', title: <L vi="Bit, byte, word" en="Bit, byte, word" /> },
        { id: 'nhi-phan', title: <L vi="Hệ nhị phân" en="Binary" /> },
        { id: 'doi', title: <L vi="Đổi thập phân → nhị phân" en="Decimal → binary" /> },
        { id: 'hex', title: <L vi="Hệ hex" en="Hexadecimal" /> },
        { id: 'phep-bit', title: <L vi="Phép toán bit" en="Bitwise operations" /> },
        { id: 'kiem-tra', title: <L vi="Tự kiểm tra" en="Check yourself" /> },
      ]}
    >
      <Sec id="bit" title={<L vi="Bit, byte, word" en="Bit, byte, word" />}>
        <p>
          <L
            vi={<>Bên trong máy tính, mọi thứ (số, chữ, ảnh, nhạc, cả chương trình) đều là các dãy <b>bit</b>. Một bit chỉ có hai giá trị: 0 hoặc 1, tương ứng với có điện hoặc không có điện.</>}
            en={<>Inside a computer, everything (numbers, text, images, music, even programs) is a string of <b>bits</b>. A bit has only two values: 0 or 1, matching “no voltage” or “voltage”.</>}
          />
        </p>
        <Table
          head={[<L key="a" vi="Tên" en="Name" />, <L key="b" vi="Số bit" en="Bits" />, <L key="c" vi="Số byte" en="Bytes" />, <L key="d" vi="Ví dụ trong C" en="C example" />]}
          rows={[
            ['bit', '1', '—', '—'],
            ['byte', '8', '1', 'char'],
            ['halfword', '16', '2', 'short'],
            ['word', '32', '4', 'int, float'],
            ['doubleword', '64', '8', 'long long, double'],
          ]}
        />
        <Note kind="key">
          <p>
            <L
              vi={<>Trong môn này (RISC-V 32 bit), <b>word = 4 byte = 32 bit</b>. Mỗi thanh ghi chứa đúng 1 word, mỗi lệnh dài đúng 1 word.</>}
              en={<>In this course (32-bit RISC-V), <b>word = 4 bytes = 32 bits</b>. Each register holds exactly 1 word, and each instruction is exactly 1 word long.</>}
            />
          </p>
        </Note>
      </Sec>

      <Sec id="nhi-phan" title={<L vi="Hệ nhị phân (cơ số 2)" en="Binary (base 2)" />}>
        <p>
          <L
            vi="Hệ thập phân có trọng số 1, 10, 100, 1000… Hệ nhị phân giống hệt, chỉ khác trọng số là 1, 2, 4, 8, 16… (lũy thừa của 2), tính từ phải sang trái bắt đầu từ 2⁰ = 1."
            en="Decimal has place weights 1, 10, 100, 1000… Binary works exactly the same way, except the weights are 1, 2, 4, 8, 16… (powers of 2), counting from right to left starting at 2⁰ = 1."
          />
        </p>
        <p>
          <L
            vi={<><b>Nhị phân → thập phân:</b> cộng trọng số ở các vị trí có bit 1. Ví dụ <code>1011</code> = 8 + 0 + 2 + 1 = <b>11</b>.</>}
            en={<><b>Binary → decimal:</b> add the weights of the positions that hold a 1. For example <code>1011</code> = 8 + 0 + 2 + 1 = <b>11</b>.</>}
          />
        </p>
        <BinaryPlayground />
        <p>
          <L
            vi={<>Với n bit, số không dấu chạy từ 0 đến 2ⁿ − 1. 8 bit: 0…255. 32 bit: 0…4 294 967 295. Số âm sẽ học ở <b>Bước 3 (Chương 4 phần A)</b>.</>}
            en={<>With n bits, unsigned numbers go from 0 to 2ⁿ − 1. 8 bits: 0…255. 32 bits: 0…4,294,967,295. Negative numbers come in <b>Step 3 (Chapter 4 part A)</b>.</>}
          />
        </p>
      </Sec>

      <Sec id="doi" title={<L vi="Đổi thập phân → nhị phân" en="Converting decimal → binary" />}>
        <p>
          <L
            vi={<>Chia số cho 2, ghi lại số dư (0 hoặc 1). Lấy thương chia tiếp, đến khi thương bằng 0. Đọc cột số dư <b>từ dưới lên</b>.</>}
            en={<>Divide the number by 2 and write down the remainder (0 or 1). Divide the quotient again, until the quotient is 0. Read the remainder column <b>from bottom to top</b>.</>}
          />
        </p>
        <DecToBin />
        <p>
          <L
            vi={<>Cách nhanh hơn khi đã quen: tìm lũy thừa của 2 lớn nhất không vượt quá số đó, trừ đi, lặp lại. 25 = 16 + 8 + 1 → bật bit 4, 3, 0 → <code>11001</code>.</>}
            en={<>A faster way once you are used to it: find the largest power of 2 not bigger than the number, subtract it, repeat. 25 = 16 + 8 + 1 → bits 4, 3, 0 are on → <code>11001</code>.</>}
          />
        </p>
      </Sec>

      <Sec id="hex" title={<L vi="Hệ thập lục phân (hex, cơ số 16)" en="Hexadecimal (hex, base 16)" />}>
        <p>
          <L
            vi={<>Viết 32 bit nhị phân rất mỏi mắt và dễ sai, nên người ta gom <b>4 bit thành 1 chữ số hex</b>. 16 chữ số hex là 0–9 rồi A (10) đến F (15).</>}
            en={<>Writing 32 binary digits is tiring and error-prone, so we group <b>4 bits into 1 hex digit</b>. The 16 hex digits are 0–9, then A (10) to F (15).</>}
          />
        </p>
        <div className="hex-grid">
          {HEX.map(([b, h, d]) => (
            <div key={h} className="hex-cell"><strong className="mono">{h}</strong><span className="mono">{b}</span><span>{d}</span></div>
          ))}
        </div>
        <p>
          <L
            vi={<>Ví dụ: <code>0001 0011 0011</code> = <code>0x133</code> = 1×256 + 3×16 + 3 = <b>307</b>. Chiều ngược lại: mỗi chữ số hex viết ra đúng 4 bit, ví dụ <code>0xFA</code> = <code>1111 1010</code>.</>}
            en={<>Example: <code>0001 0011 0011</code> = <code>0x133</code> = 1×256 + 3×16 + 3 = <b>307</b>. The other way round: each hex digit becomes exactly 4 bits, e.g. <code>0xFA</code> = <code>1111 1010</code>.</>}
          />
        </p>
        <Note kind="tip">
          <p>
            <L
              vi="Ở widget phía trên, mỗi nhóm 4 bit có một chữ số hex màu xanh bên dưới. Bấm thử vài bit để thấy chữ số hex đổi theo."
              en="In the widget above, each group of 4 bits has a blue hex digit underneath. Flip a few bits and watch the hex digit change."
            />
          </p>
        </Note>
      </Sec>

      <Sec id="phep-bit" title={<L vi="Phép toán bit và dịch bit" en="Bitwise operations and shifts" />}>
        <Table
          head={['A', 'B', 'A AND B', 'A OR B', 'A XOR B', 'NOT A']}
          rows={[['0', '0', '0', '0', '0', '1'], ['0', '1', '0', '1', '1', '1'], ['1', '0', '0', '1', '1', '0'], ['1', '1', '1', '1', '0', '0']]}
        />
        <p>
          <L
            vi={<>Các phép này làm <b>từng cặp bit</b> cùng vị trí, độc lập nhau. Dịch trái k bit = nhân 2ᵏ; dịch phải k bit = chia 2ᵏ (lấy phần nguyên). Chương 3 sẽ dùng <code>slli t1, s1, 2</code> để nhân 4 khi tính địa chỉ phần tử mảng.</>}
            en={<>These operations work on <b>each pair of bits</b> in the same position, independently. Shift left by k bits = multiply by 2ᵏ; shift right by k bits = divide by 2ᵏ (keeping the integer part). Chapter 3 uses <code>slli t1, s1, 2</code> to multiply by 4 when computing the address of an array element.</>}
          />
        </p>
        <BitOps />
      </Sec>

      <Sec id="kiem-tra" title={<L vi="Tự kiểm tra" en="Check yourself" />}>
        <Pitfalls items={[
          <L key="p1" vi="Đọc số dư theo thứ tự từ trên xuống (sai) thay vì từ dưới lên." en="Reading the remainders from top to bottom (wrong) instead of bottom to top." />,
          <L key="p2" vi="Quên rằng trọng số bắt đầu từ 2⁰ = 1 ở bit phải nhất, không phải 2¹." en="Forgetting that the weights start at 2⁰ = 1 for the rightmost bit, not 2¹." />,
          <L key="p3" vi="Gom 4 bit thành hex từ trái sang khi số bit không chia hết cho 4: phải gom từ PHẢI sang." en="Grouping bits into hex from the left when the bit count is not a multiple of 4: always group from the RIGHT." />,
        ]} />
        <SelfCheck items={[
          { q: <L vi="Đổi 125 sang nhị phân 8 bit." en="Convert 125 to 8-bit binary." />, a: <code>0111 1101</code> },
          { q: <L vi={<><code>0000 0001 0011 0011</code> bằng bao nhiêu?</>} en={<>What is <code>0000 0001 0011 0011</code>?</>} />, a: '256 + 32 + 16 + 2 + 1 = 307' },
          { q: <L vi={<><code>0xFF</code> bằng bao nhiêu ở thập phân?</>} en={<>What is <code>0xFF</code> in decimal?</>} />, a: '15 × 16 + 15 = 255' },
          { q: <L vi={<>8 (<code>0000 1000</code>) AND 14 (<code>0000 1110</code>) = ?</>} en={<>8 (<code>0000 1000</code>) AND 14 (<code>0000 1110</code>) = ?</>} />, a: <><code>0000 1000</code> = 8</> },
          { q: <L vi="3 dịch trái 2 bit bằng bao nhiêu?" en="What is 3 shifted left by 2 bits?" />, a: '3 × 4 = 12 (0011 → 1100)' },
        ]} />
      </Sec>
    </Lesson>
  );
}
