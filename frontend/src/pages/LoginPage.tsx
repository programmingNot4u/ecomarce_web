import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LoginPage = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [isLoading, setIsLoading] = useState(false);

    // Timer State
    const [timer, setTimer] = useState(0);
    const [canResend, setCanResend] = useState(true);

    const { login, requestOtp } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 11) {
            alert("Please enter a valid mobile number");
            return;
        }
        await sendOtpCode();
    };

    const sendOtpCode = async () => {
        setIsLoading(true);
        const result: any = await requestOtp(phone);
        if (result.success) {
            if (result.directLogin) {
                // Determine redirect
                // If special redirect logic, add here
                navigate('/account');
            } else {
                setStep('otp');
                setTimer(120); // 2 mins
                setCanResend(false);
                setOtp(['', '', '', '', '', '']); // Reset OTP
            }
        } else {
            alert(result.error);
        }
        setIsLoading(false);
    }

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const otpString = otp.join('');
        const result = await login(phone, otpString);
        if (result.success) {
            navigate('/account');
        } else {
            alert(result.error);
        }
        setIsLoading(false);
    };

    const handleResend = () => {
        if (canResend) {
            sendOtpCode();
        }
    };

    const handleOtpChange = (index: number, val: string) => {
        if (/[^0-9]/.test(val)) return;
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);

        // Auto-focus next
        if (val && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    // Format timer
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        // Fixed overlay to ensure no scroll and full screen coverage regardless of Layout
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white md:bg-[#FAFAFA] overflow-hidden">
            {/* Close/Back Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 right-6 md:top-8 md:right-8 p-2 text-gray-400 hover:text-black transition-colors z-20"
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Main Card */}
            <div className="w-full h-full md:w-[95%] md:h-[90%] md:max-w-[1400px] md:max-h-[850px] bg-white md:shadow-2xl md:rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-gray-200/50 border border-gray-100/50">

                {/* Left Side: Aesthetic Visual */}
                <div className="hidden md:flex w-1/2 bg-[#F8F5F2] relative overflow-hidden items-center justify-center flex-col p-12 lg:p-20">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-[120px] opacity-40"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-[120px] opacity-40"></div>

                    <div className="z-10 text-center space-y-6 lg:space-y-8">
                        <div className="relative inline-block scale-90 lg:scale-100">
                            <div className="absolute inset-0 rounded-full border border-gray-900/10 animate-spin-slow" style={{ animationDuration: '30s' }}></div>
                            <div className="w-56 h-56 lg:w-64 lg:h-64 border-[1px] border-gray-900/5 rounded-full flex items-center justify-center p-10 backdrop-blur-sm bg-white/30 overflow-hidden">
                                {/* Replicating the circle logo feel */}
                                {theme.logo && theme.logo !== 'text' ? (
                                    <img src={theme.logo} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <h1 className="font-serif text-4xl lg:text-5xl font-bold tracking-widest text-gray-900">
                                        {theme.logo === 'text' ? 'BRAND' : 'LOGO'}
                                    </h1>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-500 tracking-[0.3em] text-xs lg:text-sm font-medium uppercase">Authentic Beauty</p>
                            <p className="text-gray-400 text-[10px] lg:text-xs tracking-widest font-light">EST. 2024</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Interaction */}
                <div className="w-full md:w-1/2 h-full flex items-center justify-center p-8 md:p-12 lg:p-20 bg-white relative">
                    <div className="w-full max-w-md space-y-8 lg:space-y-10">

                        <div className="text-center space-y-3">
                            <h2 className="text-3xl lg:text-4xl font-serif text-gray-900">
                                {step === 'phone' ? 'Welcome Back' : 'Verification'}
                            </h2>
                            <p className="text-gray-500 font-light text-base lg:text-lg">
                                {step === 'phone'
                                    ? 'Please enter your mobile number to continue'
                                    : <span>Code sent to <b className="text-gray-900 font-medium">{phone}</b></span>
                                }
                            </p>
                        </div>

                        <form onSubmit={step === 'phone' ? handlePhoneSubmit : handleOtpSubmit} className="space-y-8">

                            {step === 'phone' ? (
                                <div className="space-y-6">
                                    <div className="relative">
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Mobile Number
                                        </label>
                                        <div className="flex border-b-2 border-gray-200 focus-within:border-black transition-colors">
                                            <span className="flex items-center text-gray-500 font-light text-xl lg:text-2xl px-2">
                                                +880
                                            </span>
                                            <input
                                                type="tel"
                                                id="phone"
                                                className="block w-full text-xl lg:text-2xl text-gray-900 bg-transparent border-0 appearance-none focus:outline-none focus:ring-0 peer tracking-wider font-light py-3 px-2"
                                                placeholder="17XXXXXXXX"
                                                required
                                                value={phone}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, ''); // Only numbers
                                                    if (val.length <= 11) setPhone(val);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    <div className="flex justify-center gap-2 sm:gap-4">
                                        {otp.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                id={`otp-${idx}`}
                                                type="text"
                                                maxLength={1}
                                                className="w-10 h-14 sm:w-12 sm:h-16 lg:w-16 lg:h-20 text-center text-2xl lg:text-4xl border-b-2 border-gray-200 focus:border-black focus:outline-none bg-transparent font-light transition-all"
                                                value={digit}
                                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <button
                                            type="button"
                                            onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); }}
                                            className="text-gray-400 hover:text-black transition-colors"
                                        >
                                            ← Change Number
                                        </button>

                                        {canResend ? (
                                            <button
                                                type="button"
                                                onClick={handleResend}
                                                className="font-medium text-black underline decoration-1 underline-offset-4 hover:opacity-70 transition-opacity"
                                            >
                                                Resend Code
                                            </button>
                                        ) : (
                                            <span className="text-pink-500 font-medium bg-pink-50 px-3 py-1 rounded-full text-xs tracking-wide">
                                                Resend in {formatTime(timer)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gray-900 text-white py-4 lg:py-5 rounded-xl font-bold text-sm tracking-[0.2em] uppercase hover:bg-black transition-all hover:shadow-lg hover:shadow-gray-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            >
                                {isLoading ? (
                                    <span className="animate-pulse">Processing...</span>
                                ) : (
                                    step === 'phone' ? 'Continue' : 'Verify & Login'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
