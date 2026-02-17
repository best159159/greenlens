const Hero = () => {
    const scrollToUpload = () => {
        document.getElementById('upload-section').scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
            {/* Video Background */}
            <div className="absolute inset-0 w-full h-full">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-60"
                >
                    <source src="/video/1.mp4" type="video/mp4" />
                </video>
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-8 inline-block">
                    <div className="text-8xl animate-bounce-slow">🌱</div>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                    GreenLens AI
                </h1>

                <p className="text-xl sm:text-2xl text-white/90 mb-4 max-w-3xl mx-auto font-light">
                    วิเคราะห์พื้นที่ด้วย AI เพื่อแนะนำการฟื้นฟูสิ่งแวดล้อม
                </p>

                <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
                    ใช้เทคโนโลยีปัญญาประดิษฐ์วิเคราะห์สภาพพื้นที่ แนะนำพันธุ์ไม้ที่เหมาะสม
                    และคาดการณ์ผลกระทบต่อสิ่งแวดล้อม
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={scrollToUpload}
                        className="btn-primary group"
                    >
                        เริ่มวิเคราะห์
                        <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                    </button>

                    <button className="btn-secondary">
                        เรียนรู้เพิ่มเติม
                    </button>
                </div>

                {/* Stats */}
                <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">10K+</div>
                        <div className="text-white/80 text-sm">พื้นที่วิเคราะห์</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">95%</div>
                        <div className="text-white/80 text-sm">ความแม่นยำ</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">50K</div>
                        <div className="text-white/80 text-sm">ต้นไม้แนะนำ</div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}

export default Hero
