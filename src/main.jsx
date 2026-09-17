import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./styles.css";
import { StoreProvider } from "./lib/store.jsx";
import { Footer, Header, ToastProvider } from "./components/ui.jsx";
import Landing from "./pages/Landing.jsx";
import Orders from "./pages/company/Orders.jsx";
import NewOrder from "./pages/company/NewOrder.jsx";
import OrderDetail from "./pages/company/OrderDetail.jsx";
import Projects from "./pages/student/Projects.jsx";
import ProjectDetail from "./pages/student/ProjectDetail.jsx";
import Profile from "./pages/student/Profile.jsx";
import Applications from "./pages/student/Applications.jsx";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StoreProvider>
      <HashRouter>
        <ToastProvider>
          <ScrollTop />
          <Header />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/company" element={<Orders />} />
            <Route path="/company/new" element={<NewOrder />} />
            <Route path="/company/orders/:id" element={<OrderDetail />} />
            <Route path="/student" element={<Projects />} />
            <Route path="/student/projects/:id" element={<ProjectDetail />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/applications" element={<Applications />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </ToastProvider>
      </HashRouter>
    </StoreProvider>
  </StrictMode>
);
