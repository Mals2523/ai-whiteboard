import Whiteboard from "./components/Whiteboard";
import './App.css'

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>AI Whiteboard</h1>
        <p>Collaborative real-time drawing</p>
      </header>
      <Whiteboard />
    </div>
  )
}

export default App
