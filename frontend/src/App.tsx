// App.tsx
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LoadingPage from "./pages/LoadingPage";
import { getUserInfo } from "./utils/userInfo";

function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const stored = getUserInfo().userName;
    setUserName(stored);
  }, []);

  if (showLoader) {
    return <LoadingPage />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLoginSuccess={setUserName} />} />
        <Route
          path="/dashboard"
          element={userName ? <Dashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
