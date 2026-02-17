import { useState } from 'react'

const UploadSection = ({ onAnalyze, isAnalyzing }) => {
    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [selectedProvince, setSelectedProvince] = useState('')

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
            onAnalyze(selectedImage, selectedProvince)
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
                        ให้ AI วิเคราะห์ศักยภาพการฟื้นฟูสิ่งแวดล้อมของพื้นที่คุณ
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

                    {/* Province Selector */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            เลือกจังหวัด
                        </label>
                        <select
                            value={selectedProvince}
                            onChange={(e) => setSelectedProvince(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-eco-green-500 focus:ring focus:ring-eco-green-200 transition-all outline-none text-slate-700"
                        >
                            <option value="">-- เลือกจังหวัด --</option>
                            {provinces.map((province) => (
                                <option key={province} value={province}>
                                    {province}
                                </option>
                            ))}
                        </select>
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
                        <h3 className="font-semibold text-slate-800 mb-2">วิเคราะห์ดิน</h3>
                        <p className="text-sm text-slate-600">
                            ตรวจสอบคุณภาพดินและความชื้น
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
                        <h3 className="font-semibold text-slate-800 mb-2">คาดการณ์ผล</h3>
                        <p className="text-sm text-slate-600">
                            ประเมินผลกระทบด้านสิ่งแวดล้อม
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default UploadSection
