import React from 'react';
import AppRouter from './routes/AppRouter';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <AppRouter />
    </div>
  );
};

export default App;
