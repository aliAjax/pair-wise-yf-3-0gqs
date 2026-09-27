import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Trash from "@/pages/Trash";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trash" element={<Trash />} />
      </Routes>
    </Router>
  );
}
