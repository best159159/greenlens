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
    const [plantingPlan, setPlantingPlan] = useState([])
    const [planSummary, setPlanSummary] = useState(null)
    const [isCalculating, setIsCalculating] = useState(false)
    const [projectionYear, setProjectionYear] = useState(20)
    const [scenarioMode, setScenarioMode] = useState("baseline")
    const [siteArea, setSiteArea] = useState(1000)

    useEffect(() => {
        if (plantingPlan.length === 0) {
            setPlanSummary(null)
            return
        }

        const fetchPlanSummary = async () => {
            setIsCalculating(true)
            try {
                const isDev = import.meta.env.DEV
                let apiUrl = '/api/calculate_plan'
                if (isDev) {
                    apiUrl = 'http://localhost:8000/calculate_plan'
                } else if (import.meta.env.VITE_API_URL) {
                    apiUrl = import.meta.env.VITE_API_URL.replace('/analyze', '/calculate_plan')
                }

                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plantingPlan, projection_year: projectionYear, scenario_mode: scenarioMode, site_area: siteArea })
                })
                if (res.ok) {
                    const responseData = await res.json()
                    setPlanSummary(responseData.planting_plan_summary)
                }
            } catch (err) {
                console.error("Failed to calculate plan summary:", err)
            } finally {
                setIsCalculating(false)
            }
        }

        const timeoutId = setTimeout(() => fetchPlanSummary(), 300) // debounce API call
        return () => clearTimeout(timeoutId)
    }, [plantingPlan, projectionYear, scenarioMode, siteArea])

    const addToPlan = (tree, sci) => {
        const tree_id = `${tree.category}-${tree.tree_name}`
        setPlantingPlan(prev => {
            const existing = prev.find(p => p.tree_id === tree_id)
            if (existing) {
                return prev.map(p => p.tree_id === tree_id ? { ...p, quantity: p.quantity + 1 } : p)
            } else {
                return [...prev, {
                    tree_id,
                    tree_name: tree.tree_name,
                    category: tree.category,
                    quantity: 1,
                    co2_range: sci.co2_absorption_range,
                    canopy_area_m2: sci.canopy_coverage_m2,
                    temperature_range: Array.isArray(sci.temperature_reduction_celsius) ? sci.temperature_reduction_celsius : [sci.temperature_reduction_celsius, sci.temperature_reduction_celsius],
                    gps_score: sci.green_potential_score
                }]
            }
        })
    }

    const updateQuantity = (tree_id, delta) => {
        setPlantingPlan(prev => {
            return prev.map(p => {
                if (p.tree_id === tree_id) {
                    const newQ = p.quantity + delta
                    return newQ > 0 ? { ...p, quantity: newQ } : p
                }
                return p
            })
        })
    }

    const removeFromPlan = (tree_id) => {
        setPlantingPlan(prev => prev.filter(p => p.tree_id !== tree_id))
    }

    const {
        surface_context,
        vegetation_density,
        climate_context_summary,
        environmental_notes,
        recommendations = [],
        environmental_impact = {},
        confidence_level,
        climate_profile,
        climate_risk_analysis,
        long_term_growth_advisory
    } = data

    const selectedTree = recommendations.length > 0 ? recommendations[selectedTreeIndex] : null
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
                        ระบบสนับสนุนการตัดสินใจ (DSS) — ข้อมูลเชิงคุณภาพจาก AI + ค่าประมาณการจากโมเดลพารามิเตอร์
                    </p>
                </div>

                {/* ===== 1. Environmental Impact Summary (อิงตามต้นไม้ที่เลือก) ===== */}
                {sciData && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fade-in" key={`impact-${selectedTreeIndex}`}>
                        {/* CO₂ */}
                        <div className="glass-card rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-5xl">🌿</div>
                                <div className="bg-eco-green-100 text-eco-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    ค่าประมาณการ
                                </div>
                            </div>
                            <h3 className="text-slate-600 text-sm font-medium mb-2">
                                ช่วงประมาณการดูดซับ CO₂ (ต้นไม้โตเต็มวัย สภาวะเอื้ออำนวย)
                            </h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-bold text-eco-green-600">
                                    {sciData.co2_absorption_range
                                        ? `${sciData.co2_absorption_range.low} - ${sciData.co2_absorption_range.high}`
                                        : Number(sciData.co2_absorption_kg_per_year).toFixed(1)}
                                </span>
                                <span className="text-xl text-slate-500">
                                    kg/ปี
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-eco-green-500 to-eco-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min((sciData.co2_absorption_kg_per_year / 60) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Temperature */}
                        <div className="glass-card rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-5xl">🌡️</div>
                                <div className="bg-eco-blue-100 text-eco-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    ค่าประมาณการ
                                </div>
                            </div>
                            <h3 className="text-slate-600 text-sm font-medium mb-2">
                                ช่วงประมาณการลดอุณหภูมิจุลภาคใต้ร่มเงา (ไม่ใช่อุณหภูมิระดับเมือง)
                            </h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-bold text-eco-blue-600">
                                    {Array.isArray(sciData.temperature_reduction_celsius)
                                        ? `-${Number(sciData.temperature_reduction_celsius[0]).toFixed(1)} ถึง -${Number(sciData.temperature_reduction_celsius[1]).toFixed(1)}`
                                        : `-${Number(sciData.temperature_reduction_celsius).toFixed(1)}`
                                    }
                                </span>
                                <span className="text-xl text-slate-500">
                                    °C
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-eco-blue-500 to-eco-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min((Array.isArray(sciData.temperature_reduction_celsius) ? sciData.temperature_reduction_celsius[1] : sciData.temperature_reduction_celsius) * 30, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Canopy */}
                        <div className="glass-card rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-5xl">🌳</div>
                                <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    ค่าประมาณการ
                                </div>
                            </div>
                            <h3 className="text-slate-600 text-sm font-medium mb-2">
                                ค่าประมาณพื้นที่ร่มเงาที่ทรงพุ่มโตเต็มที่
                            </h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-5xl font-bold text-emerald-600">
                                    {Number(sciData.canopy_coverage_m2).toFixed(1)}
                                </span>
                                <span className="text-2xl text-slate-500">
                                    m²
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min((sciData.canopy_coverage_m2 / 200) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== 2. Context Analysis Cards (จาก AI) ===== */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300 flex flex-col">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-amber-100 flex items-center justify-center w-12 h-12 rounded-full text-2xl shrink-0">🌍</div>
                            <h3 className="text-slate-800 font-bold leading-tight">บริบทพื้นที่<br />(Surface Context)</h3>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed grow">{surface_context || '-'}</p>
                    </div>
                    <div className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300 flex flex-col">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-green-100 flex items-center justify-center w-12 h-12 rounded-full text-2xl shrink-0">🌿</div>
                            <h3 className="text-slate-800 font-bold leading-tight">ความหนาแน่นพืชพรรณ<br />(Density)</h3>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed grow">{vegetation_density || '-'}</p>
                    </div>
                    <div className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300 flex flex-col">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-blue-100 flex items-center justify-center w-12 h-12 rounded-full text-2xl shrink-0">🌥️</div>
                            <h3 className="text-slate-800 font-bold leading-tight">สภาพอากาศ<br />(Climate Summary)</h3>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed grow">{climate_context_summary || '-'}</p>
                    </div>
                    <div className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300 flex flex-col">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-emerald-100 flex items-center justify-center w-12 h-12 rounded-full text-2xl shrink-0">📝</div>
                            <h3 className="text-slate-800 font-bold leading-tight">ข้อสังเกตแวดล้อม<br />(Notes)</h3>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed grow">{environmental_notes || '-'}</p>
                        <div className="mt-4 inline-block bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-semibold self-start">
                            Confidence: {confidence_level || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* ===== 3. Climate Risk Index & Profile ===== */}
                {climate_profile && (
                    <div className="mb-12 animate-fade-in">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">🌍 ดัชนีความเสี่ยงสภาพอากาศ (Climate Risk Index) & Profile</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Climate Risk Circular Gauge */}
                            <div className="glass-card rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
                                <h4 className="text-lg font-bold text-slate-700 mb-2">Climate Risk Index</h4>
                                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            className="text-slate-200"
                                            strokeWidth="3"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className={`${climate_profile.climate_risk_index <= 30 ? 'text-green-500' :
                                                climate_profile.climate_risk_index <= 60 ? 'text-yellow-500' :
                                                    climate_profile.climate_risk_index <= 80 ? 'text-orange-500' : 'text-red-500'
                                                }`}
                                            strokeDasharray={`${climate_profile.climate_risk_index || 0}, 100`}
                                            strokeWidth="3"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-slate-800">{climate_profile.climate_risk_index}</span>
                                    </div>
                                </div>
                                <div className="font-semibold text-slate-700">{climate_profile.climate_risk_level}</div>
                                <p className="text-xs text-slate-500 mt-4 italic leading-relaxed">Climate Risk Index is a macro-environmental planning metric derived from historical averages. It does not represent future climate certainty.</p>
                            </div>

                            <div className="glass-card rounded-2xl p-6 hover:shadow-md transition-shadow md:col-span-2">
                                <div className="grid md:grid-cols-2 gap-6 h-full">
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">ข้อมูลสถิติรอบ 5 ปี ({climate_profile.data_period})</h4>
                                        <ul className="space-y-3 text-slate-600">
                                            <li className="flex justify-between"><span>อุณหภูมิเฉลี่ยต่อปี:</span><strong className="text-eco-blue-600">{climate_profile.avg_annual_temperature_c} °C</strong></li>
                                            <li className="flex justify-between"><span>ปริมาณน้ำฝนเฉลี่ยต่อปี:</span><strong className="text-sky-600">{climate_profile.avg_annual_precipitation_mm} mm</strong></li>
                                            <li className="flex justify-between"><span>เฉลี่ยเดือนที่แห้งแล้งต่อปี:</span><strong className="text-amber-600">{climate_profile.avg_dry_months_per_year} เดือน</strong></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">บทวิเคราะห์ความเสี่ยงและแนวทางระยะยาว (AI Advisory)</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <strong className="text-sm text-slate-800 flex items-center gap-2"><span className="text-lg">🌤</span> ความเสี่ยงระยะยาว:</strong>
                                                <p className="text-sm text-slate-600 mt-1 line-clamp-3">{climate_risk_analysis || '-'}</p>
                                            </div>
                                            <div>
                                                <strong className="text-sm text-slate-800 flex items-center gap-2"><span className="text-lg">🌱</span> แนวทางการเติบโต:</strong>
                                                <p className="text-sm text-slate-600 mt-1 line-clamp-3">{long_term_growth_advisory || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}



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

                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); if (sci) addToPlan(tree, sci); }}
                                            className="w-full py-2 bg-eco-green-600 text-white rounded-lg hover:bg-eco-green-700 transition font-medium"
                                        >
                                            ➕ เพิ่มลงแผนปลูกจริง
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ===== 4. Selected Tree Detail + Chart ===== */}
                <div className="glass-card rounded-2xl p-8 bg-white/80 backdrop-blur border border-slate-100 mb-12">
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
                                        <div className="text-xl font-bold text-eco-blue-600">
                                            {Array.isArray(sciData.temperature_reduction_celsius)
                                                ? `-${Number(sciData.temperature_reduction_celsius[0]).toFixed(1)}~${Number(sciData.temperature_reduction_celsius[1]).toFixed(1)}`
                                                : `-${Number(sciData.temperature_reduction_celsius).toFixed(1)}`}°C
                                        </div>
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
                                ค่าประมาณการรายเดือน (หน่วย: กิโลกรัม) — อ้างอิงจากฐานข้อมูลพรรณไม้
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

                {/* ===== Planting Plan Panel ===== */}
                {plantingPlan.length > 0 && (
                    <div className="glass-card rounded-2xl p-8 bg-white mb-12 shadow-md border-2 border-eco-green-300 relative">
                        {isCalculating && (
                            <div className="absolute top-4 right-4 text-sm text-eco-green-600 font-medium flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-eco-green-600 border-t-transparent rounded-full animate-spin"></div>
                                กำลังคำนวณ...
                            </div>
                        )}
                        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span>📋</span> แผนปลูกจริง (Planting Plan Builder)
                        </h3>

                        <div className="grid md:grid-cols-2 gap-8 items-start">
                            {/* Selected Trees List */}
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {plantingPlan.map((item) => (
                                    <div key={item.tree_id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{item.tree_name}</h4>
                                            <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-100 mt-1 inline-block">
                                                {item.category === 'economic' ? 'ไม้เศรษฐกิจ' : item.category === 'edible' ? 'ไม้กินได้' : 'ไม้อนุรักษ์'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
                                                <button onClick={() => updateQuantity(item.tree_id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md font-bold">-</button>
                                                <span className="w-6 text-center font-bold">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.tree_id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md font-bold">+</button>
                                            </div>
                                            <button onClick={() => removeFromPlan(item.tree_id)} className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-md" title="ลบออก">
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary Display */}
                            <div className="bg-gradient-to-br from-eco-green-50 to-emerald-50 rounded-xl p-6 border border-eco-green-100 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-lg font-bold text-eco-green-800 mb-4 border-b border-eco-green-200 pb-2">
                                        📊 สรุปผลกระทบที่ปรับตามสัดส่วนการเติบโต
                                    </h4>

                                    {/* 6. Growth Timeline Slider */}
                                    <div className="mb-6 p-4 bg-white/60 rounded-xl border border-white/50 shadow-sm backdrop-blur">
                                        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
                                            <span>📅 ระยะเวลาการเติบโต (Projection Timeline)</span>
                                            <span className="text-eco-green-600 bg-white px-2 py-1 rounded-lg text-sm shadow-sm">{projectionYear} ปี</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="20"
                                            step="1"
                                            value={projectionYear}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                // Constrain to allowed steps if strictly wanted, or allow intermediate (Backend handles mapping nearest or default. Wait backend expects 1,5,10,20)
                                                // We will snap to 1, 5, 10, 20
                                                const allowed = [1, 5, 10, 20];
                                                const closest = allowed.reduce((prev, curr) => Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
                                                setProjectionYear(closest);
                                            }}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-eco-green-600"
                                        />
                                        <div className="flex justify-between text-xs font-semibold text-slate-500 mt-2 px-1">
                                            <span>1 ปี</span>
                                            <span>5 ปี</span>
                                            <span>10 ปี</span>
                                            <span>20 ปี (โตเต็มที่)</span>
                                        </div>
                                    </div>

                                    {planSummary ? (
                                        <div className="space-y-4">
                                            {/* Canopy Density Bar & Site Area Input */}
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-bold text-slate-700">🌳 ความหนาแน่นของร่มเงา (Canopy Density)</span>
                                                    <span className="text-sm font-bold text-emerald-600">{planSummary.canopy_density_percent || 0}%</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden border border-slate-300/50 relative mb-4">
                                                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full transition-all duration-700 ease-in-out"
                                                        style={{ width: `${planSummary.canopy_density_percent || 0}%` }}
                                                    ></div>
                                                </div>
                                                <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 flex items-center justify-between">
                                                    <label htmlFor="siteArea" className="text-xs font-semibold text-slate-600 block">
                                                        ขนาดพื้นที่ปลูกจริง (Site Area)
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            id="siteArea"
                                                            type="number"
                                                            value={siteArea}
                                                            onChange={(e) => setSiteArea(Number(e.target.value) || 0)}
                                                            className="w-24 px-2 py-1 text-right text-sm font-bold text-slate-800 border border-slate-200 rounded-md focus:outline-none focus:border-eco-green-500 focus:ring-1 focus:ring-eco-green-500"
                                                        />
                                                        <span className="text-xs text-slate-500 font-medium">ตร.ม.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Growth Timeline Chart */}
                                            {planSummary.impact_timeline && (
                                                <div className="mb-6 bg-white p-3 rounded-xl border border-slate-100 shadow-sm animate-fade-in">
                                                    <h5 className="text-xs font-bold text-slate-600 mb-2">📈 คาดการณ์การเติบโตตามระยะเวลา (Growth Projection)</h5>
                                                    <div className="h-40">
                                                        <Line
                                                            data={{
                                                                labels: planSummary.impact_timeline.map(d => `ปี ${d.year}`),
                                                                datasets: [
                                                                    {
                                                                        label: 'CO₂ Growth',
                                                                        data: planSummary.impact_timeline.map(d => d.co2),
                                                                        borderColor: 'rgb(34, 197, 94)',
                                                                        tension: 0.4,
                                                                        yAxisID: 'y'
                                                                    },
                                                                    {
                                                                        label: 'Cooling Effect',
                                                                        data: planSummary.impact_timeline.map(d => d.cooling),
                                                                        borderColor: 'rgb(59, 130, 246)',
                                                                        tension: 0.4,
                                                                        yAxisID: 'y1'
                                                                    }
                                                                ]
                                                            }}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                                                                scales: {
                                                                    y: { type: 'linear', display: true, position: 'left', ticks: { font: { size: 9 }, callback: (v) => `${v}kg` } },
                                                                    y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { font: { size: 9 }, callback: (v) => `-${v}°C` } },
                                                                    x: { ticks: { font: { size: 10 } } }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-700 font-medium">🌳 จำนวนต้นไม้รวม:</span>
                                                <span className="font-bold text-slate-900">{planSummary.total_tree_count} ต้น</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-700 font-medium">🌍 การดูดซับ CO₂ ประเมินตามระยะเวลา:</span>
                                                <span className="font-bold text-eco-green-600 text-right">
                                                    {planSummary.scaled_total_co2_range?.low} – {planSummary.scaled_total_co2_range?.high} <span className="text-xs">kg/ปี</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-700 font-medium">🌡 ศักยภาพการลดอุณหภูมิประเมินตามระยะเวลา:</span>
                                                <span className="font-bold text-eco-blue-600 text-right">
                                                    -{planSummary.scaled_temperature_range?.[0]} – -{planSummary.scaled_temperature_range?.[1]} <span className="text-xs">°C</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-700 font-medium">🌳 พื้นที่ร่มเงาประเมินตามระยะเวลา:</span>
                                                <span className="font-bold text-emerald-600 text-right">
                                                    {planSummary.scaled_total_canopy_area_m2} <span className="text-xs">ตร.ม.</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
                                                <span className="text-slate-700 font-medium">🟢 คะแนนแผนการปลูก (GPS):</span>
                                                <span className="font-bold text-green-700 text-xl text-right">
                                                    {planSummary.scaled_plan_gps_score} / 100
                                                </span>
                                            </div>

                                            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-4 leading-relaxed">
                                                * Climate profile เป็นเพียงบริบททางสภาพแวดล้อมเท่านั้น การคาดการณ์การเติบโตเป็นค่าประมาณการจากสายพันธุ์
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center p-12">
                                            <div className="w-8 h-8 border-3 border-eco-green-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== 5. Model Limitations Disclaimer ===== */}
                {data.model_limitations && (
                    <div className="mt-10 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                        <h4 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
                            <span>⚠️</span> ข้อจำกัดของโมเดล (Model Limitations)
                        </h4>
                        <ul className="space-y-2 text-sm text-amber-900">
                            <li>• <strong>ขอบเขต:</strong> {data.model_limitations.scope}</li>
                            <li>• <strong>อุณหภูมิ:</strong> {data.model_limitations.temperature_model}</li>
                            <li>• <strong>CO₂:</strong> {data.model_limitations.co2_model}</li>
                            <li>• <strong>การวิเคราะห์ดิน:</strong> {data.model_limitations.soil_analysis}</li>
                            <li>• <strong>ทั่วไป:</strong> {data.model_limitations.general}</li>
                        </ul>
                    </div>
                )}
            </div>
        </section>
    )
}

export default Dashboard
