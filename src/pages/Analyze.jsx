import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { db, storage } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import UploadSection from '../components/UploadSection'

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

            // After receiving backend analysis, upload image to firebase storage
            let image_url = ''
            try {
                const storageRef = ref(storage, `analyses/${currentUser.uid}/${Date.now()}_${imageFile.name}`)
                const snapshot = await uploadBytes(storageRef, imageFile)
                image_url = await getDownloadURL(snapshot.ref)
            } catch (err) {
                console.warn("Storage upload failed, skipping map url", err)
            }

            // Save result to Firestore
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
