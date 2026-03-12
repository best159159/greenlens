import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'

export default function History() {
    const { currentUser } = useAuth()
    const navigate = useNavigate()
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            if (!currentUser) return
            try {
                const q = query(
                    collection(db, 'analyses'),
                    where('userId', '==', currentUser.uid)
                )
                const snapshot = await getDocs(q)
                let data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                // Sort descending locally to avoid requiring a composite index
                data.sort((a, b) => {
                    const tA = a.created_at?.seconds || 0
                    const tB = b.created_at?.seconds || 0
                    return tB - tA
                })
                setHistory(data)
            } catch (error) {
                console.error('Error fetching history:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [currentUser])

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-eco-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-8 font-display">
                    ประวัติการวิเคราะห์ของคุณ
                </h2>

                {history.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-2xl">
                        <div className="text-6xl mb-4">📂</div>
                        <h3 className="text-xl font-medium text-slate-700">ไม่มีประวัติการวิเคราะห์</h3>
                        <p className="text-slate-500 mt-2">คุณยังไม่ได้ทำการวิเคราะห์พื้นที่ใดๆ</p>
                        <button
                            onClick={() => navigate('/analyze')}
                            className="mt-6 px-6 py-3 btn-primary rounded-xl"
                        >
                            เริ่มการวิเคราะห์ครั้งแรก
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {history.map((item) => (
                            <div key={item.id} className="glass-card rounded-2xl overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt="Analysis Map"
                                        className="w-full h-48 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
                                        <span className="text-slate-400">🏞️ ไม่มีรูปภาพ</span>
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="inline-block px-3 py-1 bg-eco-green-100 text-eco-green-800 rounded-full text-xs font-semibold">
                                            {item.province}
                                        </span>
                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                            {item.created_at && typeof item.created_at.toDate === 'function'
                                                ? item.created_at.toDate().toLocaleDateString('th-TH')
                                                : ''}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-2 truncate">
                                        {item.ai_surface_context || item.full_result?.surface_context || 'ไม่พบข้อมูลบริบทพื้นที่'}
                                    </h3>
                                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                        ต้นไม้แนะนำ: {item.recommended_trees || (Array.isArray(item.full_result?.recommendations) ? item.full_result.recommendations.map(r => r?.tree_name || r).join(', ') : '-')}
                                    </p>
                                    <button
                                        onClick={() => navigate('/result', { state: { result: item.full_result } })}
                                        className="w-full py-2 text-eco-green-600 font-medium border border-eco-green-200 rounded-lg hover:bg-eco-green-50 transition-colors"
                                    >
                                        ดูผลการวิเคราะห์
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
