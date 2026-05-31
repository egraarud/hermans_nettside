import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AppShell from './components/layout/AppShell'
import LoadingSpinner from './components/ui/LoadingSpinner'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrap = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
)

const HomePage           = lazy(() => import('./pages/HomePage'))
const LeaderboardPage    = lazy(() => import('./pages/LeaderboardPage'))
const ResultsPage        = lazy(() => import('./pages/ResultsPage'))
const StatisticsPage     = lazy(() => import('./pages/StatisticsPage'))
const PhotosPage         = lazy(() => import('./pages/PhotosPage'))
const AdminPage          = lazy(() => import('./pages/AdminPage'))
const LoginPage          = lazy(() => import('./pages/LoginPage'))
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'))
const ScoreEntryPage     = lazy(() => import('./pages/ScoreEntryPage'))
const ParticipantsPage   = lazy(() => import('./pages/ParticipantsPage'))
const SportsPage         = lazy(() => import('./pages/SportsPage'))
const SchedulePage       = lazy(() => import('./pages/SchedulePage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true,              element: wrap(HomePage) },
      { path: 'resultattavle',    element: wrap(LeaderboardPage) },
      { path: 'resultater',       element: wrap(ResultsPage) },
      { path: 'statistikk',       element: wrap(StatisticsPage) },
      { path: 'bilder',           element: wrap(PhotosPage) },
      { path: 'admin',            element: wrap(AdminPage) },
      { path: 'logg-inn',         element: wrap(LoginPage) },
      { path: 'bytt-passord',     element: wrap(ChangePasswordPage) },
      { path: 'registrer',        element: wrap(ScoreEntryPage) },
      { path: 'deltakere',        element: wrap(ParticipantsPage) },
      { path: 'idretter',         element: wrap(SportsPage) },
      { path: 'program',          element: wrap(SchedulePage) },
    ],
  },
])
