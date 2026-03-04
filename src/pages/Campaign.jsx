import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { db, storage } from '../firebase'
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore'
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
    const [treesPlanted, setTreesPlanted] = useState(1)
    const [notes, setNotes] = useState('')
    const [location, setLocation] = useState({ lat: '', lng: '', province: '', district: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLocating, setIsLocating] = useState(false)

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

    const getFallbackLocation = async () => {
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            const lat = data.latitude;
            const lng = data.longitude;
            const state = data.region || '';
            const province = state.replace('Province', '').trim() || 'Unknown';
            const district = data.city || '';
            setLocation({ lat, lng, province, district });
        } catch (error) {
            console.error('IP Geolocation failed', error);
            setLocation({ lat: 13.7563, lng: 100.5018, province: 'Bangkok', district: 'Phra Nakhon' }); // Absolute fallback to BKK
        } finally {
            setIsLocating(false);
        }
    }

    const handleGetLocation = () => {
        setIsLocating(true)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const lat = pos.coords.latitude
                const lng = pos.coords.longitude
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`)
                    const data = await res.json()
                    const state = data.address?.state || ''
                    let province = state.replace('Province', '').trim()
                    let district = data.address?.county || data.address?.city || ''
                    if (!province) throw new Error('No province in reverse geocode');
                    setLocation({ lat, lng, province, district })
                    setIsLocating(false)
                } catch (e) {
                    console.error('Reverse geocode failed', e)
                    // If reverse geocode fails, fallback to IP
                    await getFallbackLocation()
                }
            }, async () => {
                console.log('User denied GPS or GPS failed, using IP Geolocation fallback')
                await getFallbackLocation()
            }, {
                timeout: 5000 // Added timeout, wait 5 sec max for GPS
            })
        } else {
            console.log('Browser no GPS support, using IP Geolocation fallback')
            getFallbackLocation()
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            const reader = new FileReader()
            reader.onloadend = () => setImagePreview(reader.result)
            reader.readAsDataURL(file)

            // Auto detect location when image is selected
            handleGetLocation()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!image) {
            return alert('กรุณาอัปโหลดรูปภาพ')
        }
        if (!location.province || location.province === 'Unknown') {
            return alert('กำลังตรวจจับตำแหน่ง หรือไม่สามารถระบุตำแหน่งได้ กรุณาอนุญาตให้เบราว์เซอร์เข้าถึง GPS เพื่อระบุจังหวัดอัตโนมัติ')
        }
        setIsSubmitting(true)
        try {
            const storageRef = ref(storage, `campaigns/${currentUser.uid}/${Date.now()}_${image.name}`)
            const snapshot = await uploadBytes(storageRef, image)
            const url = await getDownloadURL(snapshot.ref)

            await addDoc(collection(db, 'planting_reports'), {
                userId: currentUser.uid,
                image_url: url,
                tree_type: treeType,
                trees_planted: Number(treesPlanted),
                notes,
                latitude: location.lat,
                longitude: location.lng,
                province: location.province,
                created_at: serverTimestamp()
            })

            // Reset form
            setImage(null)
            setImagePreview(null)
            setTreeType('')
            setTreesPlanted(1)
            setNotes('')
            setLocation({ lat: '', lng: '', province: '', district: '' })
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
                        GreenLens Tree Planting Campaign
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
                                <label className="block text-sm font-medium text-slate-700 mb-2">อัปโหลดรูปภาพ <span className="text-red-500">*</span></label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center relative hover:bg-slate-50 transition-colors cursor-pointer">
                                    <input type="file" required accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg shadow-md" />
                                    ) : (
                                        <div className="py-6 text-slate-500">
                                            <span className="text-3xl block mb-2">📸</span>
                                            คลิกเพื่อเลือกสถานที่ปลูก
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tree Meta */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">ชนิดต้นไม้ (ไม่บังคับ)</label>
                                <input type="text" value={treeType} onChange={e => setTreeType(e.target.value)} placeholder="เช่น ยางนา, ตะเคียน, พะยูง" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-eco-green-500 outline-none" />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">จำนวนต้นที่ปลูก <span className="text-red-500">*</span></label>
                                <input type="number" required min="1" value={treesPlanted} onChange={e => setTreesPlanted(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-eco-green-500 outline-none" />
                            </div>

                            {/* Auto Location Status */}
                            <div className="pt-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">พิกัดสถานที่ <span className="text-red-500">*</span></label>
                                {isLocating ? (
                                    <div className="flex items-center gap-3 p-4 bg-eco-green-50 border border-eco-green-100 rounded-xl text-eco-green-700">
                                        <div className="w-5 h-5 border-2 border-eco-green-600 border-t-transparent animate-spin rounded-full"></div>
                                        <span className="font-medium">ระบบกำลังตรวจหาตำแหน่งอัตโนมัติ...</span>
                                    </div>
                                ) : location.lat && location.province !== 'Unknown' ? (
                                    <div className="flex items-center gap-3 p-4 bg-eco-green-50 border border-eco-green-200 rounded-xl">
                                        <span className="text-2xl">📍</span>
                                        <div>
                                            <p className="font-bold text-eco-green-800">{location.province}</p>
                                            <p className="text-sm text-eco-green-600">{location.district || 'ตำแหน่งที่ตั้งของคุณ'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                        <span className="text-2xl opacity-50">📍</span>
                                        <p className="text-sm text-slate-500 font-medium">ตำแหน่งจะถูกตรวจจับอัตโนมัติเมื่อเลือกรูปภาพ<br /><span className="text-xs text-red-400">* จำเป็นต้องอนุญาต GPS ในเบราว์เซอร์ล่วงหน้า</span></p>
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">คำอธิบายเพิ่มเติม (ไม่บังคับ)</label>
                                <textarea rows="3" value={notes} onChange={e => setNotes(e.target.value)} placeholder="รายละเอียดโครงการ..." className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-eco-green-500 outline-none resize-none"></textarea>
                            </div>

                            <button type="submit" disabled={isSubmitting || isLocating} className="w-full py-4 bg-eco-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-eco-green-700 transition-all flex justify-center items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed">
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
