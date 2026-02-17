import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import UploadSection from './components/UploadSection'
import Dashboard from './components/Dashboard'
import Recommendation from './components/Recommendation'
import SDGSection from './components/SDGSection'
import Footer from './components/Footer'

function App() {
    const [analysisResult, setAnalysisResult] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const handleAnalysis = async (imageFile, province) => {
        setIsAnalyzing(true)
        setAnalysisResult(null)

        try {
            const formData = new FormData()
            formData.append('file', imageFile)
            formData.append('province', province)

            const isDev = import.meta.env.DEV
            const apiUrl = isDev
                ? 'http://localhost:8000/analyze'
                : (import.meta.env.VITE_API_URL || '/api/analyze')

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const text = await response.text()
                try {
                    const errorData = JSON.parse(text)
                    throw new Error(errorData.detail || 'Analysis failed')
                } catch {
                    throw new Error(`Server Error (${response.status}): ${text.substring(0, 100)}`)
                }
            }

            const result = await response.json()
            setAnalysisResult(result)

            // Scroll to results
            setTimeout(() => {
                const dashboard = document.getElementById('dashboard-results')
                if (dashboard) {
                    dashboard.scrollIntoView({ behavior: 'smooth' })
                }
            }, 100)

        } catch (error) {
            console.error('Error analyzing image:', error)
            alert('เกิดข้อผิดพลาดในการวิเคราะห์: ' + error.message)
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            <div id="hero">
                <Hero />
            </div>
            <div id="upload-section">
                <UploadSection onAnalyze={handleAnalysis} isAnalyzing={isAnalyzing} />
            </div>

            {analysisResult && (
                <div id="dashboard-results" className="animate-fade-in scroll-mt-20">
                    <Dashboard data={analysisResult} />
                    <Recommendation data={analysisResult} />
                </div>
            )}

            <div id="features">
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
                                <h3 className="text-xl font-bold mb-2">แม่นยำสูง</h3>
                                <p className="text-slate-600">ความแม่นยำ 95%+</p>
                            </div>
                            <div className="glass-card p-6 rounded-xl hover:scale-105 transition-transform">
                                <div className="text-5xl mb-4">🔬</div>
                                <h3 className="text-xl font-bold mb-2">โมเดลวิทยาศาสตร์</h3>
                                <p className="text-slate-600">คำนวณจากงานวิจัยจริง</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="sdg-section">
                <SDGSection />
            </div>

            <div id="contact">
                <Footer />
            </div>
        </div>
    )
}

export default App
