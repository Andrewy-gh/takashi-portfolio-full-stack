import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth';

export const Route = createFileRoute('/unauthorized')({
  component: RouteComponent,
});

function RouteComponent() {
  const { meta, actions } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    actions.signOut();
    navigate({ to: '/sign-in' });
  };
  return (
    <div className="mt-24">
      <section className="flex items-center justify-center">
        <div className="flex max-w-md flex-col items-center justify-center gap-8 text-center">
          <div className="flex flex-col items-center justify-center">
            {/* <XCircle className="h-16 w-16 text-red-500" /> */}X
            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Access Forbidden
            </h1>
          </div>
          <p className="text-lg">
            Your account does not have sufficient permissions. Please log in
            with an account with appropriate permissions.
          </p>
          <div className="flex items-center">
            {meta.isSignedIn ? (
              <Button variant="outline" onClick={handleSignOut}>
                Sign out
              </Button>
            ) : (
              <Button asChild>
                <Link to="/sign-in">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
