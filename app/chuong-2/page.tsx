import type { Metadata } from 'next';
import Lesson from '@/components/lesson/Lesson';
import { Note, Pitfalls, Sec, SelfCheck, Steps, Sub, Table } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
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
        <L key="s1"
          vi={<>CPU = <b>Control Unit</b> (lấy, giải mã, điều khiển) + <b>Datapath/ALU</b> (tính toán) + <b>thanh ghi</b> (nhớ siêu nhanh).</>}
          en={<>CPU = <b>Control Unit</b> (fetch, decode, control) + <b>Datapath/ALU</b> (compute) + <b>registers</b> (ultra-fast storage).</>} />,
        <L key="s2"
          vi={<>Bộ nhớ là dãy ô 1 byte, mỗi ô có địa chỉ riêng; chứa cả lệnh lẫn dữ liệu.</>}
          en={<>Memory is a row of 1-byte cells, each with its own address; it holds both instructions and data.</>} />,
        <L key="s3"
          vi={<>Chu trình lệnh: <b>Fetch</b> (đọc lệnh ở địa chỉ PC vào IR, tăng PC) → <b>Execute</b> (giải mã, lấy toán hạng, tính, lưu kết quả).</>}
          en={<>Instruction cycle: <b>Fetch</b> (read the instruction at address PC into IR, increment PC) → <b>Execute</b> (decode, fetch operands, compute, store the result).</>} />,
        <L key="s4"
          vi={<><b>Ngắt</b>: thiết bị “gọi” CPU. CPU lưu PC, chạy chương trình phục vụ ngắt (ISR), rồi quay lại. Kiểm tra ngắt ở cuối mỗi chu trình lệnh.</>}
          en={<><b>Interrupt</b>: a device “calls” the CPU. The CPU saves PC, runs the interrupt service routine (ISR), then returns. Interrupts are checked at the end of every instruction cycle.</>} />,
        <L key="s5"
          vi={<>I/O do CPU điều khiển, hoặc qua <b>DMA</b> (DMAC chuyển thẳng I/O ↔ bộ nhớ). Các thành phần nối nhau bằng <b>bus</b>.</>}
          en={<>I/O is controlled by the CPU, or done with <b>DMA</b> (a DMAC moves data directly between I/O and memory). Components are connected by a <b>bus</b>.</>} />,
      ]}
      toc={[
        { id: 'thanh-phan', title: <L vi="Các thành phần" en="Components" /> },
        { id: 'chu-trinh', title: <L vi="Chu trình lệnh" en="Instruction cycle" /> },
        { id: 'may-gia-dinh', title: <L vi="Máy giả định" en="Hypothetical machine" /> },
        { id: 'ngat', title: <L vi="Ngắt" en="Interrupts" /> },
        { id: 'io', title: <L vi="Vào/ra & DMA" en="I/O & DMA" /> },
        { id: 'bus', title: 'Bus' },
        { id: 'kiem-tra', title: <L vi="Tự kiểm tra" en="Check yourself" /> },
      ]}
    >
      <Sec id="thanh-phan" title={<L vi="Các thành phần của máy tính" en="Components of a computer" />} kicker="2.1">
        <SystemDiagram />
        <Table
          head={[<L key="a" vi="Thành phần" en="Component" />, <L key="b" vi="Làm gì" en="What it does" />]}
          rows={[
            ['Control Unit', <L key="1" vi="Lấy lệnh từ bộ nhớ → giải mã → ra lệnh cho các bộ phận khác" en="Fetches instructions from memory → decodes them → tells the other parts what to do" />],
            ['Datapath / ALU', <L key="2" vi="Làm phép tính số học (cộng, trừ…) và logic (AND, OR…)" en="Does arithmetic (add, subtract…) and logic (AND, OR…)" />],
            ['Register file', <L key="3" vi="Bộ nhớ siêu nhỏ, siêu nhanh trong CPU (học kỹ ở Chương 3)" en="Tiny, ultra-fast storage inside the CPU (covered in detail in Chapter 3)" />],
            [<L key="4a" vi="Bộ nhớ" en="Memory" />, <L key="4" vi="Dãy ô, mỗi ô 1 byte, có địa chỉ cố định; số 32 bit chiếm 4 ô liên tiếp; mảng chiếm các ô liên tiếp" en="A row of cells, 1 byte each, with fixed addresses; a 32-bit number takes 4 consecutive cells; an array takes consecutive cells" />],
            ['I/O', <L key="5" vi="Vào: chuột, bàn phím. Ra: màn hình, loa. Lưu trữ: HDD, SSD, USB. Truyền thông: WiFi, Ethernet, Bluetooth" en="Input: mouse, keyboard. Output: screen, speakers. Storage: HDD, SSD, USB. Communication: WiFi, Ethernet, Bluetooth" />],
            [<L key="6a" vi="Kết nối (interconnect)" en="Interconnect" />, <L key="6" vi="Mạng đường dây nối mọi thứ. Bo mạch chủ hiện đại có 4–12 lớp mạch" en="The web of wires connecting everything. A modern motherboard has 4–12 circuit layers" />],
          ]}
        />
        <Note kind="idea">
          <p>
            <L
              vi="Bộ nhớ giống dãy tủ khoá ở siêu thị: mỗi tủ có số (địa chỉ, cố định), trong tủ chứa 1 byte (nội dung, thay đổi được)."
              en="Memory is like a row of lockers at a supermarket: each locker has a number (the address, fixed), and holds 1 byte (the content, which can change)."
            />
          </p>
        </Note>
      </Sec>

      <Sec id="chu-trinh" title={<L vi="Chạy chương trình: chu trình lệnh" en="Running a program: the instruction cycle" />} kicker="2.2">
        <p>
          <L
            vi={<><b>Chương trình</b> là tập các lệnh. Mỗi <b>lệnh</b> là một chuỗi bit theo định dạng cố định, gồm hai phần chính: <b>opcode</b> (làm gì) và <b>toán hạng</b> (làm với cái gì). CPU chạy lệnh <b>tuần tự</b>, từng cái một, mỗi lệnh qua một chu trình:</>}
            en={<>A <b>program</b> is a set of instructions. Each <b>instruction</b> is a string of bits in a fixed format, with two main parts: the <b>opcode</b> (what to do) and the <b>operands</b> (what to do it with). The CPU runs instructions <b>sequentially</b>, one at a time, each going through a cycle:</>}
          />
        </p>
        <div className="two-col">
          <div className="card">
            <h3><L vi="FETCH — lấy lệnh" en="FETCH — get the instruction" /></h3>
            <Steps items={[
              <L key="1" vi="Đọc lệnh ở địa chỉ mà PC đang chỉ" en="Read the instruction at the address PC points to" />,
              <L key="2" vi="Đưa lệnh vào thanh ghi IR" en="Put the instruction into the IR register" />,
              <L key="3" vi="Tăng PC để trỏ tới lệnh kế tiếp" en="Increment PC so it points to the next instruction" />,
            ]} />
          </div>
          <div className="card">
            <h3><L vi="EXECUTE — thực hiện" en="EXECUTE — carry it out" /></h3>
            <Steps items={[
              <L key="1" vi="Giải mã: làm gì, lấy dữ liệu ở đâu, cất kết quả ở đâu" en="Decode: what to do, where to get data, where to put the result" />,
              <L key="2" vi="Tính địa chỉ toán hạng" en="Compute the operand addresses" />,
              <L key="3" vi="Lấy toán hạng nguồn" en="Fetch the source operands" />,
              <L key="4" vi="Thực hiện phép toán" en="Perform the operation" />,
              <L key="5" vi="Cất kết quả vào toán hạng đích" en="Store the result in the destination operand" />,
            ]} />
          </div>
        </div>
        <Note kind="key" title={<L vi="Hai thanh ghi đặc biệt" en="Two special registers" />}>
          <ul>
            <li>
              <L
                vi={<><b>PC (Program Counter)</b> chứa <b>địa chỉ</b> lệnh sắp lấy. Như ngón tay chỉ vào dòng đang đọc trong công thức nấu ăn.</>}
                en={<><b>PC (Program Counter)</b> holds the <b>address</b> of the next instruction to fetch. Like a finger pointing at the line you are reading in a recipe.</>}
              />
            </li>
            <li>
              <L
                vi={<><b>IR (Instruction Register)</b> chứa <b>nội dung</b> lệnh vừa lấy về.</>}
                en={<><b>IR (Instruction Register)</b> holds the <b>contents</b> of the instruction just fetched.</>}
              />
            </li>
          </ul>
          <p>
            <L
              vi="Câu hỏi slide 14: CPU biết lấy lệnh nào tiếp nhờ PC; lệnh vừa lấy nằm trong IR."
              en="Slide 14's question: the CPU knows which instruction to fetch next thanks to PC; the instruction it just fetched is in IR."
            />
          </p>
        </Note>
        <Table
          head={[<L key="a" vi="Loại thao tác" en="Type of operation" />, <L key="b" vi="Ví dụ" en="Example" />]}
          rows={[
            ['Processor – Memory', <L key="1" vi="Chuyển dữ liệu giữa CPU và bộ nhớ" en="Move data between the CPU and memory" />],
            ['Processor – I/O', <L key="2" vi="Chuyển dữ liệu giữa CPU và thiết bị ngoại vi" en="Move data between the CPU and a peripheral device" />],
            ['Data processing', <L key="3" vi="Tính toán số học, logic" en="Arithmetic and logic operations" />],
            ['Control', <L key="4" vi="Thay đổi thứ tự thực hiện: rẽ nhánh, nhảy" en="Change the order of execution: branches, jumps" />],
          ]}
        />
      </Sec>

      <Sec id="may-gia-dinh" title={<L vi="Ví dụ: máy giả định (slide 18–20)" en="Example: a hypothetical machine (slides 18–20)" />} kicker="2.3">
        <p>
          <L
            vi={<>Máy chỉ có một thanh ghi tính toán <b>AC</b> (16 bit). Lệnh dài 16 bit: <b>4 bit opcode + 12 bit địa chỉ</b>. Chương trình nằm ở ô 300–302, dữ liệu ở ô 940–941. Câu hỏi của slide: AC bằng bao nhiêu sau mỗi bước?</>}
            en={<>The machine has a single working register, <b>AC</b> (16 bits). Instructions are 16 bits: <b>4-bit opcode + 12-bit address</b>. The program is in cells 300–302 and the data in cells 940–941. The slide asks: what is AC after each step?</>}
          />
        </p>
        <ToyMachine />
        <Table
          head={[<L key="a" vi="Bước" en="Step" />, <L key="b" vi="Diễn ra" en="What happens" />, 'AC']}
          rows={[
            ['1', <L key="1" vi="Fetch lệnh ở 300 → IR = 1940, PC = 301" en="Fetch the instruction at 300 → IR = 1940, PC = 301" />, '—'],
            ['2', <L key="2" vi="Execute: AC ← M[940]" en="Execute: AC ← M[940]" />, '0003'],
            ['3', <L key="3" vi="Fetch lệnh ở 301 → IR = 5941, PC = 302" en="Fetch the instruction at 301 → IR = 5941, PC = 302" />, '0003'],
            ['4', <L key="4" vi="Execute: AC ← AC + M[941] = 3 + 2" en="Execute: AC ← AC + M[941] = 3 + 2" />, '0005'],
            ['5', <L key="5" vi="Fetch lệnh ở 302 → IR = 2941, PC = 303" en="Fetch the instruction at 302 → IR = 2941, PC = 303" />, '0005'],
            ['6', <L key="6" vi="Execute: M[941] ← AC" en="Execute: M[941] ← AC" />, <L key="6b" vi="0005 (và ô 941 = 0005)" en="0005 (and cell 941 = 0005)" />],
          ]}
          caption={<L vi="Đáp án chuẩn theo sách Stallings — đối chiếu với hình trên slide 20" en="Standard answer from the Stallings textbook — compare with the figure on slide 20" />}
        />
        <Note kind="tip" title={<L vi="Câu hỏi mở rộng: làm sao hỗ trợ rẽ nhánh?" en="Extra question: how do we support branching?" />}>
          <p>
            <L
              vi={<>Thêm một opcode “nhảy”. Khi thực hiện, lệnh đó <b>ghi địa chỉ mới vào PC</b> thay vì để PC tăng bình thường. Lần fetch sau sẽ lấy lệnh ở địa chỉ mới.</>}
              en={<>Add a “jump” opcode. When executed, it <b>writes a new address into PC</b> instead of letting PC increase as usual. The next fetch then takes the instruction at the new address.</>}
            />
          </p>
        </Note>
      </Sec>

      <Sec id="ngat" title={<L vi="Ngắt (interrupt)" en="Interrupts" />} kicker="2.4">
        <p>
          <L
            vi={<><b>Vấn đề:</b> thiết bị ngoài (máy in) chậm hơn CPU rất nhiều. Không có ngắt, sau mỗi lần gửi dữ liệu cho máy in, CPU phải ngồi chờ không đến khi máy in xong.</>}
            en={<><b>The problem:</b> external devices (a printer) are much slower than the CPU. Without interrupts, after each time it sends data to the printer, the CPU has to sit idle until the printer is done.</>}
          />
        </p>
        <p>
          <L
            vi={<><b>Ngắt</b> là cơ chế cho phép thiết bị khác chen ngang việc CPU đang làm. CPU tạm dừng chương trình hiện tại, chạy một chương trình ngắn để phục vụ, rồi quay lại đúng chỗ cũ.</>}
            en={<>An <b>interrupt</b> is a mechanism that lets another device break into what the CPU is doing. The CPU pauses the current program, runs a short program to service the device, then goes back to exactly where it left off.</>}
          />
        </p>
        <Note kind="idea">
          <p>
            <L
              vi="Đang học thì chuông cửa reo (ngắt). Đánh dấu trang đang đọc (lưu PC), ra mở cửa (chạy ISR), xong quay lại đọc tiếp đúng trang đó (khôi phục PC)."
              en="You are studying and the doorbell rings (an interrupt). You bookmark your page (save PC), go open the door (run the ISR), then come back and continue on that exact page (restore PC)."
            />
          </p>
        </Note>
        <InterruptTimeline />
        <Sub title={<L vi="Nguồn ngắt" en="Sources of interrupts" />}>
          <Table
            head={[<L key="a" vi="Nguồn" en="Source" />, <L key="b" vi="Ví dụ" en="Example" />]}
            rows={[
              [<L key="1a" vi="Phần mềm / chương trình (exception)" en="Software / program (exception)" />, <L key="1" vi="Chia cho 0, tràn số" en="Division by zero, arithmetic overflow" />],
              ['Timer', <L key="2" vi="Đồng hồ hệ thống báo hệ điều hành chuyển tác vụ" en="The system timer tells the operating system to switch tasks" />],
              ['I/O', <L key="3" vi="Bàn phím có phím bấm, máy in in xong" en="A key is pressed, the printer has finished" />],
              [<L key="4a" vi="Lỗi phần cứng" en="Hardware failure" />, <L key="4" vi="Lỗi bộ nhớ, mất điện" en="Memory error, power failure" />],
            ]}
          />
          <p>
            <L
              vi={<><b>Polling hay ngắt?</b> (slide 27) Polling là CPU liên tục hỏi “có ai bấm phím không?”, rất tốn CPU. Ngắt thì bàn phím tự báo khi có phím → <b>ngắt tốt hơn</b> vì CPU rảnh làm việc khác.</>}
              en={<><b>Polling or interrupts?</b> (slide 27) Polling means the CPU keeps asking “has anyone pressed a key?”, which wastes a lot of CPU time. With interrupts, the keyboard reports a key press by itself → <b>interrupts are better</b> because the CPU is free to do other work.</>}
            />
          </p>
        </Sub>
        <Sub title={<L vi="Chương trình phục vụ ngắt (ISR) và chu trình ngắt" en="The interrupt service routine (ISR) and the interrupt cycle" />}>
          <p>
            <L
              vi="ISR (Interrupt Service Routine) thường thuộc hệ điều hành. Nó xác định nguồn ngắt, xử lý, rồi trả quyền về chương trình bị ngắt bằng một lệnh đặc biệt khôi phục ngữ cảnh và PC."
              en="The ISR (Interrupt Service Routine) is usually part of the operating system. It works out where the interrupt came from, handles it, then hands control back to the interrupted program with a special instruction that restores the context and PC."
            />
          </p>
          <Steps items={[
            <L key="1" vi="CPU kiểm tra ngắt ở cuối mỗi chu trình lệnh" en="The CPU checks for interrupts at the end of every instruction cycle" />,
            <L key="2" vi="Có ngắt: lưu ngữ cảnh chương trình hiện tại (ít nhất là PC)" en="If there is one: save the current program's context (at least PC)" />,
            <L key="3" vi="Nạp địa chỉ ISR vào PC" en="Load the ISR's address into PC" />,
            <L key="4" vi="Chạy ISR như lệnh bình thường" en="Run the ISR like normal instructions" />,
            <L key="5" vi="Cuối ISR: khôi phục ngữ cảnh và PC, chạy tiếp chương trình cũ" en="At the end of the ISR: restore the context and PC, and continue the original program" />,
          ]} />
          <Table
            head={[<L key="a" vi="Gọi hàm" en="Function call" />, <L key="b" vi="Phục vụ ngắt" en="Servicing an interrupt" />]}
            rows={[
              [<L key="1a" vi="Chương trình chủ động gọi, biết trước gọi ở đâu" en="The program calls it on purpose, at a known place" />, <L key="1b" vi="Xảy ra bất ngờ, ở bất kỳ lệnh nào" en="Happens unexpectedly, after any instruction" />],
              [<L key="2a" vi="Do một lệnh trong chương trình (jal)" en="Caused by an instruction in the program (jal)" />, <L key="2b" vi="Do sự kiện phần cứng hoặc ngoại lệ" en="Caused by a hardware event or an exception" />],
              [<L key="3a" vi="Chỉ cần lưu thanh ghi theo quy ước" en="Only the registers required by convention are saved" />, <L key="3b" vi="Phải lưu toàn bộ ngữ cảnh, vì chương trình bị ngắt không hề biết" en="The whole context must be saved, because the interrupted program has no idea it happened" />],
              [<L key="4a" vi="Liên quan đến logic chương trình" en="Part of the program's own logic" />, <L key="4b" vi="Thường không liên quan đến chương trình đang chạy" en="Usually unrelated to the program that is running" />],
            ]}
            caption={<L vi="Câu hỏi slide 22: phục vụ ngắt khác gọi hàm thế nào?" en="Slide 22's question: how is servicing an interrupt different from calling a subroutine?" />}
          />
        </Sub>
        <Sub title={<L vi="Nhiều ngắt cùng lúc" en="Multiple interrupts" />}>
          <InterruptOrder />
        </Sub>
      </Sec>

      <Sec id="io" title={<L vi="Vào/ra và DMA" en="Input/output and DMA" />} kicker="2.5">
        <ul>
          <li>
            <L
              vi={<><b>CPU điều khiển:</b> dữ liệu đi qua CPU (I/O ↔ CPU ↔ bộ nhớ).</>}
              en={<><b>CPU-controlled:</b> data goes through the CPU (I/O ↔ CPU ↔ memory).</>}
            />
          </li>
          <li>
            <L
              vi={<><b>DMA (Direct Memory Access):</b> bộ điều khiển riêng (DMAC) chuyển dữ liệu <b>thẳng giữa I/O và bộ nhớ</b>. CPU chỉ khởi động việc truyền và nhận ngắt khi xong.</>}
              en={<><b>DMA (Direct Memory Access):</b> a dedicated controller (DMAC) moves data <b>directly between I/O and memory</b>. The CPU only starts the transfer and gets an interrupt when it is done.</>}
            />
          </li>
        </ul>
      </Sec>

      <Sec id="bus" title={<L vi="Kết nối hệ thống: bus" en="System interconnection: the bus" />} kicker="2.6">
        <p>
          <L
            vi={<><b>Bus</b> là đường truyền chung nối các thành phần, gồm ba nhóm dây: <b>bus dữ liệu</b> (chở dữ liệu), <b>bus địa chỉ</b> (đọc/ghi ở đâu) và <b>bus điều khiển</b> (đọc hay ghi, clock, ngắt…). Máy hiệu năng cao dùng <b>bus phân cấp</b>: bus nhanh cho CPU–bộ nhớ, bus chậm hơn cho thiết bị chậm, nối với nhau qua cầu nối. Bấm vào các đường bus ở sơ đồ đầu bài để xem chi tiết.</>}
            en={<>A <b>bus</b> is a shared communication path between components, made of three groups of wires: the <b>data bus</b> (carries data), the <b>address bus</b> (where to read/write) and the <b>control bus</b> (read or write, clock, interrupts…). High-performance machines use a <b>hierarchical bus</b>: a fast bus for CPU–memory, slower buses for slow devices, joined by bridges. Click the bus lines in the diagram at the top of this lesson for details.</>}
          />
        </p>
      </Sec>

      <Sec id="kiem-tra" title={<L vi="Tự kiểm tra" en="Check yourself" />}>
        <Pitfalls items={[
          <L key="1" vi="PC chứa ĐỊA CHỈ lệnh, IR chứa NỘI DUNG lệnh." en="PC holds the instruction's ADDRESS, IR holds the instruction's CONTENTS." />,
          <L key="2" vi="Ngắt được kiểm tra sau khi xong một lệnh, không phải giữa chừng." en="Interrupts are checked after an instruction finishes, not in the middle of one." />,
          <L key="3" vi="DMA không có nghĩa là CPU không làm gì: CPU vẫn khởi tạo việc truyền và nhận ngắt khi xong." en="DMA does not mean the CPU does nothing: the CPU still starts the transfer and receives an interrupt when it finishes." />,
        ]} />
        <SelfCheck items={[
          { q: <L vi="Ở pha Fetch, PC thay đổi thế nào?" en="How does PC change during the Fetch phase?" />, a: <L vi="Tăng lên để trỏ tới lệnh kế tiếp." en="It increases to point at the next instruction." /> },
          { q: <L vi="Vì sao cần ngắt?" en="Why do we need interrupts?" />, a: <L vi="Thiết bị I/O chậm; có ngắt thì CPU không phải ngồi chờ không." en="I/O devices are slow; with interrupts the CPU does not have to sit idle waiting." /> },
          { q: <L vi="Kể 4 nguồn ngắt." en="Name 4 sources of interrupts." />, a: <L vi="Chương trình (exception), timer, I/O, lỗi phần cứng." en="Program (exception), timer, I/O, hardware failure." /> },
          { q: <L vi="Lệnh 0x2941 của máy giả định làm gì?" en="What does instruction 0x2941 do on the hypothetical machine?" />, a: <L vi="Opcode 2: lưu AC vào ô nhớ 941." en="Opcode 2: store AC into memory cell 941." /> },
        ]} />
      </Sec>
    </Lesson>
  );
}
