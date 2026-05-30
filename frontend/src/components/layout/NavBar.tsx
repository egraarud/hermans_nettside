import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useMe, logout } from '../../api/auth'

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const { data: me } = useMe()

  const links = [
    { to: '/', label: 'Hjem' },
    { to: '/resultattavle', label: 'Resultattavle' },
    { to: '/resultater', label: 'Resultater' },
    { to: '/statistikk', label: 'Statistikk' },
    { to: '/idretter', label: 'Idretter' },
    { to: '/bilder', label: 'Bilder' },
    { to: '/arkiv', label: 'Arkiv' },
  ]

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'text-amber-400 bg-white/10'
        : 'text-slate-300 hover:text-white hover:bg-white/10'
    }`

  return (
    <nav className="bg-slate-900 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-amber-400 text-xl">🏆</span>
          <span className="font-bold text-white text-base tracking-tight leading-tight">
            Øiestad Open<br />
            <span className="text-xs font-normal text-slate-400 tracking-normal">Invitational Qualifiers</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          {me?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-sm font-medium transition-colors ml-2 ${
                  isActive ? 'bg-amber-500 text-white' : 'bg-amber-400/20 text-amber-400 hover:bg-amber-400/30'
                }`
              }
            >
              Admin
            </NavLink>
          )}
          {me ? (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-700">
              <span className="text-sm text-slate-400">{me.username}</span>
              <button
                onClick={() => logout()}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Logg ut
              </button>
            </div>
          ) : (
            <Link
              to="/logg-inn"
              className="ml-4 text-sm font-medium bg-amber-400 hover:bg-amber-300 text-slate-900 px-3 py-1.5 rounded transition-colors"
            >
              Logg inn
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label="Meny"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 px-4 py-3 flex flex-col gap-1">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm font-medium ${
                  isActive ? 'text-amber-400 bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {me?.role === 'admin' && (
            <NavLink
              to="/admin"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded text-sm font-medium text-amber-400 bg-amber-400/10"
            >
              Admin
            </NavLink>
          )}
          <div className="pt-2 mt-1 border-t border-slate-700">
            {me ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{me.username}</span>
                <button onClick={() => logout()} className="text-sm text-red-400 hover:text-red-300">
                  Logg ut
                </button>
              </div>
            ) : (
              <Link
                to="/logg-inn"
                onClick={() => setOpen(false)}
                className="block text-center bg-amber-400 hover:bg-amber-300 text-slate-900 font-medium py-2 rounded text-sm"
              >
                Logg inn
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
