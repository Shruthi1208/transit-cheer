import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CityProvider } from "@/context/CityContext";
import Index from "./pages/Index";
import DriverDashboard from "./pages/DriverDashboard";
import PassengerInterface from "./pages/PassengerInterface";
import BusStopScreen from "./pages/BusStopScreen";
import AdminDashboard from "./pages/AdminDashboard";
import TripPlanner from "./pages/TripPlanner";
import CrowdHeatmap from "./pages/CrowdHeatmap";
import FareCalculator from "./pages/FareCalculator";
import BusTracker from "./pages/BusTracker";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CityProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/driver" element={<DriverDashboard />} />
            <Route path="/passenger" element={<PassengerInterface />} />
            <Route path="/bus-stop" element={<BusStopScreen />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/trip-planner" element={<TripPlanner />} />
            <Route path="/heatmap" element={<CrowdHeatmap />} />
            <Route path="/fare-calculator" element={<FareCalculator />} />
            <Route path="/tracker" element={<BusTracker />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
