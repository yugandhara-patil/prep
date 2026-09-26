import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ProtectedRoute from "./routes/ProtectedRoute";
import Profile from "./pages/Profile";
import StartInterview from "./pages/StartInterview";
import Interview from "./pages/Interview";

import GLBAvatarTest from "./pages/GLBAvatarTest";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/start-interview"
          element={
            <ProtectedRoute>
              <StartInterview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />

        {/* TEMPORARY AVATAR TEST */}
        <Route
  path="/avatar-test"
  element={<GLBAvatarTest speaking={true} />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;