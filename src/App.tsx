import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import FreePage from "./pages/FreePage";
import FreeLessonPage from "./pages/FreeLessonPage";
import FreeCategoryPage from "./pages/FreeCategoryPage";
import VIPPage from "./pages/VIPPage";
import VIPModulePage from "./pages/VIPModulePage";
import VIPLessonPage from "./pages/VIPLessonPage";
import VIPCategoryPage from "./pages/VIPCategoryPage";
import ToolsPage from "./pages/ToolsPage";
import ToolsCategoryPage from "./pages/ToolsCategoryPage";
import ProfilePage from "./pages/ProfilePage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminTools from "./pages/admin/AdminTools";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import FeedPage from "./pages/FeedPage";
import FeedbackPage from "./pages/FeedbackPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/free" element={<FreePage />} />
            <Route path="/free/category/:id" element={<FreeCategoryPage />} />
            <Route path="/free/:id" element={<FreeLessonPage />} />
            <Route path="/vip" element={<VIPPage />} />
            <Route path="/vip/category/:id" element={<VIPCategoryPage />} />
            <Route path="/vip/module/:id" element={<VIPModulePage />} />
            <Route path="/vip/lesson/:id" element={<VIPLessonPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/category/:id" element={<ToolsCategoryPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/lessons" element={<AdminLessons />} />
            <Route path="/admin/tools" element={<AdminTools />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
