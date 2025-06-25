import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import LoadingScreen from '../components/loading-screen';
import styles from './admin.module.css';

export default function Admin() {
  const [targetUserId, setTargetUserId] = useState('');
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  // Check if current user is admin (simple check for demo)
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user']
  });

  const isAdmin = user?.email?.includes('admin') || user?.email === 'demo@pocketcoach.app';

  // Get admin actions log
  const { data: adminActions, isLoading } = useQuery({
    queryKey: ['/api/admin/actions'],
    enabled: isAdmin
  });

  // Grant free access mutation
  const grantAccessMutation = useMutation({
    mutationFn: (data: { targetUserId: string; reason: string }) => 
      apiRequest('POST', '/api/admin/grant-free-access', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/actions'] });
      setTargetUserId('');
      setReason('');
      alert('Free access granted successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.message || 'Failed to grant access'}`);
    }
  });

  const handleGrantAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId.trim() || !reason.trim()) {
      alert('Please provide both User ID and reason');
      return;
    }
    grantAccessMutation.mutate({ targetUserId: targetUserId.trim(), reason: reason.trim() });
  };

  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <Card className={styles.errorCard}>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingScreen message="Loading admin panel..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Admin Panel</h1>
        <p>Manage user access and monitor beta subscriptions</p>
      </div>

      <Card className={styles.grantAccessCard}>
        <CardHeader>
          <CardTitle>Grant Free Premium Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGrantAccess} className={styles.grantForm}>
            <div className={styles.formGroup}>
              <label htmlFor="userId">User ID or Email</label>
              <Input
                id="userId"
                type="text"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="Enter user ID or email"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="reason">Reason for Free Access</label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Beta tester, Feedback provider, Influencer partnership"
                required
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              disabled={grantAccessMutation.isPending}
              className={styles.grantButton}
            >
              {grantAccessMutation.isPending ? 'Granting...' : 'Grant Free Access'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className={styles.actionsCard}>
        <CardHeader>
          <CardTitle>Recent Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {adminActions && adminActions.length > 0 ? (
            <div className={styles.actionsList}>
              {adminActions.map((action: any) => (
                <div key={action.id} className={styles.actionItem}>
                  <div className={styles.actionHeader}>
                    <span className={styles.actionType}>
                      {action.action.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={styles.actionDate}>
                      {new Date(action.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.actionDetails}>
                    <p><strong>Target:</strong> {action.targetUserId}</p>
                    <p><strong>Admin:</strong> {action.adminUserId}</p>
                    {action.reason && <p><strong>Reason:</strong> {action.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noActions}>No admin actions recorded yet</p>
          )}
        </CardContent>
      </Card>

      <Card className={styles.instructionsCard}>
        <CardHeader>
          <CardTitle>Quick Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.instructions}>
            <h4>Granting Free Access:</h4>
            <ul>
              <li>Enter the user's email address or user ID</li>
              <li>Provide a clear reason (helps with tracking and accountability)</li>
              <li>User will immediately get full premium features</li>
              <li>Access is permanent until manually revoked</li>
            </ul>
            
            <h4>Common Reasons:</h4>
            <ul>
              <li>"Beta tester providing valuable feedback"</li>
              <li>"Content creator partnership"</li>
              <li>"Early adopter reward"</li>
              <li>"Bug reporter compensation"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}