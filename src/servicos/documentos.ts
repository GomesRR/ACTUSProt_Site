export const soDigitos = (v: string) => v.replace(/\D/g, '')

/** CNPJ com os dígitos verificadores corretos */
export function cnpjValido(v: string) {
  const d = soDigitos(v)
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false
  const dv = (n: number) => {
    let s = 0, p = n - 7
    for (let i = 0; i < n; i++) { s += Number(d[i]) * p--; if (p < 2) p = 9 }
    const r = s % 11
    return r < 2 ? 0 : 11 - r
  }
  return dv(12) === Number(d[12]) && dv(13) === Number(d[13])
}

export const mascaraCnpj = (v: string) => soDigitos(v).slice(0, 14).replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2')

/** CPF com os dígitos verificadores corretos */
export function cpfValido(v: string) {
  const d = soDigitos(v)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const dv = (n: number) => {
    let s = 0
    for (let i = 0; i < n; i++) s += Number(d[i]) * (n + 1 - i)
    const r = (s * 10) % 11
    return r === 10 ? 0 : r
  }
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10])
}

/** Até 11 dígitos: máscara de CPF; daí em diante, de CNPJ */
export const mascaraCpfCnpj = (v: string) => {
  const d = soDigitos(v).slice(0, 14)
  if (d.length > 11) return mascaraCnpj(d)
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function mascaraTelefone(v: string) {
  const d = soDigitos(v).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export const emailValido = (v: string) => /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
