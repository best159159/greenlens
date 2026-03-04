import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Dashboard from '../components/Dashboard'
import Recommendation from '../components/Recommendation'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export default function DashboardPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const { currentUser } = useAuth()

    // We try to get result from router state first
    const stateResult = location.state?.analysisResult || location.state?.result

    const [result, setResult] = useState(stateResult || null)
    const [loading, setLoading] = useState(!stateResult)
    const [noData, setNoData] = useState(false)

    useEffect(() => {
        const fetchLatest = async () => {
            if (stateResult || !currentUser) {
                setLoading(false)
                return
            }
            try {
                const q = query(
                    collection(db, 'analyses'),
                    where('userId', '==', currentUser.uid)
                )
                const snapshot = await getDocs(q)
                if (snapshot.empty) {
                    setNoData(true)
                } else {
                    let data = snapshot.docs.map(doc => doc.data())
                    data.sort((a, b) => {
                        const tA = a.created_at?.seconds || 0
                        const tB = b.created_at?.seconds || 0
                        return tB - tA
                    })
                    setResult(data[0].full_result)
                }
            } catch (error) {
                console.error('Error fetching latest analysis:', error)
                setNoData(true)
            } finally {
                setLoading(false)
            }
        }
        fetchLatest()
    }, [stateResult, currentUser])

    if (loading) {
        return (
            <div className="pt-24 min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-eco-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (noData || !result) {
        return (
            <div className="pt-24 min-h-screen bg-slate-50 flex flex-col justify-center items-center text-center px-4">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">ยังไม่มีข้อมูลในประวัติการวิเคราะห์</h2>
                <p className="text-slate-500 mb-6">คุณอาจจะยังไม่เคยอัปโหลดรูปภาพเพื่อประเมินศักยภาพพื้นที่ กรุณาไปที่หน้าวิเคราะห์เพื่อเริ่มต้นใช้งาน</p>
                <button
                    onClick={() => navigate('/analyze')}
                    className="btn-primary"
                >
                    เริ่มการวิเคราะห์ใหม่
                </button>
            </div>
        )
    }

    const handlePrint = () => {
        window.print();
    }

    return (
        <div className="pt-24 min-h-screen bg-slate-50 print:pt-0 print:bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex justify-end print:hidden">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl hover:bg-slate-700 transition shadow-sm font-medium"
                >
                    🖨️ บันทึกเป็น PDF (Print)
                </button>
            </div>
            <div id="dashboard-results" className="animate-fade-in scroll-mt-20 print:shadow-none print:m-0 print:p-0">
                <Dashboard data={result} />
                <Recommendation data={result} />
            </div>
        </div>
    )
}
