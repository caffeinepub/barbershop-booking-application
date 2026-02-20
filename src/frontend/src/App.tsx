import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import ServicesPage from './pages/ServicesPage';
import StylistsPage from './pages/StylistsPage';
import BookingPage from './pages/BookingPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import AdminSalonDashboardPage from './pages/AdminSalonDashboardPage';
import SalonsPage from './pages/SalonsPage';
import BookingManagementPage from './pages/BookingManagementPage';
import SalonOwnerDashboardPage from './pages/SalonOwnerDashboardPage';

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const adminSalonDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/salons',
  component: AdminSalonDashboardPage,
});

const bookingManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/bookings',
  component: BookingManagementPage,
});

const salonOwnerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/salon-dashboard',
  component: SalonOwnerDashboardPage,
});

const salonsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/salons',
  component: SalonsPage,
});

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services',
  component: ServicesPage,
});

const stylistsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/team',
  component: StylistsPage,
});

const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/book',
  component: BookingPage,
});

const appointmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/appointments',
  component: MyAppointmentsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminSalonDashboardRoute,
  bookingManagementRoute,
  salonOwnerDashboardRoute,
  salonsRoute,
  servicesRoute,
  stylistsRoute,
  bookingRoute,
  appointmentsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
