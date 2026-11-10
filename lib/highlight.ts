import { REG, FREG, SYNTAX } from './riscv.mjs';

/** Tô màu cú pháp cho assembly RISC-V và C. Trả về HTML đã escape. */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const MNEMONICS = new Set<string>([
  ...Object.keys(SYNTAX),
  'ecall', 'ebreak', 'nop', 'ret', 'fneg.s', 'fabs.s', 'sltz', 'sgtz',
]);

function commentStart(line: string) {
  let inS = false, inC = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if ((inS || inC) && ch === '\\') { i++; continue; }
    if (ch === '"' && !inC) inS = !inS;
    else if (ch === "'" && !inS) inC = !inC;
    else if (ch === '#' && !inS && !inC) return i;
  }
  return -1;
}

const TOKEN = /("(?:\\.|[^"\\])*"?)|('(?:\\.|[^'\\])'?)|(\.[A-Za-z]+)|([+-]?0x[0-9a-fA-F]+|[+-]?0b[01]+|[+-]?\d+(?:\.\d+)?)|(\$?[A-Za-z_][\w.$]*)(\s*:)?|(\s+|.)/g;

export function highlightAsmLine(line: string): string {
  const c = commentStart(line);
  const code = c >= 0 ? line.slice(0, c) : line;
  const comment = c >= 0 ? line.slice(c) : '';
  let out = '';
  let sawMnemonic = false;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(code))) {
    if (m[0] === '') { TOKEN.lastIndex++; continue; }
    if (m[1]) out += `<span class="tk-s">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="tk-s">${esc(m[2])}</span>`;
    else if (m[3]) { out += `<span class="tk-d">${esc(m[3])}</span>`; sawMnemonic = true; }
    else if (m[4]) out += `<span class="tk-n">${esc(m[4])}</span>`;
    else if (m[5]) {
      const word = m[5];
      const bare = word.replace(/^\$/, '');
      if (m[6] && !sawMnemonic) out += `<span class="tk-l">${esc(word)}</span>${esc(m[6])}`;
      else if (!sawMnemonic && MNEMONICS.has(bare.toLowerCase())) { out += `<span class="tk-m">${esc(word)}</span>${esc(m[6] || '')}`; sawMnemonic = true; }
      else if (bare in REG || bare in FREG) out += `<span class="tk-r">${esc(word)}</span>${esc(m[6] || '')}`;
      else { out += `<span class="tk-ref">${esc(word)}</span>${esc(m[6] || '')}`; if (!sawMnemonic) sawMnemonic = true; }
    } else out += esc(m[7] ?? m[0]);
  }
  if (comment) out += `<span class="tk-c">${esc(comment)}</span>`;
  return out;
}

export function highlightAsm(src: string): string {
  return src.split('\n').map(highlightAsmLine).join('\n');
}

const C_KEYWORDS = new Set(['int', 'char', 'short', 'long', 'float', 'double', 'void', 'unsigned', 'signed', 'struct', 'if', 'else', 'for', 'while', 'do', 'return', 'switch', 'case', 'break', 'default', 'const', 'size_t', 'goto']);

export function highlightC(src: string): string {
  return src
    .split('\n')
    .map((line) => {
      const ci = line.indexOf('//');
      const code = ci >= 0 ? line.slice(0, ci) : line;
      const comment = ci >= 0 ? line.slice(ci) : '';
      const body = code.replace(/("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)|([^"'\w]+)/g, (all, s, ch, n, w, other) => {
        if (s || ch) return `<span class="tk-s">${esc(all)}</span>`;
        if (n) return `<span class="tk-n">${esc(all)}</span>`;
        if (w) return C_KEYWORDS.has(w) ? `<span class="tk-m">${esc(w)}</span>` : esc(w);
        return esc(other);
      });
      return body + (comment ? `<span class="tk-c">${esc(comment)}</span>` : '');
    })
    .join('\n');
}
