import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Shield, Mail, Key, UserPlus, CheckCircle, RefreshCw } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.roles.includes('ROLE_ADMIN')) navigate('/admin');
      else if (user.roles.includes('ROLE_WAREHOUSE_MANAGER')) navigate('/warehouse');
      else if (user.roles.includes('ROLE_SUPPLIER')) navigate('/supplier');
      else navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="glass max-w-md w-full p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-purple-500/10 rounded-full text-purple-400">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Access Portal</h2>
          <p className="text-sm text-slate-400">Sign in to manage your orders or inventory</p>
        </div>

        {error && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="you@enterprise.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-semibold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300">Forgot?</Link>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/20 transition flex justify-center items-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Authenticate Session'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Need a customer account? <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER'); // Default CUSTOMER
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = {
        email,
        password,
        role,
        firstName: role === 'CUSTOMER' ? firstName : undefined,
        lastName: role === 'CUSTOMER' ? lastName : undefined,
        phone: role === 'CUSTOMER' ? phone : undefined,
        address: role === 'CUSTOMER' ? address : undefined,
      };
      const res = await API.post('/auth/register', payload);
      setSuccess(res.data.message || 'Registration successful! Verification required.');
      setTimeout(() => navigate('/login'), 6000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="glass max-w-xl w-full p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-purple-500/10 rounded-full text-purple-400">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Create Credentials</h2>
          <p className="text-sm text-slate-400">Join our enterprise supply chain platform</p>
        </div>

        {error && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm p-3 rounded-lg text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="name@domain.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="Min 6 characters"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Assign User Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="CUSTOMER">Customer (Retail Portal)</option>
              <option value="WAREHOUSE_MANAGER">Warehouse Manager (Stock & Logistics)</option>
              <option value="SUPPLIER">Supplier (Procurement Procurement)</option>
              <option value="ADMIN">Administrator (Full Dashboard Access)</option>
            </select>
          </div>

          {role === 'CUSTOMER' && (
            <div className="space-y-4 border-t border-slate-800 pt-4">
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Customer Profile Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                    placeholder="+1 555-0199"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">Shipping Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                    placeholder="123 Retail Lane, NY"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/20 transition flex justify-center items-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Register Credentials'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Already registered? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email token address...');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('Missing token validation query parameter.');
        return;
      }
      try {
        const res = await API.get(`/auth/verify?token=${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Email successfully verified! Redirecting to login.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification token is invalid or expired.');
      }
    };
    verifyToken();
  }, [searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass max-w-md w-full p-8 rounded-2xl shadow-2xl text-center space-y-4">
        <h2 className="text-2xl font-bold">Email Verification</h2>
        <p className={`p-4 rounded-lg font-medium ${
          status === 'verifying' ? 'bg-slate-800 text-slate-300' :
          status === 'success' ? 'bg-emerald-500/15 text-emerald-400' :
          'bg-rose-500/15 text-rose-400'
        }`}>
          {message}
        </p>
        {status !== 'verifying' && (
          <Link to="/login" className="inline-block mt-4 text-purple-400 hover:underline">Go to Login page &rarr;</Link>
        )}
      </div>
    </div>
  );
};

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email });
      setSuccess(res.data.message || 'Password reset link sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error occurred. Please verify email exists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass max-w-md w-full p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">Forgot Password</h2>
          <p className="text-sm text-slate-400 mt-2">Request password reset token</p>
        </div>

        {error && <div className="bg-rose-500/15 text-rose-400 p-3 rounded-lg text-sm text-center">{error}</div>}
        {success && <div className="bg-emerald-500/15 text-emerald-400 p-3 rounded-lg text-sm text-center">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
              placeholder="you@domain.com"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 font-bold rounded-lg transition">
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const token = searchParams.get('token');
    if (!token) {
      setError('Reset token is missing.');
      setLoading(false);
      return;
    }
    try {
      const res = await API.post('/auth/reset-password', {
        token,
        newPassword: password,
      });
      setSuccess(res.data.message || 'Password reset successfully! Redirecting to login.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Token may be invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass max-w-md w-full p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">New Password</h2>
          <p className="text-sm text-slate-400 mt-2">Enter your new credential settings</p>
        </div>

        {error && <div className="bg-rose-500/15 text-rose-400 p-3 rounded-lg text-sm text-center">{error}</div>}
        {success && <div className="bg-emerald-500/15 text-emerald-400 p-3 rounded-lg text-sm text-center">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
              placeholder="Min 6 characters"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 font-bold rounded-lg transition">
            {loading ? 'Saving password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
