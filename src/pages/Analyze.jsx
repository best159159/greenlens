import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import UploadSection from '../components/UploadSection'

// Compress image and return base64 string (~100-200KB)
const compressImage = (file, maxWidth = 800, quality = 0.72) => {
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
            const ratio = Math.min(1, maxWidth / img.width, maxWidth / img.height)
            const canvas = document.createElement('canvas')
            canvas.width = Math.round(img.width * ratio)
            canvas.height = Math.round(img.height * ratio)
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
            resolve(canvas.toDataURL('image/jpeg', quality))
        }
        img.src = URL.createObjectURL(file)
    })
}

export default function Analyze() {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const navigate = useNavigate()
    const { currentUser } = useAuth()

    const handleAnalysis = async (imageFile, province, latitude, longitude) => {
        setIsAnalyzing(true)
        try {
            // First analyze via backend
            const formData = new FormData()
            formData.append('file', imageFile)
            formData.append('province', province)
            if (latitude) formData.append('latitude', latitude)
            if (longitude) formData.append('longitude', longitude)

            const isDev = import.meta.env.DEV
            const apiUrl = isDev
                ? 'http://localhost:8000/analyze'
                : (import.meta.env.VITE_API_URL || '/api/analyze')

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(text)
            }

            const result = await response.json()

            // Compress image and store as base64 (bypasses Firebase Storage permission issues)
            let image_url = ''
            try {
                image_url = await compressImage(imageFile)
                console.log('[Image] compressed size:', Math.round(image_url.length / 1024), 'KB')
            } catch (err) {
                console.error("Image compression failed:", err)
                alert('compress รูปไม่สำเร็จ: ' + err.message)
            }

            if (!image_url) {
                alert('⚠️ ไม่สามารถบีบอัดรูปได้ — รูปจะไม่ถูกบันทึก')
            }

            // Save result to Firestore
            console.log('[Firestore] saving image_url length:', image_url.length)
            await addDoc(collection(db, 'analyses'), {
                userId: currentUser.uid,
                image_url,
                province,
                latitude: Number(latitude) || 0,
                longitude: Number(longitude) || 0,
                ai_surface_context: result.surface_context || '',
                vegetation_density: result.vegetation_density || '',
                climate_summary: result.climate_context_summary || '',
                recommended_trees: result.recommendations?.map(r => r.tree_name).join(', ') || '',
                created_at: serverTimestamp(),
                // Keep the whole object for easy display in history
                full_result: result
            })

            // Proceed to result page with result
            navigate('/result', { state: { analysisResult: result } })

        } catch (error) {
            console.error(error)
            alert('เกิดข้อผิดพลาดในการวิเคราะห์: ' + error.message)
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="pt-20 min-h-screen">
            <UploadSection onAnalyze={handleAnalysis} isAnalyzing={isAnalyzing} />
        </div>
    )
}
