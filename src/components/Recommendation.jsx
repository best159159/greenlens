const Recommendation = ({ data }) => {
    // data คือ analysisResult ทั้งก้อน
    const { environmental_notes, climate_context_summary, confidence_level } = data

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-4xl mx-auto">
                <div className="glass-card rounded-2xl p-8 md:p-12 animate-slide-in">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-8">
                        <div className="text-5xl">🤖</div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold gradient-text mb-2">
                                บทสรุปจาก AI
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-600">ความมั่นใจ:</span>
                                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-emerald-200">
                                    {confidence_level}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Analysis Content */}
                    <div className="prose prose-slate max-w-none">
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border-l-4 border-indigo-500 shadow-sm mb-8">
                            <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                <span>🌍</span> ภาพรวมระบบนิเวศ
                            </h3>
                            <p className="text-slate-700 leading-relaxed text-lg">
                                {climate_context_summary || 'กำลังวิเคราะห์ข้อมูลสภาพแวดล้อม...'}
                            </p>
                            <p className="mt-4 text-slate-600 italic border-t border-indigo-100 pt-4">
                                " {environmental_notes || '-'} "
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid md:grid-cols-2 gap-4 no-print">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-4 rounded-xl hover:bg-slate-900 transition-colors font-medium hover:scale-[1.02] active:scale-95 shadow-md group"
                        >
                            <span className="group-hover:translate-y-[-2px] transition-transform">📄</span>
                            <span>บันทึกรายงาน (PDF)</span>
                        </button>
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'GreenLens AI Analysis',
                                        text: `ดูผลวิเคราะห์ที่ดินของฉัน! ภาพรวม: ${climate_context_summary || ''}`,
                                        url: window.location.href
                                    }).catch(console.error);
                                } else {
                                    alert("คัดลอกลิงก์ผลลัพธ์แล้ว! (จำลอง)");
                                }
                            }}
                            className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-6 py-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium hover:scale-[1.02] active:scale-95 shadow-sm group"
                        >
                            <span className="group-hover:rotate-12 transition-transform">📤</span>
                            <span>แชร์ผลลัพธ์</span>
                        </button>
                    </div>

                    {/* Warning Box */}
                    <div className="mt-8 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <h4 className="font-bold text-amber-900">ข้อจำกัดของระบบประเมิน</h4>
                            <p className="text-amber-800 text-sm mt-1">
                                {data.model_limitations?.scope || 'ระบบนี้ใช้วิเคราะห์เบื้องต้นเท่านั้น ไม่ใช่การศึกษาดินทางวิทยาศาสตร์ หรือวิเคราะห์ข้อมูลเชิงลึกระยะยาว'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Recommendation
