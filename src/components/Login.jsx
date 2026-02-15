import React, { useState } from 'react';
import { GraduationCap, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { loginStudent } from '../services/authService';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    branch: '',
    year: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const branches = [
    'Mechanical Engineering',
    'Electrical Engineering',
    'Footwear Technology',
    'Agriculture Engineering',
    'Civil Engineering'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user types
    if (error) setError('');
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.rollNo || !formData.password) {
      setError('Please enter roll number and password');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await loginStudent({
        rollNo: formData.rollNo,
        password: formData.password
      });

      if (result.success) {
        // Store student data in localStorage
        localStorage.setItem('student', JSON.stringify(result.data));

        setSuccess('Login successful!');

        // Redirect to dashboard after a short delay to show success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (error) {
      setError('An error occurred during login');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-secondary rounded-xl flex items-center justify-center border border-input">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your student portal
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Login</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your roll number and password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/15 border border-destructive/50 p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  <div className="text-sm text-destructive">{error}</div>
                </div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-primary/10 border border-primary/50 p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <div className="text-sm text-primary">{success}</div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rollNo" className="text-foreground">Roll Number</Label>
                <Input
                  id="rollNo"
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleChange}
                  placeholder="12345"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading || success}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? 'Signing in...' : (success ? 'Success!' : 'Sign In')}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              {`Don't have an account? `}
              <Link to="/signup" className="text-primary hover:underline transition-colors font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;