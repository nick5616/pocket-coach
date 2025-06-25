import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import DemoBanner from "@/components/demo-banner";
import LoadingScreen from "@/components/loading-screen";

export default function DemoPage() {
  const [, setLocation] = useLocation();
  const [isInIframe, setIsInIframe] = useState(false);

  // Detect if running in iframe
  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  // Auto-login with demo account
  const demoLoginMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting demo login...');
      const response = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
      });
      
      console.log('Demo login response status:', response.status);
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Demo login failed with:', errorText);
        throw new Error('Demo login failed');
      }
      
      if (!contentType?.includes('application/json')) {
        console.error('Expected JSON response but got:', contentType);
        throw new Error('Invalid response format');
      }
      
      const result = await response.json();
      console.log('Demo login successful:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Demo login successful:', data);
      setLoginComplete(true);
      // Invalidate auth query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Redirect after successful login
      setTimeout(() => {
        setLocation("/");
      }, 500);
    },
    onError: (error) => {
      console.error('Demo login failed:', error);
    },
  });

  // Check if already authenticated with error handling for 401
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: true,
    retry: false,
  });

  useEffect(() => {
    if (!isLoading) {
      if (user && !error) {
        // Already logged in, redirect to home
        console.log('Demo user authenticated, redirecting to home');
        setLocation("/");
      } else if (!hasTriedLogin && !demoLoginMutation.isPending) {
        // Not logged in and haven't tried demo login yet
        console.log('Starting demo login process');
        setHasTriedLogin(true);
        demoLoginMutation.mutate();
      }
    }
  }, [user, isLoading, error, hasTriedLogin, demoLoginMutation.isPending]);

  if (isLoading || demoLoginMutation.isPending || loginComplete) {
    return (
      <div>
        <DemoBanner />
        <LoadingScreen message={loginComplete ? "Demo ready! Loading app..." : "Setting up your demo experience..."} />
      </div>
    );
  }

  if (demoLoginMutation.isError) {
    return (
      <div>
        <DemoBanner />
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          maxWidth: '500px',
          margin: '2rem auto'
        }}>
          <h2>Demo Unavailable</h2>
          <p>The demo mode is currently unavailable. Please try opening the app in a new tab for the full experience.</p>
          <button 
            onClick={() => window.open(window.location.origin, '_blank')}
            style={{
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Open Full App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DemoBanner />
      <LoadingScreen message="Loading demo..." />
    </div>
  );
}