/** Khai báo kiểu cho lib/riscv.mjs */

export type AsmError = { line: number; msg: string };
export type TextWord = { addr: number; word: number; line: number; src: string; first: boolean; pseudo: boolean };
export type Program = {
  ok: boolean;
  errors: AsmError[];
  warnings: AsmError[];
  labels: Record<string, number>;
  text: TextWord[];
  data: Map<number, number>;
  textEnd: number;
  dataEnd: number;
  lines: string[];
};

export type Field = { name: string; hi: number; lo: number; kind: 'op' | 'rd' | 'f3' | 'rs1' | 'rs2' | 'f7' | 'imm'; value: number; note?: string };
export type Decoded = {
  ok: boolean;
  word: number;
  text: string;
  abiText?: string;
  name?: string;
  fmt?: 'R' | 'I' | 'S' | 'B' | 'U' | 'J' | null;
  imm?: number | null;
  rd?: number;
  rs1?: number;
  rs2?: number;
  f3?: number;
  f7?: number;
  op?: number;
  fields: Field[];
  target?: number | null;
};

export type StepRecord = {
  pc: number;
  word: number;
  /** [thanh ghi, giá trị cũ, giá trị mới] */
  regs: number[][];
  fregs: number[][];
  mem: number[][];
  outLen: number;
  memW: [number, number] | null;
  memR?: [number, number] | null;
  memVal?: number;
  taken?: boolean;
  nextPc?: number;
};

export class Sim {
  x: Int32Array;
  fb: Uint32Array;
  fv: Float32Array;
  pc: number;
  out: string;
  halted: boolean;
  waiting: { kind: 'int' | 'float' | 'string' | 'char' } | null;
  error: string | null;
  exitCode: number | null;
  haltMsg: string;
  history: StepRecord[];
  count: number;
  lastRec: StepRecord | null;
  prog: Program | null;
  textMap: Map<number, TextWord>;
  constructor();
  reset(): void;
  load(prog: Program): void;
  peekByte(a: number): number;
  peekWord(a: number): number;
  readString(a: number, max?: number): string;
  canStep(): boolean;
  step(): boolean;
  back(): boolean;
  provideInput(s: string): { ok: boolean; msg?: string };
  run(maxSteps?: number): number;
}

export function assemble(source: string): Program;
export function decode(word: number, pc?: number): Decoded;
export function encodeLine(line: string): { ok: true; words: { word: number; d: Decoded }[] } | { ok: false; msg: string };
export function fmtFloat(f: number): string;
export function parseNum(tok: string): number | null;
export function hex8(v: number): string;
export function bin32(v: number): string;
export const ABI: string[];
export const FABI: string[];
export const REG: Record<string, number>;
export const FREG: Record<string, number>;
export const TEXT_BASE: number;
export const DATA_BASE: number;
export const SP_INIT: number;
export const GP_INIT: number;
export const SYNTAX: Record<string, string>;
