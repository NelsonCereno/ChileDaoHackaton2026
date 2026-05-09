import { Routes, Route } from 'react-router-dom';
import { WalletProvider } from '@/components/WalletProvider';
import { Navbar } from '@/components/Navbar';
import { Home } from '@/pages/Home';
import { Professor } from '@/pages/Professor';
import { Explore } from '@/pages/Explore';
import { WorkDetail } from '@/pages/WorkDetail';

function App() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-[#0e0e0e]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/professor" element={<Professor />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/work/:id" element={<WorkDetail />} />
        </Routes>
      </div>
    </WalletProvider>
  );
}

export default App;
