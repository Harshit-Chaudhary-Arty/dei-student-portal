import React, { useState } from 'react';
import { GraduationCap, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { loginStudent, checkUserExists, loginStaff } from '../services/authService';
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
  const [loginType, setLoginType] = useState('student'); // 'student' | 'staff'
  const [formData, setFormData] = useState({
    rollNo: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setError('');
    setSuccess('');
    setFormData({ rollNo: '', username: '', password: '' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (loginType === 'staff') {
        if (!formData.username || !formData.password) {
          setError('Please enter username and password');
          setLoading(false);
          return;
        }

        const result = await loginStaff({
          username: formData.username,
          password: formData.password
        });

        if (result.success) {
          localStorage.setItem('student', JSON.stringify(result.data));
          setSuccess('Login successful!');
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          setError(result.error || 'Invalid username or password');
        }
      } else {
        // Student login (existing flow)
        if (!formData.rollNo || !formData.password) {
          setError('Please enter roll number and password');
          setLoading(false);
          return;
        }

        const exists = await checkUserExists(formData.rollNo);
        if (!exists) {
          setError(
            <span>
              No account found. Please <Link to="/signup" className="underline hover:text-white font-medium">create an account</Link> first.
            </span>
          );
          setLoading(false);
          return;
        }

        const result = await loginStudent({
          rollNo: formData.rollNo,
          password: formData.password
        });

        if (result.success) {
          localStorage.setItem('student', JSON.stringify(result.data));
          setSuccess('Login successful!');
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          setError(result.error || 'Invalid roll number or password');
        }
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
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
              Select your account type to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Login Type Toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => handleLoginTypeChange('student')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  loginType === 'student'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleLoginTypeChange('staff')}
                className={`flex-1 py-2 text-sm font-medium transition-colors border-l border-border ${
                  loginType === 'staff'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                Staff
              </button>
            </div>

            {/* Alerts */}
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
              {loginType === 'student' ? (
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
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-foreground">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="staff username"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  />
                </div>
              )}

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
                disabled={loading || !!success}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? 'Signing in...' : (success ? 'Success!' : 'Sign In')}
              </Button>
            </div>
          </CardContent>

          {loginType === 'student' && (
            <CardFooter className="flex justify-center border-t border-border pt-6">
              <p className="text-xs text-muted-foreground">
                {`Don't have an account? `}
                <Link to="/signup" className="text-primary hover:underline transition-colors font-medium">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;