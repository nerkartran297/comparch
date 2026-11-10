/** Chương trình mẫu cho Lab RISC-V. input/expect dùng cho test tự động (npm test). */
export const EXAMPLES = [
  {
    id: 'hello1', group: 'Bài tập Ch3', title: 'Hello World 1 — cộng 2 + 3',
    code: `.text                 # vùng code
    addi t1, zero, 2      # t1 = 2
    addi t2, zero, 3      # t2 = 3
    add  t0, t1, t2       # t0 = t1 + t2 = 5
`, expect: { reg: { t0: 5 } }
  },
  {
    id: 'hello2', group: 'Bài tập Ch3', title: 'Hello World 2 — biến X + Y trong bộ nhớ',
    code: `.data                 # vùng dữ liệu, bắt đầu 0x10010000
X:  .word 100
Y:  .word 200
.text
    la   t0, X            # t0 = địa chỉ của X
    lw   t1, 0(t0)        # t1 = X = 100
    la   t0, Y            # t0 = địa chỉ của Y
    lw   t2, 0(t0)        # t2 = Y = 200
    add  t0, t1, t2       # t0 = 300
`, expect: { reg: { t0: 300 } }
  },
  {
    id: 'arith', group: 'Chương 3', title: 'Slide 24 — s1 cuối cùng bằng mấy?',
    code: `.text
    li   s1, 6            # giả sử ban đầu s1 = 6
    addi s2, s1, 3        # s2 = 6 + 3 = 9
    addi s1, s1, -2       # s1 = 6 - 2 = 4
    sub  s1, s2, s1       # s1 = 9 - 4 = 5
`, expect: { reg: { s1: 5, s2: 9 } }
  },
  {
    id: 'logic', group: 'Chương 3', title: 'Slide 26 — and / or theo bit',
    code: `.text
    li   s1, 8            # 0000 1000
    li   s2, 14           # 0000 1110
    and  s3, s1, s2       # 0000 1000 = 8
    or   s4, s1, s2       # 0000 1110 = 14
    xor  s5, s1, s2       # 0000 0110 = 6
    slli s6, s1, 2        # 8 << 2 = 32 (nhân 4)
    li   t0, -8
    srai s7, t0, 1        # -8 >> 1 giữ dấu = -4
    srli s8, t0, 1        # dịch logic: thành số dương rất lớn
`, expect: { reg: { s3: 8, s4: 14, s5: 6, s6: 32, s7: -4, s8: 0x7FFFFFFC } }
  },
  {
    id: 'lwarray', group: 'Chương 3', title: 'Slide 30 — A[10] = A[3] + 10',
    code: `.data
A:  .word 0, 1, 2, 33, 4, 5, 6, 7, 8, 9, 10   # A[3] = 33
.text
    la   x13, A           # x13 = địa chỉ A[0]
    lw   x10, 12(x13)     # 12 / 4 = 3  → x10 = A[3]
    addi x12, x10, 10     # x12 = A[3] + 10
    sw   x12, 40(x13)     # 40 / 4 = 10 → A[10] = x12
`, expect: { reg: { a0: 33, a2: 43 }, mem: { 0x10010028: 43 } }
  },
  {
    id: 'branch', group: 'Chương 3', title: 'Slide 32 — beq: s2 cuối bằng mấy?',
    code: `.text
start:
    addi s0, zero, 2      # s0 = 2
    addi s1, zero, 2      # s1 = 2
    addi s3, zero, 0      # s3 = 0
    beq  s0, s1, Exit     # 2 == 2 → nhảy, bỏ qua lệnh dưới
    add  s3, s2, s1       # (không chạy)
Exit:
    add  s2, s3, s1       # s2 = 0 + 2 = 2
`, expect: { reg: { s2: 2 } }
  },
  {
    id: 'ifelse', group: 'Chương 3', title: 'Slide 35 — if (i < 5) X = 3 else X = 10',
    code: `# i ở s1, X ở t1. Thử đổi giá trị i rồi chạy lại.
.text
    li   s1, 3            # i = 3
    slti t0, s1, 5        # t0 = (i < 5) ? 1 : 0
    beq  t0, zero, else   # nếu KHÔNG (i < 5) → nhảy sang else
    addi t1, zero, 3      # X = 3
    j    endif            # bỏ qua phần else
else:
    addi t1, zero, 10     # X = 10
endif:
    nop
`, expect: { reg: { t1: 3 } }
  },
  {
    id: 'switch', group: 'Chương 3', title: 'Slide 47 — switch-case',
    code: `# test, a, b ở s1, s2, s3. t0..t2 = 0, 1, 2 để so sánh
.text
    li   s1, 2            # test = 2  (thử đổi 0, 1, 2, 5)
    li   s2, 10           # a = 10
    li   s3, 7            # b = 7
    li   t0, 0
    li   t1, 1
    li   t2, 2
    beq  s1, t0, case_0
    beq  s1, t1, case_1
    beq  s1, t2, case_2
    j    default
case_0:
    addi s2, s2, 1        # a = a + 1
    j    continue         # break
case_1:
    sub  s2, s2, t1       # a = a - 1
    j    continue
case_2:
    add  s3, s3, s3       # b = 2 * b
    j    continue
default:
continue:
    nop
`, expect: { reg: { s3: 14, s2: 10 } }
  },
  {
    id: 'forsum', group: 'Chương 3', title: 'Vòng for — sum += A[i]',
    code: `# for (i = 0; i < n; i++) sum = sum + A[i];
.data
A:  .word 5, 10, 15, 20, 25
n:  .word 5
.text
    la   a0, A            # a0 = &A[0]
    lw   a1, n            # a1 = n (lw từ nhãn: lệnh giả)
    li   s0, 0            # sum = 0
    li   s1, 0            # i = 0
loop:
    bge  s1, a1, end      # i >= n → thoát vòng lặp
    slli t1, s1, 2        # t1 = i * 4  (mỗi int 4 byte)
    add  t1, t1, a0       # t1 = &A[i]
    lw   t0, 0(t1)        # t0 = A[i]
    add  s0, s0, t0       # sum += A[i]
    addi s1, s1, 1        # i++
    j    loop
end:
    mv   a0, s0           # in tổng
    li   a7, 1
    ecall
    li   a7, 10
    ecall
`, expect: { out: '75', reg: { s0: 75 } }
  },
  {
    id: 'while', group: 'Chương 3', title: 'Slide 49 — while (A[i] == k) i++',
    code: `# i, k, A ở x22, x24, x25
.data
A:  .word 7, 7, 7, 3, 7
.text
    li   x22, 0           # i = 0
    li   x24, 7           # k = 7
    la   x25, A
Loop:
    slli x10, x22, 2      # i * 4
    add  x10, x10, x25    # &A[i]
    lw   x9, 0(x10)       # A[i]
    bne  x9, x24, Exit    # A[i] != k → thoát
    addi x22, x22, 1      # i++
    beq  x0, x0, Loop     # luôn nhảy về Loop
Exit:
    nop                   # i = 3 (A[3] = 3 khác 7)
`, expect: { reg: { s6: 3 } }
  },
  {
    id: 'widei', group: 'Chương 3', title: 'Slide 44 — hằng 32 bit bằng lui + addi',
    code: `.text
    lui  s0, 0x003D0      # s0 = 0x003D0000 (20 bit cao)
    addi s0, s0, 0x100    # s0 = 0x003D0100
    li   s1, 0x3D0100     # lệnh giả li: assembler tự sinh lui + addi
    li   s2, 0x12345FFF   # 12 bit thấp >= 0x800: phần lui phải +1 (xem cột Lệnh thật)
`, expect: { reg: { s0: 0x3D0100, s1: 0x3D0100, s2: 0x12345FFF } }
  },
  {
    id: 'stack', group: 'Chương 3', title: 'Slide 52 — push / pop trên stack',
    code: `.text
    li   t0, 111
    li   t1, 222
    # PUSH t0
    addi sp, sp, -4       # dành 4 byte (stack mọc XUỐNG)
    sw   t0, 0(sp)
    # PUSH t1
    addi sp, sp, -4
    sw   t1, 0(sp)
    # POP vào t2 (lấy cái vào sau cùng: 222)
    lw   t2, 0(sp)
    addi sp, sp, 4
    # POP vào t3 (111)
    lw   t3, 0(sp)
    addi sp, sp, 4        # sp trở về như cũ
`, expect: { reg: { t2: 222, t3: 111, sp: 0x7FFFEFFC } }
  },
  {
    id: 'leaf', group: 'Chương 3', title: 'Slide 63 — hàm lá leaf_example + main',
    code: `# f = (g + h) - (i + j); g,h,i,j trong a0..a3
.text
main:
    li   a0, 5            # g
    li   a1, 6            # h
    li   a2, 2            # i
    li   a3, 3            # j
    jal  leaf_example     # ra = địa chỉ lệnh kế tiếp, nhảy vào hàm
    li   a7, 1            # in a0 = (5+6)-(2+3) = 6
    ecall
    li   a7, 10           # kết thúc
    ecall

leaf_example:
    addi sp, sp, -12      # chỗ cho 3 thanh ghi
    sw   t1, 8(sp)
    sw   t0, 4(sp)
    sw   s0, 0(sp)
    add  t0, a0, a1       # t0 = g + h
    add  t1, a2, a3       # t1 = i + j
    sub  s0, t0, t1       # f = t0 - t1
    add  a0, s0, zero     # trả về f trong a0
    lw   s0, 0(sp)        # khôi phục
    lw   t0, 4(sp)
    lw   t1, 8(sp)
    addi sp, sp, 12       # trả lại stack
    jalr zero, 0(ra)      # quay về main
`, expect: { out: '6' }
  },
  {
    id: 'fact', group: 'Chương 3', title: 'Slide 66 — giai thừa đệ quy fact(n)',
    code: `# Nhập n, in n!. Chạy từng bước và xem tab Stack: mỗi lần gọi đẩy ra + n.
.data
msg: .asciz "Nhap n: "
.text
main:
    li   a7, 4
    la   a0, msg
    ecall
    li   a7, 5            # đọc n → a0
    ecall
    jal  fact             # a0 = fact(n)
    li   a7, 1
    ecall
    li   a7, 10
    ecall

fact:
    addi sp, sp, -8       # chỗ cho 2 word
    sw   ra, 4(sp)        # cất địa chỉ quay về
    sw   a0, 0(sp)        # cất n
    addi t0, a0, -1       # t0 = n - 1
    bge  t0, zero, L1     # n - 1 >= 0 (n >= 1) → L1
    addi a0, zero, 1      # trường hợp cơ sở: return 1
    addi sp, sp, 8
    jr   ra
L1:
    addi a0, a0, -1       # n - 1
    jal  fact             # a0 = fact(n - 1)
    add  a1, a0, zero     # a1 = fact(n - 1)
    lw   a0, 0(sp)        # khôi phục n
    lw   ra, 4(sp)        # khôi phục ra
    addi sp, sp, 8
    mul  a0, a0, a1       # n * fact(n - 1)
    jalr x0, 0(ra)
`, input: ['5'], expect: { outIncludes: '120' }
  },
  {
    id: 'strcpy', group: 'Chương 3', title: 'Slide 70 — strcpy(x, y)',
    code: `.data
y:  .asciz "RISC-V"
x:  .space 16
.text
main:
    la   a0, x            # a0 = x (đích)
    la   a1, y            # a1 = y (nguồn)
    jal  strcpy
    li   a7, 4            # in chuỗi x
    la   a0, x
    ecall
    li   a7, 10
    ecall

strcpy:                   # x ở a0, y ở a1, i ở s0
    addi sp, sp, -4
    sw   s0, 0(sp)        # s0 là thanh ghi "saved" → phải cất
    add  s0, zero, zero   # i = 0
L1: add  t1, s0, a1       # &y[i]  (char 1 byte → KHÔNG nhân 4)
    lbu  t2, 0(t1)        # t2 = y[i]
    add  t3, s0, a0       # &x[i]
    sb   t2, 0(t3)        # x[i] = y[i]
    beq  t2, zero, L2     # gặp '\\0' → xong
    addi s0, s0, 1        # i++
    beq  x0, x0, L1
L2: lw   s0, 0(sp)
    addi sp, sp, 4
    jalr x0, 0(ra)
`, expect: { out: 'RISC-V' }
  },
  {
    id: 'sort', group: 'Chương 3', title: 'Slide 71 — sắp xếp chèn: sort + swap',
    code: `# void sort(int v[], int n) gọi swap(v, j). Hàm lồng nhau → phải cất ra.
.data
v:  .word 5, 2, 9, 1, 7
sp1: .asciz " "
.text
main:
    la   a0, v
    li   a1, 5
    jal  sort
    # in mảng
    la   s0, v
    li   s1, 0
print_loop:
    li   t0, 5
    bge  s1, t0, done
    slli t1, s1, 2
    add  t1, t1, s0
    lw   a0, 0(t1)
    li   a7, 1
    ecall
    la   a0, sp1
    li   a7, 4
    ecall
    addi s1, s1, 1
    j    print_loop
done:
    li   a7, 10
    ecall

# swap(v, k): đổi v[k] và v[k+1]
swap:
    slli t1, a1, 2        # k * 4
    add  t1, a0, t1       # &v[k]
    lw   t0, 0(t1)        # temp = v[k]
    lw   t2, 4(t1)        # v[k+1]
    sw   t2, 0(t1)
    sw   t0, 4(t1)
    jr   ra

# sort(v, n)
sort:
    addi sp, sp, -20
    sw   ra, 16(sp)
    sw   s6, 12(sp)
    sw   s5, 8(sp)
    sw   s4, 4(sp)
    sw   s3, 0(sp)
    mv   s5, a0           # s5 = v
    mv   s6, a1           # s6 = n
    li   s3, 0            # i = 0
for1:
    bge  s3, s6, exit1    # i >= n → xong
    addi s4, s3, -1       # j = i - 1
for2:
    blt  s4, zero, exit2  # j < 0 → thoát
    slli t0, s4, 2
    add  t0, s5, t0       # &v[j]
    lw   t1, 0(t0)        # v[j]
    lw   t2, 4(t0)        # v[j+1]
    ble  t1, t2, exit2    # v[j] <= v[j+1] → thoát
    mv   a0, s5
    mv   a1, s4
    jal  swap             # swap(v, j)
    addi s4, s4, -1       # j--
    j    for2
exit2:
    addi s3, s3, 1        # i++
    j    for1
exit1:
    lw   s3, 0(sp)
    lw   s4, 4(sp)
    lw   s5, 8(sp)
    lw   s6, 12(sp)
    lw   ra, 16(sp)
    addi sp, sp, 20
    jr   ra
`, expect: { out: '1 2 5 7 9 ' }
  },
  {
    id: 'datamap', group: 'Bài tập Ch3', title: 'Slide 8 — vẽ bản đồ vùng .data',
    code: `# Bấm "Dịch" rồi xem tab Bộ nhớ (chế độ Byte) để thấy từng byte và byte đệm.
.data
arr16: .space 16
arr:   .byte 'a','b','c'
st1:   .asciz "abcd"
X1:    .word 0xFFFFFFFF
st2:   .ascii "efgh"
X2:    .word 0xFFFFFFFF
st3:   .asciz "1234"
X3:    .word 0xFFFFFFFF
st4:   .asciz "5678"
X4:    .word 0xFFFFFFFF
.text
    nop
`, expect: { label: { X1: 0x10010018, X3: 0x1001002C, X4: 0x10010038, st4: 0x10010030 } }
  },
  {
    id: 'ex31', group: 'Bài tập Ch3', title: 'Bài 3.1 — f = g + (h − 5)',
    code: `.data
f:  .word 0
g:  .word 100
h:  .word 300
.text
    la   x8, h
    lw   x7, 0(x8)        # x7 = h
    la   x8, g
    lw   x6, 0(x8)        # x6 = g
    addi x7, x7, -5       # h - 5
    add  x5, x6, x7       # f = g + (h - 5) = 395
    la   x8, f
    sw   x5, 0(x8)        # lưu f vào bộ nhớ
`, expect: { reg: { t0: 395 }, mem: { 0x10010000: 395 } }
  },
  {
    id: 'ex32', group: 'Bài tập Ch3', title: 'Bài 3.2 — B[4] = A[i − j]',
    code: `# i, j ở x28, x29; A, B ở x10, x11
.data
A:  .word 10, 11, 12, 13, 14, 15
B:  .word 0, 0, 0, 0, 0, 0
.text
    la   x10, A
    la   x11, B
    li   x28, 5           # i = 5
    li   x29, 2           # j = 2  → A[3] = 13
    sub  x5, x28, x29     # i - j
    slli x5, x5, 2        # (i - j) * 4 = offset byte
    add  x5, x10, x5      # &A[i-j]
    lw   x6, 0(x5)        # A[i-j]
    sw   x6, 16(x11)      # B[4]: offset 4 * 4 = 16
`, expect: { mem: { 0x10010028: 13 } }
  },
  {
    id: 'ex33', group: 'Bài tập Ch3', title: 'Bài 3.3 — dịch ngược sang C',
    code: `# f,g ở x5,x6; A ở x10, B ở x11. Lệnh cuối dùng sw (slide in nhầm là lw).
.data
A:  .word 1, 2, 3, 4, 5, 6
B:  .word 0, 0, 0, 0, 0, 0
.text
    la   x10, A
    la   x11, B
    li   x5, 1            # f = 1
    li   x6, 2            # g = 2
    slli x30, x5, 2       # f * 4
    add  x30, x10, x30    # x30 = &A[f]
    slli x31, x6, 2       # g * 4
    add  x31, x11, x31    # x31 = &B[g]
    lw   x5, 0(x30)       # f = A[f]           → 2
    addi x12, x30, 8      # &A[f_cũ + 2]
    lw   x30, 0(x12)      # A[f_cũ + 2]        → 4
    add  x30, x30, x5     # A[f+2] + A[f]      → 6
    sw   x30, 0(x31)      # B[g] = 6
`, expect: { mem: { 0x10010020: 6 }, reg: { t0: 2 } }
  },
  {
    id: 'hello3', group: 'Bài tập Ch3', title: 'Hello World 3 — in chuỗi, chờ phím',
    code: `.data
hello:   .asciz "Hello!\\n"
goodday: .asciz "Have a good day!\\n"
.text
main:
    li   a7, 4            # dịch vụ 4: in chuỗi
    la   a0, hello
    ecall
    li   a7, 12           # dịch vụ 12: đọc 1 ký tự (chờ bấm phím)
    ecall
    li   a7, 4
    la   a0, goodday
    ecall
    li   a7, 10
    ecall
`, input: ['x'], expect: { outIncludes: 'Have a good day!' }
  },
  {
    id: 'ex35', group: 'Bài tập Ch3', title: 'Bài 3.5 — số chẵn hay lẻ',
    code: `.data
odd:  .asciz "odd"
even: .asciz "even"
.text
    li   a7, 5            # đọc số nguyên → a0
    ecall
    andi t0, a0, 1        # lấy bit cuối: 1 = lẻ, 0 = chẵn
    beq  t0, zero, is_even
    la   a0, odd
    j    print
is_even:
    la   a0, even
print:
    li   a7, 4            # in chuỗi
    ecall
    li   a7, 10
    ecall
`, input: ['7'], expect: { outIncludes: 'odd' }
  },
  {
    id: 'ex36', group: 'Bài tập Ch3', title: 'Bài 3.6 — trị tuyệt đối, lặp tới khi nhập 0',
    code: `.data
nl: .asciz "\\n"
.text
main:
    li   a7, 5            # đọc số → a0
    ecall
    beq  a0, zero, exit   # nhập 0 → thoát
    jal  abs              # a0 = |a0|
    li   a7, 1            # in a0
    ecall
    li   a7, 4
    la   a0, nl
    ecall
    j    main
exit:
    li   a7, 10           # thiếu 2 dòng này CPU sẽ chạy tuột xuống hàm abs
    ecall
abs:
    bge  a0, zero, done   # a0 >= 0 → giữ nguyên
    sub  a0, zero, a0     # a0 = 0 - a0
done:
    jr   ra
`, input: ['-9', '4', '0'], expect: { outIncludes: '9\n' }
  },
  {
    id: 'ex37', group: 'Bài tập Ch3', title: 'Bài 3.7 — tổng 1 + 2 + … + n',
    code: `# Hàm sum: n trong a7 (theo đề), kết quả trong a0
.text
main:
    li   a7, 5            # đọc n → a0
    ecall
    mv   a7, a0           # truyền n qua a7 (sau khi ecall xong)
    jal  sum
    li   a7, 1            # in a0
    ecall
    li   a7, 10
    ecall
sum:
    li   a0, 0            # tổng = 0
    li   t0, 1            # k = 1
sum_loop:
    blt  a7, t0, sum_end  # k > n → dừng
    add  a0, a0, t0       # tổng += k
    addi t0, t0, 1        # k++
    j    sum_loop
sum_end:
    jr   ra
`, input: ['10'], expect: { outIncludes: '55' }
  },
  {
    id: 'ex38', group: 'Bài tập Ch3', title: 'Bài 3.8 — strlen',
    code: `.data
buf: .space 256
.text
main:
    la   a0, buf
    li   a1, 256          # tối đa 255 ký tự + '\\0'
    li   a7, 8            # dịch vụ 8: đọc chuỗi vào buf
    ecall
    la   a0, buf
    jal  strlen           # a0 = độ dài
    li   a7, 1
    ecall
    li   a7, 10
    ecall

strlen:                   # a0 = địa chỉ chuỗi → a0 = số ký tự
    li   t0, 0
strlen_loop:
    add  t1, a0, t0       # &str[i]
    lbu  t2, 0(t1)        # str[i]
    beq  t2, zero, strlen_end
    li   t3, 10           # '\\n': dịch vụ 8 giữ lại ký tự xuống dòng
    beq  t2, t3, strlen_end
    addi t0, t0, 1
    j    strlen_loop
strlen_end:
    mv   a0, t0
    jr   ra
`, input: ['xin chao'], expect: { outIncludes: '8' }
  },
  {
    id: 'bltu', group: 'Chương 4', title: 'Slide 14 — blt hay bltu?',
    code: `# Thử đổi bltu thành blt rồi chạy lại.
.text
    li   t0, 20
    li   t1, -20          # 0xFFFFFFEC: coi là không dấu thì = 4 294 967 276
    bltu t1, t0, else     # không dấu: 4294967276 < 20? Sai → không nhảy
    li   a0, 1
    j    print
else:
    li   a0, 0
print:
    li   a7, 1
    ecall
`, expect: { out: '1' }
  },
  {
    id: 'lbu', group: 'Chương 4', title: 'Slide 15 — lb và lbu',
    code: `.data
x:  .byte 20
y:  .byte -20             # lưu thành byte 0xEC
.text
    la   t0, x
    la   t1, y
    lb   s0, 0(t0)        # 20
    lbu  s1, 0(t0)        # 20
    lb   s2, 0(t1)        # mở rộng dấu → -20
    lbu  s3, 0(t1)        # mở rộng 0   → 236
`, expect: { reg: { s0: 20, s1: 20, s2: -20, s3: 236 } }
  },
  {
    id: 'overflow', group: 'Chương 4', title: 'Tràn số — RISC-V không báo gì',
    code: `.text
    li   t0, 0x7FFFFFFF   # số dương lớn nhất 32 bit = 2147483647
    addi t1, t0, 1        # +1 → tràn thành -2147483648
    mv   a0, t1
    li   a7, 1
    ecall
    # Cách tự phát hiện tràn khi cộng 2 số dương: kết quả < 0
    slt  t2, t1, zero     # t2 = 1 → đã tràn
`, expect: { out: '-2147483648', reg: { t2: 1 } }
  },
  {
    id: 'divrem', group: 'Chương 4', title: 'Slide 54 — đọc a, b, in a/b và a%b',
    code: `.data
nl: .asciz "\\n"
.text
    li   a7, 5
    ecall
    mv   t0, a0           # a
    li   a7, 5
    ecall
    mv   t1, a0           # b
    div  a0, t0, t1       # thương (có dấu, làm tròn về 0)
    li   a7, 1
    ecall
    la   a0, nl
    li   a7, 4
    ecall
    rem  a0, t0, t1       # số dư (cùng dấu với số bị chia)
    li   a7, 1
    ecall
    li   a7, 10
    ecall
`, input: ['-7', '2'], expect: { outIncludes: '-3\n-1' }
  },
  {
    id: 'gcd', group: 'Chương 4', title: 'Slide 55 — UCLN và BCNN',
    code: `.data
nl: .asciz "\\n"
.text
    li   a7, 5
    ecall
    mv   s0, a0           # a
    li   a7, 5
    ecall
    mv   s1, a0           # b
    mv   t0, s0           # x = a
    mv   t1, s1           # y = b
gcd_loop:                 # Euclid: UCLN(x, y) = UCLN(y, x % y)
    beq  t1, zero, gcd_done
    rem  t2, t0, t1
    mv   t0, t1
    mv   t1, t2
    j    gcd_loop
gcd_done:                 # t0 = UCLN
    mv   a0, t0
    li   a7, 1
    ecall
    la   a0, nl
    li   a7, 4
    ecall
    div  t3, s0, t0       # a / UCLN (chia trước cho đỡ tràn)
    mul  a0, t3, s1       # × b = BCNN
    li   a7, 1
    ecall
    li   a7, 10
    ecall
`, input: ['12', '18'], expect: { outIncludes: '6\n36' }
  },
  {
    id: 'float', group: 'Chương 4', title: 'Slide 78 — in số thực float x = 0.75',
    code: `.data
x:  .float 0.75
.text
    la       t1, x
    flw      ft0, 0(t1)      # ft0 = x
    li       a7, 2           # dịch vụ 2: in float trong fa0
    fcvt.s.w ft1, zero       # ft1 = 0.0
    fadd.s   fa0, ft0, ft1   # fa0 = x + 0.0 (cách "chép" của slide)
    ecall
    li       a7, 10
    ecall
`, expect: { out: '0.75' }
  },
  {
    id: 'float2', group: 'Chương 4', title: 'Sai số số thực: 0.1 + 0.2 và 0.333 × 3',
    code: `.data
a:  .float 0.1
b:  .float 0.2
c:  .float 0.333
nl: .asciz "\\n"
.text
    la    t0, a
    flw   ft0, 0(t0)
    la    t0, b
    flw   ft1, 0(t0)
    fadd.s fa0, ft0, ft1     # 0.1 + 0.2
    li    a7, 2
    ecall
    la    a0, nl
    li    a7, 4
    ecall
    la    t0, c
    flw   ft2, 0(t0)
    li    t1, 3
    fcvt.s.w ft3, t1         # 3.0
    fmul.s fa0, ft2, ft3     # 0.333 × 3
    li    a7, 2
    ecall
    li    a7, 10
    ecall
`, expect: { outIncludes: '0.3' }
  }
];
