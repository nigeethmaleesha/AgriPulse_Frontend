export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const variants = {
    primary: 'bg-tea-950 text-white hover:bg-tea-900 disabled:bg-tea-950/35',
    secondary: 'border border-tea-950/15 bg-white text-graphite hover:bg-tea-50 disabled:text-muted/60',
    ghost: 'text-tea-800 hover:bg-tea-50 disabled:text-muted/60',
    danger: 'border border-critical/25 bg-critical/5 text-critical hover:bg-critical/10',
    amber: 'bg-amberui text-white hover:brightness-95',
  }
  const sizes = { sm: 'h-9 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-11 px-5 text-sm' }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
