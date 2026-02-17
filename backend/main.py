import os
import base64
import json
import math
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

# ==============================
# โหลด Tree Database (จากไฟล์ Python โดยตรง)
# ==============================
try:
    from backend.tree_data import TREE_DATABASE_DATA as TREE_DATABASE
    print("Loaded tree data from backend.tree_data")
except ImportError:
    # Fallback for local run
    from tree_data import TREE_DATABASE_DATA as TREE_DATABASE
    print("Loaded tree data from local tree_data")


# ==============================
# Scientific Calculation Functions
# ==============================

def calc_canopy_coverage(diameter_m):
    """คำนวณพื้นที่ร่มเงาจากเส้นผ่านศูนย์กลางทรงพุ่ม (วงกลม)
    สูตร: A = π × (d/2)²
    """
    radius = diameter_m / 2
    return round(math.pi * radius ** 2, 1)


def calc_temperature_reduction(canopy_coverage_m2):
    """คำนวณอุณหภูมิที่ลดลงจากพื้นที่ร่มเงา
    สูตรประมาณ: ทุกๆ 30 m² ของร่มเงา ลดอุณหภูมิได้ ~0.5°C (อ้างอิง urban heat island research)
    ค่าสูงสุดไม่เกิน 5°C
    """
    reduction = (canopy_coverage_m2 / 30) * 0.5
    return round(min(reduction, 5.0), 1)


def calc_green_potential_score(tree_data):
    """คำนวณ Green Potential Score จากหลายปัจจัย (0-100)
    สูตร:
      - CO₂ absorption weight: 30%
      - Canopy coverage weight: 25%
      - Drought tolerance weight: 15%
      - Lifespan weight: 15%
      - Growth rate weight: 15%
    """
    co2 = tree_data["co2_absorption_kg_per_year"]
    canopy_d = tree_data["average_canopy_diameter_m"]
    lifespan = tree_data["lifespan_years"]

    # Normalize CO₂ (max ~40 kg/yr ในฐานข้อมูล)
    co2_score = min(co2 / 40 * 100, 100)
    

    # Normalize canopy (max ~15m diameter)
    canopy_score = min(canopy_d / 15 * 100, 100)

    # Drought tolerance
    drought_map = {"high": 100, "medium": 60, "low": 30}
    drought_score = drought_map.get(tree_data["drought_tolerance"], 50)

    # Lifespan (max 200 years)
    lifespan_score = min(lifespan / 200 * 100, 100)

    # Growth rate
    growth_map = {"fast": 90, "medium": 60, "slow": 35}
    growth_score = growth_map.get(tree_data["growth_rate"], 50)

    score = (
        co2_score * 0.30 +
        canopy_score * 0.25 +
        drought_score * 0.15 +
        lifespan_score * 0.15 +
        growth_score * 0.15
    )
    return round(score)


def calc_monthly_co2(annual_co2, peak_months):
    """คำนวณการดูดซับ CO₂ รายเดือนจากค่ารายปี + เดือนที่เจริญเติบโตสูงสุด
    สูตร:
      - เดือนที่อยู่ใน peak_months จะได้ค่าสูงกว่า (~1.5x ของค่าเฉลี่ย)
      - เดือนที่ไม่อยู่ใน peak_months จะได้ค่าต่ำกว่า (~0.6x ของค่าเฉลี่ย)
      - ผลรวม 12 เดือน = annual_co2
    """
    peak_count = len(peak_months)
    off_peak_count = 12 - peak_count

    if peak_count == 0 or off_peak_count == 0:
        return [round(annual_co2 / 12, 1)] * 12

    # สร้างสมการ: peak_count * peak_val + off_peak_count * off_val = annual_co2
    # โดย peak_val = 1.5 * base, off_val = 0.6 * base
    # → base * (peak_count * 1.5 + off_peak_count * 0.6) = annual_co2
    base = annual_co2 / (peak_count * 1.5 + off_peak_count * 0.6)
    peak_val = round(base * 1.5, 1)
    off_val = round(base * 0.6, 1)

    monthly = []
    for month in range(1, 13):
        if month in peak_months:
            monthly.append(peak_val)
        else:
            monthly.append(off_val)

    # ปรับให้ผลรวมตรงพอดี (แก้ rounding error)
    diff = round(annual_co2 - sum(monthly), 1)
    if diff != 0:
        monthly[peak_months[0] - 1] = round(monthly[peak_months[0] - 1] + diff, 1)

    return monthly


def compute_scientific_data(tree_data):
    """รวมการคำนวณทั้งหมดเป็นก้อนเดียว"""
    canopy_area = calc_canopy_coverage(tree_data["average_canopy_diameter_m"])
    temp_reduction = calc_temperature_reduction(canopy_area)
    green_score = calc_green_potential_score(tree_data)
    monthly_co2 = calc_monthly_co2(
        tree_data["co2_absorption_kg_per_year"],
        tree_data.get("peak_growth_months", [5, 6, 7, 8])
    )

    return {
        "scientific_name": tree_data["scientific_name"],
        "english_name": tree_data["english_name"],
        "co2_absorption_kg_per_year": tree_data["co2_absorption_kg_per_year"],
        "canopy_coverage_m2": canopy_area,
        "temperature_reduction_celsius": temp_reduction,
        "green_potential_score": green_score,
        "monthly_co2_data": monthly_co2,
        "growth_rate": tree_data["growth_rate"],
        "max_height_m": tree_data["max_height_m"],
        "water_requirement": tree_data["water_requirement"],
        "drought_tolerance": tree_data["drought_tolerance"],
        "lifespan_years": tree_data["lifespan_years"]
    }


# ==============================
# Helper Functions
# ==============================

def get_all_tree_names():
    """ดึงรายชื่อต้นไม้ทั้งหมดจาก database แยกตามประเภท"""
    result = {}
    for category in ["economic", "edible", "conservation"]:
        result[category] = [t["name"] for t in TREE_DATABASE.get(category, [])]
    return result


def lookup_tree(name, category):
    """ค้นหาข้อมูลต้นไม้จากชื่อ + ประเภท"""
    trees = TREE_DATABASE.get(category, [])
    for tree in trees:
        if tree["name"] == name:
            return tree
    # fallback: partial match
    for tree in trees:
        if tree["name"] in name or name in tree["name"]:
            return tree
    return None


def build_tree_list_prompt():
    """สร้าง prompt ที่มีรายชื่อต้นไม้ทั้งหมด ให้ AI เลือก"""
    names = get_all_tree_names()
    lines = []
    lines.append("รายชื่อต้นไม้ที่สามารถแนะนำได้ (ห้ามแนะนำต้นไม้นอกรายชื่อนี้):\n")
    lines.append("ไม้เศรษฐกิจ (economic): " + ", ".join(names["economic"]))
    lines.append("ไม้กินได้ (edible): " + ", ".join(names["edible"]))
    lines.append("ไม้อนุรักษ์ (conservation): " + ", ".join(names["conservation"]))
    return "\n".join(lines)


# ==============================
# API Endpoints
# ==============================

@app.get("/")
def read_root():
    return {"message": "GreenLens AI Backend (GPT-5.2 + Scientific Model) is running!"}


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...), province: str = Form(...)):
    if not client:
        raise HTTPException(status_code=500, detail="OpenAI API Key not found. Please check .env file.")

    # 1. Read and encode image
    contents = await file.read()
    encoded_image = base64.b64encode(contents).decode("utf-8")
    media_type = file.content_type

    # 2. สร้างรายชื่อต้นไม้จาก database
    tree_list_prompt = build_tree_list_prompt()

    # 3. Construct prompt
    prompt = f"""คุณคือผู้เชี่ยวชาญด้านการใช้ประโยชน์ที่ดินเพื่อสิ่งแวดล้อม และที่ปรึกษาด้านวนเกษตร

บทบาทของคุณคือการทำการวิเคราะห์เชิงคุณภาพ (QUALITATIVE) เท่านั้น
คุณต้อง **ห้ามสร้างค่าตัวเลขทางวิทยาศาสตร์** เช่น ปริมาณการดูดซับ CO2, อุณหภูมิที่ลดลง, ค่า pH หรือสถิติด้านสิ่งแวดล้อมที่วัดได้ใดๆ

ระบบจะคำนวณผลกระทบด้านสิ่งแวดล้อมเป็นตัวเลขแยกต่างหาก โดยใช้โมเดลทางวิทยาศาสตร์ที่ตรวจสอบแล้ว

คุณจะได้รับข้อมูล:
1. รูปภาพของพื้นที่ดิน
2. ข้อมูลสถานที่: จังหวัด {province}, ประเทศไทย

{tree_list_prompt}

⚠️ สำคัญมาก: คุณต้องเลือกต้นไม้จากรายชื่อข้างบนเท่านั้น ห้ามแนะนำต้นไม้อื่นนอกรายชื่อนี้เด็ดขาด
⚠️ ชื่อต้นไม้ใน tree_name ต้องตรงกับรายชื่อด้านบนเป๊ะๆ (เช่น "สักทอง", "มะม่วง", "ต้นจามจุรี")

งานของคุณ:

1. วิเคราะห์ลักษณะทางกายภาพของพื้นที่:
   - เนื้อดิน (ทราย/เหนียว/ร่วน/ผสม/ไม่แน่ใจ)
   - แสงแดด (แดดจัด/แดดบางส่วน/ร่มเงา)
   - ความหนาแน่นของพืชพรรณ (เบาบาง/ปานกลาง/หนาแน่น)
   - สัญญาณการพังทลาย ความแห้งแล้ง หรือการกักเก็บน้ำ

2. ตีความสภาพภูมิอากาศของจังหวัด{province} และอธิบาย:
   - ความเหมาะสมสำหรับการทำวนเกษตร
   - ข้อจำกัดที่อาจเกิดขึ้น (เช่น ความเสี่ยงแล้ง น้ำท่วม พายุ)
   - สภาพระบบนิเวศทั่วไป

3. เลือกต้นไม้ 3 ต้น จากรายชื่อที่กำหนด (ประเภทละ 1 ต้น):
   - 1 ไม้เศรษฐกิจ (economic)
   - 1 ไม้กินได้ (edible)
   - 1 ไม้อนุรักษ์ (conservation)

สำหรับแต่ละต้นไม้ที่เลือก ให้ระบุ:
   - ชื่อ (ต้องตรงกับรายชื่อข้างบน)
   - เหตุผลที่เหมาะกับพื้นที่นี้
   - ข้อควรระวังในการดูแล
   - ประโยชน์ด้านสิ่งแวดล้อม (เชิงคุณภาพเท่านั้น)

รูปแบบการตอบกลับที่เคร่งครัด:
ตอบกลับเป็น JSON ที่ถูกต้องเท่านั้น (ห้ามมีข้อความอื่นนอกเหนือจาก JSON):

{{
  "land_analysis": {{
    "soil_texture": "<ทราย/เหนียว/ร่วน/ผสม/ไม่แน่ใจ>",
    "sunlight": "<แดดจัด/แดดบางส่วน/ร่มเงา>",
    "vegetation_density": "<เบาบาง/ปานกลาง/หนาแน่น>",
    "observations": "<อธิบายสิ่งที่มองเห็นได้>"
  }},
  "climate_interpretation": {{
    "overall_suitability": "<อธิบายความเหมาะสมของพื้นที่>",
    "risks": "<ความเสี่ยงด้านภูมิอากาศ>",
    "ecological_notes": "<ข้อสังเกตเพิ่มเติม>"
  }},
  "recommendations": [
    {{
      "category": "economic",
      "tree_name": "<ชื่อจากรายชื่อที่กำหนด>",
      "reason": "<เหตุผลที่เหมาะกับพื้นที่>",
      "care_notes": "<คำแนะนำการดูแล>",
      "environmental_benefits": "<ประโยชน์เชิงคุณภาพ>"
    }},
    {{
      "category": "edible",
      "tree_name": "<ชื่อจากรายชื่อที่กำหนด>",
      "reason": "<เหตุผลที่เหมาะกับพื้นที่>",
      "care_notes": "<คำแนะนำการดูแล>",
      "environmental_benefits": "<ประโยชน์เชิงคุณภาพ>"
    }},
    {{
      "category": "conservation",
      "tree_name": "<ชื่อจากรายชื่อที่กำหนด>",
      "reason": "<เหตุผลที่เหมาะกับพื้นที่>",
      "care_notes": "<คำแนะนำการดูแล>",
      "environmental_benefits": "<ประโยชน์เชิงคุณภาพ>"
    }}
  ],
  "confidence_level": "<สูง/ปานกลาง/ต่ำ พร้อมคำอธิบาย>"
}}

กฎเกณฑ์:
- ห้ามสร้างสถิติด้านสิ่งแวดล้อมเป็นตัวเลข
- ต้องเลือกต้นไม้จากรายชื่อที่กำหนดให้เท่านั้น
- ชื่อต้นไม้ต้องตรงเป๊ะกับรายชื่อ
- ตอบเป็นภาษาไทยทั้งหมด
"""

    try:
        # 4. Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-5.2",
            max_completion_tokens=2000,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{media_type};base64,{encoded_image}"
                            }
                        }
                    ]
                }
            ]
        )

        # 5. Parse AI response
        response_text = response.choices[0].message.content

        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        ai_result = json.loads(response_text)

        # ==============================
        # 6. Scientific Model Layer
        # ==============================
        total_co2 = 0
        total_canopy = 0
        total_temp_reduction = 0

        for rec in ai_result.get("recommendations", []):
            tree_name = rec.get("tree_name", "")
            category = rec.get("category", "")

            # ค้นหาข้อมูลจาก tree_database.json
            tree_data = lookup_tree(tree_name, category)

            if tree_data:
                # คำนวณค่าวิทยาศาสตร์ทั้งหมด
                sci = compute_scientific_data(tree_data)
                rec["scientific_data"] = sci

                total_co2 += sci["co2_absorption_kg_per_year"]
                total_canopy += sci["canopy_coverage_m2"]
                total_temp_reduction += sci["temperature_reduction_celsius"]
            else:
                rec["scientific_data"] = None
                print(f"⚠️ ไม่พบข้อมูลต้นไม้: {tree_name} ในหมวด {category}")

        # 7. Environmental Impact Summary
        tree_count = len([r for r in ai_result["recommendations"] if r.get("scientific_data")])
        ai_result["environmental_impact"] = {
            "total_co2_absorption": {
                "value": round(total_co2, 1),
                "unit": "kg/ปี",
                "description": "ศักยภาพการดูดซับ CO₂ รวมทุกต้น"
            },
            "average_temperature_reduction": {
                "value": round(total_temp_reduction / max(tree_count, 1), 1),
                "unit": "°C",
                "description": "อุณหภูมิที่คาดว่าจะลดลงโดยเฉลี่ย"
            },
            "total_canopy_coverage": {
                "value": round(total_canopy, 1),
                "unit": "m²",
                "description": "พื้นที่ร่มเงารวม"
            }
        }

        ai_result["province"] = province

        return ai_result

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Analysis failed: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
