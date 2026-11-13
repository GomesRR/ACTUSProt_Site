/** Logo do ACTUSProt (escudo com um carro + logotipo), o mesmo do sistema. Provisório até a marca oficial */
export function LogoIcone({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 52" className={className} aria-hidden="true">
      <path d="M24 2 44 9v15c0 13-8.6 22.4-20 26C12.6 46.4 4 37 4 24V9L24 2Z" fill="#f5c400" />
      <path d="M14.5 27.5 17.3 21a3 3 0 0 1 2.8-1.9h7.8a3 3 0 0 1 2.8 1.9l2.8 6.5c1.5.3 2.5 1.6 2.5 3.1v4.9a1.5 1.5 0 0 1-1.5 1.5h-1.5v1.8a1.7 1.7 0 0 1-3.4 0V37h-11.2v1.8a1.7 1.7 0 0 1-3.4 0V37h-1.5a1.5 1.5 0 0 1-1.5-1.5v-4.9c0-1.5 1-2.8 2.5-3.1Zm3.4-.2h12.2l-2-4.7a1 1 0 0 0-.9-.6h-6.4a1 1 0 0 0-.9.6l-2 4.7Z" fill="#2a2d33" />
    </svg>
  )
}

export function Logo({ claro = false, className = '' }: { claro?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${claro ? 'text-white' : 'text-brand'} ${className}`}>
      <LogoIcone className="h-8 w-auto" />
      <span className="font-brand text-[26px] font-bold leading-none tracking-wide">
        ACTUS<span className="ml-1 rounded bg-primary px-1 py-px align-super font-sans text-[10px] font-semibold tracking-[0.2em] text-brand">PROT</span>
      </span>
    </span>
  )
}
