import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleLogin = async () => {
        try {
            await login();
            navigate('/');
        } catch (error) {
            console.error('Failed to log in', error);
            alert(`ล้มเหลวในการเข้าสู่ระบบด้วย Google: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-2xl">
                <div>
                    <div className="flex justify-center text-6xl mb-4">🌱</div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                        GreenLens AI
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        แพลตฟอร์มเทคโนโลยีสิ่งแวดล้อม
                    </p>
                </div>
                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleLogin}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-md"
                    >
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
