import { AuthProvider } from './contexts/AuthContext'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Roadmap from './pages/Roadmap'
import Hiragana from './pages/Hiragana'
import Katakana from './pages/Katakana'
import Quiz from './pages/Quiz'
import Kotoba from './pages/Kotoba'
import Bunpo from './pages/Bunpo'
import Kanji from './pages/Kanji'
import Video from './pages/Video'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'

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
            <Route path="/video" element={<Video />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
