import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import IndustriesPage from "./pages/IndustriesPage";
import IndustryDetailPage from "./pages/IndustryDetailPage";
import PricingPage from "./pages/PricingPage";
import PartnersPage from "./pages/PartnersPage";
import AboutPage from "./pages/AboutPage";
import SpecsPage from "./pages/SpecsPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import BookDemoPage from "./pages/BookDemoPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import RequestQuotePage from "./pages/RequestQuotePage";
import GetStartedPage from "./pages/GetStartedPage";
import DashboardPage from "./pages/DashboardPage";
import PartnershipPage from "./pages/PartnershipPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import DemoBookingsPage from "./pages/admin/DemoBookingsPage";
import ContactInquiriesPage from "./pages/admin/ContactInquiriesPage";
import ProductInquiriesPage from "./pages/admin/ProductInquiriesPage";
import QuoteRequestsPage from "./pages/admin/QuoteRequestsPage";
import UsersPage from "./pages/admin/UsersPage";

const queryClient = new QueryClient();

// Placeholder component for Phase 2 pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground">Coming soon in Phase 2</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              
              {/* Phase 2 placeholder routes */}
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:productId" element={<ProductDetailPage />} />
              <Route path="/industries" element={<IndustriesPage />} />
              <Route path="/industries/:industryId" element={<IndustryDetailPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:postId" element={<BlogPostPage />} />
              <Route path="/specs" element={<SpecsPage />} />
              <Route path="/demo" element={<BookDemoPage />} />
              <Route path="/get-started" element={<GetStartedPage />} />
              <Route path="/auth/signin" element={<SignInPage />} />
              <Route path="/auth/signup" element={<SignUpPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/quote" element={<RequestQuotePage />} />
              <Route path="/partnership" element={<PartnershipPage />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/demo-bookings" 
                element={
                  <ProtectedRoute requireAdmin>
                    <DemoBookingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/contact-inquiries" 
                element={
                  <ProtectedRoute requireAdmin>
                    <ContactInquiriesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/product-inquiries" 
                element={
                  <ProtectedRoute requireAdmin>
                    <ProductInquiriesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/quote-requests" 
                element={
                  <ProtectedRoute requireAdmin>
                    <QuoteRequestsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requireAdmin>
                    <UsersPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
