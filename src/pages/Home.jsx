import Hero from '../components/Hero'
import SDGSection from '../components/SDGSection'
import Footer from '../components/Footer'

export default function Home() {
    return (
        <div className="min-h-screen pt-16">
            <Hero />
            <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold gradient-text mb-4">
                        ทำไมต้อง GreenLens AI?
                    </h2>
                    <p className="text-slate-600 text-lg mb-12">
                        เทคโนโลยี AI ที่ช่วยให้คุณสร้างผลกระทบด้านสิ่งแวดล้อมได้อย่างมีประสิทธิภาพ
                    </p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="glass-card p-6 rounded-xl hover:scale-105 transition-transform">
                            <div className="text-5xl mb-4">⚡</div>
                            <h3 className="text-xl font-bold mb-2">วิเคราะห์เร็ว</h3>
                            <p className="text-slate-600">ได้ผลรวดเร็ว</p>
                        </div>
                        <div className="glass-card p-6 rounded-xl hover:scale-105 transition-transform">
                            <div className="text-5xl mb-4">🎯</div>
                            <h3 className="text-xl font-bold mb-2">ครอบคลุมทั่วไทย</h3>
                            <p className="text-slate-600">รองรับ 77 จังหวัด</p>
                        </div>
                        <div className="glass-card p-6 rounded-xl hover:scale-105 transition-transform">
                            <div className="text-5xl mb-4">🔬</div>
                            <h3 className="text-xl font-bold mb-2">โมเดลประมาณการ</h3>
                            <p className="text-slate-600">สมมติฐานโปร่งใส ตรวจสอบได้</p>
                        </div>
                    </div>
                </div>
            </div>
            <SDGSection />
            <Footer />
        </div>
    )
}
