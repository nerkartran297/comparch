import type { Metadata } from 'next';
import Link from 'next/link';
import Lesson from '@/components/lesson/Lesson';
import { Note, Sec } from '@/components/lesson/Blocks';
import Checklist from '@/components/Checklist';
import Quiz from '@/components/widgets/Quiz';

export const metadata: Metadata = { title: 'Ôn thi' };

function Sheet({ ch, title, href, items }: { ch: string; title: string; href: string; items: React.ReactNode[] }) {
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
      title="Ôn thi: cả môn trên một trang"
      summary={[
        <>Đọc tóm tắt từng chương bên dưới. Chỗ nào chưa chắc thì bấm vào tên chương để học lại chi tiết.</>,
        <>Tích checklist những gì đã tự tin làm được.</>,
        <>Làm trắc nghiệm: các câu bám theo đúng ví dụ và bài tập trong slide, vì thi là quiz online lấy từ bài tập.</>,
      ]}
      toc={[
        { id: 'tom-tat', title: 'Tóm tắt 1 trang' },
        { id: 'checklist', title: 'Checklist' },
        { id: 'trac-nghiem', title: 'Trắc nghiệm' },
      ]}
    >
      <Sec id="tom-tat" title="Tóm tắt 1 trang">
        <div className="sheets">
          <Sheet ch="Chương 1" title="Giới thiệu & hiệu năng" href="/chuong-1" items={[
            '5 thành phần: Input, Output, Memory, Datapath, Control. Datapath + Control = CPU.',
            'Performance = 1 / thời gian. “A nhanh hơn B n lần” ⇔ n = Time_B / Time_A.',
            <><b>CPU time = IC × CPI × CC = IC × CPI / CR</b>; CC = 1 / CR.</>,
            'CPI trung bình = Σ (tỉ lệ × CPI từng loại).',
            '7 ý tưởng: trừu tượng hoá, làm nhanh trường hợp phổ biến, song song, pipeline, dự đoán, phân cấp bộ nhớ, dư thừa.',
          ]} />
          <Sheet ch="Chương 2" title="Thành phần, chu trình lệnh, ngắt" href="/chuong-2" items={[
            'CPU = Control Unit + Datapath (ALU) + Register file.',
            'Fetch: đọc lệnh ở PC vào IR, tăng PC. Execute: giải mã, lấy toán hạng, tính, lưu.',
            'Ngắt: lưu PC → chạy ISR → khôi phục. Kiểm tra ở cuối mỗi chu trình lệnh.',
            '4 nguồn ngắt: chương trình (exception), timer, I/O, lỗi phần cứng.',
            'I/O do CPU điều khiển hoặc DMA. Bus: dữ liệu, địa chỉ, điều khiển.',
          ]} />
          <Sheet ch="Chương 3" title="Tập lệnh RISC-V" href="/chuong-3" items={[
            '32 thanh ghi 32 bit; x0 = 0. Byte-addressed, word = 4 byte, little-endian.',
            <>Chỉ load/store chạm bộ nhớ: <code>lw rd, off(rs1)</code>, <code>sw rs2, off(rs1)</code>. Mảng int: offset = i × 4.</>,
            '6 định dạng R, I, S, B, U, J; dài 32 bit; opcode ở 7 bit cuối.',
            <>Gọi hàm <code>jal ra, f</code>; về <code>jalr x0, 0(ra)</code>. Tham số a0–a7, kết quả a0.</>,
            'Callee giữ s0–s11, sp. Caller tự lo t0–t6, a0–a7, ra. Stack mọc xuống.',
          ]} />
          <Sheet ch="Chương 4" title="Số học máy tính" href="/chuong-4a" items={[
            'Không dấu: 0…2ⁿ−1. Có dấu (bù 2): −2ⁿ⁻¹…2ⁿ⁻¹−1. Đổi dấu: đảo bit + 1.',
            'Mở rộng dấu: chép bit dấu. Tràn: cộng hai số cùng dấu ra khác dấu. RISC-V không báo.',
            <>Full adder: <code>S = A⊕B⊕Cin</code>, <code>Cout = AB + ACin + BCin</code>. Lookahead: <code>cᵢ₊₁ = gᵢ + pᵢcᵢ</code>.</>,
            'Nhân = dịch + cộng (2n bit). Chia = dịch + trừ. Dư cùng dấu số bị chia.',
            <>IEEE 754: <code>(−1)^S × 1.F × 2^(E−127)</code>. E = 0: 0/không chuẩn hoá; E = 255: ∞/NaN.</>,
          ]} />
        </div>
        <Note kind="tip"><p>Trước khi thi, mở <Link href="/lab">Lab</Link> và chạy lại các chương trình mẫu trong mục “Bài tập Ch3”. Đọc code mà đoán trước được kết quả là đã vững.</p></Note>
      </Sec>

      <Sec id="checklist" title="Checklist trước khi thi">
        <Checklist />
      </Sec>

      <Sec id="trac-nghiem" title="Trắc nghiệm">
        <p>Bấm chọn một đáp án; giải thích hiện ngay. Chọn chương để luyện riêng.</p>
        <Quiz />
      </Sec>
    </Lesson>
  );
}
