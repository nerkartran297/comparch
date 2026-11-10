import Link from 'next/link';
import HeroInstruction from '@/components/widgets/HeroInstruction';
import SystemDiagram from '@/components/widgets/ch2/SystemDiagram';
import RoadmapList from '@/components/RoadmapList';
import { Note, Table } from '@/components/lesson/Blocks';

export default function Home() {
  return (
    <div className="page home">
      <header className="hero">
        <p className="hero-kicker">IT3030E · Kiến trúc Máy tính · Đại học Bách khoa Hà Nội</p>
        <h1>Từ một dãy 32 bit đến cả một chương trình chạy được</h1>
        <p className="hero-lede">
          Bốn chương đầu của môn học, giải thích lại từ con số 0. Mỗi bài có tóm tắt 1 phút, giải thích chi tiết, ví dụ có lời giải lấy từ slide,
          và mô phỏng để tự bấm thử. Code RISC-V nào cũng chạy được từng lệnh ngay trên trang.
        </p>
        <HeroInstruction />
        <div className="hero-cta">
          <Link className="next-link" href="/nen-tang"><span>Bắt đầu học</span><strong>Bước 0 · Nền tảng: bit, nhị phân, hex →</strong></Link>
          <Link className="btn" href="/lab">Mở Lab RISC-V toàn màn hình</Link>
        </div>
      </header>

      <section className="sec" id="lo-trinh">
        <h2>Lộ trình học</h2>
        <p className="prose">
          Học theo đúng thứ tự dưới đây, đừng nhảy cóc. Thứ tự này khác thứ tự slide một chỗ: <b>phần đầu Chương 4 (số âm, bù 2) học trước Chương 3</b>,
          vì Chương 3 dùng số âm, số hex và mở rộng dấu liên tục. Bấm “Đánh dấu đã học xong” cuối mỗi bài để theo dõi tiến độ (lưu trong trình duyệt này).
        </p>
        <RoadmapList />
      </section>

      <section className="sec" id="buc-tranh">
        <h2>Bức tranh toàn cảnh</h2>
        <p className="prose">Hình dung máy tính như một nhà bếp:</p>
        <div className="two-col">
          <div className="card"><h3>CPU = đầu bếp</h3><p>Chỉ biết vài động tác rất đơn giản (cộng, trừ, so sánh, lấy đồ, cất đồ) nhưng làm cực nhanh.</p></div>
          <div className="card"><h3>Thanh ghi = cái thớt</h3><p>Ngay trước mặt, chỉ có 32 chỗ, nhưng với tay là tới.</p></div>
          <div className="card"><h3>Bộ nhớ = tủ lạnh</h3><p>Chứa nhiều hơn rất nhiều, nhưng mỗi lần lấy phải đi lại, chậm hơn thanh ghi 100–500 lần.</p></div>
          <div className="card"><h3>Chương trình = công thức</h3><p>Danh sách từng bước (lệnh) viết sẵn, cất trong tủ lạnh cùng với nguyên liệu (dữ liệu).</p></div>
          <div className="card"><h3>I/O = quầy gọi món</h3><p>Bàn phím, màn hình, ổ đĩa: nơi máy nói chuyện với thế giới bên ngoài.</p></div>
          <div className="card"><h3>Bus = hành lang</h3><p>Đường nối đầu bếp, tủ lạnh và quầy, chở dữ liệu, địa chỉ và tín hiệu điều khiển.</p></div>
        </div>
        <SystemDiagram />
        <Table
          head={['Chương', 'Câu hỏi', 'Câu trả lời một dòng']}
          rows={[
            ['1', 'Máy tính là gì, đo nhanh/chậm thế nào?', <code key="1">CPU time = Số lệnh × CPI × Thời gian 1 chu kỳ</code>],
            ['2', 'Bên trong có gì, chạy lệnh ra sao?', 'CPU lặp mãi: lấy lệnh (fetch) → thực hiện (execute) → kiểm tra ngắt'],
            ['3', 'CPU hiểu “ngôn ngữ” gì?', 'Tập lệnh RISC-V: mỗi lệnh 32 bit, làm việc trên 32 thanh ghi'],
            ['4', 'Máy tính làm toán thế nào?', 'Số âm dùng bù 2, số thực dùng IEEE 754, phép tính bằng mạch logic'],
          ]}
        />
      </section>

      <section className="sec" id="cach-dung">
        <h2>Cách dùng trang này</h2>
        <div className="two-col">
          <div className="card">
            <h3>Đọc theo lớp</h3>
            <p>Đầu mỗi bài có <b>Tóm tắt 1 phút</b>. Đọc nó trước, rồi đọc phần chi tiết. Ôn thi thì vào <Link href="/on-thi">Ôn thi</Link> có tóm tắt cả môn trên một trang.</p>
          </div>
          <div className="card">
            <h3>Bấm thử mọi thứ</h3>
            <p>Khung có nhãn <span className="widget-kicker">Mô phỏng</span> là để bấm. Sửa số, bật tắt bit, chạy từng bước. Hiểu bằng tay nhanh hơn đọc.</p>
          </div>
          <div className="card">
            <h3>Chạy code trong Lab</h3>
            <p>Mỗi khối code RISC-V có nút <b>▶ Chạy từng bước trong Lab</b>. Lab dịch code ra mã máy, chạy từng lệnh, cho lùi lại, và hiện thanh ghi, bộ nhớ, stack, màn hình như RARS.</p>
          </div>
          <div className="card">
            <h3>Tự kiểm tra</h3>
            <p>Cuối mỗi bài có câu hỏi tự kiểm tra và danh sách bẫy hay gặp. Trang Ôn thi có {''}trắc nghiệm theo đúng dạng bài trong slide.</p>
          </div>
        </div>
        <Note kind="key" title="Về kỳ thi">
          <p>Theo slide Chương 1: giữa kỳ và cuối kỳ là <b>quiz online, câu hỏi lấy từ bài tập và homework</b>. Làm hết ví dụ và bài tập trong slide là cách ôn hiệu quả nhất. Tất cả ví dụ đó đều có lời giải ở đây.</p>
        </Note>
        <Note kind="slide" title="Nguồn">
          <p>Nội dung tóm tắt từ slide IT3030E (Fall 2024) của bộ môn Kỹ thuật Máy tính, SoICT: Chương 1, 2, 3 (lý thuyết + bài tập), 4 và bảng tóm tắt lệnh RISC-V. Những chỗ slide có vẻ in nhầm đều được ghi chú rõ — nên hỏi lại giảng viên.</p>
        </Note>
      </section>
    </div>
  );
}
