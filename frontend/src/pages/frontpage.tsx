import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { getCurrentUser, getPlans, createPlan, logout } from '../services/api';
import type { User, Plan } from '../types';

export function Frontpage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanStartDate, setNewPlanStartDate] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUserAndPlans();
  }, []);

  const loadUserAndPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load current user
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      // Load plans
      const userPlans = await getPlans();
      setPlans(userPlans);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = '/auth/google';
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setPlans([]);
      // Reload to get new session
      window.location.reload();
    } catch (err) {
      setError('Failed to logout. Please try again.');
      console.error('Error logging out:', err);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlanName.trim() || !newPlanStartDate) {
      return;
    }

    try {
      setCreating(true);
      setError(null);
      const plan = await createPlan(newPlanName, newPlanStartDate);
      setPlans([...plans, plan]);
      setCreateDialogOpen(false);
      setNewPlanName('');
      setNewPlanStartDate('');
      
      // Navigate to the new plan
      if (plan.id) {
        navigate(`/plan/${plan.id}`);
      }
    } catch (err) {
      setError('Failed to create plan. Please try again.');
      console.error('Error creating plan:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenPlan = (planId: number) => {
    navigate(`/plan/${planId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Cashplan.io
          </Typography>
          <Typography variant="h5" component="h2" color="text.secondary" sx={{ mb: 4 }}>
            Plan your financial future with confidence
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Track incomes, expenses, mortgages, and loans. Visualize your liquidity and assets over 5-20 years
            with interactive charts.
          </Typography>
          
          {/* Auth Section */}
          <Box sx={{ mb: 4 }}>
            {user && user.isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Typography variant="body1">
                  Logged in as <strong>{user.email}</strong>
                </Typography>
                <Button variant="outlined" size="small" onClick={handleLogout}>
                  Logout
                </Button>
              </Box>
            ) : (
              <Box>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGoogleLogin}
                  sx={{ mb: 2 }}
                >
                  Sign in with Google
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Or continue without signing in
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Plans Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h3">
              Your Plans
            </Typography>
            <Button
              variant="contained"
              onClick={() => setCreateDialogOpen(true)}
            >
              + Create New Plan
            </Button>
          </Box>

          {/* Plans List */}
          {plans.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No plans yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first financial plan to get started
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  + Create Your First Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
              }}
            >
              {plans.map((plan) => (
                <Card key={plan.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h4" gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start Date: {new Date(plan.startDate).toLocaleDateString()}
                    </Typography>
                    {plan.createdAt && (
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(plan.createdAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      onClick={() => handleOpenPlan(plan.id!)}
                    >
                      Open Plan
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* Create Plan Dialog */}
        <Dialog open={createDialogOpen} onClose={() => !creating && setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Plan</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Plan Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              disabled={creating}
              placeholder="e.g., My 10-Year Financial Plan"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Start Date"
              type="date"
              fullWidth
              variant="outlined"
              value={newPlanStartDate}
              onChange={(e) => setNewPlanStartDate(e.target.value)}
              disabled={creating}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlan}
              variant="contained"
              disabled={!newPlanName.trim() || !newPlanStartDate || creating}
            >
              {creating ? <CircularProgress size={24} /> : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

