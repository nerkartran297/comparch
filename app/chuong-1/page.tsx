import type { Metadata } from 'next';
import Lesson from '@/components/lesson/Lesson';
import { Formula, Note, Pitfalls, Sec, SelfCheck, Sub, Table } from '@/components/lesson/Blocks';
import AbstractionLadder from '@/components/widgets/ch1/AbstractionLadder';
import PerfCompare from '@/components/widgets/ch1/PerfCompare';
import ClockSolver from '@/components/widgets/ch1/ClockSolver';
import CpiMix from '@/components/widgets/ch1/CpiMix';
import LoopCounter from '@/components/widgets/ch1/LoopCounter';
import SystemDiagram from '@/components/widgets/ch2/SystemDiagram';
import { ClockTrap } from '@/components/widgets/Figures';

export const metadata: Metadata = { title: 'Chương 1: Giới thiệu & hiệu năng' };

export default function Page() {
  return (
    <Lesson
      step="chuong-1"
      summary={[
        <>Máy tính = máy <b>nhận dữ liệu vào → xử lý bằng chương trình lưu sẵn → đưa kết quả ra</b>.</>,
        <>5 thành phần: Input, Output, Memory, Datapath, Control. <b>Datapath + Control = CPU</b>.</>,
        <>Compiler: 1 dòng C → nhiều lệnh assembly. Assembler: 1 lệnh assembly → đúng 1 lệnh máy.</>,
        <>Hiệu năng = 1 / thời gian chạy. “A nhanh hơn B n lần” ⇔ n = Time_B / Time_A.</>,
        <><b>CPU time = IC × CPI × CC = IC × CPI / Clock rate</b>. CPI trung bình = Σ (tỉ lệ × CPI từng loại lệnh).</>,
      ]}
      toc={[
        { id: 'may-tinh', title: 'Máy tính là gì' },
        { id: 'lich-su', title: 'Phân loại & lịch sử' },
        { id: 'y-tuong', title: '7 ý tưởng lớn' },
        { id: 'truu-tuong', title: 'Các tầng trừu tượng' },
        { id: 'to-chuc', title: '5 thành phần' },
        { id: 'hieu-nang', title: 'Đo hiệu năng' },
        { id: 'cpi', title: 'CPI & công thức vàng' },
        { id: 'dem-lenh', title: 'Đếm số lệnh' },
        { id: 'kiem-tra', title: 'Tự kiểm tra' },
      ]}
    >
      <Sec id="may-tinh" title="Máy tính là gì" kicker="1.1">
        <p>Theo slide, máy tính là một cỗ máy:</p>
        <ol>
          <li>Nhận dữ liệu vào (input)</li>
          <li>Xử lý dữ liệu bằng cách <b>chạy một chương trình được lưu sẵn</b> (stored program)</li>
          <li>Đưa kết quả ra (output)</li>
        </ol>
        <p>Theo định nghĩa này, điện thoại, máy giặt thông minh, ô tô, đồng hồ thông minh… đều có máy tính bên trong.</p>
      </Sec>

      <Sec id="lich-su" title="Phân loại & lịch sử" kicker="1.2">
        <Table
          head={['Loại', 'Đặc điểm', 'Ví dụ']}
          rows={[
            ['Siêu máy tính', 'Cực nhanh, cực đắt, cho tính toán khoa học', 'Dự báo thời tiết'],
            ['Server', 'Chạy qua mạng, dung lượng lớn, tin cậy cao', 'Máy chủ web'],
            ['Desktop / PC', 'Đa dụng, cân bằng giá và hiệu năng', 'Laptop'],
            ['Nhúng (embedded)', 'Giấu trong thiết bị khác, ràng buộc chặt về điện/giá', 'Chip trong máy giặt, ô tô'],
          ]}
        />
        <Note kind="key"><p>Câu trong slide: <b>“Khác nhau về quy mô, không khác về bản chất”</b>. Loại nào cũng có cùng 5 thành phần cơ bản. Thời kỳ <b>hậu PC</b>: điện thoại, tablet, smart TV và điện toán đám mây.</p></Note>
        <Table
          head={['Thế hệ', 'Công nghệ', 'Điểm cần nhớ']}
          rows={[
            ['0', 'Cơ khí', 'Bìa đục lỗ Jacquard, máy Pascal, máy Babbage; Ada Lovelace viết chương trình đầu tiên'],
            ['1', 'Đèn chân không', 'ENIAC (máy đa dụng đầu tiên); IAS (kiến trúc Von Neumann); UNIVAC (máy thương mại đầu tiên)'],
            ['2', 'Transistor', 'Nhỏ và nhanh hơn; IBM System/360'],
            ['3+', 'Mạch tích hợp IC, VLSI', 'Định luật Moore: số transistor trên chip tăng gấp đôi khoảng mỗi 18–24 tháng'],
          ]}
        />
        <Note kind="key" title="Kiến trúc Von Neumann">
          <p>Gồm bộ nhớ, ALU, khối điều khiển, vào/ra, và quan trọng nhất là <b>khái niệm chương trình lưu trữ</b>: chương trình và dữ liệu cùng nằm trong bộ nhớ. Đây là nền tảng của mọi máy tính ngày nay.</p>
        </Note>
      </Sec>

      <Sec id="y-tuong" title="7 ý tưởng lớn trong kiến trúc máy tính" kicker="1.3">
        <Table
          head={['Ý tưởng', 'Nghĩa là gì', 'Ví dụ']}
          rows={[
            ['Đơn giản hoá bằng trừu tượng hoá', 'Chia thành nhiều tầng, mỗi tầng giấu chi tiết tầng dưới', 'Lập trình C không cần biết transistor'],
            ['Làm nhanh trường hợp phổ biến', 'Tối ưu cái dùng nhiều nhất', 'Số 0 dùng nhiều nhất → có hẳn thanh ghi x0 = 0'],
            ['Hiệu năng nhờ song song', 'Làm nhiều việc cùng lúc', 'CPU nhiều lõi'],
            ['Hiệu năng nhờ đường ống (pipeline)', 'Chia việc thành công đoạn, chồng lên nhau', 'Máy giặt mẻ 2 trong khi máy sấy mẻ 1'],
            ['Hiệu năng nhờ dự đoán', 'Đoán trước rồi làm, sai thì sửa', 'Đoán nhánh nào sẽ được chọn'],
            ['Phân cấp bộ nhớ', 'Nhỏ-nhanh-đắt ở gần CPU, to-chậm-rẻ ở xa', 'Thanh ghi → cache → RAM → ổ đĩa'],
            ['Tin cậy nhờ dư thừa', 'Có linh kiện dự phòng', 'RAID ổ đĩa'],
          ]}
        />
      </Sec>

      <Sec id="truu-tuong" title="Các tầng trừu tượng: từ code C đến bit" kicker="1.4">
        <p>Chương trình đi qua ba tầng. <b>Compiler</b> dịch ngôn ngữ bậc cao (C) sang <b>hợp ngữ</b> (assembly, dạng chữ của lệnh máy). <b>Assembler</b> dịch assembly sang <b>mã máy</b> (toàn 0 và 1). Phần mềm hệ thống còn có <b>hệ điều hành</b>: lo vào/ra, quản lý bộ nhớ, chia sẻ tài nguyên và lập lịch chạy chương trình.</p>
        <AbstractionLadder />
        <Note kind="slide"><p>Slide 26 viết <code>slli x6, x11, 3</code> (nhân 8) vì lấy từ bản 64 bit của sách. Với mảng <code>int</code> 4 byte và lệnh <code>lw</code> thì phải là <code>slli x6, x11, 2</code> (nhân 4), như ở trên.</p></Note>
      </Sec>

      <Sec id="to-chuc" title="Tổ chức máy tính: 5 thành phần" kicker="1.5">
        <p>Muốn nhận dữ liệu thì cần <b>Input</b>, muốn lưu thì cần <b>Memory</b>, muốn xử lý thì cần <b>Datapath</b> (nơi tính toán) và <b>Control</b> (điều khiển), muốn đưa kết quả ra thì cần <b>Output</b>. Datapath + Control gộp lại gọi là <b>CPU</b> (processor).</p>
        <SystemDiagram title="5 thành phần trong một sơ đồ" />
        <p>Slide có ảnh tháo iPhone XS Max: chip Apple A12 không chỉ là CPU mà gồm cả GPU, bộ xử lý AI và nhiều khối khác trên cùng một chip.</p>
      </Sec>

      <Sec id="hieu-nang" title="Đo hiệu năng" kicker="1.6">
        <p>Hiệu năng có nhiều tiêu chí: <b>thông lượng</b> (bao nhiêu việc mỗi giây) và <b>thời gian đáp ứng</b> (một việc mất bao lâu). Môn này tập trung vào thời gian chạy.</p>
        <Formula caption="Thời gian càng ngắn thì hiệu năng càng cao">Performance = 1 / Execution time</Formula>
        <Formula caption="Luôn lấy thời gian máy CHẬM chia cho thời gian máy NHANH">“X nhanh hơn Y n lần” ⇔ n = Time_Y / Time_X</Formula>
        <p><b>Ví dụ slide 34:</b> A chạy 10 s, B chạy 15 s → n = 15 / 10 = <b>1.5</b>. A nhanh hơn B 1.5 lần.</p>
        <Sub title="Xung nhịp (clock)">
          <p>CPU làm việc theo nhịp như tiếng tích tắc. <b>Clock cycle time (CC)</b> là độ dài một nhịp; <b>clock rate (CR)</b> là số nhịp mỗi giây. CC = 1 / CR.</p>
          <Table head={['Chu kỳ', 'Clock rate']} rows={[['1 ns (10⁻⁹ s)', '1 GHz (10⁹ Hz)'], ['500 ps', '2 GHz'], ['250 ps', '4 GHz'], ['200 ps', '5 GHz']]} caption="1 ns = 1000 ps" />
          <p><b>CPU time</b> là thời gian CPU thực sự chạy chương trình (không tính lúc chờ I/O hay chạy chương trình khác): CPU time = số chu kỳ × CC = số chu kỳ / CR.</p>
        </Sub>
        <ClockSolver />
      </Sec>

      <Sec id="cpi" title="CPI và công thức vàng" kicker="1.7">
        <p>Lệnh khác nhau tốn số chu kỳ khác nhau (cộng nhanh, đọc bộ nhớ chậm). <b>CPI</b> (Clock cycles Per Instruction) là số chu kỳ trung bình của một lệnh.</p>
        <Formula caption="IC: số lệnh (do thuật toán, compiler, ISA) · CPI: do thiết kế phần cứng · CC: thông số CPU">CPU time = IC × CPI × CC = IC × CPI / CR</Formula>
        <PerfCompare />
        <CpiMix />
        <Note kind="tip"><p>Cải tiến phần chiếm nhiều thời gian nhất thì lợi nhất. Ở bảng trên, Load chiếm 1.0 trên tổng 2.2, nên làm Load nhanh hơn (37.5%) lợi hơn hẳn làm Branch nhanh hơn (10%).</p></Note>
        <Sub title="Clock nhanh hơn chưa chắc chạy nhanh hơn">
          <ClockTrap />
        </Sub>
        <Sub title="Cách tăng hiệu năng (slide 44)">
          <Table head={['Giảm', 'Bằng cách']} rows={[['CC (clock nhanh hơn)', 'Công nghệ chip mới'], ['CPI', 'Tối ưu ISA và thiết kế phần cứng'], ['IC (số lệnh)', 'Thuật toán tốt hơn, compiler tốt hơn']]} />
          <p>Để so sánh các máy, người ta chạy bộ chương trình chuẩn <b>SPEC CPU</b>. Từ khoảng năm 2004, tốc độ một lõi tăng chậm lại nên các hãng chuyển sang CPU nhiều lõi.</p>
        </Sub>
      </Sec>

      <Sec id="dem-lenh" title="Đếm số lệnh động" kicker="1.8">
        <p>Đây là dạng bài hay ra thi. Tính <b>từ vòng trong cùng ra ngoài</b>, nhớ cộng các lệnh phụ của vòng lặp (tăng biến đếm, kiểm tra điều kiện) ở mỗi lần lặp.</p>
        <LoopCounter />
      </Sec>

      <Sec id="kiem-tra" title="Tự kiểm tra">
        <Pitfalls items={[
          'Nhầm “nhanh hơn n lần” thành Time_A / Time_B. Phải lấy thời gian máy chậm chia thời gian máy nhanh.',
          'Quên đổi đơn vị: GHz = 10⁹, ns = 10⁻⁹ s, ps = 10⁻¹² s.',
          'Đếm vòng lặp quên cộng lệnh phụ của vòng lặp ở mỗi lần lặp.',
          '“Nhanh hơn 37.5%” lấy từ tỉ số 2.2 / 1.6 = 1.375, không phải từ (2.2 − 1.6) / 2.2.',
        ]} />
        <SelfCheck items={[
          { q: 'Máy 4 GHz, chương trình 10⁹ lệnh, CPI = 1.5. CPU time?', a: '10⁹ × 1.5 / (4 × 10⁹) = 0.375 s' },
          { q: 'Datapath + Control = ?', a: 'CPU (bộ xử lý)' },
          { q: 'Compiler dịch 1 dòng C thành mấy lệnh assembly? Assembler dịch 1 lệnh assembly thành mấy lệnh máy?', a: 'Compiler: nhiều. Assembler: đúng 1.' },
          { q: 'Máy A clock 2 GHz, chạy 10 s. Máy B cần số chu kỳ gấp 1.2 lần, muốn chạy 6 s thì cần clock bao nhiêu?', a: 'Chu kỳ A = 20 × 10⁹; chu kỳ B = 24 × 10⁹; CR_B = 24 × 10⁹ / 6 = 4 GHz.' },
        ]} />
      </Sec>
    </Lesson>
  );
}
