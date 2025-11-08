
import React, { useState } from 'react';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface LoginPageProps {
    onLogin: (email: string, password: string) => Promise<void>;
    onSignUp: (name: string, email: string, password: string) => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignUp }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        
        if (!email || !/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
            // Parent component will show a more specific toast
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
            // On a successful login or sign-up, this component will unmount,
            // so we don't need to reset the loading state here.
        } catch (error) {
            // The parent function (onLogin/onSignUp) already showed a toast for the error.
            // We just need to reset the loading state to allow the user to try again.
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg animate-fade-in">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h1>
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
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                            <a href="#" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                                Forgot your password?
                            </a>
                        </div>
                    )}
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors">
                            {isLoading ? <SpinnerIcon className="w-6 h-6" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isSignUp ? 'Already have an account? ' : 'Don\'t have an account? '}
                        <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                             {isSignUp ? 'Sign in' : 'Sign up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
