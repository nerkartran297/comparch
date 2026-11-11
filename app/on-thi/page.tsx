import type { Metadata } from 'next';
import Link from 'next/link';
import Lesson from '@/components/lesson/Lesson';
import { Note, Sec } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
import Checklist from '@/components/Checklist';
import Quiz from '@/components/widgets/Quiz';

export const metadata: Metadata = { title: 'Ôn thi' };

function Sheet({ ch, title, href, items }: { ch: React.ReactNode; title: React.ReactNode; href: string; items: React.ReactNode[] }) {
  return (
    <div className="sheet">
      <p className="sheet-ch mono">{ch}</p>
      <h3><Link href={href}>{title}</Link></h3>
      <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}

export default function Page() {
  return (
    <Lesson
      step="on-thi"
      title={<L vi="Ôn thi: cả môn trên một trang" en="Exam review: the whole course on one page" />}
      summary={[
        <L key="s1"
          vi="Đọc tóm tắt từng chương bên dưới. Chỗ nào chưa chắc thì bấm vào tên chương để học lại chi tiết."
          en="Read the summary of each chapter below. If something feels shaky, click the chapter name to go back to the details." />,
        <L key="s2"
          vi="Tích checklist những gì đã tự tin làm được."
          en="Tick off the checklist items you can confidently do." />,
        <L key="s3"
          vi="Làm trắc nghiệm: các câu bám theo đúng ví dụ và bài tập trong slide, vì thi là quiz online lấy từ bài tập."
          en="Take the quiz: the questions follow the examples and exercises in the slides, because the exams are online quizzes built from the exercises." />,
      ]}
      toc={[
        { id: 'tom-tat', title: <L vi="Tóm tắt 1 trang" en="One-page summary" /> },
        { id: 'checklist', title: 'Checklist' },
        { id: 'trac-nghiem', title: <L vi="Trắc nghiệm" en="Quiz" /> },
      ]}
    >
      <Sec id="tom-tat" title={<L vi="Tóm tắt 1 trang" en="One-page summary" />}>
        <div className="sheets">
          <Sheet
            ch={<L vi="Chương 1" en="Chapter 1" />}
            title={<L vi="Giới thiệu & hiệu năng" en="Introduction & performance" />}
            href="/chuong-1"
            items={[
              <L key="1" vi="5 thành phần: Input, Output, Memory, Datapath, Control. Datapath + Control = CPU." en="5 components: Input, Output, Memory, Datapath, Control. Datapath + Control = CPU." />,
              <L key="2" vi="Performance = 1 / thời gian. “A nhanh hơn B n lần” ⇔ n = Time_B / Time_A." en="Performance = 1 / time. “A is n times faster than B” ⇔ n = Time_B / Time_A." />,
              <><b>CPU time = IC × CPI × CC = IC × CPI / CR</b>; CC = 1 / CR.</>,
              <L key="4" vi="CPI trung bình = Σ (tỉ lệ × CPI từng loại)." en="Average CPI = Σ (fraction × CPI of each class)." />,
              <L key="5" vi="7 ý tưởng: trừu tượng hoá, làm nhanh trường hợp phổ biến, song song, pipeline, dự đoán, phân cấp bộ nhớ, dư thừa." en="7 ideas: abstraction, make the common case fast, parallelism, pipelining, prediction, memory hierarchy, redundancy." />,
            ]}
          />
          <Sheet
            ch={<L vi="Chương 2" en="Chapter 2" />}
            title={<L vi="Thành phần, chu trình lệnh, ngắt" en="Components, instruction cycle, interrupts" />}
            href="/chuong-2"
            items={[
              <L key="1" vi="CPU = Control Unit + Datapath (ALU) + Register file." en="CPU = Control Unit + Datapath (ALU) + Register file." />,
              <L key="2" vi="Fetch: đọc lệnh ở PC vào IR, tăng PC. Execute: giải mã, lấy toán hạng, tính, lưu." en="Fetch: read the instruction at PC into IR, increment PC. Execute: decode, fetch operands, compute, store." />,
              <L key="3" vi="Ngắt: lưu PC → chạy ISR → khôi phục. Kiểm tra ở cuối mỗi chu trình lệnh." en="Interrupt: save PC → run the ISR → restore. Checked at the end of every instruction cycle." />,
              <L key="4" vi="4 nguồn ngắt: chương trình (exception), timer, I/O, lỗi phần cứng." en="4 interrupt sources: program (exception), timer, I/O, hardware failure." />,
              <L key="5" vi="I/O do CPU điều khiển hoặc DMA. Bus: dữ liệu, địa chỉ, điều khiển." en="I/O is CPU-controlled or done by DMA. Bus: data, address, control." />,
            ]}
          />
          <Sheet
            ch={<L vi="Chương 3" en="Chapter 3" />}
            title={<L vi="Tập lệnh RISC-V" en="The RISC-V instruction set" />}
            href="/chuong-3"
            items={[
              <L key="1" vi="32 thanh ghi 32 bit; x0 = 0. Byte-addressed, word = 4 byte, little-endian." en="32 registers of 32 bits; x0 = 0. Byte-addressed, word = 4 bytes, little-endian." />,
              <L key="2"
                vi={<>Chỉ load/store chạm bộ nhớ: <code>lw rd, off(rs1)</code>, <code>sw rs2, off(rs1)</code>. Mảng int: offset = i × 4.</>}
                en={<>Only loads/stores touch memory: <code>lw rd, off(rs1)</code>, <code>sw rs2, off(rs1)</code>. int array: offset = i × 4.</>} />,
              <L key="3" vi="6 định dạng R, I, S, B, U, J; dài 32 bit; opcode ở 7 bit cuối." en="6 formats R, I, S, B, U, J; 32 bits long; the opcode is in the lowest 7 bits." />,
              <L key="4"
                vi={<>Gọi hàm <code>jal ra, f</code>; về <code>jalr x0, 0(ra)</code>. Tham số a0–a7, kết quả a0.</>}
                en={<>Call a function with <code>jal ra, f</code>; return with <code>jalr x0, 0(ra)</code>. Arguments in a0–a7, result in a0.</>} />,
              <L key="5" vi="Callee giữ s0–s11, sp. Caller tự lo t0–t6, a0–a7, ra. Stack mọc xuống." en="The callee preserves s0–s11 and sp. The caller saves t0–t6, a0–a7, ra itself. The stack grows downward." />,
            ]}
          />
          <Sheet
            ch={<L vi="Chương 4" en="Chapter 4" />}
            title={<L vi="Số học máy tính" en="Computer arithmetic" />}
            href="/chuong-4a"
            items={[
              <L key="1" vi="Không dấu: 0…2ⁿ−1. Có dấu (bù 2): −2ⁿ⁻¹…2ⁿ⁻¹−1. Đổi dấu: đảo bit + 1." en="Unsigned: 0…2ⁿ−1. Signed (two's complement): −2ⁿ⁻¹…2ⁿ⁻¹−1. Negate: invert the bits + 1." />,
              <L key="2" vi="Mở rộng dấu: chép bit dấu. Tràn: cộng hai số cùng dấu ra khác dấu. RISC-V không báo." en="Sign extension: copy the sign bit. Overflow: adding two numbers of the same sign gives the opposite sign. RISC-V does not flag it." />,
              <L key="3"
                vi={<>Full adder: <code>S = A⊕B⊕Cin</code>, <code>Cout = AB + ACin + BCin</code>. Lookahead: <code>cᵢ₊₁ = gᵢ + pᵢcᵢ</code>.</>}
                en={<>Full adder: <code>S = A⊕B⊕Cin</code>, <code>Cout = AB + ACin + BCin</code>. Lookahead: <code>cᵢ₊₁ = gᵢ + pᵢcᵢ</code>.</>} />,
              <L key="4" vi="Nhân = dịch + cộng (2n bit). Chia = dịch + trừ. Dư cùng dấu số bị chia." en="Multiply = shift + add (2n bits). Divide = shift + subtract. The remainder has the dividend's sign." />,
              <L key="5"
                vi={<>IEEE 754: <code>(−1)^S × 1.F × 2^(E−127)</code>. E = 0: 0/không chuẩn hoá; E = 255: ∞/NaN.</>}
                en={<>IEEE 754: <code>(−1)^S × 1.F × 2^(E−127)</code>. E = 0: zero/denormalized; E = 255: ∞/NaN.</>} />,
            ]}
          />
        </div>
        <Note kind="tip">
          <p>
            <L
              vi={<>Trước khi thi, mở <Link href="/lab">Lab</Link> và chạy lại các chương trình mẫu trong mục “Bài tập Ch3”. Đọc code mà đoán trước được kết quả là đã vững.</>}
              en={<>Before the exam, open the <Link href="/lab">Lab</Link> and rerun the sample programs in the “Chapter 3 exercises” group. If you can predict the result just by reading the code, you are ready.</>}
            />
          </p>
        </Note>
      </Sec>

      <Sec id="checklist" title={<L vi="Checklist trước khi thi" en="Pre-exam checklist" />}>
        <Checklist />
      </Sec>

      <Sec id="trac-nghiem" title={<L vi="Trắc nghiệm" en="Quiz" />}>
        <p>
          <L
            vi="Bấm chọn một đáp án; giải thích hiện ngay. Chọn chương để luyện riêng."
            en="Click an answer and the explanation appears right away. Pick a chapter to practise it on its own."
          />
        </p>
        <Quiz />
      </Sec>
    </Lesson>
  );
}
