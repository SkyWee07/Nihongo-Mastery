import { AuthProvider } from './contexts/AuthContext'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'

// Lazy load pages for better performance
const Landing = lazy(() => import('./pages/Landing'))
const Roadmap = lazy(() => import('./pages/Roadmap'))
const Hiragana = lazy(() => import('./pages/Hiragana'))
const Katakana = lazy(() => import('./pages/Katakana'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Kotoba = lazy(() => import('./pages/Kotoba'))
const Bunpo = lazy(() => import('./pages/Bunpo'))
const Kanji = lazy(() => import('./pages/Kanji'))
const Video = lazy(() => import('./pages/Video'))
const Auth = lazy(() => import('./pages/Auth'))
const Profile = lazy(() => import('./pages/Profile'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const MiniGame = lazy(() => import('./pages/MiniGame'))

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
)

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <ScrollToTop />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Landing page tanpa Layout (navbar/padding sendiri) */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Halaman belajar dengan Layout (navbar + padding) */}
            <Route element={<Layout />}>
              <Route path="/learn" element={<Roadmap />} />
              <Route path="/hiragana" element={<Hiragana />} />
              <Route path="/katakana" element={<Katakana />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/kotoba/:level" element={<Kotoba />} />
              <Route path="/bunpo/:level" element={<Bunpo />} />
              <Route path="/kanji/:level" element={<Kanji />} />
              <Route path="/video/:level?" element={<Video />} />
              <Route path="/game" element={<MiniGame />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </AuthProvider>
  )
}

export default App
