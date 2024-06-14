import { Routes, Route } from 'react-router-dom'
import Lobby from './screens/Lobby';
import Room from './screens/Room';

function App() {
  return (
    <>
        <Routes>
          <Route path = "/" element = {<Lobby/>}></Route>
          <Route path = "/room/:roomId" element = {<Room />}></Route>
        </Routes>
    </> 
  );
}

export default App;
