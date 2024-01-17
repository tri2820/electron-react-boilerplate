import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';

import 'tailwindcss/tailwind.css';
import MainScreen from './components/main-screen';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainScreen />} />
      </Routes>
    </Router>
  );
}
