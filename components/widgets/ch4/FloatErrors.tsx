import { Widget } from '@/components/lesson/Blocks';

const fr = Math.fround;
const show = (x: number) => x.toPrecision(10).replace(/0+$/, '').replace(/\.$/, '.0');

const ROWS: { expr: string; v: number; note: string }[] = [
  { expr: '0.2 × 5', v: fr(fr(0.2) * 5), note: '0.2 lưu thành 0.200000003; nhân 5 rồi làm tròn may mắn ra đúng 1.0' },
  { expr: '0.333 × 3', v: fr(fr(0.333) * 3), note: '0.333 vốn không phải 1/3, nên ra 0.999 chứ không phải 1' },
  { expr: '(1.0 / 3) × 3', v: fr(fr(1 / 3) * 3), note: 'sai số làm tròn của 1/3 và của phép nhân triệt tiêu nhau' },
  { expr: '0.1 + 0.2', v: fr(fr(0.1) + fr(0.2)), note: 'ra 0.3 sau làm tròn, nhưng giá trị lưu thật không đúng 0.3' },
  { expr: '0.1 lưu thật là', v: fr(0.1), note: '0.1 = 0.000110011001100…₂ lặp vô hạn, phải cắt bớt' },
];

/** Bảng các phép tính số thực "kỳ lạ" (slide 75), tính bằng float 32 bit thật. */
export default function FloatErrors() {
  return (
    <Widget title="Số thực chỉ là gần đúng" kicker="Kết quả thật (float 32 bit)" hint="Các giá trị dưới đây được tính bằng float 32 bit, hiển thị 10 chữ số có nghĩa để thấy sai số.">
      <div className="scroll-x">
        <table className="steptable">
          <thead><tr><th>Phép tính</th><th>Kết quả float</th><th>Vì sao</th></tr></thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.expr}><td>{r.expr}</td><td className="chg">{show(r.v)}</td><td className="txt">{r.note}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="widget-note">Bài học: đừng so sánh số thực bằng <code>==</code>. So sánh |a − b| &lt; một sai số nhỏ.</p>
    </Widget>
  );
}
