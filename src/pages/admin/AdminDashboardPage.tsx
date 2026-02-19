import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Mail, FileText, TrendingUp, Clock, Package, Satellite } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalDemoBookings: number;
  totalContactInquiries: number;
  totalProductInquiries: number;
  totalQuoteRequests: number;
  totalImageryRequests?: number;
  pendingDemoBookings: number;
  newContactInquiries: number;
  pendingProductInquiries: number;
  pendingQuoteRequests: number;
  pendingImageryRequests?: number;
}

interface RecentActivity {
  id: string;
  type: 'demo' | 'contact' | 'product' | 'quote' | 'user' | 'imagery';
  title: string;
  description: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setActivityLoading(true);
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('auth_token');
      
      // Fetch statistics
      const statsResponse = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const statsData = await statsResponse.json();
      setStats(statsData);
      setLoading(false);

      // Fetch recent activity (separate from stats to not block the main UI)
      try {
        const activityResponse = await fetch(`${API_BASE_URL}/admin/dashboard/activity?limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!activityResponse.ok) {
          console.error('Activity fetch failed:', activityResponse.status, activityResponse.statusText);
          setRecentActivity([]);
        } else {
          const activityData = await activityResponse.json();
          // console.log('Activity data received:', activityData);
          setRecentActivity(activityData.activities || []);
        }
      } catch (activityError) {
        console.error('Error fetching activity:', activityError);
        setRecentActivity([]);
      } finally {
        setActivityLoading(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
      setActivityLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'demo':
        return <Calendar className="h-4 w-4" />;
      case 'contact':
        return <Mail className="h-4 w-4" />;
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'quote':
        return <FileText className="h-4 w-4" />;
      case 'imagery':
        return <Satellite className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Overview of platform activity and management</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-gray-400 mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Demo Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalDemoBookings || 0}</div>
              <p className="text-xs text-gray-400 mt-1">
                {stats?.pendingDemoBookings || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Contact Inquiries</CardTitle>
              <Mail className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalContactInquiries || 0}</div>
              <p className="text-xs text-gray-400 mt-1">
                {stats?.newContactInquiries || 0} new
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Product Inquiries</CardTitle>
              <Package className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalProductInquiries || 0}</div>
              <p className="text-xs text-gray-400 mt-1">
                {stats?.pendingProductInquiries || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Quote Requests</CardTitle>
              <FileText className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalQuoteRequests || 0}</div>
              <p className="text-xs text-gray-400 mt-1">
                {stats?.pendingQuoteRequests || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Imagery Requests</CardTitle>
              <Satellite className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalImageryRequests || 0}</div>
              <p className="text-xs text-gray-400 mt-1">
                {stats?.pendingImageryRequests || 0} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Link to="/admin/demo-bookings">
                <Button variant="outline" className="w-full border-gray-600 text-gray-200 hover:bg-gray-700">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Bookings
                </Button>
              </Link>
              <Link to="/admin/contact-inquiries">
                <Button variant="outline" className="w-full border-gray-600 text-gray-200 hover:bg-gray-700">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Inquiries
                </Button>
              </Link>
              <Link to="/admin/product-inquiries">
                <Button variant="outline" className="w-full border-gray-600 text-gray-200 hover:bg-gray-700">
                  <Package className="mr-2 h-4 w-4" />
                  Product Inquiries
                </Button>
              </Link>
              <Link to="/admin/quote-requests">
                <Button variant="outline" className="w-full border-gray-600 text-gray-200 hover:bg-gray-700">
                  <FileText className="mr-2 h-4 w-4" />
                  Quote Requests
                </Button>
              </Link>
              <Link to="/admin/imagery-requests">
                <Button variant="outline" className="w-full border-gray-600 text-gray-200 hover:bg-gray-700">
                  <Satellite className="mr-2 h-4 w-4" />
                  Imagery Requests
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="outline" className="w-full border-gray-600 text-gray-200 hover:bg-gray-700">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Content Management */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Content Management</CardTitle>
            <CardDescription className="text-gray-400">
              Manage website content and data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/products">
                <Button variant="outline" className="w-full border-gray-600 text-gray-200 hover:bg-gray-700">
                  <Package className="mr-2 h-4 w-4" />
                  Products
                </Button>
              </Link>
              <Link to="/admin/industries">
                <Button variant="outline" className="w-full border-gray-600 text-gray-200 hover:bg-gray-700">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Industries
                </Button>
              </Link>
              <Link to="/admin/partners">
                <Button variant="outline" className="w-full border-gray-600 text-gray-200 hover:bg-gray-700">
                  <Users className="mr-2 h-4 w-4" />
                  Partners
                </Button>
              </Link>
              <Link to="/admin/blog">
                <Button variant="outline" className="w-full border-gray-600 text-gray-200 hover:bg-gray-700">
                  <FileText className="mr-2 h-4 w-4" />
                  Blog Posts
                </Button>
              </Link>
              <Link to="/admin/satellite-products">
                <Button variant="outline" className="w-full border-gray-600 text-gray-200 hover:bg-gray-700">
                  <Satellite className="mr-2 h-4 w-4" />
                  Satellite Products
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-gray-400">
              Latest platform events and submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="text-center py-8 text-gray-400">
                Loading recent activity...
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No recent activity
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-2 rounded-full bg-gray-600">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
