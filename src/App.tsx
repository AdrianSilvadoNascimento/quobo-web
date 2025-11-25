import React from 'react';

import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { Router } from "@/routes/Router"

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
