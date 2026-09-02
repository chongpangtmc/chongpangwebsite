import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

import Navbar from "./components/Navbar"; 
import Footer from "./components/Footer"; 

import Index from "./pages/Index";
import Resources from "./pages/Resources";
import ResourcesAdmin from "./pages/ResourcesAdmin";
import MemberColumn from "./pages/MemberColumn";
import Heritage from "./pages/Heritage";
import ToolsPage from "./pages/ToolsPage"; 
import Contact from "./pages/Contact"; 
import Admin from "./pages/Admin"; 
import NotFound from "./pages/NotFound";
import BusStatus from "./pages/BusStatus";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppLayout = () => {
  const { pathname } = useLocation();
  const isBusStatus = pathname === "/bus_status";

  return (
    <>
      <ScrollToTop />

      {!isBusStatus && <Navbar />}

      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/admin" element={<ResourcesAdmin />} />
          <Route path="/member-column" element={<MemberColumn />} />
          <Route path="/heritage" element={<Heritage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/bus_status" element={<BusStatus />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isBusStatus && <Footer />}
    </>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
