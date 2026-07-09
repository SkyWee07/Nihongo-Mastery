import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Roadmap from './pages/Roadmap'
import Hiragana from './pages/Hiragana'

function App() {
  return (
    <div className="app-container">
      <Layout>
        <Routes>
          <Route path="/" element={<Roadmap />} />
          <Route path="/hiragana" element={<Hiragana />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App
