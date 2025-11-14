import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import TripDetails from "./pages/TripDetails";
import Profile from "./pages/Profile";
import Publish from "./pages/Publish";
import Bookings from "./pages/Bookings";
import Auth from "./pages/Auth";
import VerifyIdentity from "./pages/VerifyIdentity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/trip/:id" element={<TripDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-identity" element={<VerifyIdentity />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
