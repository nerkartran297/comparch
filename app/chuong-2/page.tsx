import type { Metadata } from 'next';
import Lesson from '@/components/lesson/Lesson';
import { Note, Pitfalls, Sec, SelfCheck, Steps, Sub, Table } from '@/components/lesson/Blocks';
import SystemDiagram from '@/components/widgets/ch2/SystemDiagram';
import ToyMachine from '@/components/widgets/ch2/ToyMachine';
import InterruptTimeline from '@/components/widgets/ch2/InterruptTimeline';
import { InterruptOrder } from '@/components/widgets/Figures';

export const metadata: Metadata = { title: 'Chương 2: Thành phần, chu trình lệnh, ngắt' };

export default function Page() {
  return (
    <Lesson
      step="chuong-2"
      summary={[
        <>CPU = <b>Control Unit</b> (lấy, giải mã, điều khiển) + <b>Datapath/ALU</b> (tính toán) + <b>thanh ghi</b> (nhớ siêu nhanh).</>,
        <>Bộ nhớ là dãy ô 1 byte, mỗi ô có địa chỉ riêng; chứa cả lệnh lẫn dữ liệu.</>,
        <>Chu trình lệnh: <b>Fetch</b> (đọc lệnh ở địa chỉ PC vào IR, tăng PC) → <b>Execute</b> (giải mã, lấy toán hạng, tính, lưu kết quả).</>,
        <><b>Ngắt</b>: thiết bị “gọi” CPU. CPU lưu PC, chạy chương trình phục vụ ngắt (ISR), rồi quay lại. Kiểm tra ngắt ở cuối mỗi chu trình lệnh.</>,
        <>I/O do CPU điều khiển, hoặc qua <b>DMA</b> (DMAC chuyển thẳng I/O ↔ bộ nhớ). Các thành phần nối nhau bằng <b>bus</b>.</>,
      ]}
      toc={[
        { id: 'thanh-phan', title: 'Các thành phần' },
        { id: 'chu-trinh', title: 'Chu trình lệnh' },
        { id: 'may-gia-dinh', title: 'Máy giả định' },
        { id: 'ngat', title: 'Ngắt' },
        { id: 'io', title: 'Vào/ra & DMA' },
        { id: 'bus', title: 'Bus' },
        { id: 'kiem-tra', title: 'Tự kiểm tra' },
      ]}
    >
      <Sec id="thanh-phan" title="Các thành phần của máy tính" kicker="2.1">
        <SystemDiagram />
        <Table
          head={['Thành phần', 'Làm gì']}
          rows={[
            ['Control Unit', 'Lấy lệnh từ bộ nhớ → giải mã → ra lệnh cho các bộ phận khác'],
            ['Datapath / ALU', 'Làm phép tính số học (cộng, trừ…) và logic (AND, OR…)'],
            ['Register file', 'Bộ nhớ siêu nhỏ, siêu nhanh trong CPU (học kỹ ở Chương 3)'],
            ['Bộ nhớ', 'Dãy ô, mỗi ô 1 byte, có địa chỉ cố định; số 32 bit chiếm 4 ô liên tiếp; mảng chiếm các ô liên tiếp'],
            ['I/O', 'Vào: chuột, bàn phím. Ra: màn hình, loa. Lưu trữ: HDD, SSD, USB. Truyền thông: WiFi, Ethernet, Bluetooth'],
            ['Kết nối (interconnect)', 'Mạng đường dây nối mọi thứ. Bo mạch chủ hiện đại có 4–12 lớp mạch'],
          ]}
        />
        <Note kind="idea"><p>Bộ nhớ giống dãy tủ khoá ở siêu thị: mỗi tủ có số (địa chỉ, cố định), trong tủ chứa 1 byte (nội dung, thay đổi được).</p></Note>
      </Sec>

      <Sec id="chu-trinh" title="Chạy chương trình: chu trình lệnh" kicker="2.2">
        <p><b>Chương trình</b> là tập các lệnh. Mỗi <b>lệnh</b> là một chuỗi bit theo định dạng cố định, gồm hai phần chính: <b>opcode</b> (làm gì) và <b>toán hạng</b> (làm với cái gì). CPU chạy lệnh <b>tuần tự</b>, từng cái một, mỗi lệnh qua một chu trình:</p>
        <div className="two-col">
          <div className="card">
            <h3>FETCH — lấy lệnh</h3>
            <Steps items={['Đọc lệnh ở địa chỉ mà PC đang chỉ', 'Đưa lệnh vào thanh ghi IR', 'Tăng PC để trỏ tới lệnh kế tiếp']} />
          </div>
          <div className="card">
            <h3>EXECUTE — thực hiện</h3>
            <Steps items={['Giải mã: làm gì, lấy dữ liệu ở đâu, cất kết quả ở đâu', 'Tính địa chỉ toán hạng', 'Lấy toán hạng nguồn', 'Thực hiện phép toán', 'Cất kết quả vào toán hạng đích']} />
          </div>
        </div>
        <Note kind="key" title="Hai thanh ghi đặc biệt">
          <ul>
            <li><b>PC (Program Counter)</b> chứa <b>địa chỉ</b> lệnh sắp lấy. Như ngón tay chỉ vào dòng đang đọc trong công thức nấu ăn.</li>
            <li><b>IR (Instruction Register)</b> chứa <b>nội dung</b> lệnh vừa lấy về.</li>
          </ul>
          <p>Câu hỏi slide 14: CPU biết lấy lệnh nào tiếp nhờ PC; lệnh vừa lấy nằm trong IR.</p>
        </Note>
        <Table
          head={['Loại thao tác', 'Ví dụ']}
          rows={[
            ['Processor – Memory', 'Chuyển dữ liệu giữa CPU và bộ nhớ'],
            ['Processor – I/O', 'Chuyển dữ liệu giữa CPU và thiết bị ngoại vi'],
            ['Data processing', 'Tính toán số học, logic'],
            ['Control', 'Thay đổi thứ tự thực hiện: rẽ nhánh, nhảy'],
          ]}
        />
      </Sec>

      <Sec id="may-gia-dinh" title="Ví dụ: máy giả định (slide 18–20)" kicker="2.3">
        <p>Máy chỉ có một thanh ghi tính toán <b>AC</b> (16 bit). Lệnh dài 16 bit: <b>4 bit opcode + 12 bit địa chỉ</b>. Chương trình nằm ở ô 300–302, dữ liệu ở ô 940–941. Câu hỏi của slide: AC bằng bao nhiêu sau mỗi bước?</p>
        <ToyMachine />
        <Table
          head={['Bước', 'Diễn ra', 'AC']}
          rows={[
            ['1', 'Fetch lệnh ở 300 → IR = 1940, PC = 301', '—'],
            ['2', 'Execute: AC ← M[940]', '0003'],
            ['3', 'Fetch lệnh ở 301 → IR = 5941, PC = 302', '0003'],
            ['4', 'Execute: AC ← AC + M[941] = 3 + 2', '0005'],
            ['5', 'Fetch lệnh ở 302 → IR = 2941, PC = 303', '0005'],
            ['6', 'Execute: M[941] ← AC', '0005 (và ô 941 = 0005)'],
          ]}
          caption="Đáp án chuẩn theo sách Stallings — đối chiếu với hình trên slide 20"
        />
        <Note kind="tip" title="Câu hỏi mở rộng: làm sao hỗ trợ rẽ nhánh?"><p>Thêm một opcode “nhảy”. Khi thực hiện, lệnh đó <b>ghi địa chỉ mới vào PC</b> thay vì để PC tăng bình thường. Lần fetch sau sẽ lấy lệnh ở địa chỉ mới.</p></Note>
      </Sec>

      <Sec id="ngat" title="Ngắt (interrupt)" kicker="2.4">
        <p><b>Vấn đề:</b> thiết bị ngoài (máy in) chậm hơn CPU rất nhiều. Không có ngắt, sau mỗi lần gửi dữ liệu cho máy in, CPU phải ngồi chờ không đến khi máy in xong.</p>
        <p><b>Ngắt</b> là cơ chế cho phép thiết bị khác chen ngang việc CPU đang làm. CPU tạm dừng chương trình hiện tại, chạy một chương trình ngắn để phục vụ, rồi quay lại đúng chỗ cũ.</p>
        <Note kind="idea"><p>Đang học thì chuông cửa reo (ngắt). Đánh dấu trang đang đọc (lưu PC), ra mở cửa (chạy ISR), xong quay lại đọc tiếp đúng trang đó (khôi phục PC).</p></Note>
        <InterruptTimeline />
        <Sub title="Nguồn ngắt">
          <Table
            head={['Nguồn', 'Ví dụ']}
            rows={[
              ['Phần mềm / chương trình (exception)', 'Chia cho 0, tràn số'],
              ['Timer', 'Đồng hồ hệ thống báo hệ điều hành chuyển tác vụ'],
              ['I/O', 'Bàn phím có phím bấm, máy in in xong'],
              ['Lỗi phần cứng', 'Lỗi bộ nhớ, mất điện'],
            ]}
          />
          <p><b>Polling hay ngắt?</b> (slide 27) Polling là CPU liên tục hỏi “có ai bấm phím không?”, rất tốn CPU. Ngắt thì bàn phím tự báo khi có phím → <b>ngắt tốt hơn</b> vì CPU rảnh làm việc khác.</p>
        </Sub>
        <Sub title="Chương trình phục vụ ngắt (ISR) và chu trình ngắt">
          <p>ISR (Interrupt Service Routine) thường thuộc hệ điều hành. Nó xác định nguồn ngắt, xử lý, rồi trả quyền về chương trình bị ngắt bằng một lệnh đặc biệt khôi phục ngữ cảnh và PC.</p>
          <Steps items={[
            'CPU kiểm tra ngắt ở cuối mỗi chu trình lệnh',
            'Có ngắt: lưu ngữ cảnh chương trình hiện tại (ít nhất là PC)',
            'Nạp địa chỉ ISR vào PC',
            'Chạy ISR như lệnh bình thường',
            'Cuối ISR: khôi phục ngữ cảnh và PC, chạy tiếp chương trình cũ',
          ]} />
          <Table
            head={['Gọi hàm', 'Phục vụ ngắt']}
            rows={[
              ['Chương trình chủ động gọi, biết trước gọi ở đâu', 'Xảy ra bất ngờ, ở bất kỳ lệnh nào'],
              ['Do một lệnh trong chương trình (jal)', 'Do sự kiện phần cứng hoặc ngoại lệ'],
              ['Chỉ cần lưu thanh ghi theo quy ước', 'Phải lưu toàn bộ ngữ cảnh, vì chương trình bị ngắt không hề biết'],
              ['Liên quan đến logic chương trình', 'Thường không liên quan đến chương trình đang chạy'],
            ]}
            caption="Câu hỏi slide 22: phục vụ ngắt khác gọi hàm thế nào?"
          />
        </Sub>
        <Sub title="Nhiều ngắt cùng lúc">
          <InterruptOrder />
        </Sub>
      </Sec>

      <Sec id="io" title="Vào/ra và DMA" kicker="2.5">
        <ul>
          <li><b>CPU điều khiển:</b> dữ liệu đi qua CPU (I/O ↔ CPU ↔ bộ nhớ).</li>
          <li><b>DMA (Direct Memory Access):</b> bộ điều khiển riêng (DMAC) chuyển dữ liệu <b>thẳng giữa I/O và bộ nhớ</b>. CPU chỉ khởi động việc truyền và nhận ngắt khi xong.</li>
        </ul>
      </Sec>

      <Sec id="bus" title="Kết nối hệ thống: bus" kicker="2.6">
        <p><b>Bus</b> là đường truyền chung nối các thành phần, gồm ba nhóm dây: <b>bus dữ liệu</b> (chở dữ liệu), <b>bus địa chỉ</b> (đọc/ghi ở đâu) và <b>bus điều khiển</b> (đọc hay ghi, clock, ngắt…). Máy hiệu năng cao dùng <b>bus phân cấp</b>: bus nhanh cho CPU–bộ nhớ, bus chậm hơn cho thiết bị chậm, nối với nhau qua cầu nối. Bấm vào các đường bus ở sơ đồ đầu bài để xem chi tiết.</p>
      </Sec>

      <Sec id="kiem-tra" title="Tự kiểm tra">
        <Pitfalls items={[
          'PC chứa ĐỊA CHỈ lệnh, IR chứa NỘI DUNG lệnh.',
          'Ngắt được kiểm tra sau khi xong một lệnh, không phải giữa chừng.',
          'DMA không có nghĩa là CPU không làm gì: CPU vẫn khởi tạo việc truyền và nhận ngắt khi xong.',
        ]} />
        <SelfCheck items={[
          { q: 'Ở pha Fetch, PC thay đổi thế nào?', a: 'Tăng lên để trỏ tới lệnh kế tiếp.' },
          { q: 'Vì sao cần ngắt?', a: 'Thiết bị I/O chậm; có ngắt thì CPU không phải ngồi chờ không.' },
          { q: 'Kể 4 nguồn ngắt.', a: 'Chương trình (exception), timer, I/O, lỗi phần cứng.' },
          { q: 'Lệnh 0x2941 của máy giả định làm gì?', a: 'Opcode 2: lưu AC vào ô nhớ 941.' },
        ]} />
      </Sec>
    </Lesson>
  );
}
