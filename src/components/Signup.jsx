import React, { useState } from 'react';
import { GraduationCap, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signupStudent } from '../services/authService';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    branch: '',
    year: '',
    password: '',
    confirmPassword: ''
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.name ||
      !formData.rollNo ||
      !formData.branch ||
      !formData.year ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Please fill all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signupStudent({
        name: formData.name,
        rollNo: formData.rollNo,
        branch: formData.branch,
        year: formData.year,
        password: formData.password
      });

      if (result.success) {
        setSuccess(result.message || 'Account created successfully!');
        // Redirect to login page
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (error) {
      setError('An error occurred during signup');
      console.error('Signup error:', error);
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
            Create an account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start your journey with us
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Sign Up</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your details to create an account
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
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rollNo" className="text-foreground">Roll Number</Label>
                <Input
                  id="rollNo"
                  type="text"
                  name="rollNo"
                  placeholder="123456"
                  value={formData.rollNo}
                  onChange={handleChange}
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Branch</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                    <SelectTrigger className="bg-background border-input text-foreground focus:ring-primary">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-input text-foreground">
                      {branches.map(b => (
                        <SelectItem key={b} value={b} className="focus:bg-muted focus:text-foreground cursor-pointer">{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Year</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, year: value })}>
                    <SelectTrigger className="bg-background border-input text-foreground focus:ring-primary">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-input text-foreground">
                      {years.map(y => (
                        <SelectItem key={y} value={y} className="focus:bg-muted focus:text-foreground cursor-pointer">{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? 'Creating Account...' : 'Sign up'}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              {`Already have an account? `}
              <Link to="/" className="text-primary hover:underline transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;