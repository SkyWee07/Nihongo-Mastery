import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Roadmap from './pages/Roadmap'
import Hiragana from './pages/Hiragana'
import Katakana from './pages/Katakana'
import Quiz from './pages/Quiz'

function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* Landing page tanpa Layout (navbar/padding sendiri) */}
        <Route path="/" element={<Landing />} />
        
        {/* Halaman belajar dengan Layout (navbar + padding) */}
        <Route element={<Layout />}>
          <Route path="/learn" element={<Roadmap />} />
          <Route path="/hiragana" element={<Hiragana />} />
          <Route path="/katakana" element={<Katakana />} />
          <Route path="/quiz" element={<Quiz />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
