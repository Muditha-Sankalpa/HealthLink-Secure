import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import SessionsPage from './pages/SessionsPageAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Navigate to="/login" />} />
        <Route path="/allSessions" element={<SessionsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;