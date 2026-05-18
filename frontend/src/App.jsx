import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      {/* Redirect root về trang đăng ký */}
      <Route path="/" element={<Navigate to="/register" replace />} />
    </Routes>
  );
}

export default App;
