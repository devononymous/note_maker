
import './App.css'
import SyncStatus from './components/SyncStatus'
import NoteEditor from './components/NoteEditor'
import NoteList from './components/NoteList'

function App() {

  return (
    <>
      <div className="App">
        <SyncStatus isOnline={navigator.onLine} />
        <NoteEditor/>
        <NoteList/>
      </div>
    </>
  )
}

export default App
