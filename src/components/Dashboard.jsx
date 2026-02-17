import { useEffect, useRef, useState } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

const Dashboard = ({ data }) => {
    const chartRef = useRef(null)
    const [selectedTreeIndex, setSelectedTreeIndex] = useState(0)

    const { land_analysis, recommendations, climate_interpretation, environmental_impact } = data
    const selectedTree = recommendations[selectedTreeIndex]
    const sciData = selectedTree?.scientific_data

    // Chart: ข้อมูลรายเดือนจาก scientific_data
    const monthlyData = sciData?.monthly_co2_data || []

    const chartData = {
        labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
        datasets: [
            {
                label: `CO₂ ดูดซับ - ${selectedTree.tree_name}`,
                data: monthlyData,
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                callbacks: {
                    label: function (context) {
                        return `${context.parsed.y} kg CO₂`
                    }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { callback: (value) => value + ' kg' }
            },
            x: { grid: { display: false } },
        },
    }

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold gradient-text mb-4">
                        ผลการวิเคราะห์พื้นที่
                    </h2>
                    <p className="text-slate-600 text-lg">
                        ข้อมูลเชิงลึกจาก AI + ข้อมูลวิทยาศาสตร์จากฐานข้อมูลงานวิจัย
                    </p>
                </div>

                {/* ===== 1. Environmental Impact Summary (ตัวเลขจาก Scientific Model) ===== */}
                {environmental_impact && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {/* CO₂ */}
                        <div className="glass-card rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-5xl">🌿</div>
                                <div className="bg-eco-green-100 text-eco-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    วิทยาศาสตร์
                                </div>
                            </div>
                            <h3 className="text-slate-600 text-sm font-medium mb-2">
                                {environmental_impact.total_co2_absorption.description}
                            </h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-5xl font-bold text-eco-green-600">
                                    {Number(environmental_impact.total_co2_absorption.value).toFixed(1)}
                                </span>
                                <span className="text-2xl text-slate-500">
                                    {environmental_impact.total_co2_absorption.unit}
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-eco-green-500 to-eco-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(environmental_impact.total_co2_absorption.value, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Temperature */}
                        <div className="glass-card rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-5xl">🌡️</div>
                                <div className="bg-eco-blue-100 text-eco-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    วิทยาศาสตร์
                                </div>
                            </div>
                            <h3 className="text-slate-600 text-sm font-medium mb-2">
                                {environmental_impact.average_temperature_reduction.description}
                            </h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-5xl font-bold text-eco-blue-600">
                                    -{Number(environmental_impact.average_temperature_reduction.value).toFixed(1)}
                                </span>
                                <span className="text-2xl text-slate-500">
                                    {environmental_impact.average_temperature_reduction.unit}
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-eco-blue-500 to-eco-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(environmental_impact.average_temperature_reduction.value * 30, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Canopy */}
                        <div className="glass-card rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-5xl">🌳</div>
                                <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    วิทยาศาสตร์
                                </div>
                            </div>
                            <h3 className="text-slate-600 text-sm font-medium mb-2">
                                {environmental_impact.total_canopy_coverage.description}
                            </h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-5xl font-bold text-emerald-600">
                                    {Number(environmental_impact.total_canopy_coverage.value).toFixed(1)}
                                </span>
                                <span className="text-2xl text-slate-500">
                                    {environmental_impact.total_canopy_coverage.unit}
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(environmental_impact.total_canopy_coverage.value / 2, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== 2. Land Analysis Cards (จาก AI) ===== */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-amber-100 p-3 rounded-full text-2xl">🌱</div>
                            <div>
                                <h3 className="text-slate-500 text-sm font-medium">สภาพดิน</h3>
                                <p className="text-xl font-bold text-slate-800">{land_analysis.soil_texture}</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm">{land_analysis.observations}</p>
                    </div>
                    <div className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-yellow-100 p-3 rounded-full text-2xl">☀️</div>
                            <div>
                                <h3 className="text-slate-500 text-sm font-medium">แสงแดด</h3>
                                <p className="text-xl font-bold text-slate-800">{land_analysis.sunlight}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-green-100 p-3 rounded-full text-2xl">🌿</div>
                            <div>
                                <h3 className="text-slate-500 text-sm font-medium">พืชพรรณเดิม</h3>
                                <p className="text-xl font-bold text-slate-800">{land_analysis.vegetation_density}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== 3. Tree Recommendations (เลือกดูรายละเอียด) ===== */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6">🌳 พันธุ์ไม้ที่แนะนำ</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {recommendations.map((tree, idx) => {
                            const sci = tree.scientific_data
                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedTreeIndex(idx)}
                                    className={`glass-card rounded-2xl p-6 cursor-pointer transition-all duration-300 relative overflow-hidden group
                                        ${selectedTreeIndex === idx
                                            ? 'ring-2 ring-eco-green-500 bg-eco-green-50/50 shadow-lg scale-[1.02]'
                                            : 'hover:shadow-md hover:scale-[1.01] bg-white'
                                        }
                                    `}
                                >
                                    {selectedTreeIndex === idx && (
                                        <div className="absolute top-0 right-0 bg-eco-green-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                                            เลือกอยู่
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-4">
                                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                                            {tree.category === 'economic' ? '💰' : tree.category === 'edible' ? '🍎' : '🌳'}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                            ${tree.category === 'economic' ? 'bg-amber-100 text-amber-700' :
                                                tree.category === 'edible' ? 'bg-red-100 text-red-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {tree.category === 'economic' ? 'ไม้เศรษฐกิจ' : tree.category === 'edible' ? 'ไม้กินได้' : 'ไม้อนุรักษ์'}
                                        </span>
                                    </div>

                                    <h4 className="text-xl font-bold text-slate-800 mb-1">{tree.tree_name}</h4>
                                    {sci && (
                                        <p className="text-xs text-slate-400 italic mb-2">
                                            {sci.english_name} ({sci.scientific_name})
                                        </p>
                                    )}
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{tree.reason}</p>

                                    {/* Mini Stats จาก Scientific Data */}
                                    {sci && (
                                        <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-slate-100">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-eco-green-600">{Number(sci.co2_absorption_kg_per_year).toFixed(1)}</div>
                                                <div className="text-[10px] text-slate-500">kg CO₂/ปี</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-eco-blue-600">{sci.green_potential_score}</div>
                                                <div className="text-[10px] text-slate-500">Green Score</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ===== 4. Selected Tree Detail + Chart ===== */}
                <div className="glass-card rounded-2xl p-8 bg-white/80 backdrop-blur border border-slate-100">
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        {/* Left: Info */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">
                                    {selectedTree.category === 'economic' ? '💰' : selectedTree.category === 'edible' ? '🍎' : '🌳'}
                                </span>
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-800">{selectedTree.tree_name}</h3>
                                    {sciData && (
                                        <p className="text-sm text-slate-400 italic">{sciData.english_name} • {sciData.scientific_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                    <h5 className="font-semibold text-indigo-900 mb-1 flex items-center gap-2">
                                        <span>🤔</span> ทำไมถึงเหมาะกับที่นี่?
                                    </h5>
                                    <p className="text-indigo-800 text-sm leading-relaxed">{selectedTree.reason}</p>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                    <h5 className="font-semibold text-emerald-900 mb-1 flex items-center gap-2">
                                        <span>🌍</span> ประโยชน์ต่อสิ่งแวดล้อม
                                    </h5>
                                    <p className="text-emerald-800 text-sm leading-relaxed">{selectedTree.environmental_benefits}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <h5 className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                        <span>🛠️</span> คู่มือการดูแล
                                    </h5>
                                    <p className="text-slate-600 text-sm leading-relaxed">{selectedTree.care_notes}</p>
                                </div>
                            </div>

                            {/* Scientific Stats */}
                            {sciData && (
                                <div className="grid grid-cols-2 gap-3 mt-6">
                                    <div className="text-center p-3 bg-eco-green-50 rounded-lg border border-eco-green-100">
                                        <div className="text-2xl font-bold text-eco-green-600">{Number(sciData.co2_absorption_kg_per_year).toFixed(1)}</div>
                                        <div className="text-xs text-slate-600">kg CO₂/ปี</div>
                                    </div>
                                    <div className="text-center p-3 bg-eco-blue-50 rounded-lg border border-eco-blue-100">
                                        <div className="text-2xl font-bold text-eco-blue-600">-{Number(sciData.temperature_reduction_celsius).toFixed(1)}°C</div>
                                        <div className="text-xs text-slate-600">ลดอุณหภูมิ</div>
                                    </div>
                                    <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                        <div className="text-2xl font-bold text-emerald-600">{Number(sciData.canopy_coverage_m2).toFixed(1)} m²</div>
                                        <div className="text-xs text-slate-600">พื้นที่ร่มเงา</div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                                        <div className="text-2xl font-bold text-purple-600">{sciData.green_potential_score}</div>
                                        <div className="text-xs text-slate-600">Green Score</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Chart */}
                        <div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">
                                📈 กราฟดูดซับ CO₂ รายเดือน
                            </h4>
                            <p className="text-slate-500 text-sm mb-4">
                                ข้อมูลจากฐานข้อมูลงานวิจัย (หน่วย: กิโลกรัม)
                            </p>
                            {monthlyData.length > 0 ? (
                                <div className="h-64">
                                    <Line ref={chartRef} data={chartData} options={chartOptions} />
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <p className="text-slate-400">ไม่พบข้อมูลกราฟสำหรับต้นไม้นี้</p>
                                </div>
                            )}

                            {/* Monthly Stats */}
                            {monthlyData.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-3">
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <div className="text-lg font-bold text-eco-green-600">
                                            {monthlyData.reduce((a, b) => a + b, 0).toFixed(1)}
                                        </div>
                                        <div className="text-xs text-slate-600">รวมทั้งปี (kg)</div>
                                    </div>
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <div className="text-lg font-bold text-eco-green-600">
                                            {Math.max(...monthlyData).toFixed(1)}
                                        </div>
                                        <div className="text-xs text-slate-600">สูงสุด/เดือน</div>
                                    </div>
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <div className="text-lg font-bold text-eco-green-600">
                                            {(monthlyData.reduce((a, b) => a + b, 0) / 12).toFixed(1)}
                                        </div>
                                        <div className="text-xs text-slate-600">เฉลี่ย/เดือน</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Dashboard
