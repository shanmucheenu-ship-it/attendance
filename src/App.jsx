import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AppProvider } from './context/AppContext';
import { LoadingScreen } from './components/shared/LoadingScreen';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <AppProvider>
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingScreen key="loader" onComplete={() => setLoading(false)} />
        ) : (
          <BrowserRouter key="app">
            <AppRoutes />
          </BrowserRouter>
        )}
      </AnimatePresence>
    </AppProvider>
  );
}

export default App;
