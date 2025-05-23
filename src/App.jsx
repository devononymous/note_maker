
import './App.css'
import SyncStatus from './components/SyncStatus'
import NoteEditor from './components/NoteEditor'
import NoteList from './components/NoteList'
import { useNetworkStatus } from './hooks/useNetworkStatus'

function App() {
  const online = useNetworkStatus();
  return (
    <>
      <div className='App'>
      <header className="header">Personal Note maker</header>
      <SyncStatus online={online} />
      <NoteList isOnline={online}/>
    </div>
    </>
  )
}

export default App
