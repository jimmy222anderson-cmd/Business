import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SubProductDetailPage from "./pages/SubProductDetailPage";
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
import ImageryRequestsPage from "./pages/admin/ImageryRequestsPage";
import UsersPage from "./pages/admin/UsersPage";
import ProductsManagementPage from "./pages/admin/ProductsManagementPage";
import IndustriesManagementPage from "./pages/admin/IndustriesManagementPage";
import PartnersManagementPage from "./pages/admin/PartnersManagementPage";
import BlogManagementPage from "./pages/admin/BlogManagementPage";
import ProductFormPage from "./pages/admin/ProductFormPage";
import IndustryFormPage from "./pages/admin/IndustryFormPage";
import PartnerFormPage from "./pages/admin/PartnerFormPage";
import BlogFormPage from "./pages/admin/BlogFormPage";
import AdminSatelliteProductsPage from "./pages/admin/AdminSatelliteProductsPage";
import SatelliteProductFormPage from "./pages/admin/SatelliteProductFormPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import ExplorerPage from "./pages/ExplorerPage";
import UserImageryDashboard from "./pages/UserImageryDashboard";

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
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
            {/* Explorer Page - Full screen without header/footer */}
            <Route path="/explore" element={<ExplorerPage />} />
            
            {/* User Dashboard - Full screen without header/footer */}
            <Route path="/dashboard/imagery" element={<UserImageryDashboard />} />
            
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              
              {/* Phase 2 placeholder routes */}
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:productId" element={<ProductDetailPage />} />
              <Route path="/products/:productId/:subProductId" element={<SubProductDetailPage />} />
              <Route path="/industries" element={<IndustriesPage />} />
              <Route path="/industries/:industryId" element={<IndustryDetailPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:postId" element={<BlogPostPage />} />
              <Route path="/features" element={<SpecsPage />} />
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
                path="/admin/imagery-requests" 
                element={
                  <ProtectedRoute requireAdmin>
                    <ImageryRequestsPage />
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
              <Route 
                path="/admin/products" 
                element={
                  <ProtectedRoute requireAdmin>
                    <ProductsManagementPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/products/new" 
                element={
                  <ProtectedRoute requireAdmin>
                    <ProductFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/products/edit/:id" 
                element={
                  <ProtectedRoute requireAdmin>
                    <ProductFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/industries" 
                element={
                  <ProtectedRoute requireAdmin>
                    <IndustriesManagementPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/industries/new" 
                element={
                  <ProtectedRoute requireAdmin>
                    <IndustryFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/industries/edit/:id" 
                element={
                  <ProtectedRoute requireAdmin>
                    <IndustryFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/partners" 
                element={
                  <ProtectedRoute requireAdmin>
                    <PartnersManagementPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/partners/new" 
                element={
                  <ProtectedRoute requireAdmin>
                    <PartnerFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/partners/edit/:id" 
                element={
                  <ProtectedRoute requireAdmin>
                    <PartnerFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/blog" 
                element={
                  <ProtectedRoute requireAdmin>
                    <BlogManagementPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/blog/new" 
                element={
                  <ProtectedRoute requireAdmin>
                    <BlogFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/blog/edit/:id" 
                element={
                  <ProtectedRoute requireAdmin>
                    <BlogFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/satellite-products" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSatelliteProductsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/satellite-products/new" 
                element={
                  <ProtectedRoute requireAdmin>
                    <SatelliteProductFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/satellite-products/edit/:id" 
                element={
                  <ProtectedRoute requireAdmin>
                    <SatelliteProductFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminAnalyticsPage />
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
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
