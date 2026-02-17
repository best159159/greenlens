import { useState, useEffect } from 'react'

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToSection = (id) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
            setIsMobileMenuOpen(false)
        }
    }

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'glass-card shadow-lg py-3'
                : 'bg-transparent py-4'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <button
                        onClick={() => scrollToSection('hero')}
                        className="flex items-center gap-3 group cursor-pointer"
                    >
                        <div className="text-3xl group-hover:scale-110 transition-transform">
                            🌱
                        </div>
                        <div>
                            <h1
                                className={`text-xl font-bold transition-colors ${isScrolled ? 'gradient-text' : 'text-white'
                                    }`}
                            >
                                GreenLens AI
                            </h1>
                            <p
                                className={`text-xs ${isScrolled ? 'text-slate-500' : 'text-white/80'
                                    }`}
                            >
                                Eco-Tech Platform
                            </p>
                        </div>
                    </button>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <button
                            onClick={() => scrollToSection('hero')}
                            className={`font-medium transition-colors hover:scale-105 transform ${isScrolled
                                ? 'text-slate-700 hover:text-eco-green-600'
                                : 'text-white hover:text-eco-green-200'
                                }`}
                        >
                            หน้าแรก
                        </button>
                        <button
                            onClick={() => scrollToSection('upload-section')}
                            className={`font-medium transition-colors hover:scale-105 transform ${isScrolled
                                ? 'text-slate-700 hover:text-eco-green-600'
                                : 'text-white hover:text-eco-green-200'
                                }`}
                        >
                            วิเคราะห์
                        </button>
                        <button
                            onClick={() => scrollToSection('features')}
                            className={`font-medium transition-colors hover:scale-105 transform ${isScrolled
                                ? 'text-slate-700 hover:text-eco-green-600'
                                : 'text-white hover:text-eco-green-200'
                                }`}
                        >
                            คุณสมบัติ
                        </button>
                        <button
                            onClick={() => scrollToSection('sdg-section')}
                            className={`font-medium transition-colors hover:scale-105 transform ${isScrolled
                                ? 'text-slate-700 hover:text-eco-green-600'
                                : 'text-white hover:text-eco-green-200'
                                }`}
                        >
                            SDG Impact
                        </button>
                        <button
                            onClick={() => scrollToSection('contact')}
                            className="bg-gradient-to-r from-eco-green-500 to-eco-blue-500 text-white px-6 py-2 rounded-full hover:from-eco-green-600 hover:to-eco-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            ติดต่อเรา
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled
                            ? 'text-slate-700 hover:bg-slate-100'
                            : 'text-white hover:bg-white/10'
                            }`}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMobileMenuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 space-y-3 animate-fade-in">
                        <button
                            onClick={() => scrollToSection('hero')}
                            className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${isScrolled
                                ? 'text-slate-700 hover:bg-eco-green-50'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            หน้าแรก
                        </button>
                        <button
                            onClick={() => scrollToSection('upload-section')}
                            className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${isScrolled
                                ? 'text-slate-700 hover:bg-eco-green-50'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            วิเคราะห์
                        </button>
                        <button
                            onClick={() => scrollToSection('features')}
                            className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${isScrolled
                                ? 'text-slate-700 hover:bg-eco-green-50'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            คุณสมบัติ
                        </button>
                        <button
                            onClick={() => scrollToSection('sdg-section')}
                            className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${isScrolled
                                ? 'text-slate-700 hover:bg-eco-green-50'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            SDG Impact
                        </button>
                        <button
                            onClick={() => scrollToSection('contact')}
                            className="block w-full bg-gradient-to-r from-eco-green-500 to-eco-blue-500 text-white px-4 py-2 rounded-lg hover:from-eco-green-600 hover:to-eco-blue-600 transition-all"
                        >
                            ติดต่อเรา
                        </button>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
