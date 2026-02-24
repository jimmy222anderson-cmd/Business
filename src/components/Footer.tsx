import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setMessage('Thank you for subscribing!');
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          <div className="md:col-span-2 space-y-2">
            <Link to="/" className="inline-block">
              <img src="/atlas-logo.png" alt="ATLAS Space & Data Systems Logo" className="h-40 md:h-40 w-auto" />
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed -mt-16">Empowering decisions with satellite data and space-based intelligence solutions.</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-yellow-500 transition-colors" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-yellow-500 transition-colors" aria-label="Twitter"><Twitter className="w-5 h-5" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-yellow-500 transition-colors" aria-label="LinkedIn"><Linkedin className="w-5 h-5" /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-yellow-500 transition-colors" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-yellow-500 transition-colors" aria-label="YouTube"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Products</h3>
            <ul className="space-y-3">
              <li><Link to="/products/analytics" className="text-sm text-slate-400 hover:text-white transition-colors">Analytics</Link></li>
              <li><Link to="/products/commercial-imagery" className="text-sm text-slate-400 hover:text-white transition-colors">Commercial Imagery</Link></li>
              <li><Link to="/products/open-data" className="text-sm text-slate-400 hover:text-white transition-colors">Open Data</Link></li>
              <li><Link to="/products" className="text-sm text-slate-400 hover:text-white transition-colors">View All Products</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-slate-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/partners" className="text-sm text-slate-400 hover:text-white transition-colors">Partners</Link></li>
              <li><Link to="/blog" className="text-sm text-slate-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Newsletter</h3>
            <p className="text-sm text-slate-400">Stay updated with the latest news and insights.</p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-yellow-500" aria-label="Email address" />
              <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold" disabled={isSubmitting}>{isSubmitting ? 'Subscribing...' : 'Subscribe'}</Button>
              {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
              {message && <p className="text-sm text-green-400" role="status">{message}</p>}
            </form>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-slate-400">
            <p> {new Date().getFullYear()} ATLAS Space & Data Systems. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
