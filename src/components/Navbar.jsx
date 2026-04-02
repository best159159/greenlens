import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { currentUser, logout } = useAuth()

    // We only want the navbar transparent on the home page when at top
    const isHome = location.pathname === '/'
    // If not on home, force "scrolled" style so we have a background
    const navStyleScrolled = isScrolled || !isHome

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
            setIsMobileMenuOpen(false)
        } catch (error) {
            console.error('Failed to log out', error)
        }
    }

    const navLinks = currentUser ? [
        { name: 'Dashboard', path: '/' },
        { name: 'Analyze', path: '/analyze' },
        { name: 'History', path: '/history' },
        { name: 'Campaign', path: '/campaign' },
    ] : [
        // Optional links for non-logged in users
        { name: 'Dashboard', path: '/' },
    ]

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navStyleScrolled
                ? 'glass-card shadow-lg py-3'
                : 'bg-transparent py-4'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 group cursor-pointer"
                    >
                        <div className="text-3xl group-hover:scale-110 transition-transform">
                            🌱
                        </div>
                        <div>
                            <h1
                                className={`text-xl font-bold transition-colors ${navStyleScrolled ? 'gradient-text' : 'text-white'
                                    }`}
                            >
                                TerraSense AI
                            </h1>
                            <p
                                className={`text-xs ${navStyleScrolled ? 'text-slate-500' : 'text-white/80'
                                    }`}
                            >
                                Eco-Tech Platform
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`font-medium transition-colors hover:scale-105 transform ${navStyleScrolled
                                    ? 'text-slate-700 hover:text-eco-green-600'
                                    : 'text-white hover:text-eco-green-200'
                                    } ${location.pathname.startsWith(link.path) && link.path !== '/' ? 'text-eco-green-600 font-bold' : ''}`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {currentUser ? (
                            <div className="flex items-center gap-4 ml-4">
                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" />
                                    ) : (
                                        <div className="w-6 h-6 bg-eco-green-500 text-white rounded-full flex items-center justify-center text-xs">
                                            {currentUser.email?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-slate-700">{currentUser.displayName?.split(' ')[0] || 'User'}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-red-500 hover:text-red-600 font-medium transition-colors text-sm border border-red-200 px-4 py-1.5 rounded-full hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-gradient-to-r from-eco-green-500 to-eco-blue-500 text-white px-6 py-2 rounded-full hover:from-eco-green-600 hover:to-eco-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                เข้าสู่ระบบ / Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`md:hidden p-2 rounded-lg transition-colors ${navStyleScrolled
                            ? 'text-slate-700 hover:bg-slate-100'
                            : 'text-white hover:bg-white/10'
                            }`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 space-y-3 animate-fade-in bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-100">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block w-full text-left px-4 py-2 rounded-lg transition-colors text-slate-700 hover:bg-eco-green-50 ${location.pathname.startsWith(link.path) && link.path !== '/' ? 'bg-eco-green-50 font-bold text-eco-green-700' : ''}`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {currentUser ? (
                            <div className="pt-2 border-t border-slate-100 mt-2 space-y-3">
                                <div className="flex items-center gap-3 px-4 py-2">
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <div className="w-8 h-8 bg-eco-green-500 text-white rounded-full flex items-center justify-center text-sm">
                                            {currentUser.email?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="font-medium text-slate-700">{currentUser.displayName || currentUser.email}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-center bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-all font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block w-full text-center bg-gradient-to-r from-eco-green-500 to-eco-blue-500 text-white px-4 py-2 rounded-lg hover:from-eco-green-600 hover:to-eco-blue-600 transition-all shadow-md"
                            >
                                เข้าสู่ระบบ / Sign In
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
