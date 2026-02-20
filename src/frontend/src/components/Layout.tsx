import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetAllSalons } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Building2, Calendar, LayoutDashboard, Users, Heart, Store } from 'lucide-react';
import { SiX, SiFacebook, SiInstagram } from 'react-icons/si';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: allSalons } = useGetAllSalons();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Check if user owns any salons
  const ownedSalons = allSalons?.filter(salon => 
    salon.ownerName === identity?.getPrincipal().toString()
  ) || [];
  const isSalonOwner = ownedSalons.length > 0;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-custom mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-sans font-bold text-foreground">SalonHub</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/salons"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Find Salons
              </Link>
              <Link
                to="/book"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Book Appointment
              </Link>
              {isAuthenticated && (
                <Link
                  to="/appointments"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  My Appointments
                </Link>
              )}
              {isAuthenticated && isSalonOwner && (
                <Link
                  to="/salon-dashboard"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  My Salon Dashboard
                </Link>
              )}
              {isAuthenticated && isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Admin
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate({ to: '/admin/salons' })}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Salon Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: '/admin/bookings' })}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Booking Management
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: '/services' })}>
                      <Users className="mr-2 h-4 w-4" />
                      Services
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: '/team' })}>
                      <Users className="mr-2 h-4 w-4" />
                      Stylists
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>

            {/* Auth Button */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAuth}
                disabled={isLoggingIn}
                variant={isAuthenticated ? 'outline' : 'default'}
                size="sm"
                className="hidden md:inline-flex"
              >
                {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
              </Button>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link
                      to="/salons"
                      onClick={closeMobileMenu}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Find Salons
                    </Link>
                    <Link
                      to="/book"
                      onClick={closeMobileMenu}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Book Appointment
                    </Link>
                    {isAuthenticated && (
                      <Link
                        to="/appointments"
                        onClick={closeMobileMenu}
                        className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                      >
                        My Appointments
                      </Link>
                    )}
                    {isAuthenticated && isSalonOwner && (
                      <Link
                        to="/salon-dashboard"
                        onClick={closeMobileMenu}
                        className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <Store className="h-5 w-5" />
                        My Salon Dashboard
                      </Link>
                    )}
                    {isAuthenticated && isAdmin && (
                      <>
                        <div className="border-t border-border my-2" />
                        <div className="text-sm font-semibold text-muted-foreground">Admin</div>
                        <Link
                          to="/admin/salons"
                          onClick={closeMobileMenu}
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          Salon Dashboard
                        </Link>
                        <Link
                          to="/admin/bookings"
                          onClick={closeMobileMenu}
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          Booking Management
                        </Link>
                        <Link
                          to="/services"
                          onClick={closeMobileMenu}
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          Services
                        </Link>
                        <Link
                          to="/team"
                          onClick={closeMobileMenu}
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          Stylists
                        </Link>
                      </>
                    )}
                    <div className="border-t border-border my-2" />
                    <Button
                      onClick={() => {
                        handleAuth();
                        closeMobileMenu();
                      }}
                      disabled={isLoggingIn}
                      variant={isAuthenticated ? 'outline' : 'default'}
                    >
                      {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container-custom mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <span className="text-xl font-sans font-bold text-foreground">SalonHub</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Discover and book salon services with ease. Find verified salons near you and schedule appointments with expert stylists.
              </p>
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiFacebook className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiX className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiInstagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/salons" className="text-muted-foreground hover:text-primary transition-colors">
                    Find Salons
                  </Link>
                </li>
                <li>
                  <Link to="/book" className="text-muted-foreground hover:text-primary transition-colors">
                    Book Appointment
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="/team" className="text-muted-foreground hover:text-primary transition-colors">
                    Stylists
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} SalonHub. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'salonhub'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
