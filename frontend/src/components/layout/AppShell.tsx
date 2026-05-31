import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'
import oya from '../../assets/oya.jpg'

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed full-page background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${oya})` }}
      />
      {/* Translucent white veil so content cards remain legible */}
      <div className="fixed inset-0 -z-10 bg-white/55" />

      <NavBar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-slate-900/90 backdrop-blur-sm text-slate-400 text-xs text-center py-5 mt-8">
        © {new Date().getFullYear()} Øiestad Open Invitational Qualifiers
      </footer>
    </div>
  )
}
