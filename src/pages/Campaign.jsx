import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { db, storage } from '../firebase'
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { MapContainer, TileLayer, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getProvinceCenter } from '../utils/provinceCenters';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create an inner component to center map on markers? (Optional)

export default function Campaign() {
    const { currentUser } = useAuth()

    // Form State
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [treeType, setTreeType] = useState('')
    const [notes, setNotes] = useState('')
    const [selectedProvince, setSelectedProvince] = useState('')
    const [provinceSearch, setProvinceSearch] = useState('')
    const [showProvinceDropdown, setShowProvinceDropdown] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // AI Tree Counting State
    const [isCountingTrees, setIsCountingTrees] = useState(false)
    const [aiTreeCount, setAiTreeCount] = useState(null)
    const [aiConfidence, setAiConfidence] = useState(null)
    const [aiDescription, setAiDescription] = useState(null)
    const [countError, setCountError] = useState(null)

    // รายชื่อจังหวัดทั้งหมด
    const provinces = [
        'เชียงราย', 'เชียงใหม่', 'น่าน', 'พะเยา', 'แพร่', 'แม่ฮ่องสอน', 'ลำปาง', 'ลำพูน', 'อุตรดิตถ์',
        'กาฬสินธุ์', 'ขอนแก่น', 'ชัยภูมิ', 'นครพนม', 'นครราชสีมา', 'บึงกาฬ', 'บุรีรัมย์', 'มหาสารคาม', 'มุกดาหาร', 'ยโสธร', 'ร้อยเอ็ด', 'เลย', 'สกลนคร', 'สุรินทร์', 'ศรีสะเกษ', 'หนองคาย', 'หนองบัวลำภู', 'อุดรธานี', 'อุบลราชธานี', 'อำนาจเจริญ',
        'กรุงเทพมหานคร', 'กำแพงเพชร', 'ชัยนาท', 'นครนายก', 'นครปฐม', 'นครสวรรค์', 'นนทบุรี', 'ปทุมธานี', 'พระนครศรีอยุธยา', 'พิจิตร', 'พิษณุโลก', 'เพชรบูรณ์', 'ลพบุรี', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สระบุรี', 'อ่างทอง', 'อุทัยธานี',
        'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ตราด', 'ปราจีนบุรี', 'ระยอง', 'สระแก้ว',
        'กาญจนบุรี', 'ตาก', 'ประจวบคีรีขันธ์', 'เพชรบุรี', 'ราชบุรี',
        'กระบี่', 'ชุมพร', 'ตรัง', 'นครศรีธรรมราช', 'นราธิวาส', 'ปัตตานี', 'พังงา', 'พัทลุง', 'ภูเก็ต', 'ยะลา', 'ระนอง', 'สงขลา', 'สตูล', 'สุราษฎร์ธานี'
    ].sort()

    // พิกัดจังหวัด
    const provinceCoordinates = {
        'เชียงราย': { lat: 19.9105, lng: 99.8406 }, 'เชียงใหม่': { lat: 18.7883, lng: 98.9853 },
        'น่าน': { lat: 18.7756, lng: 100.7730 }, 'พะเยา': { lat: 19.1664, lng: 99.9019 },
        'แพร่': { lat: 18.1445, lng: 100.1408 }, 'แม่ฮ่องสอน': { lat: 19.3020, lng: 97.9654 },
        'ลำปาง': { lat: 18.2888, lng: 99.4909 }, 'ลำพูน': { lat: 18.5744, lng: 99.0087 },
        'อุตรดิตถ์': { lat: 17.6200, lng: 100.0993 }, 'กาฬสินธุ์': { lat: 16.4315, lng: 103.5059 },
        'ขอนแก่น': { lat: 16.4322, lng: 102.8236 }, 'ชัยภูมิ': { lat: 15.8068, lng: 102.0316 },
        'นครพนม': { lat: 17.3921, lng: 104.7695 }, 'นครราชสีมา': { lat: 14.9799, lng: 102.0978 },
        'บึงกาฬ': { lat: 18.3609, lng: 103.6466 }, 'บุรีรัมย์': { lat: 14.9930, lng: 103.1029 },
        'มหาสารคาม': { lat: 16.1851, lng: 103.3006 }, 'มุกดาหาร': { lat: 16.5425, lng: 104.7235 },
        'ยโสธร': { lat: 15.7944, lng: 104.1451 }, 'ร้อยเอ็ด': { lat: 16.0538, lng: 103.6520 },
        'เลย': { lat: 17.4860, lng: 101.7223 }, 'สกลนคร': { lat: 17.1545, lng: 104.1348 },
        'สุรินทร์': { lat: 14.8818, lng: 103.4936 }, 'ศรีสะเกษ': { lat: 15.1186, lng: 104.3220 },
        'หนองคาย': { lat: 17.8783, lng: 102.7420 }, 'หนองบัวลำภู': { lat: 17.2218, lng: 102.4260 },
        'อุดรธานี': { lat: 17.4138, lng: 102.7872 }, 'อุบลราชธานี': { lat: 15.2286, lng: 104.8564 },
        'อำนาจเจริญ': { lat: 15.8656, lng: 104.6258 }, 'กรุงเทพมหานคร': { lat: 13.7563, lng: 100.5018 },
        'กำแพงเพชร': { lat: 16.4827, lng: 99.5226 }, 'ชัยนาท': { lat: 15.1851, lng: 100.1251 },
        'นครนายก': { lat: 14.2069, lng: 101.2133 }, 'นครปฐม': { lat: 13.8199, lng: 100.0638 },
        'นครสวรรค์': { lat: 15.7030, lng: 100.1371 }, 'นนทบุรี': { lat: 13.8591, lng: 100.5217 },
        'ปทุมธานี': { lat: 14.0208, lng: 100.5250 }, 'พระนครศรีอยุธยา': { lat: 14.3516, lng: 100.5844 },
        'พิจิตร': { lat: 16.4429, lng: 100.3487 }, 'พิษณุโลก': { lat: 16.8211, lng: 100.2659 },
        'เพชรบูรณ์': { lat: 16.4189, lng: 101.1591 }, 'ลพบุรี': { lat: 14.7995, lng: 100.6534 },
        'สมุทรปราการ': { lat: 13.5991, lng: 100.5998 }, 'สมุทรสงคราม': { lat: 13.4098, lng: 100.0024 },
        'สมุทรสาคร': { lat: 13.5475, lng: 100.2737 }, 'สิงห์บุรี': { lat: 14.8936, lng: 100.3967 },
        'สุโขทัย': { lat: 17.0078, lng: 99.8265 }, 'สุพรรณบุรี': { lat: 14.4744, lng: 100.1177 },
        'สระบุรี': { lat: 14.5289, lng: 100.9118 }, 'อ่างทอง': { lat: 14.5896, lng: 100.4550 },
        'อุทัยธานี': { lat: 15.3835, lng: 100.0245 }, 'จันทบุรี': { lat: 12.6113, lng: 102.1037 },
        'ฉะเชิงเทรา': { lat: 13.6904, lng: 101.0779 }, 'ชลบุรี': { lat: 13.3611, lng: 100.9847 },
        'ตราด': { lat: 12.2428, lng: 102.5175 }, 'ปราจีนบุรี': { lat: 14.0509, lng: 101.3717 },
        'ระยอง': { lat: 12.6814, lng: 101.2816 }, 'สระแก้ว': { lat: 13.8240, lng: 102.0645 },
        'กาญจนบุรี': { lat: 14.0041, lng: 99.5483 }, 'ตาก': { lat: 16.8840, lng: 99.1259 },
        'ประจวบคีรีขันธ์': { lat: 11.8126, lng: 99.7957 }, 'เพชรบุรี': { lat: 13.1112, lng: 99.9398 },
        'ราชบุรี': { lat: 13.5283, lng: 99.8134 }, 'กระบี่': { lat: 8.0863, lng: 98.9063 },
        'ชุมพร': { lat: 10.4930, lng: 99.1800 }, 'ตรัง': { lat: 7.5564, lng: 99.6114 },
        'นครศรีธรรมราช': { lat: 8.4304, lng: 99.9631 }, 'นราธิวาส': { lat: 6.4255, lng: 101.8253 },
        'ปัตตานี': { lat: 6.8686, lng: 101.2505 }, 'พังงา': { lat: 8.4511, lng: 98.5156 },
        'พัทลุง': { lat: 7.6167, lng: 100.0740 }, 'ภูเก็ต': { lat: 7.8804, lng: 98.3923 },
        'ยะลา': { lat: 6.5414, lng: 101.2803 }, 'ระนอง': { lat: 9.9529, lng: 98.6085 },
        'สงขลา': { lat: 7.1898, lng: 100.5954 }, 'สตูล': { lat: 6.6239, lng: 100.0673 },
        'สุราษฎร์ธานี': { lat: 9.1342, lng: 99.3334 },
    }

    // โหลดจังหวัดที่เคยเลือกไว้จาก localStorage
    useEffect(() => {
        const saved = localStorage.getItem('campaign_province')
        if (saved && provinces.includes(saved)) {
            setSelectedProvince(saved)
        }
    }, [])

    // ฟังก์ชันเลือกจังหวัด
    const handleSelectProvince = (province) => {
        setSelectedProvince(province)
        setProvinceSearch('')
        setShowProvinceDropdown(false)
        localStorage.setItem('campaign_province', province)
    }

    // กรองจังหวัดตามคำค้นหา
    const filteredProvinces = provinceSearch.trim()
        ? provinces.filter(p => p.includes(provinceSearch.trim()))
        : provinces

    // ปิด dropdown เมื่อคลิกข้างนอก
    useEffect(() => {
        const handleClickOutside = () => setShowProvinceDropdown(false)
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    // Data State
    const [reports, setReports] = useState([])
    const [provinceData, setProvinceData] = useState({})
    const [stats, setStats] = useState({ totalTrees: 0, totalReports: 0, activeProvinces: 0 })

    useEffect(() => {
        const q = query(collection(db, 'planting_reports'), orderBy('created_at', 'desc'))
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            setReports(data)

            let totalTrees = 0
            const pData = {}
            data.forEach(r => {
                const count = Number(r.trees_planted || 0)
                totalTrees += count
                if (r.province && r.latitude && r.longitude) {
                    if (!pData[r.province]) pData[r.province] = { count: 0, latSum: 0, lngSum: 0, countReports: 0 }
                    pData[r.province].count += count
                    pData[r.province].latSum += r.latitude
                    pData[r.province].lngSum += r.longitude
                    pData[r.province].countReports += 1
                }
            })

            // Center for each province (exact if available, otherwise average)
            for (const prov in pData) {
                const center = getProvinceCenter(prov);
                if (center) {
                    pData[prov].lat = center.lat;
                    pData[prov].lng = center.lng;
                } else {
                    pData[prov].lat = pData[prov].latSum / pData[prov].countReports;
                    pData[prov].lng = pData[prov].lngSum / pData[prov].countReports;
                }
            }

            setProvinceData(pData)
            setStats({
                totalTrees,
                totalReports: data.length,
                activeProvinces: Object.keys(pData).length
            })
        })
        return () => unsub()
    }, [])

    // ดึงพิกัดจากจังหวัดที่เลือก
    const getProvinceCoords = (province) => {
        return provinceCoordinates[province] || { lat: 13.7563, lng: 100.5018 }
    }

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            setAiTreeCount(null)
            setAiConfidence(null)
            setAiDescription(null)
            setCountError(null)
            const reader = new FileReader()
            reader.onloadend = () => setImagePreview(reader.result)
            reader.readAsDataURL(file)

            // Automatically call AI to count trees
            await countTreesFromImage(file)
        }
    }

    const countTreesFromImage = async (file) => {
        setIsCountingTrees(true)
        setCountError(null)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const isDev = import.meta.env.DEV
            let apiUrl = '/api/count-trees'
            if (isDev) {
                apiUrl = 'http://localhost:8000/count-trees'
            } else if (import.meta.env.VITE_API_URL) {
                if (import.meta.env.VITE_API_URL.includes('/analyze')) {
                    apiUrl = import.meta.env.VITE_API_URL.replace(/\/analyze$/, '/count-trees')
                } else {
                    apiUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '') + '/count-trees'
                }
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error('AI ไม่สามารถวิเคราะห์รูปภาพได้')
            }

            const result = await response.json()
            setAiTreeCount(result.tree_count)
            setAiConfidence(result.confidence)
            setAiDescription(result.description)
        } catch (error) {
            console.error('Error counting trees:', error)
            setCountError('ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองอีกครั้ง')
        } finally {
            setIsCountingTrees(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!image || aiTreeCount === null) {
            return alert('กรุณาอัปโหลดรูปภาพและรอให้ AI วิเคราะห์จำนวนต้นไม้ก่อน')
        }
        if (!selectedProvince) {
            return alert('กรุณาเลือกจังหวัดก่อนส่งรายงาน')
        }
        setIsSubmitting(true)
        try {
            const storageRef = ref(storage, `campaigns/${currentUser.uid}/${Date.now()}_${image.name}`)
            const snapshot = await uploadBytes(storageRef, image)
            const url = await getDownloadURL(snapshot.ref)

            const coords = getProvinceCoords(selectedProvince)
            await addDoc(collection(db, 'planting_reports'), {
                userId: currentUser.uid,
                image_url: url,
                tree_type: treeType,
                trees_planted: aiTreeCount,
                ai_verified: true,
                ai_confidence: aiConfidence,
                ai_description: aiDescription,
                notes,
                latitude: coords.lat,
                longitude: coords.lng,
                province: selectedProvince,
                created_at: serverTimestamp()
            })

            // Reset form (จังหวัดไม่ reset เพราะจำไว้ใน localStorage)
            setImage(null)
            setImagePreview(null)
            setTreeType('')
            setAiTreeCount(null)
            setAiConfidence(null)
            setAiDescription(null)
            setCountError(null)
            setNotes('')
            alert('บันทึกข้อมูลเรียบร้อยแล้ว!')

        } catch (error) {
            console.error('Failed to submit report', error)
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Sort provinces for leaderboard
    const leaderboard = Object.entries(provinceData)
        .map(([name, data]) => ({ name, count: data.count }))
        .sort((a, b) => b.count - a.count)

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="text-center animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-4 font-display">
                        TerraSense Tree Planting Campaign
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Track real-world tree planting efforts across the country. ร่วมกันสร้างพื้นที่สีเขียวทั่วไทย
                    </p>
                </div>

                {/* Community Impact Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-delay-1">
                    <div className="glass-card p-8 rounded-2xl text-center shadow-md">
                        <div className="text-4xl mb-2">🌳</div>
                        <p className="text-4xl font-bold text-eco-green-600">{stats.totalTrees.toLocaleString()}</p>
                        <p className="text-slate-500 font-medium">Trees Planted</p>
                    </div>
                    <div className="glass-card p-8 rounded-2xl text-center shadow-md">
                        <div className="text-4xl mb-2">📍</div>
                        <p className="text-4xl font-bold text-eco-green-600">{stats.totalReports.toLocaleString()}</p>
                        <p className="text-slate-500 font-medium">Planting Reports</p>
                    </div>
                    <div className="glass-card p-8 rounded-2xl text-center shadow-md">
                        <div className="text-4xl mb-2">🗺️</div>
                        <p className="text-4xl font-bold text-eco-green-600">{stats.activeProvinces}</p>
                        <p className="text-slate-500 font-medium">Active Provinces</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Map & Leaderboard - Left Column (2 spans) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Map */}
                        <div className="glass-card rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                            <div className="h-96 w-full relative z-0">
                                <MapContainer center={[13.75, 100.5]} zoom={5} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />

                                    {/* Bubble Map for Province totals (Geographic Fixed Size in Meters) */}
                                    {(() => {
                                        const maxTrees = Math.max(1, ...Object.values(provinceData).map(p => p.count));
                                        return Object.entries(provinceData).map(([prov, data], idx) => {
                                            const ratio = data.count / maxTrees;

                                            // ปรับขนาดรัศมีให้เล็กลงมากินพื้นที่น้อยลง
                                            const minRadius = 1500; // ต่ำสุด 1.5 กิโลเมตร
                                            const maxExtraRadius = 15000; // เพิ่มสูงสุดอีก 15 กิโลเมตร
                                            const radiusInMeters = minRadius + (ratio * maxExtraRadius);

                                            let h = 140;
                                            let s = 50 + (ratio * 50);
                                            let l = 45;
                                            return (
                                                <Circle
                                                    key={`circle-${idx}`}
                                                    center={[data.lat, data.lng]}
                                                    radius={radiusInMeters}
                                                    pathOptions={{ color: `hsl(${h}, ${s}%, ${l}%)`, fillColor: `hsl(${h}, ${s}%, ${l}%)`, fillOpacity: 0.9, weight: 2 }}
                                                >
                                                    <Popup className="custom-popup border-0">
                                                        <div className="text-center px-4 py-2 min-w-[150px]">
                                                            <div className="text-3xl mb-1 mt-1">🌿</div>
                                                            <h4 className="font-bold text-xl text-eco-green-800">{prov}</h4>
                                                            <div className="bg-eco-green-50 text-eco-green-600 border border-eco-green-100 font-bold mt-3 py-2 rounded-lg text-lg shadow-inner">
                                                                {data.count.toLocaleString()} ต้น
                                                            </div>
                                                            <p className="text-xs text-slate-500 font-medium mt-3">{data.countReports} โครงการในพื้นที่</p>
                                                        </div>
                                                    </Popup>
                                                </Circle>
                                            )
                                        });
                                    })()}
                                </MapContainer>
                            </div>
                        </div>

                        {/* Leaderboard */}
                        <div className="glass-card p-6 rounded-2xl shadow-md border border-slate-200">
                            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                🌱 Province Leaderboard
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-slate-100 text-slate-500 text-sm">
                                            <th className="py-3 px-4 font-semibold">Rank</th>
                                            <th className="py-3 px-4 font-semibold">Province</th>
                                            <th className="py-3 px-4 font-semibold text-right">Trees Planted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((item, index) => (
                                            <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-4 font-medium text-slate-600">
                                                    {index === 0 && '🥇'}
                                                    {index === 1 && '🥈'}
                                                    {index === 2 && '🥉'}
                                                    {index > 2 && `${index + 1}.`}
                                                </td>
                                                <td className="py-4 px-4 font-semibold text-slate-800">{item.name}</td>
                                                <td className="py-4 px-4 text-right font-bold text-eco-green-600">{item.count}</td>
                                            </tr>
                                        ))}
                                        {leaderboard.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="text-center py-6 text-slate-500">
                                                    ยังไม่มีข้อมูลแคมเปญ สนับสนุนเป็นจังหวัดแรกเลย!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Upload Form - Right Column (1 span) */}
                    <div className="glass-card p-8 rounded-2xl shadow-xl border border-slate-200 h-fit sticky top-28">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            📝 รายงานการปลูกต้นไม้
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Photo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">อัปโหลดรูปภาพต้นไม้ที่ปลูก <span className="text-red-500">*</span></label>
                                <p className="text-xs text-slate-400 mb-2">🤖 AI จะวิเคราะห์นับจำนวนต้นไม้จากรูปโดยอัตโนมัติ</p>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center relative hover:bg-slate-50 transition-colors cursor-pointer">
                                    <input type="file" required accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg shadow-md" />
                                    ) : (
                                        <div className="py-6 text-slate-500">
                                            <span className="text-3xl block mb-2">📸</span>
                                            คลิกเพื่อเลือกรูปต้นไม้ที่ปลูก
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* AI Tree Count Result */}
                            {isCountingTrees && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
                                        <div>
                                            <p className="font-semibold text-blue-800">🤖 AI กำลังนับต้นไม้...</p>
                                            <p className="text-xs text-blue-600">กรุณารอสักครู่ ระบบกำลังวิเคราะห์รูปภาพ</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {aiTreeCount !== null && !isCountingTrees && (
                                <div className="bg-eco-green-50 border border-eco-green-200 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-eco-green-800 text-lg">🌳 AI นับได้: {aiTreeCount} ต้น</p>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            aiConfidence === 'high' ? 'bg-green-100 text-green-700' :
                                            aiConfidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {aiConfidence === 'high' ? '✅ มั่นใจสูง' :
                                             aiConfidence === 'medium' ? '⚠️ มั่นใจปานกลาง' :
                                             '❓ มั่นใจต่ำ'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-white/60 rounded-lg p-2">💬 {aiDescription}</p>
                                    <button
                                        type="button"
                                        onClick={() => image && countTreesFromImage(image)}
                                        className="text-xs text-eco-green-600 hover:text-eco-green-800 underline transition-colors"
                                    >
                                        🔄 วิเคราะห์ใหม่อีกครั้ง
                                    </button>
                                </div>
                            )}

                            {countError && !isCountingTrees && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="text-red-700 font-medium">❌ {countError}</p>
                                    <button
                                        type="button"
                                        onClick={() => image && countTreesFromImage(image)}
                                        className="text-xs text-red-600 hover:text-red-800 underline mt-2 transition-colors"
                                    >
                                        🔄 ลองอีกครั้ง
                                    </button>
                                </div>
                            )}

                            {/* Tree Meta */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">ชนิดต้นไม้ (ไม่บังคับ)</label>
                                <input type="text" value={treeType} onChange={e => setTreeType(e.target.value)} placeholder="เช่น ยางนา, ตะเคียน, พะยูง" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-eco-green-500 outline-none" />
                            </div>



                            {/* Province Selector */}
                            <div className="pt-2 relative" onClick={(e) => e.stopPropagation()}>
                                <label className="block text-sm font-medium text-slate-700 mb-2">จังหวัดที่ปลูก <span className="text-red-500">*</span></label>
                                {selectedProvince && (
                                    <div className="flex items-center gap-3 p-3 mb-3 bg-eco-green-50 border border-eco-green-200 rounded-xl">
                                        <span className="text-xl">📍</span>
                                        <p className="font-bold text-eco-green-800 grow">{selectedProvince}</p>
                                        <button type="button" onClick={() => { setSelectedProvince(''); localStorage.removeItem('campaign_province') }} className="text-xs text-slate-400 hover:text-red-500 transition">
                                            เปลี่ยน
                                        </button>
                                    </div>
                                )}
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={provinceSearch}
                                        onChange={(e) => { setProvinceSearch(e.target.value); setShowProvinceDropdown(true) }}
                                        onFocus={() => setShowProvinceDropdown(true)}
                                        placeholder={selectedProvince ? 'ค้นหาเพื่อเปลี่ยนจังหวัด...' : 'พิมพ์ค้นหาจังหวัด...'}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-eco-green-500 outline-none text-sm"
                                    />
                                    {showProvinceDropdown && (
                                        <ul className="absolute z-50 w-full bg-white mt-1 rounded-xl shadow-lg border border-slate-100 max-h-48 overflow-y-auto">
                                            {filteredProvinces.map(p => (
                                                <li
                                                    key={p}
                                                    onClick={() => handleSelectProvince(p)}
                                                    className={`px-4 py-2.5 cursor-pointer text-sm transition-colors hover:bg-eco-green-50 ${p === selectedProvince ? 'bg-eco-green-100 font-bold text-eco-green-800' : 'text-slate-700'
                                                        }`}
                                                >
                                                    {p === selectedProvince ? `✅ ${p}` : p}
                                                </li>
                                            ))}
                                            {filteredProvinces.length === 0 && (
                                                <li className="px-4 py-3 text-sm text-slate-400 text-center">ไม่พบจังหวัดที่ค้นหา</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                                {!selectedProvince && <p className="text-xs text-slate-400 mt-1">💡 จังหวัดที่เลือกจะถูกจำไว้สำหรับครั้งถัดไป</p>}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">คำอธิบายเพิ่มเติม (ไม่บังคับ)</label>
                                <textarea rows="3" value={notes} onChange={e => setNotes(e.target.value)} placeholder="รายละเอียดโครงการ..." className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-eco-green-500 outline-none resize-none"></textarea>
                            </div>

                            <button type="submit" disabled={isSubmitting || !selectedProvince || aiTreeCount === null || isCountingTrees} className="w-full py-4 bg-eco-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-eco-green-700 transition-all flex justify-center items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                        <span>กำลังส่งข้อมูล...</span>
                                    </>
                                ) : (
                                    <>🚀 ร่วมส่งรายงาน</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    )
}
