import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';

const fr = Math.fround;
const show = (x: number) => x.toPrecision(10).replace(/0+$/, '').replace(/\.$/, '.0');

const ROWS: { expr: { vi: string; en: string }; v: number; note: { vi: string; en: string } }[] = [
  {
    expr: { vi: '0.2 × 5', en: '0.2 × 5' }, v: fr(fr(0.2) * 5),
    note: { vi: '0.2 lưu thành 0.200000003; nhân 5 rồi làm tròn may mắn ra đúng 1.0', en: '0.2 is stored as 0.200000003; times 5 and rounding happen to land exactly on 1.0' },
  },
  {
    expr: { vi: '0.333 × 3', en: '0.333 × 3' }, v: fr(fr(0.333) * 3),
    note: { vi: '0.333 vốn không phải 1/3, nên ra 0.999 chứ không phải 1', en: '0.333 is not 1/3 to begin with, so the result is 0.999, not 1' },
  },
  {
    expr: { vi: '(1.0 / 3) × 3', en: '(1.0 / 3) × 3' }, v: fr(fr(1 / 3) * 3),
    note: { vi: 'sai số làm tròn của 1/3 và của phép nhân triệt tiêu nhau', en: 'the rounding errors of 1/3 and of the multiplication cancel each other out' },
  },
  {
    expr: { vi: '0.1 + 0.2', en: '0.1 + 0.2' }, v: fr(fr(0.1) + fr(0.2)),
    note: { vi: 'ra 0.3 sau làm tròn, nhưng giá trị lưu thật không đúng 0.3', en: 'shows 0.3 after rounding, but the stored value is not exactly 0.3' },
  },
  {
    expr: { vi: '0.1 lưu thật là', en: '0.1 is really stored as' }, v: fr(0.1),
    note: { vi: '0.1 = 0.000110011001100…₂ lặp vô hạn, phải cắt bớt', en: '0.1 = 0.000110011001100…₂ repeats forever, so it must be cut off' },
  },
];

/** Bảng các phép tính số thực "kỳ lạ" (slide 75), tính bằng float 32 bit thật. */
export default function FloatErrors() {
  return (
    <Widget
      title={<L vi="Số thực chỉ là gần đúng" en="Floating-point numbers are only approximations" />}
      kicker={<L vi="Kết quả thật (float 32 bit)" en="Real results (32-bit float)" />}
      hint={<L vi="Các giá trị dưới đây được tính bằng float 32 bit, hiển thị 10 chữ số có nghĩa để thấy sai số." en="The values below are computed with 32-bit floats and shown to 10 significant digits so you can see the error." />}
    >
      <div className="scroll-x">
        <table className="steptable">
          <thead><tr><th><L vi="Phép tính" en="Expression" /></th><th><L vi="Kết quả float" en="Float result" /></th><th><L vi="Vì sao" en="Why" /></th></tr></thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.expr.vi}>
                <td><L vi={r.expr.vi} en={r.expr.en} /></td>
                <td className="chg">{show(r.v)}</td>
                <td className="txt"><L vi={r.note.vi} en={r.note.en} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="widget-note">
        <L
          vi={<>Bài học: đừng so sánh số thực bằng <code>==</code>. So sánh |a − b| &lt; một sai số nhỏ.</>}
          en={<>Lesson: don&apos;t compare floating-point numbers with <code>==</code>. Check whether |a − b| &lt; a small tolerance instead.</>}
        />
      </p>
    </Widget>
  );
}
