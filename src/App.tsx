import React from 'react';

import { HashRouter } from "react-router"
import { AuthProvider } from "@/contexts/AuthContext"
import { Router } from "@/routes/Router"

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Router />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
