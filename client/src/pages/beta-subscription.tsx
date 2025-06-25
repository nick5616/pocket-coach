import { useState, useEffect } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import LoadingScreen from '../components/loading-screen';
import styles from './beta-subscription.module.css';

// Load Stripe with error handling
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : Promise.resolve(null);

const BetaSubscriptionForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setMessage(error.message || 'Payment failed');
    } else {
      setMessage('Payment successful! Welcome to beta access!');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <PaymentElement />
      {message && (
        <div className={`${styles.message} ${message.includes('successful') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}
      <Button 
        type="submit" 
        disabled={!stripe || !elements || isProcessing}
        className={styles.submitButton}
      >
        {isProcessing ? 'Processing...' : 'Subscribe for $2.99/month'}
      </Button>
    </form>
  );
};

export default function BetaSubscription() {
  const [clientSecret, setClientSecret] = useState('');
  const queryClient = useQueryClient();

  // Check subscription status
  const { data: subscriptionStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/subscription/status'],
    retry: false
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/subscription/create-beta-subscription'),
    onSuccess: async (response) => {
      const data = await response.json();
      setClientSecret(data.clientSecret);
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
    }
  });

  useEffect(() => {
    if (subscriptionStatus?.hasAccess) {
      // User already has access, redirect to dashboard
      window.location.href = '/dashboard';
    } else if (!clientSecret && !createSubscriptionMutation.isPending) {
      // Start subscription creation process
      createSubscriptionMutation.mutate();
    }
  }, [subscriptionStatus, clientSecret, createSubscriptionMutation]);

  if (statusLoading) {
    return <LoadingScreen message="Checking subscription status..." />;
  }

  if (subscriptionStatus?.hasAccess) {
    return (
      <div className={styles.container}>
        <Card className={styles.accessCard}>
          <CardHeader>
            <CardTitle>You Already Have Access!</CardTitle>
            <CardDescription>
              {subscriptionStatus.reason}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (createSubscriptionMutation.isError) {
    return (
      <div className={styles.container}>
        <Card className={styles.errorCard}>
          <CardHeader>
            <CardTitle>Subscription Error</CardTitle>
            <CardDescription>
              Unable to set up subscription. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => createSubscriptionMutation.mutate()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return <LoadingScreen message="Setting up your subscription..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Join the Beta</h1>
        <p className={styles.subtitle}>
          Get early access to all premium features at an exclusive beta price
        </p>
      </div>

      <div className={styles.pricing}>
        <Card className={styles.pricingCard}>
          <CardHeader>
            <CardTitle className={styles.pricingTitle}>
              Beta Access
              <span className={styles.badge}>Limited Time</span>
            </CardTitle>
            <div className={styles.price}>
              <span className={styles.amount}>$2.99</span>
              <span className={styles.period}>/month</span>
            </div>
            <CardDescription>
              70% off future pricing - lock it in forever
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className={styles.features}>
              <li>✓ AI-powered workout programs</li>
              <li>✓ Interactive body heat mapping</li>
              <li>✓ Advanced progress analytics</li>
              <li>✓ Exercise swapping & recommendations</li>
              <li>✓ Achievement system</li>
              <li>✓ Priority feedback & feature requests</li>
              <li>✓ Founding member badge</li>
              <li>✓ Grandfathered pricing forever</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className={styles.paymentCard}>
        <CardHeader>
          <CardTitle>Complete Your Subscription</CardTitle>
          <CardDescription>
            Join the first 500 beta users and help shape the future of fitness tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <BetaSubscriptionForm clientSecret={clientSecret} />
          </Elements>
        </CardContent>
      </Card>

      <div className={styles.testimonials}>
        <h3>What Beta Users Are Saying</h3>
        <div className={styles.testimonialGrid}>
          <div className={styles.testimonial}>
            <p>"The AI program generation is incredible - it's like having a personal trainer who knows exactly what I need."</p>
            <cite>- Early Beta User</cite>
          </div>
          <div className={styles.testimonial}>
            <p>"The body heat map visualization completely changed how I approach my workouts. I can see exactly what I'm missing."</p>
            <cite>- Fitness Enthusiast</cite>
          </div>
        </div>
      </div>
    </div>
  );
}