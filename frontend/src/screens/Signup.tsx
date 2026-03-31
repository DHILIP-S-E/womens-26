import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { motion } from 'framer-motion';

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', username: '', password: '', firstName: '', lastName: '', dateOfBirth: '', phoneNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = 'Email is required';
    if (!form.username || form.username.length < 3) errs.username = 'Username must be at least 3 characters';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Password must contain an uppercase letter';
    else if (!/\d/.test(form.password)) errs.password = 'Password must contain a number';
    if (!form.firstName) errs.firstName = 'First name is required';
    if (!form.lastName) errs.lastName = 'Last name is required';
    if (!form.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setServerError('');
    setLoading(true);
    try {
      await signup({ ...form, phoneNumber: form.phoneNumber || undefined });
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-lg"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--primary))]">
            <span className="text-xl font-bold text-white">H</span>
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--card-foreground))]">Create your account</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Start tracking your health journey</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={form.firstName} onChange={update('firstName')} error={errors.firstName} required />
            <Input label="Last name" value={form.lastName} onChange={update('lastName')} error={errors.lastName} required />
          </div>
          <Input label="Username" value={form.username} onChange={update('username')} error={errors.username} required />
          <Input label="Email" type="email" value={form.email} onChange={update('email')} error={errors.email} required />
          <Input label="Password" type="password" value={form.password} onChange={update('password')} error={errors.password} required />
          <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={update('dateOfBirth')} error={errors.dateOfBirth} required />
          <Input label="Phone number (optional)" type="tel" value={form.phoneNumber} onChange={update('phoneNumber')} />
          <Button type="submit" isLoading={loading} className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[hsl(var(--primary))] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
