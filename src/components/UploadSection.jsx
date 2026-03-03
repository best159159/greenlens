import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Default Leaflet marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create an inner component to handle map clicks
const LocationMarker = ({ position, setPosition, setLatitude, setLongitude }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng)
            setLatitude(e.latlng.lat.toFixed(6))
            setLongitude(e.latlng.lng.toFixed(6))
        }
    })

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom())
        }
    }, [position, map])

    return position === null ? null : (
        <Marker position={position}></Marker>
    )
}

const UploadSection = ({ onAnalyze, isAnalyzing }) => {
    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [selectedProvince, setSelectedProvince] = useState('')
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [mapPosition, setMapPosition] = useState({ lat: 13.7563, lng: 100.5018 }) // Default Bangkok
    const [markerPosition, setMarkerPosition] = useState(null)
    const [localArea, setLocalArea] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)

    // Sync input to map marker when typed
    useEffect(() => {
        if (latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
            setMarkerPosition({ lat: Number(latitude), lng: Number(longitude) })
        }
    }, [latitude, longitude])

    const provinces = [
        // ภาคเหนือ
        'เชียงราย', 'เชียงใหม่', 'น่าน', 'พะเยา', 'แพร่', 'แม่ฮ่องสอน', 'ลำปาง', 'ลำพูน', 'อุตรดิตถ์',
        // ภาคตะวันออกเฉียงเหนือ
        'กาฬสินธุ์', 'ขอนแก่น', 'ชัยภูมิ', 'นครพนม', 'นครราชสีมา', 'บึงกาฬ', 'บุรีรัมย์', 'มหาสารคาม', 'มุกดาหาร', 'ยโสธร', 'ร้อยเอ็ด', 'เลย', 'สกลนคร', 'สุรินทร์', 'ศรีสะเกษ', 'หนองคาย', 'หนองบัวลำภู', 'อุดรธานี', 'อุบลราชธานี', 'อำนาจเจริญ',
        // ภาคกลาง
        'กรุงเทพมหานคร', 'กำแพงเพชร', 'ชัยนาท', 'นครนายก', 'นครปฐม', 'นครสวรรค์', 'นนทบุรี', 'ปทุมธานี', 'พระนครศรีอยุธยา', 'พิจิตร', 'พิษณุโลก', 'เพชรบูรณ์', 'ลพบุรี', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สระบุรี', 'อ่างทอง', 'อุทัยธานี',
        // ภาคตะวันออก
        'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ตราด', 'ปราจีนบุรี', 'ระยอง', 'สระแก้ว',
        // ภาคตะวันตก
        'กาญจนบุรี', 'ตาก', 'ประจวบคีรีขันธ์', 'เพชรบุรี', 'ราชบุรี',
        // ภาคใต้
        'กระบี่', 'ชุมพร', 'ตรัง', 'นครศรีธรรมราช', 'นราธิวาส', 'ปัตตานี', 'พังงา', 'พัทลุง', 'ภูเก็ต', 'ยะลา', 'ระนอง', 'สงขลา', 'สตูล', 'สุราษฎร์ธานี'
    ].sort()

    // Mapping กึ่งสำเร็จรูปสำหรับพิกัดใจกลางจังหวัดหลักๆ แบบคร่าวๆ
    const provinceCoordinates = {
        'กรุงเทพมหานคร': { lat: 13.7563, lng: 100.5018 },
        'เชียงใหม่': { lat: 18.7883, lng: 98.9853 },
        'ขอนแก่น': { lat: 16.4322, lng: 102.8236 },
        'นครราชสีมา': { lat: 14.9799, lng: 102.0978 },
        'อุดรธานี': { lat: 17.4138, lng: 102.7872 },
        'ชลบุรี': { lat: 13.3611, lng: 100.9847 },
        'ภูเก็ต': { lat: 7.8804, lng: 98.3923 },
        'สงขลา': { lat: 7.1898, lng: 100.5954 },
        'สุราษฎร์ธานี': { lat: 9.1342, lng: 99.3334 },
        'สระบุรี': { lat: 14.5289, lng: 100.9118 },
        'พระนครศรีอยุธยา': { lat: 14.3516, lng: 100.5844 },
    }

    const [mapInstance, setMapInstance] = useState(null)

    // Handle province change and auto-pan
    const handleProvinceChange = async (e) => {
        const province = e.target.value
        setSelectedProvince(province)

        if (!province) return;

        // ถ้ามีใน mapping แข็ง ให้ใช้เลย
        if (provinceCoordinates[province]) {
            const coords = provinceCoordinates[province]
            setMapPosition(coords)
            setMarkerPosition(coords)
            setLatitude(coords.lat.toFixed(6))
            setLongitude(coords.lng.toFixed(6))
            if (mapInstance) mapInstance.flyTo(coords, 10)
            return
        }

        // ถ้าไม่มี ลอง fetch API เอาพิกัดคร่าวๆ
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(province + ', Thailand')}`)
            const data = await res.json()
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat)
                const lng = parseFloat(data[0].lon)
                const newPos = { lat, lng }
                setMapPosition(newPos)
                setMarkerPosition(newPos)
                setLatitude(lat.toFixed(6))
                setLongitude(lng.toFixed(6))
                if (mapInstance) mapInstance.flyTo(newPos, 10)
            }
        } catch (error) {
            console.error("Failed to fetch province coordinates", error)
        }
    }

    // Handle location search with debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (localArea && localArea.trim().length > 2) {
                setIsSearching(true)
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(localArea + ', Thailand')}&limit=5`)
                    const data = await res.json()
                    setSearchResults(data)
                    setShowDropdown(true)
                } catch (error) {
                    console.error("Search failed:", error)
                } finally {
                    setIsSearching(false)
                }
            } else {
                setSearchResults([])
                setShowDropdown(false)
            }
        }, 800)
        return () => clearTimeout(timer)
    }, [localArea])

    const handleSelectLocation = (place) => {
        const lat = parseFloat(place.lat)
        const lng = parseFloat(place.lon)
        const newPos = { lat, lng }

        const shortName = place.display_name.split(',').slice(0, 3).join(',')
        setLocalArea(shortName)
        setShowDropdown(false)
        setMapPosition(newPos)
        setMarkerPosition(newPos)
        setLatitude(lat.toFixed(6))
        setLongitude(lng.toFixed(6))

        if (mapInstance) mapInstance.flyTo(newPos, 14) // Zoom in closer for specific location
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleAnalyze = () => {
        if (selectedImage && selectedProvince) {
            onAnalyze(selectedImage, selectedProvince, latitude, longitude)
        }
    }

    return (
        <section id="upload-section" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 animate-fade-in">
                    <h2 className="text-4xl font-bold gradient-text mb-4">
                        อัปโหลดรูปภาพพื้นที่
                    </h2>
                    <p className="text-slate-600 text-lg">
                        ให้ AI ช่วยประเมินลักษณะพื้นที่เบื้องต้นเพื่อสนับสนุนการวางแผนพื้นที่สีเขียว
                    </p>
                </div>

                <div className="glass-card rounded-2xl p-8 space-y-6">
                    {/* Upload Zone */}
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                        />
                        <label
                            htmlFor="image-upload"
                            className="block border-3 border-dashed border-eco-green-300 rounded-xl p-12 text-center cursor-pointer hover:border-eco-green-500 hover:bg-eco-green-50/50 transition-all duration-300"
                        >
                            {imagePreview ? (
                                <div className="space-y-4">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-h-64 mx-auto rounded-lg shadow-lg"
                                    />
                                    <p className="text-eco-green-600 font-medium">
                                        คลิกเพื่อเปลี่ยนรูปภาพ
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-6xl">📸</div>
                                    <div>
                                        <p className="text-lg font-medium text-slate-700">
                                            คลิกเพื่ออัปโหลดรูปภาพ
                                        </p>
                                        <p className="text-sm text-slate-500 mt-2">
                                            รองรับไฟล์ JPG, PNG (สูงสุด 10MB)
                                        </p>
                                    </div>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Location Selection Zone */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Province Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                เลือกจังหวัด <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedProvince}
                                onChange={handleProvinceChange}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-eco-green-500 focus:ring focus:ring-eco-green-200 transition-all outline-none text-slate-700 bg-white"
                            >
                                <option value="">-- เลือกจังหวัด --</option>
                                {provinces.map((province) => (
                                    <option key={province} value={province}>
                                        {province}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Local Area Input */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ค้นหาสถานที่ / เขต / อำเภอ <span className="text-slate-400 font-normal">(ค้นหาพิกัดแผนที่)</span>
                            </label>
                            <input
                                type="text"
                                value={localArea}
                                onChange={(e) => {
                                    setLocalArea(e.target.value)
                                    setShowDropdown(true)
                                }}
                                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true) }}
                                placeholder="พิมพ์ชื่อเพื่อค้นหา เช่น สวนลุมพินี..."
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-eco-green-500 focus:ring focus:ring-eco-green-200 transition-all outline-none text-slate-700"
                            />
                            {/* Loading Indicator */}
                            {isSearching && (
                                <div className="absolute right-4 top-11 z-10">
                                    <div className="w-5 h-5 border-2 border-eco-green-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}

                            {/* Autocomplete Dropdown */}
                            {showDropdown && searchResults.length > 0 && (
                                <ul className="absolute z-50 w-full bg-white mt-1 rounded-xl shadow-lg border border-slate-100 max-h-60 overflow-y-auto">
                                    {searchResults.map((place) => (
                                        <li
                                            key={place.place_id}
                                            onClick={() => handleSelectLocation(place)}
                                            className="px-4 py-3 hover:bg-eco-green-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                                        >
                                            <p className="text-sm text-slate-800 line-clamp-2">{place.display_name}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Coordinates (Latitude / Longitude) & Map */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            ปักหมุดบนแผนที่ หรือกรอกพิกัดเพื่อดึงข้อมูลสภาพอากาศ
                        </label>

                        {/* Map Container */}
                        <div className="w-full h-64 rounded-xl overflow-hidden shadow-inner mb-4 border-2 border-slate-200 relative z-0">
                            <MapContainer
                                center={mapPosition}
                                zoom={6}
                                scrollWheelZoom={true}
                                style={{ height: '100%', width: '100%' }}
                                ref={setMapInstance}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker
                                    position={markerPosition}
                                    setPosition={setMarkerPosition}
                                    setLatitude={setLatitude}
                                    setLongitude={setLongitude}
                                />
                            </MapContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="number"
                                    placeholder="ละติจูด (ต.ย. 13.7563)"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-eco-green-500 focus:ring focus:ring-eco-green-200 transition-all outline-none text-slate-700"
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    placeholder="ลองจิจูด (ต.ย. 100.5018)"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-eco-green-500 focus:ring focus:ring-eco-green-200 transition-all outline-none text-slate-700"
                                />
                            </div>
                        </div>
                        <div className="mt-2 text-right">
                            <button
                                type="button"
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition((pos) => {
                                            const lat = pos.coords.latitude;
                                            const lng = pos.coords.longitude;
                                            setLatitude(lat.toFixed(6));
                                            setLongitude(lng.toFixed(6));
                                            setMarkerPosition({ lat, lng });
                                            setMapPosition({ lat, lng });
                                        }, () => {
                                            alert('ไม่สามารถดึงตำแหน่งได้ หรือผู้ใช้ไม่อนุญาตการเข้าถึง GPS');
                                        });
                                    } else {
                                        alert('เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัดอัตโนมัติ');
                                    }
                                }}
                                className="text-sm text-eco-green-600 font-medium hover:text-eco-green-700 transition"
                            >
                                📍 ดึงตำแหน่งปัจจุบันของฉัน
                            </button>
                        </div>
                    </div>

                    {/* Analyze Button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={!selectedImage || !selectedProvince || isAnalyzing}
                        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${!selectedImage || !selectedProvince || isAnalyzing
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'btn-primary'
                            }`}
                    >
                        {isAnalyzing ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>กำลังวิเคราะห์ด้วย AI...</span>
                            </div>
                        ) : (
                            '🤖 วิเคราะห์ด้วย AI'
                        )}
                    </button>
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                        <div className="text-3xl mb-3">🌍</div>
                        <h3 className="font-semibold text-slate-800 mb-2">สังเกตลักษณะพื้นที่</h3>
                        <p className="text-sm text-slate-600">
                            ประเมินเบื้องต้นจากภาพถ่าย
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                        <div className="text-3xl mb-3">🌳</div>
                        <h3 className="font-semibold text-slate-800 mb-2">แนะนำพันธุ์ไม้</h3>
                        <p className="text-sm text-slate-600">
                            เลือกพันธุ์ไม้ที่เหมาะสมที่สุด
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                        <div className="text-3xl mb-3">📊</div>
                        <h3 className="font-semibold text-slate-800 mb-2">ประมาณการผลกระทบ</h3>
                        <p className="text-sm text-slate-600">
                            คำนวณช่วงผลกระทบด้านสิ่งแวดล้อม
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default UploadSection
