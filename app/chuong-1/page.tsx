import type { Metadata } from 'next';
import Lesson from '@/components/lesson/Lesson';
import { Formula, Note, Pitfalls, Sec, SelfCheck, Sub, Table } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
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
        <L key="s1"
          vi={<>Máy tính = máy <b>nhận dữ liệu vào → xử lý bằng chương trình lưu sẵn → đưa kết quả ra</b>.</>}
          en={<>A computer = a machine that <b>takes input → processes it by running a stored program → produces output</b>.</>} />,
        <L key="s2"
          vi={<>5 thành phần: Input, Output, Memory, Datapath, Control. <b>Datapath + Control = CPU</b>.</>}
          en={<>5 components: Input, Output, Memory, Datapath, Control. <b>Datapath + Control = CPU</b>.</>} />,
        <L key="s3"
          vi={<>Compiler: 1 dòng C → nhiều lệnh assembly. Assembler: 1 lệnh assembly → đúng 1 lệnh máy.</>}
          en={<>Compiler: 1 line of C → many assembly instructions. Assembler: 1 assembly instruction → exactly 1 machine instruction.</>} />,
        <L key="s4"
          vi={<>Hiệu năng = 1 / thời gian chạy. “A nhanh hơn B n lần” ⇔ n = Time_B / Time_A.</>}
          en={<>Performance = 1 / execution time. “A is n times faster than B” ⇔ n = Time_B / Time_A.</>} />,
        <L key="s5"
          vi={<><b>CPU time = IC × CPI × CC = IC × CPI / Clock rate</b>. CPI trung bình = Σ (tỉ lệ × CPI từng loại lệnh).</>}
          en={<><b>CPU time = IC × CPI × CC = IC × CPI / Clock rate</b>. Average CPI = Σ (fraction × CPI of each instruction class).</>} />,
      ]}
      toc={[
        { id: 'may-tinh', title: <L vi="Máy tính là gì" en="What is a computer" /> },
        { id: 'lich-su', title: <L vi="Phân loại & lịch sử" en="Classes & history" /> },
        { id: 'y-tuong', title: <L vi="7 ý tưởng lớn" en="7 great ideas" /> },
        { id: 'truu-tuong', title: <L vi="Các tầng trừu tượng" en="Levels of abstraction" /> },
        { id: 'to-chuc', title: <L vi="5 thành phần" en="5 components" /> },
        { id: 'hieu-nang', title: <L vi="Đo hiệu năng" en="Measuring performance" /> },
        { id: 'cpi', title: <L vi="CPI & công thức vàng" en="CPI & the golden formula" /> },
        { id: 'dem-lenh', title: <L vi="Đếm số lệnh" en="Counting instructions" /> },
        { id: 'kiem-tra', title: <L vi="Tự kiểm tra" en="Check yourself" /> },
      ]}
    >
      <Sec id="may-tinh" title={<L vi="Máy tính là gì" en="What is a computer" />} kicker="1.1">
        <p><L vi="Theo slide, máy tính là một cỗ máy:" en="According to the slides, a computer is a machine that:" /></p>
        <ol>
          <li><L vi="Nhận dữ liệu vào (input)" en="Accepts input data" /></li>
          <li><L vi={<>Xử lý dữ liệu bằng cách <b>chạy một chương trình được lưu sẵn</b> (stored program)</>} en={<>Processes the data by <b>running a stored program</b></>} /></li>
          <li><L vi="Đưa kết quả ra (output)" en="Produces output" /></li>
        </ol>
        <p>
          <L
            vi="Theo định nghĩa này, điện thoại, máy giặt thông minh, ô tô, đồng hồ thông minh… đều có máy tính bên trong."
            en="By this definition, phones, smart washing machines, cars, smartwatches… all have a computer inside."
          />
        </p>
      </Sec>

      <Sec id="lich-su" title={<L vi="Phân loại & lịch sử" en="Classes & history" />} kicker="1.2">
        <Table
          head={[<L key="a" vi="Loại" en="Class" />, <L key="b" vi="Đặc điểm" en="Characteristics" />, <L key="c" vi="Ví dụ" en="Example" />]}
          rows={[
            [<L key="1" vi="Siêu máy tính" en="Supercomputer" />, <L key="2" vi="Cực nhanh, cực đắt, cho tính toán khoa học" en="Extremely fast, extremely expensive, for scientific computing" />, <L key="3" vi="Dự báo thời tiết" en="Weather forecasting" />],
            ['Server', <L key="2" vi="Chạy qua mạng, dung lượng lớn, tin cậy cao" en="Network-based, high capacity, high reliability" />, <L key="3" vi="Máy chủ web" en="Web servers" />],
            ['Desktop / PC', <L key="2" vi="Đa dụng, cân bằng giá và hiệu năng" en="General purpose, balancing cost and performance" />, 'Laptop'],
            [<L key="1" vi="Nhúng (embedded)" en="Embedded" />, <L key="2" vi="Giấu trong thiết bị khác, ràng buộc chặt về điện/giá" en="Hidden inside other devices, strict power/cost limits" />, <L key="3" vi="Chip trong máy giặt, ô tô" en="Chips in washing machines, cars" />],
          ]}
        />
        <Note kind="key">
          <p>
            <L
              vi={<>Câu trong slide: <b>“Khác nhau về quy mô, không khác về bản chất”</b>. Loại nào cũng có cùng 5 thành phần cơ bản. Thời kỳ <b>hậu PC</b>: điện thoại, tablet, smart TV và điện toán đám mây.</>}
              en={<>From the slides: <b>“Differences in scale, not in substance”</b>. Every class has the same 5 basic components. The <b>post-PC era</b>: phones, tablets, smart TVs and cloud computing.</>}
            />
          </p>
        </Note>
        <Table
          head={[<L key="a" vi="Thế hệ" en="Generation" />, <L key="b" vi="Công nghệ" en="Technology" />, <L key="c" vi="Điểm cần nhớ" en="What to remember" />]}
          rows={[
            ['0', <L key="t" vi="Cơ khí" en="Mechanical" />, <L key="r" vi="Bìa đục lỗ Jacquard, máy Pascal, máy Babbage; Ada Lovelace viết chương trình đầu tiên" en="Jacquard's punch cards, Pascal's machine, Babbage's engine; Ada Lovelace wrote the first program" />],
            ['1', <L key="t" vi="Đèn chân không" en="Vacuum tubes" />, <L key="r" vi="ENIAC (máy đa dụng đầu tiên); IAS (kiến trúc Von Neumann); UNIVAC (máy thương mại đầu tiên)" en="ENIAC (first general-purpose computer); IAS (Von Neumann architecture); UNIVAC (first commercial computer)" />],
            ['2', 'Transistor', <L key="r" vi="Nhỏ và nhanh hơn; IBM System/360" en="Smaller and faster; IBM System/360" />],
            ['3+', <L key="t" vi="Mạch tích hợp IC, VLSI" en="Integrated circuits (IC), VLSI" />, <L key="r" vi="Định luật Moore: số transistor trên chip tăng gấp đôi khoảng mỗi 18–24 tháng" en="Moore's law: the number of transistors on a chip doubles roughly every 18–24 months" />],
          ]}
        />
        <Note kind="key" title={<L vi="Kiến trúc Von Neumann" en="The Von Neumann architecture" />}>
          <p>
            <L
              vi={<>Gồm bộ nhớ, ALU, khối điều khiển, vào/ra, và quan trọng nhất là <b>khái niệm chương trình lưu trữ</b>: chương trình và dữ liệu cùng nằm trong bộ nhớ. Đây là nền tảng của mọi máy tính ngày nay.</>}
              en={<>It has memory, an ALU, a control unit, input/output, and most importantly the <b>stored-program concept</b>: the program and its data live together in memory. Every computer today is built on this idea.</>}
            />
          </p>
        </Note>
      </Sec>

      <Sec id="y-tuong" title={<L vi="7 ý tưởng lớn trong kiến trúc máy tính" en="7 great ideas in computer architecture" />} kicker="1.3">
        <Table
          head={[<L key="a" vi="Ý tưởng" en="Idea" />, <L key="b" vi="Nghĩa là gì" en="What it means" />, <L key="c" vi="Ví dụ" en="Example" />]}
          rows={[
            [<L key="1" vi="Đơn giản hoá bằng trừu tượng hoá" en="Simplification via abstraction" />, <L key="2" vi="Chia thành nhiều tầng, mỗi tầng giấu chi tiết tầng dưới" en="Split into layers, each hiding the details of the layer below" />, <L key="3" vi="Lập trình C không cần biết transistor" en="You can write C without knowing about transistors" />],
            [<L key="1" vi="Làm nhanh trường hợp phổ biến" en="Make the common case fast" />, <L key="2" vi="Tối ưu cái dùng nhiều nhất" en="Optimise what is used most" />, <L key="3" vi="Số 0 dùng nhiều nhất → có hẳn thanh ghi x0 = 0" en="0 is the most used constant → there is a register x0 = 0" />],
            [<L key="1" vi="Hiệu năng nhờ song song" en="Performance via parallelism" />, <L key="2" vi="Làm nhiều việc cùng lúc" en="Do many things at once" />, <L key="3" vi="CPU nhiều lõi" en="Multi-core CPUs" />],
            [<L key="1" vi="Hiệu năng nhờ đường ống (pipeline)" en="Performance via pipelining" />, <L key="2" vi="Chia việc thành công đoạn, chồng lên nhau" en="Split work into stages that overlap" />, <L key="3" vi="Máy giặt mẻ 2 trong khi máy sấy mẻ 1" en="Washing load 2 while drying load 1" />],
            [<L key="1" vi="Hiệu năng nhờ dự đoán" en="Performance via prediction" />, <L key="2" vi="Đoán trước rồi làm, sai thì sửa" en="Guess ahead and act, fix it if wrong" />, <L key="3" vi="Đoán nhánh nào sẽ được chọn" en="Guessing which way a branch will go" />],
            [<L key="1" vi="Phân cấp bộ nhớ" en="Memory hierarchy" />, <L key="2" vi="Nhỏ-nhanh-đắt ở gần CPU, to-chậm-rẻ ở xa" en="Small, fast, expensive near the CPU; big, slow, cheap further away" />, <L key="3" vi="Thanh ghi → cache → RAM → ổ đĩa" en="Registers → cache → RAM → disk" />],
            [<L key="1" vi="Tin cậy nhờ dư thừa" en="Dependability via redundancy" />, <L key="2" vi="Có linh kiện dự phòng" en="Keep spare components" />, <L key="3" vi="RAID ổ đĩa" en="RAID disk arrays" />],
          ]}
        />
      </Sec>

      <Sec id="truu-tuong" title={<L vi="Các tầng trừu tượng: từ code C đến bit" en="Levels of abstraction: from C code to bits" />} kicker="1.4">
        <p>
          <L
            vi={<>Chương trình đi qua ba tầng. <b>Compiler</b> dịch ngôn ngữ bậc cao (C) sang <b>hợp ngữ</b> (assembly, dạng chữ của lệnh máy). <b>Assembler</b> dịch assembly sang <b>mã máy</b> (toàn 0 và 1). Phần mềm hệ thống còn có <b>hệ điều hành</b>: lo vào/ra, quản lý bộ nhớ, chia sẻ tài nguyên và lập lịch chạy chương trình.</>}
            en={<>A program goes through three levels. The <b>compiler</b> translates a high-level language (C) into <b>assembly language</b> (the text form of machine instructions). The <b>assembler</b> translates assembly into <b>machine code</b> (all 0s and 1s). System software also includes the <b>operating system</b>: it handles input/output, manages memory, shares resources and schedules programs.</>}
          />
        </p>
        <AbstractionLadder />
        <Note kind="slide">
          <p>
            <L
              vi={<>Slide 26 viết <code>slli x6, x11, 3</code> (nhân 8) vì lấy từ bản 64 bit của sách. Với mảng <code>int</code> 4 byte và lệnh <code>lw</code> thì phải là <code>slli x6, x11, 2</code> (nhân 4), như ở trên.</>}
              en={<>Slide 26 writes <code>slli x6, x11, 3</code> (multiply by 8) because it comes from the 64-bit edition of the book. For a 4-byte <code>int</code> array and the <code>lw</code> instruction it must be <code>slli x6, x11, 2</code> (multiply by 4), as above.</>}
            />
          </p>
        </Note>
      </Sec>

      <Sec id="to-chuc" title={<L vi="Tổ chức máy tính: 5 thành phần" en="Computer organisation: 5 components" />} kicker="1.5">
        <p>
          <L
            vi={<>Muốn nhận dữ liệu thì cần <b>Input</b>, muốn lưu thì cần <b>Memory</b>, muốn xử lý thì cần <b>Datapath</b> (nơi tính toán) và <b>Control</b> (điều khiển), muốn đưa kết quả ra thì cần <b>Output</b>. Datapath + Control gộp lại gọi là <b>CPU</b> (processor).</>}
            en={<>To take in data you need <b>Input</b>, to store it you need <b>Memory</b>, to process it you need the <b>Datapath</b> (where calculations happen) and <b>Control</b>, and to give results back you need <b>Output</b>. Datapath + Control together are called the <b>CPU</b> (processor).</>}
          />
        </p>
        <SystemDiagram title={<L vi="5 thành phần trong một sơ đồ" en="The 5 components in one diagram" />} />
        <p>
          <L
            vi="Slide có ảnh tháo iPhone XS Max: chip Apple A12 không chỉ là CPU mà gồm cả GPU, bộ xử lý AI và nhiều khối khác trên cùng một chip."
            en="The slides show a teardown of an iPhone XS Max: the Apple A12 chip is not just a CPU — it also packs a GPU, an AI processor and many other blocks on the same chip."
          />
        </p>
      </Sec>

      <Sec id="hieu-nang" title={<L vi="Đo hiệu năng" en="Measuring performance" />} kicker="1.6">
        <p>
          <L
            vi={<>Hiệu năng có nhiều tiêu chí: <b>thông lượng</b> (bao nhiêu việc mỗi giây) và <b>thời gian đáp ứng</b> (một việc mất bao lâu). Môn này tập trung vào thời gian chạy.</>}
            en={<>Performance has several criteria: <b>throughput</b> (how many jobs per second) and <b>response time</b> (how long one job takes). This course focuses on execution time.</>}
          />
        </p>
        <Formula caption={<L vi="Thời gian càng ngắn thì hiệu năng càng cao" en="The shorter the time, the higher the performance" />}>Performance = 1 / Execution time</Formula>
        <Formula caption={<L vi="Luôn lấy thời gian máy CHẬM chia cho thời gian máy NHANH" en="Always divide the SLOW machine's time by the FAST machine's time" />}>
          <L vi="“X nhanh hơn Y n lần” ⇔ n = Time_Y / Time_X" en="“X is n times faster than Y” ⇔ n = Time_Y / Time_X" />
        </Formula>
        <p>
          <L
            vi={<><b>Ví dụ slide 34:</b> A chạy 10 s, B chạy 15 s → n = 15 / 10 = <b>1.5</b>. A nhanh hơn B 1.5 lần.</>}
            en={<><b>Slide 34 example:</b> A runs in 10 s, B in 15 s → n = 15 / 10 = <b>1.5</b>. A is 1.5 times faster than B.</>}
          />
        </p>
        <Sub title={<L vi="Xung nhịp (clock)" en="The clock" />}>
          <p>
            <L
              vi={<>CPU làm việc theo nhịp như tiếng tích tắc. <b>Clock cycle time (CC)</b> là độ dài một nhịp; <b>clock rate (CR)</b> là số nhịp mỗi giây. CC = 1 / CR.</>}
              en={<>The CPU works to a beat, like a ticking clock. The <b>clock cycle time (CC)</b> is the length of one tick; the <b>clock rate (CR)</b> is the number of ticks per second. CC = 1 / CR.</>}
            />
          </p>
          <Table
            head={[<L key="a" vi="Chu kỳ" en="Cycle time" />, 'Clock rate']}
            rows={[['1 ns (10⁻⁹ s)', '1 GHz (10⁹ Hz)'], ['500 ps', '2 GHz'], ['250 ps', '4 GHz'], ['200 ps', '5 GHz']]}
            caption="1 ns = 1000 ps"
          />
          <p>
            <L
              vi={<><b>CPU time</b> là thời gian CPU thực sự chạy chương trình (không tính lúc chờ I/O hay chạy chương trình khác): CPU time = số chu kỳ × CC = số chu kỳ / CR.</>}
              en={<><b>CPU time</b> is the time the CPU actually spends running the program (not counting waiting for I/O or running other programs): CPU time = clock cycles × CC = clock cycles / CR.</>}
            />
          </p>
        </Sub>
        <ClockSolver />
      </Sec>

      <Sec id="cpi" title={<L vi="CPI và công thức vàng" en="CPI and the golden formula" />} kicker="1.7">
        <p>
          <L
            vi={<>Lệnh khác nhau tốn số chu kỳ khác nhau (cộng nhanh, đọc bộ nhớ chậm). <b>CPI</b> (Clock cycles Per Instruction) là số chu kỳ trung bình của một lệnh.</>}
            en={<>Different instructions take different numbers of cycles (adding is fast, reading memory is slow). <b>CPI</b> (Clock cycles Per Instruction) is the average number of cycles per instruction.</>}
          />
        </p>
        <Formula
          caption={<L
            vi="IC: số lệnh (do thuật toán, compiler, ISA) · CPI: do thiết kế phần cứng · CC: thông số CPU"
            en="IC: instruction count (set by algorithm, compiler, ISA) · CPI: set by the hardware design · CC: a CPU spec" />}
        >
          CPU time = IC × CPI × CC = IC × CPI / CR
        </Formula>
        <PerfCompare />
        <CpiMix />
        <Note kind="tip">
          <p>
            <L
              vi="Cải tiến phần chiếm nhiều thời gian nhất thì lợi nhất. Ở bảng trên, Load chiếm 1.0 trên tổng 2.2, nên làm Load nhanh hơn (37.5%) lợi hơn hẳn làm Branch nhanh hơn (10%)."
              en="Improving the part that takes the most time pays off the most. In the table above, Load accounts for 1.0 of the total 2.2, so speeding up Load (37.5%) helps far more than speeding up Branch (10%)."
            />
          </p>
        </Note>
        <Sub title={<L vi="Clock nhanh hơn chưa chắc chạy nhanh hơn" en="A faster clock does not always mean a faster run" />}>
          <ClockTrap />
        </Sub>
        <Sub title={<L vi="Cách tăng hiệu năng (slide 44)" en="How to improve performance (slide 44)" />}>
          <Table
            head={[<L key="a" vi="Giảm" en="Reduce" />, <L key="b" vi="Bằng cách" en="By" />]}
            rows={[
              [<L key="1" vi="CC (clock nhanh hơn)" en="CC (faster clock)" />, <L key="2" vi="Công nghệ chip mới" en="Newer chip technology" />],
              ['CPI', <L key="2" vi="Tối ưu ISA và thiết kế phần cứng" en="Optimising the ISA and the hardware design" />],
              [<L key="1" vi="IC (số lệnh)" en="IC (instruction count)" />, <L key="2" vi="Thuật toán tốt hơn, compiler tốt hơn" en="Better algorithms, better compilers" />],
            ]}
          />
          <p>
            <L
              vi={<>Để so sánh các máy, người ta chạy bộ chương trình chuẩn <b>SPEC CPU</b>. Từ khoảng năm 2004, tốc độ một lõi tăng chậm lại nên các hãng chuyển sang CPU nhiều lõi.</>}
              en={<>To compare machines, people run the <b>SPEC CPU</b> benchmark suite. Since around 2004, single-core speed has grown slowly, so manufacturers moved to multi-core CPUs.</>}
            />
          </p>
        </Sub>
      </Sec>

      <Sec id="dem-lenh" title={<L vi="Đếm số lệnh động" en="Counting dynamic instructions" />} kicker="1.8">
        <p>
          <L
            vi={<>Đây là dạng bài hay ra thi. Tính <b>từ vòng trong cùng ra ngoài</b>, nhớ cộng các lệnh phụ của vòng lặp (tăng biến đếm, kiểm tra điều kiện) ở mỗi lần lặp.</>}
            en={<>This type of problem shows up in exams a lot. Work <b>from the innermost loop outwards</b>, and remember to add the loop's own overhead instructions (increment the counter, check the condition) on every iteration.</>}
          />
        </p>
        <LoopCounter />
      </Sec>

      <Sec id="kiem-tra" title={<L vi="Tự kiểm tra" en="Check yourself" />}>
        <Pitfalls items={[
          <L key="1" vi="Nhầm “nhanh hơn n lần” thành Time_A / Time_B. Phải lấy thời gian máy chậm chia thời gian máy nhanh." en="Computing “n times faster” as Time_A / Time_B. It must be the slow machine's time divided by the fast machine's time." />,
          <L key="2" vi="Quên đổi đơn vị: GHz = 10⁹, ns = 10⁻⁹ s, ps = 10⁻¹² s." en="Forgetting unit conversions: GHz = 10⁹, ns = 10⁻⁹ s, ps = 10⁻¹² s." />,
          <L key="3" vi="Đếm vòng lặp quên cộng lệnh phụ của vòng lặp ở mỗi lần lặp." en="Counting loops but forgetting the loop's overhead instructions on each iteration." />,
          <L key="4" vi="“Nhanh hơn 37.5%” lấy từ tỉ số 2.2 / 1.6 = 1.375, không phải từ (2.2 − 1.6) / 2.2." en="“37.5% faster” comes from the ratio 2.2 / 1.6 = 1.375, not from (2.2 − 1.6) / 2.2." />,
        ]} />
        <SelfCheck items={[
          { q: <L vi="Máy 4 GHz, chương trình 10⁹ lệnh, CPI = 1.5. CPU time?" en="A 4 GHz machine runs a program of 10⁹ instructions with CPI = 1.5. CPU time?" />, a: '10⁹ × 1.5 / (4 × 10⁹) = 0.375 s' },
          { q: 'Datapath + Control = ?', a: <L vi="CPU (bộ xử lý)" en="The CPU (processor)" /> },
          {
            q: <L vi="Compiler dịch 1 dòng C thành mấy lệnh assembly? Assembler dịch 1 lệnh assembly thành mấy lệnh máy?" en="How many assembly instructions does the compiler turn 1 line of C into? How many machine instructions does the assembler turn 1 assembly instruction into?" />,
            a: <L vi="Compiler: nhiều. Assembler: đúng 1." en="Compiler: many. Assembler: exactly 1." />,
          },
          {
            q: <L vi="Máy A clock 2 GHz, chạy 10 s. Máy B cần số chu kỳ gấp 1.2 lần, muốn chạy 6 s thì cần clock bao nhiêu?" en="Machine A has a 2 GHz clock and runs in 10 s. Machine B needs 1.2 times as many cycles. What clock does B need to run in 6 s?" />,
            a: <L vi="Chu kỳ A = 20 × 10⁹; chu kỳ B = 24 × 10⁹; CR_B = 24 × 10⁹ / 6 = 4 GHz." en="Cycles A = 20 × 10⁹; cycles B = 24 × 10⁹; CR_B = 24 × 10⁹ / 6 = 4 GHz." />,
          },
        ]} />
      </Sec>
    </Lesson>
  );
}
