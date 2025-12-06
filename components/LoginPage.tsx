
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
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || isGoogleLoading) return;
        
        if (!email || !/(.+)@(.+){2,}\.(.+){2,}/.test(email)) return;

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

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#0B0C15] font-sans selection:bg-indigo-500 selection:text-white">
            
            {/* Left Side - Form Container */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-none lg:w-[480px] xl:w-[550px] flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 relative z-10 bg-white/80 dark:bg-[#0B0C15]/80 backdrop-blur-xl border-r border-gray-200 dark:border-white/5">
                
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            R
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">RepurposeAI</h1>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        {isSignUp ? 'Start automating your content workflow today.' : 'Enter your details to access your workspace.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {isSignUp && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                                placeholder="Alex Doe"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder="alex@company.com"
                            required
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            {showPassword ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                    {isSignUp && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Confirm Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || isGoogleLoading}
                        className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isLoading && <SpinnerIcon className="w-5 h-5" />}
                        {isSignUp ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-white/10"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-3 bg-gray-50 dark:bg-[#0B0C15] text-gray-500">Or continue with</span></div>
                </div>

                <button
                    onClick={() => { if (!isGoogleLoading && !isLoading) { setIsGoogleLoading(true); onGoogleLogin().catch(() => setIsGoogleLoading(false)); }}}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full py-3.5 px-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex justify-center items-center gap-3"
                >
                    {isGoogleLoading ? <SpinnerIcon className="w-5 h-5" /> : <GoogleIcon className="w-5 h-5" />}
                    Sign in with Google
                </button>

                <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {isSignUp ? 'Already have an account? ' : 'Don\'t have an account? '}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                        {isSignUp ? 'Sign in' : 'Sign up for free'}
                    </button>
                </p>
            </div>

            {/* Right Side - Artistic Background */}
            <div className="hidden lg:block flex-1 relative overflow-hidden bg-white dark:bg-black">
                {/* Abstract Blobs */}
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-500/30 rounded-full blur-[120px] animate-float"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500/30 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[40%] right-[30%] w-[40%] h-[40%] bg-pink-500/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '4s' }}></div>
                
                {/* Overlay Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                
                {/* Central Visual */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[500px] h-[600px] glass-panel bg-white/10 dark:bg-white/5 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-md p-8 transform rotate-3 hover:rotate-0 transition-transform duration-700 ease-out flex flex-col">
                        <div className="flex-1 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-white/10 relative overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500 rounded-full blur-[50px] animate-pulse"></div>
                        </div>
                        <div className="mt-6">
                            <div className="h-4 w-2/3 bg-white/20 rounded-full mb-3"></div>
                            <div className="h-4 w-1/2 bg-white/10 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
