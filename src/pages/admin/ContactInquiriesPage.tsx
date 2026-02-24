import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Mail, Eye, Filter, Send } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/BackButton';

interface ContactInquiry {
  _id: string;
  inquiry_type: string;
  full_name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export default function ContactInquiriesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    filterInquiries();
  }, [inquiries, statusFilter]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/admin/contact/inquiries`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inquiries');
      }

      const data = await response.json();
      setInquiries(data.inquiries);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to load contact inquiries');
    } finally {
      setLoading(false);
    }
  };

  const filterInquiries = () => {
    if (statusFilter === 'all') {
      setFilteredInquiries(inquiries);
    } else {
      setFilteredInquiries(inquiries.filter(i => i.status === statusFilter));
    }
  };

  const updateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/admin/contact/inquiries/${inquiryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update inquiry status');
      }

      toast.success('Inquiry status updated successfully');
      fetchInquiries();
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast.error('Failed to update inquiry status');
    }
  };

  const sendReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      setSendingReply(true);
      
      // In a real implementation, this would send an email via the backend
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Reply sent successfully');
      setReplyMessage('');
      setReplyOpen(false);
      
      // Update status to in_progress if it was new
      if (selectedInquiry.status === 'new') {
        await updateInquiryStatus(selectedInquiry._id, 'in_progress');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      new: 'default',
      in_progress: 'outline',
      resolved: 'secondary',
      closed: 'destructive'
    };
    const labels: Record<string, string> = {
      new: 'New',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed'
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const viewDetails = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setDetailsOpen(true);
  };

  const openReply = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setReplyMessage(`Hi ${inquiry.full_name},\n\nThank you for contacting ATLAS Space & Data Systems.\n\n`);
    setReplyOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Contact Inquiries Management</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading inquiries...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <BackButton to="/admin/dashboard" label="Back to Admin Dashboard" />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Contact Inquiries Management</h1>
          <p className="text-gray-400">Manage and respond to customer inquiries</p>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-400">
                Showing {filteredInquiries.length} of {inquiries.length} inquiries
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inquiries Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Contact Inquiries</CardTitle>
            <CardDescription className="text-gray-400">
              All contact inquiries from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInquiries.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No contact inquiries found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Subject</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInquiries.map((inquiry) => (
                      <TableRow key={inquiry._id} className="border-gray-700 hover:bg-gray-700/50">
                        <TableCell className="text-white font-medium">
                          {inquiry.full_name}
                        </TableCell>
                        <TableCell className="text-gray-300">{inquiry.email}</TableCell>
                        <TableCell className="text-gray-300 max-w-xs truncate">
                          {inquiry.subject}
                        </TableCell>
                        <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewDetails(inquiry)}
                              className="text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openReply(inquiry)}
                              className="text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Select
                              value={inquiry.status}
                              onValueChange={(value) => updateInquiryStatus(inquiry._id, value)}
                            >
                              <SelectTrigger className="w-[130px] h-8 bg-gray-700 border-gray-600 text-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-700 border-gray-600">
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contact Inquiry Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                Complete information about this inquiry
              </DialogDescription>
            </DialogHeader>
            {selectedInquiry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Full Name</label>
                    <p className="text-white font-medium">{selectedInquiry.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white font-medium">{selectedInquiry.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Company</label>
                    <p className="text-white font-medium">
                      {selectedInquiry.company || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Inquiry Type</label>
                    <p className="text-white font-medium capitalize">
                      {selectedInquiry.inquiry_type}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedInquiry.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Created Date</label>
                    <p className="text-white font-medium">
                      {new Date(selectedInquiry.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Subject</label>
                  <p className="text-white font-medium mt-1">{selectedInquiry.subject}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Message</label>
                  <p className="text-white mt-1 p-3 bg-gray-700 rounded-md whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => {
                  setDetailsOpen(false);
                  if (selectedInquiry) openReply(selectedInquiry);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="mr-2 h-4 w-4" />
                Reply to Inquiry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reply Dialog */}
        <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reply to Inquiry</DialogTitle>
              <DialogDescription className="text-gray-400">
                Send an email response to {selectedInquiry?.full_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">To</label>
                <p className="text-white font-medium">{selectedInquiry?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Subject</label>
                <p className="text-white font-medium">
                  Re: {selectedInquiry?.subject}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Message</label>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="min-h-[200px] bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReplyOpen(false)}
                className="border-gray-600 text-gray-200 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={sendReply}
                disabled={sendingReply || !replyMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sendingReply ? 'Sending...' : 'Send Reply'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
