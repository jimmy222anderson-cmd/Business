import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <Button variant="ghost" asChild>
              <Link to="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/demo">Book Demo</Link>
            </Button>
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
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
