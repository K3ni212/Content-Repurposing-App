
import React, { useState } from 'react';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { GoogleIcon } from './icons/GoogleIcon';

interface LoginPageProps {
    onLogin: (email: string, password: string) => Promise<void>;
    onSignUp: (name: string, email: string, password: string) => Promise<void>;
    onGoogleLogin: () => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignUp, onGoogleLogin }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || isGoogleLoading) return;
        
        if (!email || !/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
            return;
        }

        setIsLoading(true);

        try {
            if (isSignUp) {
                if (password !== confirmPassword) {
                    alert("Passwords do not match!");
                    setIsLoading(false);
                    return;
                }
                await onSignUp(name, email, password);
            } else {
                await onLogin(email, password);
            }
        } catch (error) {
            setIsLoading(false);
        }
    };

    const handleGoogleClick = async () => {
        if (isLoading || isGoogleLoading) return;
        setIsGoogleLoading(true);
        try {
            await onGoogleLogin();
        } catch (error) {
            setIsGoogleLoading(false);
        }
    };
    
    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0B0C15] overflow-hidden transition-colors duration-500">
            {/* Aurora Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/30 rounded-full blur-[120px] animate-float"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/30 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-pink-500/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="relative w-full max-w-md p-8 space-y-8 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl animate-fade-in z-10">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-glow mb-6 animate-gradient bg-200%">
                        R
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{isSignUp ? 'Get started with your content journey.' : 'Sign in to continue to RepurposeAI'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {isSignUp && (
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="Your Name"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete={isSignUp ? "new-password" : "current-password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-500 dark:text-gray-400"
                        >
                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                     {isSignUp && (
                        <div className="relative">
                            <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-500 dark:text-gray-400"
                            >
                                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    )}
                    {!isSignUp && (
                        <div className="flex items-center justify-between">
                            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline">
                                Forgot your password?
                            </a>
                        </div>
                    )}
                    <div>
                        <button type="submit" disabled={isLoading || isGoogleLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 animate-gradient bg-200%">
                            {isLoading ? <SpinnerIcon className="w-6 h-6" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
                        </button>
                    </div>
                </form>

                <div className="relative flex items-center justify-center my-6">
                    <span className="absolute bg-white dark:bg-[#161822] px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Or continue with</span>
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>

                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={handleGoogleClick}
                        disabled={isLoading || isGoogleLoading}
                        className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-60"
                    >
                        {isGoogleLoading ? <SpinnerIcon className="w-5 h-5 mr-3" /> : <GoogleIcon className="w-5 h-5 mr-3" />}
                        Sign in with Google
                    </button>
                </div>
                
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isSignUp ? 'Already have an account? ' : 'Don\'t have an account? '}
                        <button onClick={() => setIsSignUp(!isSignUp)} className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline transition-colors">
                             {isSignUp ? 'Sign in' : 'Sign up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};