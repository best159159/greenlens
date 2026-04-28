import { useState } from 'react'
import { auth, db, storage, googleProvider } from '../firebase'
import { signInWithPopup } from 'firebase/auth'
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const STATUS = {
    idle: { icon: '⬜', text: 'ยังไม่ทดสอบ', color: 'text-slate-400' },
    loading: { icon: '🔄', text: 'กำลังทดสอบ...', color: 'text-blue-500' },
    ok: { icon: '✅', text: 'ผ่าน', color: 'text-green-600' },
    fail: { icon: '❌', text: 'ล้มเหลว', color: 'text-red-600' },
}

export default function FirebaseTest() {
    const [results, setResults] = useState({
        config: 'idle',
        auth: 'idle',
        firestore: 'idle',
        storage: 'idle',
    })
    const [details, setDetails] = useState({})
    const [running, setRunning] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteMsg, setDeleteMsg] = useState('')

    const deleteAllHistory = async () => {
        if (!window.confirm('ลบประวัติการวิเคราะห์ทั้งหมดของ account นี้ใช่ไหม?')) return
        setDeleting(true)
        setDeleteMsg('')
        try {
            const user = auth.currentUser
            if (!user) { setDeleteMsg('❌ ยังไม่ได้ login'); setDeleting(false); return }
            const q = query(collection(db, 'analyses'), where('userId', '==', user.uid))
            const snap = await getDocs(q)
            await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'analyses', d.id))))
            setDeleteMsg(`✅ ลบแล้ว ${snap.docs.length} รายการ`)
        } catch (err) {
            setDeleteMsg(`❌ ${err.message}`)
        }
        setDeleting(false)
    }

    const set = (key, status, detail = '') => {
        setResults(r => ({ ...r, [key]: status }))
        if (detail) setDetails(d => ({ ...d, [key]: detail }))
    }

    const runAll = async () => {
        setRunning(true)
        setDetails({})
        setResults({ config: 'idle', auth: 'idle', firestore: 'idle', storage: 'idle' })

        // 1. Config check
        set('config', 'loading')
        const cfg = {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        }
        if (!cfg.apiKey || cfg.apiKey.includes('fake')) {
            set('config', 'fail', `ไม่พบ env vars — projectId: ${cfg.projectId || 'ไม่มี'}`)
        } else {
            set('config', 'ok', `projectId: ${cfg.projectId} | bucket: ${cfg.storageBucket}`)
        }

        // 2. Auth check
        set('auth', 'loading')
        try {
            const result = await signInWithPopup(auth, googleProvider)
            set('auth', 'ok', `เข้าสู่ระบบสำเร็จ: ${result.user.email}`)
        } catch (err) {
            set('auth', 'fail', `${err.code}: ${err.message}`)
        }

        // 3. Firestore check
        set('firestore', 'loading')
        try {
            const testRef = await addDoc(collection(db, '_firebase_test'), {
                ts: Date.now(),
            })
            await deleteDoc(doc(db, '_firebase_test', testRef.id))
            set('firestore', 'ok', 'เขียน/อ่าน/ลบ Firestore สำเร็จ')
        } catch (err) {
            set('firestore', 'fail', `${err.code}: ${err.message}`)
        }

        // 4. Storage check
        set('storage', 'loading')
        try {
            const blob = new Blob(['test'], { type: 'text/plain' })
            const storageRef = ref(storage, `_firebase_test/test_${Date.now()}.txt`)
            const snap = await uploadBytes(storageRef, blob)
            const url = await getDownloadURL(snap.ref)
            await deleteObject(storageRef)
            set('storage', 'ok', `upload/download สำเร็จ — URL ได้รับแล้ว`)
        } catch (err) {
            const serverResp = err?.customData?.serverResponse || err?.serverResponse || ''
            let detail = `${err.code}: ${err.message}`
            if (serverResp) {
                try {
                    const parsed = JSON.parse(serverResp)
                    detail += ` | Server: ${parsed?.error?.message || serverResp}`
                } catch {
                    detail += ` | Server: ${serverResp}`
                }
            }
            set('storage', 'fail', detail)
        }

        setRunning(false)
    }

    const rows = [
        { key: 'config', label: 'Firebase Config (.env)' },
        { key: 'auth', label: 'Authentication (Google Sign-in)' },
        { key: 'firestore', label: 'Firestore Database' },
        { key: 'storage', label: 'Firebase Storage (รูปภาพ)' },
    ]

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Firebase Diagnostic</h1>
                <p className="text-slate-500 text-sm mb-6">กดปุ่มเพื่อทดสอบทุก Firebase service</p>

                <button
                    onClick={runAll}
                    disabled={running}
                    className="mb-8 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {running ? '🔄 กำลังทดสอบ...' : '🚀 เริ่มทดสอบทั้งหมด'}
                </button>

                <div className="space-y-3">
                    {rows.map(({ key, label }) => {
                        const s = STATUS[results[key]]
                        return (
                            <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{s.icon}</span>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-700">{label}</p>
                                        {details[key] && (
                                            <p className={`text-xs mt-1 font-mono break-all ${results[key] === 'fail' ? 'text-red-500' : 'text-green-600'}`}>
                                                {details[key]}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`text-sm font-semibold ${s.color}`}>{s.text}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-8 border-t pt-6">
                    <p className="text-sm font-semibold text-slate-700 mb-3">🗑️ จัดการข้อมูล</p>
                    <button
                        onClick={deleteAllHistory}
                        disabled={deleting}
                        className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50 transition"
                    >
                        {deleting ? 'กำลังลบ...' : 'ลบประวัติทั้งหมด'}
                    </button>
                    {deleteMsg && <p className="mt-3 text-sm font-mono">{deleteMsg}</p>}
                </div>

                <p className="mt-6 text-xs text-slate-400 text-center">
                    หน้านี้ใช้สำหรับ debug เท่านั้น — ลบออกก่อน deploy production
                </p>
            </div>
        </div>
    )
}
