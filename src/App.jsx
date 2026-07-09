import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Roadmap from './pages/Roadmap'
import Hiragana from './pages/Hiragana'
import Katakana from './pages/Katakana'
import Quiz from './pages/Quiz'

function App() {
  return (
    <div className="app-container">
      <Layout>
        <Routes>
          <Route path="/" element={<Roadmap />} />
          <Route path="/hiragana" element={<Hiragana />} />
          <Route path="/katakana" element={<Katakana />} />
          <Route path="/quiz" element={<Quiz />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App
