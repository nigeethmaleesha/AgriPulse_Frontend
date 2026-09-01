export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const variants = {
    primary: 'bg-tea-900 text-white shadow-sm hover:bg-tea-800 hover:shadow-md disabled:bg-tea-900/35 disabled:shadow-none',
    secondary: 'border border-slate-200 bg-white text-graphite shadow-sm hover:border-tea-700/20 hover:bg-tea-50 disabled:text-muted/60',
    outline: 'border border-slate-200 bg-white text-graphite shadow-sm hover:border-tea-700/20 hover:bg-tea-50 disabled:text-muted/60',
    ghost: 'text-tea-800 hover:bg-tea-50 disabled:text-muted/60',
    danger: 'border border-critical/20 bg-red-50 text-critical hover:bg-red-100',
    amber: 'bg-amberui text-white shadow-sm hover:brightness-95',
  }
  const sizes = { sm: 'h-9 px-3.5 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-11 px-5 text-sm' }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
