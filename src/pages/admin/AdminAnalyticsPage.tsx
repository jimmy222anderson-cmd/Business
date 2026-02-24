import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, MapPin, Calendar, Package, Clock, TrendingDown, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  totalRequests: number;
  requestsByStatus: Array<{ status: string; count: number }>;
  requestsOverTime: Array<{ date: string; count: number }>;
  popularProducts: Array<{ provider: string; count: number }>;
  avgAoiSize: number;
  avgResponseTime: number;
  conversionRate: number;
  requestsByUrgency: Array<{ urgency: string; count: number }>;
  requestsByUserType: Array<{ userType: string; count: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  reviewing: '#3b82f6',
  quoted: '#8b5cf6',
  approved: '#10b981',
  completed: '#06b6d4',
  cancelled: '#ef4444'
};

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/admin/analytics/imagery-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading analytics...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">No analytics data available</div>
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
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Imagery request insights and statistics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Requests</CardTitle>
              <Calendar className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics.totalRequests}</div>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Avg AOI Size</CardTitle>
              <MapPin className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics.avgAoiSize} km²</div>
              <p className="text-xs text-gray-400 mt-1">Average area</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Active Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {analytics.requestsByStatus
                  .filter(s => ['pending', 'reviewing', 'quoted'].includes(s.status))
                  .reduce((sum, s) => sum + s.count, 0)}
              </div>
              <p className="text-xs text-gray-400 mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Top Providers</CardTitle>
              <Package className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics.popularProducts.length}</div>
              <p className="text-xs text-gray-400 mt-1">Unique providers</p>
            </CardContent>
          </Card>
        </div>

        {/* New Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {analytics.avgResponseTime > 0 ? `${analytics.avgResponseTime}h` : 'N/A'}
              </div>
              <p className="text-xs text-gray-400 mt-1">Time to first status change</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Conversion Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics.conversionRate}%</div>
              <p className="text-xs text-gray-400 mt-1">Pending → Approved</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Urgent Requests</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {analytics.requestsByUrgency
                  .filter(u => ['urgent', 'emergency'].includes(u.urgency))
                  .reduce((sum, u) => sum + u.count, 0)}
              </div>
              <p className="text-xs text-gray-400 mt-1">Urgent + Emergency</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Registered Users</CardTitle>
              <Users className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {analytics.requestsByUserType.find(u => u.userType === 'registered')?.count || 0}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                vs {analytics.requestsByUserType.find(u => u.userType === 'guest')?.count || 0} guests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Requests by Status - Pie Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Requests by Status</CardTitle>
              <CardDescription className="text-gray-400">
                Distribution of request statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.requestsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                  >
                    {analytics.requestsByStatus.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.status] || CHART_COLORS[index % CHART_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#9ca3af' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Popular Products - Bar Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Popular Products</CardTitle>
              <CardDescription className="text-gray-400">
                Most requested satellite providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.popularProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.popularProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="provider" 
                      stroke="#9ca3af"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  No provider data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Requests Over Time - Line Chart */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Requests Over Time</CardTitle>
            <CardDescription className="text-gray-400">
              Daily request volume (last 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.requestsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.requestsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                    name="Requests"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                No request data for the last 30 days
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Metrics Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requests by Urgency - Bar Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Requests by Urgency</CardTitle>
              <CardDescription className="text-gray-400">
                Distribution by urgency level
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.requestsByUrgency.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.requestsByUrgency}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="urgency" 
                      stroke="#9ca3af"
                      tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                    />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value, name) => [value, name === 'count' ? 'Requests' : name]}
                      labelFormatter={(label) => label.charAt(0).toUpperCase() + label.slice(1)}
                    />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  No urgency data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requests by User Type - Pie Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Requests by User Type</CardTitle>
              <CardDescription className="text-gray-400">
                Guest vs Registered users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.requestsByUserType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.requestsByUserType}
                      dataKey="count"
                      nameKey="userType"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.userType.charAt(0).toUpperCase() + entry.userType.slice(1)}: ${entry.count}`}
                    >
                      {analytics.requestsByUserType.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.userType === 'guest' ? '#8b5cf6' : '#06b6d4'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value, name) => [value, name === 'count' ? 'Requests' : name]}
                      labelFormatter={(label) => label.charAt(0).toUpperCase() + label.slice(1)}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#9ca3af' }}
                      formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  No user type data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
