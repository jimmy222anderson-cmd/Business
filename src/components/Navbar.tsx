import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const industries = [
  { name: 'Financial Services', href: '/industries/financial-services' },
  { name: 'Agriculture', href: '/industries/agriculture' },
  { name: 'Energy', href: '/industries/energy' },
  { name: 'Mining', href: '/industries/mining' },
  { name: 'Construction', href: '/industries/construction' },
  { name: 'Government', href: '/industries/government' },
  { name: 'Environment', href: '/industries/environment' },
  { name: 'Insurance', href: '/industries/insurance' },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getUserInitials = () => {
    if (!user?.full_name) return 'U';
    const names = user.full_name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.full_name[0].toUpperCase();
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              Earth Intelligence
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/products"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              Products
            </Link>

            {/* Industries Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground/80 hover:text-foreground transition-colors font-medium outline-none">
                <span>Industries</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {industries.map((industry) => (
                  <DropdownMenuItem key={industry.href} asChild>
                    <Link to={industry.href} className="cursor-pointer">
                      {industry.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/specs"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              Specs
            </Link>

            <Link
              to="/pricing"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              Pricing
            </Link>

            <Link
              to="/partners"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              Partners
            </Link>
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.full_name || user.email}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{user.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/demo">Book Demo</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-6 mt-8">
                <Link
                  to="/products"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Products
                </Link>

                {/* Industries - Mobile */}
                <div className="space-y-3">
                  <div className="text-lg font-medium text-foreground">Industries</div>
                  <div className="pl-4 space-y-2">
                    {industries.map((industry) => (
                      <Link
                        key={industry.href}
                        to={industry.href}
                        className="block text-foreground/80 hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {industry.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  to="/specs"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Specs
                </Link>

                <Link
                  to="/pricing"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>

                <Link
                  to="/partners"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Partners
                </Link>

                {/* CTA Buttons - Mobile */}
                <div className="flex flex-col space-y-3 pt-6 border-t border-border">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-2 py-2 bg-muted rounded-lg">
                        <p className="font-medium text-sm">{user.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                      {user.role === 'admin' && (
                        <Button variant="ghost" asChild className="w-full justify-start">
                          <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                            <User className="w-4 h-4 mr-2" />
                            Admin Panel
                          </Link>
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleSignOut();
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" asChild className="w-full">
                        <Link to="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link to="/demo" onClick={() => setIsMobileMenuOpen(false)}>
                          Book Demo
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
