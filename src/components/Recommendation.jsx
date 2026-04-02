import { useState } from 'react'

const Recommendation = ({ data }) => {
    const { environmental_notes, climate_context_summary, confidence_level } = data
    const [isActionPlanOpen, setIsActionPlanOpen] = useState(false)

    // ใช้ข้อมูลจริงจาก AI เท่านั้น (ไม่มี Fallback Fix ตายตัว)
    const actionPlan = (data.action_plan && data.action_plan.length > 0) ? data.action_plan : null

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

                        {/* ===== ข้อมูลสภาพอากาศปัจจุบัน (ตัวเลข) ===== */}
                        {data.current_weather && (
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <span>⛅</span> สภาพอากาศปัจจุบัน ณ พิกัดที่ระบุ
                                    <span className="text-xs font-normal text-slate-400 ml-auto">แหล่งข้อมูล: {data.current_weather.source}</span>
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 text-center hover:shadow-md transition-shadow">
                                        <div className="text-3xl mb-2">🌡️</div>
                                        <div className="text-2xl font-bold text-orange-600">{data.current_weather.temperature_c ?? '-'}°C</div>
                                        <div className="text-xs text-slate-500 mt-1">อุณหภูมิ</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-100 text-center hover:shadow-md transition-shadow">
                                        <div className="text-3xl mb-2">💧</div>
                                        <div className="text-2xl font-bold text-sky-600">{data.current_weather.humidity_percent ?? '-'}%</div>
                                        <div className="text-xs text-slate-500 mt-1">ความชื้นสัมพัทธ์</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 text-center hover:shadow-md transition-shadow">
                                        <div className="text-3xl mb-2">🌧️</div>
                                        <div className="text-2xl font-bold text-blue-600">{data.current_weather.precipitation_mm ?? '-'} mm</div>
                                        <div className="text-xs text-slate-500 mt-1">ปริมาณน้ำฝน</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-100 text-center hover:shadow-md transition-shadow">
                                        <div className="text-3xl mb-2">💨</div>
                                        <div className="text-2xl font-bold text-teal-600">{data.current_weather.wind_speed_kmh ?? '-'} km/h</div>
                                        <div className="text-xs text-slate-500 mt-1">ความเร็วลม</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ===== AI สรุปให้ (Personalized Summary) ===== */}
                        {data.ai_summary && (
                            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-8 border-l-4 border-amber-400 shadow-sm mb-8">
                                <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                                    <span>💡</span> AI สรุปให้จากข้อมูลของคุณ
                                </h3>
                                <p className="text-slate-700 leading-relaxed text-lg">
                                    {data.ai_summary}
                                </p>
                            </div>
                        )}

                        {/* ===== ปุ่ม Action Plan (แสดงเฉพาะเมื่อมีข้อมูลจริงจาก AI) ===== */}
                        {actionPlan && (
                            <div className="text-center mb-10">
                                <button
                                    onClick={() => setIsActionPlanOpen(true)}
                                    className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all hover:-translate-y-1 shadow-xl hover:shadow-emerald-500/40 relative overflow-hidden group"
                                >
                                    <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                                    <span className="text-2xl relative flex h-6 w-6 items-center justify-center">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
                                        <span className="relative inline-flex text-2xl">🎯</span>
                                    </span>
                                    <span className="relative z-10">ดู AI แนะนำขั้นตอน (Action Plan)</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid md:grid-cols-2 gap-4 print:hidden">
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
                                        title: 'TerraSense AI Analysis',
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

            {/* ===== Action Plan Modal Popup ===== */}
            {isActionPlanOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 print:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        style={{ animation: 'fadeIn 0.2s ease-out forwards' }}
                        onClick={() => setIsActionPlanOpen(false)}
                    ></div>

                    {/* Modal Card */}
                    <div
                        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        style={{ maxHeight: '85vh', animation: 'modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 flex items-center justify-between shrink-0">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <span>🎯</span> AI แนะนำขั้นตอนเตรียมพื้นที่
                            </h3>
                            <button
                                onClick={() => setIsActionPlanOpen(false)}
                                className="text-white hover:bg-white/20 w-8 h-8 flex items-center justify-center rounded-full transition-colors font-bold text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body — Timeline Steps */}
                        <div className="p-8 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
                            <div className="space-y-6 relative">
                                {/* Timeline Line */}
                                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 via-emerald-300 to-transparent"></div>

                                {actionPlan.map((step, index) => (
                                    <div
                                        key={index}
                                        className="relative flex items-start gap-4 group"
                                        style={{ animation: `stepSlideIn 0.5s ease-out ${index * 0.25}s both` }}
                                    >
                                        {/* Step Number Circle */}
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white font-bold shrink-0 shadow-lg shadow-emerald-500/30 z-10 transition-transform group-hover:scale-110 border-4 border-white">
                                            {index + 1}
                                        </div>

                                        {/* Step Content Card */}
                                        <div className="flex-1 p-4 rounded-xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 hover:border-emerald-300 group-hover:bg-emerald-50/40">
                                            <h4 className="font-bold text-emerald-800 mb-1">ขั้นตอนที่ {index + 1}</h4>
                                            <p className="text-slate-600 leading-relaxed text-sm">{step}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-white border-t border-slate-100 flex justify-end shrink-0">
                            <button
                                onClick={() => setIsActionPlanOpen(false)}
                                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                            >
                                ปิดหน้าต่าง
                            </button>
                        </div>
                    </div>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes modalPop {
                            0% { opacity: 0; transform: scale(0.92) translateY(16px); }
                            100% { opacity: 1; transform: scale(1) translateY(0); }
                        }
                        @keyframes stepSlideIn {
                            from { opacity: 0; transform: translateX(-20px); }
                            to { opacity: 1; transform: translateX(0); }
                        }
                    `}} />
                </div>
            )}
        </section>
    )
}

export default Recommendation
