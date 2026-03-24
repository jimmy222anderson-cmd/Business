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
import { lazy, Suspense } from "react";

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Eager load critical pages (home, not found)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load all other pages
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const SubProductDetailPage = lazy(() => import("./pages/SubProductDetailPage"));
const IndustriesPage = lazy(() => import("./pages/IndustriesPage"));
const IndustryDetailPage = lazy(() => import("./pages/IndustryDetailPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const PartnersPage = lazy(() => import("./pages/PartnersPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const SpecsPage = lazy(() => import("./pages/SpecsPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const BookDemoPage = lazy(() => import("./pages/BookDemoPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const RequestQuotePage = lazy(() => import("./pages/RequestQuotePage"));
const GetStartedPage = lazy(() => import("./pages/GetStartedPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const PartnershipPage = lazy(() => import("./pages/PartnershipPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));

// Lazy load Explorer and User Dashboard (map-heavy pages)
const ExplorerPage = lazy(() => import("./pages/ExplorerPage"));
const UserImageryDashboard = lazy(() => import("./pages/UserImageryDashboard"));

// Lazy load admin pages
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const DemoBookingsPage = lazy(() => import("./pages/admin/DemoBookingsPage"));
const ContactInquiriesPage = lazy(() => import("./pages/admin/ContactInquiriesPage"));
const ProductInquiriesPage = lazy(() => import("./pages/admin/ProductInquiriesPage"));
const QuoteRequestsPage = lazy(() => import("./pages/admin/QuoteRequestsPage"));
const ImageryRequestsPage = lazy(() => import("./pages/admin/ImageryRequestsPage"));
const UsersPage = lazy(() => import("./pages/admin/UsersPage"));
const ProductsManagementPage = lazy(() => import("./pages/admin/ProductsManagementPage"));
const IndustriesManagementPage = lazy(() => import("./pages/admin/IndustriesManagementPage"));
const PartnersManagementPage = lazy(() => import("./pages/admin/PartnersManagementPage"));
const BlogManagementPage = lazy(() => import("./pages/admin/BlogManagementPage"));
const ProductFormPage = lazy(() => import("./pages/admin/ProductFormPage"));
const IndustryFormPage = lazy(() => import("./pages/admin/IndustryFormPage"));
const PartnerFormPage = lazy(() => import("./pages/admin/PartnerFormPage"));
const BlogFormPage = lazy(() => import("./pages/admin/BlogFormPage"));
const AdminSatelliteProductsPage = lazy(() => import("./pages/admin/AdminSatelliteProductsPage"));
const SatelliteProductFormPage = lazy(() => import("./pages/admin/SatelliteProductFormPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
