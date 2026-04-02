const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-3 gap-12 mb-12">
                    {/* About Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-4xl">🌱</div>
                            <h3 className="text-2xl font-bold">TerraSense AI</h3>
                        </div>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            แพลตฟอร์มวิเคราะห์พื้นที่ด้วย AI เพื่อส่งเสริมการฟื้นฟูสิ่งแวดล้อม
                            และการปลูกต้นไม้อย่างยั่งยืน
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                                <span className="text-xl">📘</span>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                                <span className="text-xl">🐦</span>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                                <span className="text-xl">📸</span>
                            </a>
                        </div>
                    </div>

                    {/* Future Vision */}
                    <div>
                        <h4 className="text-xl font-bold mb-4">🚀 Future Vision</h4>
                        <ul className="space-y-3 text-slate-300">
                            <li className="flex items-start gap-2">
                                <span className="text-eco-green-400 mt-1">▸</span>
                                <span>ขยายฐานข้อมูล AI ให้ครอบคลุมพันธุ์ไม้กว่า 1,000 ชนิด</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-eco-green-400 mt-1">▸</span>
                                <span>เพิ่มระบบติดตามการเจริญเติบโตแบบ Real-time</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-eco-green-400 mt-1">▸</span>
                                <span>สร้าง Community สำหรับแลกเปลี่ยนประสบการณ์</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-eco-green-400 mt-1">▸</span>
                                <span>พัฒนา Mobile App สำหรับการใช้งานในพื้นที่จริง</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xl font-bold mb-4">📬 ติดต่อเรา</h4>
                        <div className="space-y-4 text-slate-300">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">📧</span>
                                <div>
                                    <p className="font-medium text-white">Email</p>
                                    <a
                                        href="mailto:contact@terrasense.ai"
                                        className="hover:text-eco-green-400 transition-colors"
                                    >
                                        contact@terrasense.ai
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-xl">💬</span>
                                <div>
                                    <p className="font-medium text-white">Discord Community</p>
                                    <a
                                        href="#"
                                        className="hover:text-eco-green-400 transition-colors"
                                    >
                                        เข้าร่วมชุมชน
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-xl">📚</span>
                                <div>
                                    <p className="font-medium text-white">Documentation</p>
                                    <a
                                        href="#"
                                        className="hover:text-eco-green-400 transition-colors"
                                    >
                                        คู่มือการใช้งาน
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="border-t border-slate-700 pt-8 mb-8">
                    <h4 className="text-center text-sm font-semibold text-slate-400 mb-4">
                        POWERED BY
                    </h4>
                    <div className="flex flex-wrap justify-center gap-6 text-slate-400 text-sm">
                        <span className="bg-slate-700/50 px-4 py-2 rounded-lg">React</span>
                        <span className="bg-slate-700/50 px-4 py-2 rounded-lg">Vite</span>
                        <span className="bg-slate-700/50 px-4 py-2 rounded-lg">Tailwind CSS</span>
                        <span className="bg-slate-700/50 px-4 py-2 rounded-lg">Chart.js</span>
                        <span className="bg-slate-700/50 px-4 py-2 rounded-lg">Google Gemini AI</span>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-slate-700 pt-8 text-center text-slate-400 text-sm">
                    <p>
                        © {currentYear} TerraSense AI. All rights reserved. •{' '}
                        <a href="#" className="hover:text-eco-green-400 transition-colors">
                            Privacy Policy
                        </a>{' '}
                        •{' '}
                        <a href="#" className="hover:text-eco-green-400 transition-colors">
                            Terms of Service
                        </a>
                    </p>
                    <p className="mt-2 text-slate-500">
                        Made with 💚 for a greener future
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
