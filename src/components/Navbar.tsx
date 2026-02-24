import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Map, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Industry {
  _id: string;
  name: string;
  slug: string;
}

interface SubProduct {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  subProducts?: SubProduct[];
}

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/public/industries`);
        if (response.ok) {
          const data = await response.json();
          setIndustries(data);
        }
      } catch (error) {
        console.error('Error fetching industries:', error);
      }
    };

    const fetchProducts = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/public/products`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchIndustries();
    fetchProducts();
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
        <div className="flex items-center justify-between h-10 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 md:space-x-3 py-2">
            <img 
              src="/atlas-logo.png" 
              alt="ATLAS Space & Data Systems Logo" 
              className="h-16 md:h-16 w-auto flex-shrink-0"
              onError={(e) => {
                // Fallback to SVG if image not found
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-14 h-14 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">
              <svg className="w-12 h-12 md:w-14 md:h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="12 2 15 8 12 12 9 8" fill="currentColor" />
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Products Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground/80 hover:text-foreground transition-colors font-medium outline-none">
                <span>Products</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {products.map((product) => (
                  product.subProducts && product.subProducts.length > 0 ? (
                    <DropdownMenuSub key={product._id}>
                      <DropdownMenuSubTrigger className="cursor-pointer">
                        {product.name}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-56">
                        {product.subProducts.map((subProduct) => (
                          <DropdownMenuItem key={subProduct._id} asChild>
                            <Link to={`/products/${product.slug}/${subProduct.slug}`} className="cursor-pointer">
                              {subProduct.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={`/products/${product.slug}`} className="cursor-pointer font-semibold text-primary">
                            View All {product.name}
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ) : (
                    <DropdownMenuItem key={product._id} asChild>
                      <Link to={`/products/${product.slug}`} className="cursor-pointer">
                        {product.name}
                      </Link>
                    </DropdownMenuItem>
                  )
                ))}
                {products.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem asChild>
                  <Link to="/products" className="cursor-pointer font-semibold text-primary">
                    View All Products
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Industries Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground/80 hover:text-foreground transition-colors font-medium outline-none">
                <span>Industries</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {industries.map((industry) => (
                  <DropdownMenuItem key={industry._id} asChild>
                    <Link to={`/industries/${industry.slug}`} className="cursor-pointer">
                      {industry.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {industries.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem asChild>
                  <Link to="/industries" className="cursor-pointer font-semibold text-primary">
                    View All Industries
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/features"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              Features
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

            <Button variant="outline" size="sm" asChild className="ml-2">
              <Link to="/explore" className="flex items-center space-x-2">
                <Map className="w-4 h-4" />
                <span>Explore Map</span>
              </Link>
            </Button>
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
                {/* Products - Mobile */}
                <div className="space-y-3">
                  <div className="text-lg font-medium text-foreground">Products</div>
                  <div className="pl-4 space-y-2">
                    {products.map((product) => (
                      <div key={product._id}>
                        {product.subProducts && product.subProducts.length > 0 ? (
                          <div className="space-y-2">
                            <div className="font-medium text-foreground/90">{product.name}</div>
                            <div className="pl-4 space-y-1">
                              {product.subProducts.map((subProduct) => (
                                <Link
                                  key={subProduct._id}
                                  to={`/products/${product.slug}/${subProduct.slug}`}
                                  className="block text-sm text-foreground/70 hover:text-primary transition-colors"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {subProduct.name}
                                </Link>
                              ))}
                              <Link
                                to={`/products/${product.slug}`}
                                className="block text-sm text-primary font-semibold hover:text-primary/80 transition-colors pt-1"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                View All {product.name}
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <Link
                            to={`/products/${product.slug}`}
                            className="block text-foreground/80 hover:text-primary transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {product.name}
                          </Link>
                        )}
                      </div>
                    ))}
                    {products.length > 0 && (
                      <Link
                        to="/products"
                        className="block text-primary font-semibold hover:text-primary/80 transition-colors pt-2 border-t border-border"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        View All Products
                      </Link>
                    )}
                  </div>
                </div>

                {/* Industries - Mobile */}
                <div className="space-y-3">
                  <div className="text-lg font-medium text-foreground">Industries</div>
                  <div className="pl-4 space-y-2">
                    {industries.map((industry) => (
                      <Link
                        key={industry._id}
                        to={`/industries/${industry.slug}`}
                        className="block text-foreground/80 hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {industry.name}
                      </Link>
                    ))}
                    {industries.length > 0 && (
                      <Link
                        to="/industries"
                        className="block text-primary font-semibold hover:text-primary/80 transition-colors pt-2 border-t border-border"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        View All Industries
                      </Link>
                    )}
                  </div>
                </div>

                <Link
                  to="/features"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
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

                {/* Explore Map Button - Mobile */}
                <Button variant="outline" asChild className="w-full">
                  <Link to="/explore" onClick={() => setIsMobileMenuOpen(false)}>
                    <Map className="w-4 h-4 mr-2" />
                    Explore Map
                  </Link>
                </Button>

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
