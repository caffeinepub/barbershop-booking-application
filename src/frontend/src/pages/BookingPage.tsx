import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import BookingForm from '../components/BookingForm';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function BookingPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Show loading state
  if (!isAuthenticated && isLoggingIn) {
    return (
      <div className="container-custom mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Login Required</CardTitle>
            <CardDescription>
              Please log in to book an appointment with your favorite salon
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <button
              onClick={login}
              disabled={isLoggingIn}
              className="px-8 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 font-semibold disabled:opacity-50"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while fetching profile
  if (profileLoading) {
    return (
      <div className="container-custom mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Show profile setup modal if user doesn't have a profile
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="container-custom mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-sans font-bold text-foreground mb-3">
          Book Your Appointment
        </h1>
        <p className="text-base text-muted-foreground">
          Find and book services from nearby salons with ease
        </p>
      </div>

      {showProfileSetup && <ProfileSetupModal />}
      {userProfile && <BookingForm />}
    </div>
  );
}
