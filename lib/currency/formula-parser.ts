type Token =
  | { type: 'NUMBER'; value: number }
  | { type: 'IDENT'; value: string }
  | { type: 'OP'; value: '+' | '-' | '*' | '/' }
  | { type: 'LPAREN' }
  | { type: 'RPAREN' }

type AstNode =
  | { type: 'num'; value: number }
  | { type: 'ref'; name: string }
  | { type: 'neg'; expr: AstNode }
  | { type: 'bin'; op: '+' | '-' | '*' | '/'; left: AstNode; right: AstNode }

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < input.length) {
    const ch = input[i]
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i++
      continue
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      tokens.push({ type: 'OP', value: ch })
      i++
      continue
    }
    if (ch === '(') { tokens.push({ type: 'LPAREN' }); i++; continue }
    if (ch === ')') { tokens.push({ type: 'RPAREN' }); i++; continue }
    if ((ch >= '0' && ch <= '9') || ch === '.') {
      let j = i
      let hasDot = false
      while (j < input.length) {
        const c = input[j]
        if (c >= '0' && c <= '9') { j++; continue }
        if (c === '.' && !hasDot) { hasDot = true; j++; continue }
        break
      }
      const raw = input.slice(i, j)
      const value = Number(raw)
      if (!Number.isFinite(value)) throw new Error(`Numero malformado "${raw}"`)
      tokens.push({ type: 'NUMBER', value })
      i = j
      continue
    }
    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
      let j = i
      while (j < input.length) {
        const c = input[j]
        const alnum =
          (c >= 'a' && c <= 'z') ||
          (c >= 'A' && c <= 'Z') ||
          (c >= '0' && c <= '9') ||
          c === '_'
        if (!alnum) break
        j++
      }
      tokens.push({ type: 'IDENT', value: input.slice(i, j) })
      i = j
      continue
    }
    throw new Error(`Caracter inesperado "${ch}" en posicion ${i}`)
  }
  return tokens
}

class Parser {
  private pos = 0
  constructor(private readonly tokens: Token[]) {}

  parse(): AstNode {
    const node = this.parseExpr()
    if (this.pos < this.tokens.length) throw new Error('Tokens sobrantes al final')
    return node
  }

  private peek(): Token | null {
    return this.tokens[this.pos] ?? null
  }

  private consume(): Token {
    const t = this.tokens[this.pos]
    if (!t) throw new Error('Fin inesperado')
    this.pos++
    return t
  }

  private parseExpr(): AstNode {
    let left = this.parseTerm()
    while (true) {
      const t = this.peek()
      if (t?.type === 'OP' && (t.value === '+' || t.value === '-')) {
        this.consume()
        const right = this.parseTerm()
        left = { type: 'bin', op: t.value, left, right }
      } else break
    }
    return left
  }

  private parseTerm(): AstNode {
    let left = this.parseFactor()
    while (true) {
      const t = this.peek()
      if (t?.type === 'OP' && (t.value === '*' || t.value === '/')) {
        this.consume()
        const right = this.parseFactor()
        left = { type: 'bin', op: t.value, left, right }
      } else break
    }
    return left
  }

  private parseFactor(): AstNode {
    const t = this.peek()
    if (!t) throw new Error('Se esperaba numero, identificador o parentesis')
    if (t.type === 'OP' && t.value === '-') {
      this.consume()
      return { type: 'neg', expr: this.parseFactor() }
    }
    if (t.type === 'OP' && t.value === '+') {
      this.consume()
      return this.parseFactor()
    }
    if (t.type === 'NUMBER') { this.consume(); return { type: 'num', value: t.value } }
    if (t.type === 'IDENT') { this.consume(); return { type: 'ref', name: t.value } }
    if (t.type === 'LPAREN') {
      this.consume()
      const node = this.parseExpr()
      const close = this.consume()
      if (close.type !== 'RPAREN') throw new Error('Parentesis sin cerrar')
      return node
    }
    throw new Error(`Token inesperado`)
  }
}

function evalNode(node: AstNode, vars: Map<string, number>): number {
  if (node.type === 'num') return node.value
  if (node.type === 'ref') {
    const v = vars.get(node.name)
    if (v == null) throw new Error(`Variable desconocida "${node.name}"`)
    return v
  }
  if (node.type === 'neg') return -evalNode(node.expr, vars)
  const l = evalNode(node.left, vars)
  const r = evalNode(node.right, vars)
  let result: number
  switch (node.op) {
    case '+': result = l + r; break
    case '-': result = l - r; break
    case '*': result = l * r; break
    case '/':
      if (r === 0) throw new Error('Division por cero')
      result = l / r
      break
  }
  if (!Number.isFinite(result)) throw new Error('Resultado no finito')
  return result
}

function collectRefs(node: AstNode, acc: Set<string>): void {
  if (node.type === 'ref') acc.add(node.name)
  else if (node.type === 'neg') collectRefs(node.expr, acc)
  else if (node.type === 'bin') {
    collectRefs(node.left, acc)
    collectRefs(node.right, acc)
  }
}

function parseFormula(formula: string): AstNode {
  if (!formula || formula.length > 500) throw new Error('Vacia o excede 500 caracteres')
  return new Parser(tokenize(formula)).parse()
}

export function validateFormula(formula: string): { ok: true } | { ok: false; error: string } {
  try {
    parseFormula(formula)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Formula invalida' }
  }
}

export function evaluateFormula(formula: string, vars: Map<string, number>): number {
  return evalNode(parseFormula(formula), vars)
}

export function extractRefs(formula: string): string[] {
  const s = new Set<string>()
  collectRefs(parseFormula(formula), s)
  return [...s]
}
