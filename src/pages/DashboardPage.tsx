/**
 * Dashboard Page
 * User dashboard for authenticated users with profile management, bookings, and inquiries
 */

import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Building, LogOut, Calendar, Package, Edit2, Save, X, MessageSquare, FileText, Satellite } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { getUserBookings, getUserInquiries, getUserContactInquiries, getUserQuoteRequests, updateUserProfile, DemoBooking, ProductInquiry, ContactInquiry, QuoteRequest } from "@/lib/api/users";

// Product ID to name mapping
const PRODUCT_NAMES: Record<string, string> = {
  '1': 'Analytics',
  '2': 'Commercial Imagery',
  '3': 'Open Data',
  '4': 'Vantor',
  '5': 'Maxar Connect',
  '6': 'AIS Data',
  '7': 'ATAK Plugin',
  '8': 'ICEYE US',
  '9': 'Planet Select',
};

const getProductName = (productId: string): string => {
  return PRODUCT_NAMES[productId] || `Product ${productId}`;
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const DashboardPage = () => {
  const { user, signOut, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    company: user?.company || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // State for bookings and inquiries
  const [bookings, setBookings] = useState<DemoBooking[]>([]);
  const [inquiries, setInquiries] = useState<ProductInquiry[]>([]);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(true);
  const [isLoadingContactInquiries, setIsLoadingContactInquiries] = useState(true);
  const [isLoadingQuoteRequests, setIsLoadingQuoteRequests] = useState(true);

  // Load bookings and inquiries on mount
  useEffect(() => {
    if (user?._id) {
      loadBookings();
      loadInquiries();
      loadContactInquiries();
      loadQuoteRequests();
    }
  }, [user?._id]);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        company: user.company || '',
      });
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user?._id) return;
    
    try {
      setIsLoadingBookings(true);
      const data = await getUserBookings(user._id);
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load demo bookings.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const loadInquiries = async () => {
    if (!user?._id) return;
    
    try {
      setIsLoadingInquiries(true);
      const data = await getUserInquiries(user._id);
      setInquiries(data);
    } catch (error) {
      console.error('Failed to load inquiries:', error);
      toast({
        title: "Error",
        description: "Failed to load product inquiries.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  const loadContactInquiries = async () => {
    if (!user?._id) return;
    
    try {
      setIsLoadingContactInquiries(true);
      const data = await getUserContactInquiries(user._id);
      setContactInquiries(data);
    } catch (error) {
      console.error('Failed to load contact inquiries:', error);
      toast({
        title: "Error",
        description: "Failed to load contact inquiries.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContactInquiries(false);
    }
  };

  const loadQuoteRequests = async () => {
    if (!user?._id) return;
    
    try {
      setIsLoadingQuoteRequests(true);
      const data = await getUserQuoteRequests(user._id);
      setQuoteRequests(data);
    } catch (error) {
      console.error('Failed to load quote requests:', error);
      toast({
        title: "Error",
        description: "Failed to load quote requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingQuoteRequests(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileData({
      full_name: user?.full_name || '',
      company: user?.company || '',
    });
  };

  const handleSaveProfile = async () => {
    if (!user?._id) return;

    try {
      setIsSavingProfile(true);
      await updateUserProfile(user._id, profileData);
      await refreshUser();
      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'confirmed':
      case 'quoted':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'completed':
      case 'ordered':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.full_name || user?.email}!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </div>
                {!isEditingProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditProfile}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingProfile ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSavingProfile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{user?.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Company
                    </p>
                    <p className="font-medium">{user?.company || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium capitalize">{user?.role}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your account and access features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/dashboard/imagery')}
              >
                <Satellite className="h-4 w-4 mr-2" />
                Imagery Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/products')}
              >
                Browse Products
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/demo')}
              >
                Book a Demo
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/contact')}
              >
                Contact Support
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Demo Bookings Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Demo Bookings
            </CardTitle>
            <CardDescription>Your scheduled product demonstrations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBookings ? (
              <p className="text-muted-foreground">Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't booked any demos yet.</p>
                <Button onClick={() => navigate('/demo')}>Book Your First Demo</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{booking.companyName || booking.fullName || 'Demo Booking'}</p>
                        <p className="text-sm text-muted-foreground">
                          Requested: {formatDate(booking.created_at)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                    {booking.message && (
                      <p className="text-sm text-muted-foreground">{booking.message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Inquiries Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Inquiries
            </CardTitle>
            <CardDescription>Your product inquiry history and status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInquiries ? (
              <p className="text-muted-foreground">Loading inquiries...</p>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't made any product inquiries yet.</p>
                <Button onClick={() => navigate('/products')}>Browse Products</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <div
                    key={inquiry._id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{getProductName(inquiry.product_id)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(inquiry.created_at)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(inquiry.status)}>
                        {inquiry.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{inquiry.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Inquiries Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contact Inquiries
            </CardTitle>
            <CardDescription>Your contact form submissions and support requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingContactInquiries ? (
              <p className="text-muted-foreground">Loading contact inquiries...</p>
            ) : contactInquiries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't submitted any contact inquiries yet.</p>
                <Button onClick={() => navigate('/contact')}>Contact Us</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {contactInquiries.map((inquiry) => (
                  <div
                    key={inquiry._id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{inquiry.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(inquiry.created_at)} • {inquiry.inquiry_type}
                        </p>
                      </div>
                      <Badge className={getStatusColor(inquiry.status)}>
                        {inquiry.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{inquiry.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote Requests Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quote Requests
            </CardTitle>
            <CardDescription>Your custom quote requests and pricing information</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingQuoteRequests ? (
              <p className="text-muted-foreground">Loading quote requests...</p>
            ) : quoteRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't requested any quotes yet.</p>
                <Button onClick={() => navigate('/quote')}>Request a Quote</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {quoteRequests.map((quote) => (
                  <div
                    key={quote._id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{quote.companyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(quote.created_at)} • {quote.industry}
                        </p>
                      </div>
                      <Badge className={getStatusColor(quote.status)}>
                        {quote.status}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium">Data Volume:</span> {quote.estimatedDataVolume}
                      </p>
                      <p className="text-muted-foreground mt-1">{quote.requirements}</p>
                    </div>
                    {quote.quoteDetails && quote.status === 'quoted' && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="font-medium text-sm mb-2">Quote Details:</p>
                        <p className="text-sm"><span className="font-medium">Pricing:</span> {quote.quoteDetails.pricing}</p>
                        <p className="text-sm"><span className="font-medium">Terms:</span> {quote.quoteDetails.terms}</p>
                        {quote.quoteDetails.validUntil && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Valid until: {formatDate(quote.quoteDetails.validUntil)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
