import Link from 'next/link';
import HeroInstruction from '@/components/widgets/HeroInstruction';
import SystemDiagram from '@/components/widgets/ch2/SystemDiagram';
import RoadmapList from '@/components/RoadmapList';
import { Note, Table } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';

export default function Home() {
  return (
    <div className="page home">
      <header className="hero">
        <p className="hero-kicker">
          <L vi="IT3030E · Kiến trúc Máy tính · Đại học Bách khoa Hà Nội" en="IT3030E · Computer Architecture · Hanoi University of Science and Technology" />
        </p>
        <h1><L vi="Từ một dãy 32 bit đến cả một chương trình chạy được" en="From a string of 32 bits to a whole running program" /></h1>
        <p className="hero-lede">
          <L
            vi="Bốn chương đầu của môn học, giải thích lại từ con số 0. Mỗi bài có tóm tắt 1 phút, giải thích chi tiết, ví dụ có lời giải lấy từ slide, và mô phỏng để tự bấm thử. Code RISC-V nào cũng chạy được từng lệnh ngay trên trang."
            en="The first four chapters of the course, explained again from zero. Every lesson has a one-minute summary, a detailed explanation, worked examples taken from the slides, and simulations you can play with. Every piece of RISC-V code can be run one instruction at a time, right on the page."
          />
        </p>
        <HeroInstruction />
        <div className="hero-cta">
          <Link className="next-link" href="/nen-tang">
            <span><L vi="Bắt đầu học" en="Start learning" /></span>
            <strong><L vi="Bước 0 · Nền tảng: bit, nhị phân, hex →" en="Step 0 · Foundations: bits, binary, hex →" /></strong>
          </Link>
          <Link className="btn" href="/lab"><L vi="Mở Lab RISC-V toàn màn hình" en="Open the full-screen RISC-V Lab" /></Link>
        </div>
      </header>

      <section className="sec" id="lo-trinh">
        <h2><L vi="Lộ trình học" en="Learning path" /></h2>
        <p className="prose">
          <L
            vi={<>Học theo đúng thứ tự dưới đây, đừng nhảy cóc. Thứ tự này khác thứ tự slide một chỗ: <b>phần đầu Chương 4 (số âm, bù 2) học trước Chương 3</b>,
              vì Chương 3 dùng số âm, số hex và mở rộng dấu liên tục. Bấm “Đánh dấu đã học xong” cuối mỗi bài để theo dõi tiến độ (lưu trong trình duyệt này).</>}
            en={<>Follow the order below and don't skip ahead. It differs from the slide order in one place: <b>the first part of Chapter 4 (negative numbers, two's complement) comes before Chapter 3</b>,
              because Chapter 3 uses negative numbers, hex and sign extension all the time. Click “Mark as completed” at the end of each lesson to track your progress (saved in this browser).</>}
          />
        </p>
        <RoadmapList />
      </section>

      <section className="sec" id="buc-tranh">
        <h2><L vi="Bức tranh toàn cảnh" en="The big picture" /></h2>
        <p className="prose"><L vi="Hình dung máy tính như một nhà bếp:" en="Picture a computer as a kitchen:" /></p>
        <div className="two-col">
          <div className="card">
            <h3><L vi="CPU = đầu bếp" en="CPU = the cook" /></h3>
            <p><L vi="Chỉ biết vài động tác rất đơn giản (cộng, trừ, so sánh, lấy đồ, cất đồ) nhưng làm cực nhanh." en="Knows only a few very simple moves (add, subtract, compare, fetch, put away) but does them extremely fast." /></p>
          </div>
          <div className="card">
            <h3><L vi="Thanh ghi = cái thớt" en="Registers = the cutting board" /></h3>
            <p><L vi="Ngay trước mặt, chỉ có 32 chỗ, nhưng với tay là tới." en="Right in front of the cook. Only 32 spots, but everything is within arm's reach." /></p>
          </div>
          <div className="card">
            <h3><L vi="Bộ nhớ = tủ lạnh" en="Memory = the fridge" /></h3>
            <p><L vi="Chứa nhiều hơn rất nhiều, nhưng mỗi lần lấy phải đi lại, chậm hơn thanh ghi 100–500 lần." en="Holds far more, but every trip there takes time: 100–500 times slower than a register." /></p>
          </div>
          <div className="card">
            <h3><L vi="Chương trình = công thức" en="Program = the recipe" /></h3>
            <p><L vi="Danh sách từng bước (lệnh) viết sẵn, cất trong tủ lạnh cùng với nguyên liệu (dữ liệu)." en="A pre-written list of steps (instructions), kept in the fridge together with the ingredients (data)." /></p>
          </div>
          <div className="card">
            <h3><L vi="I/O = quầy gọi món" en="I/O = the order counter" /></h3>
            <p><L vi="Bàn phím, màn hình, ổ đĩa: nơi máy nói chuyện với thế giới bên ngoài." en="Keyboard, screen, disk: where the machine talks to the outside world." /></p>
          </div>
          <div className="card">
            <h3><L vi="Bus = hành lang" en="Bus = the hallway" /></h3>
            <p><L vi="Đường nối đầu bếp, tủ lạnh và quầy, chở dữ liệu, địa chỉ và tín hiệu điều khiển." en="Connects the cook, the fridge and the counter, carrying data, addresses and control signals." /></p>
          </div>
        </div>
        <SystemDiagram />
        <Table
          head={[<L key="h1" vi="Chương" en="Chapter" />, <L key="h2" vi="Câu hỏi" en="Question" />, <L key="h3" vi="Câu trả lời một dòng" en="One-line answer" />]}
          rows={[
            ['1', <L key="q1" vi="Máy tính là gì, đo nhanh/chậm thế nào?" en="What is a computer, and how do we measure fast or slow?" />, <code key="1">CPU time = <L vi="Số lệnh × CPI × Thời gian 1 chu kỳ" en="Instruction count × CPI × Clock cycle time" /></code>],
            ['2', <L key="q2" vi="Bên trong có gì, chạy lệnh ra sao?" en="What is inside, and how does it run an instruction?" />, <L key="a2" vi="CPU lặp mãi: lấy lệnh (fetch) → thực hiện (execute) → kiểm tra ngắt" en="The CPU loops forever: fetch → execute → check for interrupts" />],
            ['3', <L key="q3" vi="CPU hiểu “ngôn ngữ” gì?" en="What “language” does the CPU understand?" />, <L key="a3" vi="Tập lệnh RISC-V: mỗi lệnh 32 bit, làm việc trên 32 thanh ghi" en="The RISC-V instruction set: every instruction is 32 bits and works on 32 registers" />],
            ['4', <L key="q4" vi="Máy tính làm toán thế nào?" en="How does a computer do arithmetic?" />, <L key="a4" vi="Số âm dùng bù 2, số thực dùng IEEE 754, phép tính bằng mạch logic" en="Negative numbers use two's complement, real numbers use IEEE 754, and arithmetic is done by logic circuits" />],
          ]}
        />
      </section>

      <section className="sec" id="cach-dung">
        <h2><L vi="Cách dùng trang này" en="How to use this site" /></h2>
        <div className="two-col">
          <div className="card">
            <h3><L vi="Đọc theo lớp" en="Read in layers" /></h3>
            <p>
              <L
                vi={<>Đầu mỗi bài có <b>Tóm tắt 1 phút</b>. Đọc nó trước, rồi đọc phần chi tiết. Ôn thi thì vào <Link href="/on-thi">Ôn thi</Link> có tóm tắt cả môn trên một trang.</>}
                en={<>Each lesson starts with a <b>One-minute summary</b>. Read it first, then the details. Before the exam, go to <Link href="/on-thi">Exam review</Link> for the whole course on one page.</>}
              />
            </p>
          </div>
          <div className="card">
            <h3><L vi="Bấm thử mọi thứ" en="Try everything" /></h3>
            <p>
              <L
                vi={<>Khung có nhãn <span className="widget-kicker">Mô phỏng</span> là để bấm. Sửa số, bật tắt bit, chạy từng bước. Hiểu bằng tay nhanh hơn đọc.</>}
                en={<>Boxes labelled <span className="widget-kicker">Simulation</span> are made to be clicked. Change numbers, flip bits, step through. Learning by doing beats reading.</>}
              />
            </p>
          </div>
          <div className="card">
            <h3><L vi="Chạy code trong Lab" en="Run code in the Lab" /></h3>
            <p>
              <L
                vi={<>Mỗi khối code RISC-V có nút <b>▶ Chạy từng bước trong Lab</b>. Lab dịch code ra mã máy, chạy từng lệnh, cho lùi lại, và hiện thanh ghi, bộ nhớ, stack, màn hình như RARS.</>}
                en={<>Every RISC-V code block has a <b>▶ Step through in the Lab</b> button. The Lab assembles the code into machine code, runs it one instruction at a time, lets you step back, and shows registers, memory, the stack and the console, just like RARS.</>}
              />
            </p>
          </div>
          <div className="card">
            <h3><L vi="Tự kiểm tra" en="Check yourself" /></h3>
            <p>
              <L
                vi="Cuối mỗi bài có câu hỏi tự kiểm tra và danh sách bẫy hay gặp. Trang Ôn thi có trắc nghiệm theo đúng dạng bài trong slide."
                en="Each lesson ends with self-check questions and a list of common traps. The Exam review page has a quiz that follows the exercise types in the slides."
              />
            </p>
          </div>
        </div>
        <Note kind="key" title={<L vi="Về kỳ thi" en="About the exams" />}>
          <p>
            <L
              vi={<>Theo slide Chương 1: giữa kỳ và cuối kỳ là <b>quiz online, câu hỏi lấy từ bài tập và homework</b>. Làm hết ví dụ và bài tập trong slide là cách ôn hiệu quả nhất. Tất cả ví dụ đó đều có lời giải ở đây.</>}
              en={<>According to the Chapter 1 slides, the midterm and final are <b>online quizzes with questions taken from the exercises and homework</b>. Working through every example and exercise in the slides is the best way to prepare. All of them have solutions here.</>}
            />
          </p>
        </Note>
        <Note kind="slide" title={<L vi="Nguồn" en="Sources" />}>
          <p>
            <L
              vi="Nội dung tóm tắt từ slide IT3030E (Fall 2024) của bộ môn Kỹ thuật Máy tính, SoICT: Chương 1, 2, 3 (lý thuyết + bài tập), 4 và bảng tóm tắt lệnh RISC-V. Những chỗ slide có vẻ in nhầm đều được ghi chú rõ — nên hỏi lại giảng viên."
              en="Content is summarised from the IT3030E (Fall 2024) slides of the Department of Computer Engineering, SoICT: Chapters 1, 2, 3 (theory + exercises), 4 and the RISC-V instruction summary. Places where the slides seem to contain typos are clearly noted — check them with your lecturer."
            />
          </p>
        </Note>
      </section>
    </div>
  );
}
