import os
import base64
import json
import math
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

# ==============================
# App Setup
# ==============================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client (ใช้ Environment Variable ของ Vercel โดยตรง)
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

# ==============================
# Tree Database (Inline - ไม่ต้องโหลดไฟล์)
# ==============================
TREE_DATABASE = {
    "economic": [
        {
            "name": "สักทอง",
            "english_name": "Teak",
            "scientific_name": "Tectona grandis",
            "growth_rate": "medium",
            "max_height_m": 30,
            "average_canopy_diameter_m": 8,
            "co2_absorption_kg_per_year": 22,
            "water_requirement": "medium",
            "drought_tolerance": "high",
            "root_depth": "deep",
            "lifespan_years": 100,
            "suitable_soil_types": ["ร่วน", "ร่วนปนทราย"],
            "suitable_regions": ["ภาคเหนือ", "ภาคตะวันตก", "ภาคกลาง"],
            "peak_growth_months": [5, 6, 7, 8, 9],
            "notes": "ไม้มีค่าสูง ต้องการดินระบายน้ำดี เจริญเติบโตดีในพื้นที่สูง"
        },
        {
            "name": "ยางพารา",
            "english_name": "Rubber Tree",
            "scientific_name": "Hevea brasiliensis",
            "growth_rate": "fast",
            "max_height_m": 25,
            "average_canopy_diameter_m": 7,
            "co2_absorption_kg_per_year": 28,
            "water_requirement": "high",
            "drought_tolerance": "low",
            "root_depth": "medium",
            "lifespan_years": 30,
            "suitable_soil_types": ["ร่วน", "เหนียว"],
            "suitable_regions": ["ภาคใต้", "ภาคตะวันออก"],
            "peak_growth_months": [4, 5, 6, 7, 8, 9, 10],
            "notes": "ให้น้ำยาง 25 ปี ต้องการฝนมาก เหมาะกับภาคใต้"
        },
        {
            "name": "ไม้แดง",
            "english_name": "Padauk",
            "scientific_name": "Pterocarpus macrocarpus",
            "growth_rate": "slow",
            "max_height_m": 25,
            "average_canopy_diameter_m": 6,
            "co2_absorption_kg_per_year": 18,
            "water_requirement": "low",
            "drought_tolerance": "high",
            "root_depth": "deep",
            "lifespan_years": 150,
            "suitable_soil_types": ["ร่วน", "ทราย", "ร่วนปนทราย"],
            "suitable_regions": ["ภาคเหนือ", "ภาคตะวันออกเฉียงเหนือ", "ภาคกลาง"],
            "peak_growth_months": [5, 6, 7, 8],
            "notes": "ไม้ป่าสงวน ทนแล้ง โตช้าแต่เนื้อไม้มีค่าสูงมาก"
        },
        {
            "name": "ยูคาลิปตัส",
            "english_name": "Eucalyptus",
            "scientific_name": "Eucalyptus camaldulensis",
            "growth_rate": "fast",
            "max_height_m": 30,
            "average_canopy_diameter_m": 7,
            "co2_absorption_kg_per_year": 32,
            "water_requirement": "medium",
            "drought_tolerance": "high",
            "root_depth": "deep",
            "lifespan_years": 40,
            "suitable_soil_types": ["ทราย", "ร่วน", "ร่วนปนทราย"],
            "suitable_regions": ["ภาคเหนือ", "ภาคตะวันออกเฉียงเหนือ", "ภาคกลาง"],
            "peak_growth_months": [5, 6, 7, 8, 9],
            "notes": "ไม้โตเร็ว นิยมใช้ในอุตสาหกรรมเยื่อกระดาษและพลังงานชีวมวล"
        },
        {
            "name": "พะยูง",
            "english_name": "Siamese Rosewood",
            "scientific_name": "Dalbergia cochinchinensis",
            "growth_rate": "slow",
            "max_height_m": 25,
            "average_canopy_diameter_m": 8,
            "co2_absorption_kg_per_year": 20,
            "water_requirement": "medium",
            "drought_tolerance": "medium",
            "root_depth": "deep",
            "lifespan_years": 120,
            "suitable_soil_types": ["ร่วน", "ร่วนปนทราย"],
            "suitable_regions": ["ภาคตะวันออกเฉียงเหนือ", "ภาคตะวันออก"],
            "peak_growth_months": [5, 6, 7, 8],
            "notes": "ไม้เนื้อแข็งมีมูลค่าสูง ต้องการการดูแลและการอนุรักษ์"
        }
    ],
    "edible": [
        {
            "name": "มะม่วง",
            "english_name": "Mango",
            "scientific_name": "Mangifera indica",
            "growth_rate": "medium",
            "max_height_m": 15,
            "average_canopy_diameter_m": 8,
            "co2_absorption_kg_per_year": 16,
            "water_requirement": "medium",
            "drought_tolerance": "medium",
            "root_depth": "deep",
            "lifespan_years": 80,
            "suitable_soil_types": ["ร่วน", "ร่วนปนทราย", "เหนียว"],
            "suitable_regions": ["ภาคเหนือ", "ภาคกลาง", "ภาคตะวันออกเฉียงเหนือ", "ภาคตะวันออก"],
            "peak_growth_months": [3, 4, 5, 6, 7],
            "notes": "ผลไม้ส่งออกสำคัญ ให้ร่มเงาดี ทนแล้งได้ปานกลาง"
        },
        {
            "name": "ทุเรียน",
            "english_name": "Durian",
            "scientific_name": "Durio zibethinus",
            "growth_rate": "medium",
            "max_height_m": 25,
            "average_canopy_diameter_m": 10,
            "co2_absorption_kg_per_year": 20,
            "water_requirement": "high",
            "drought_tolerance": "low",
            "root_depth": "medium",
            "lifespan_years": 100,
            "suitable_soil_types": ["ร่วน", "ร่วนปนเหนียว"],
            "suitable_regions": ["ภาคตะวันออก", "ภาคใต้"],
            "peak_growth_months": [4, 5, 6, 7, 8, 9],
            "notes": "ราชาผลไม้ ราคาสูง ต้องการน้ำมากและดินระบายน้ำดี"
        },
        {
            "name": "ขนุน",
            "english_name": "Jackfruit",
            "scientific_name": "Artocarpus heterophyllus",
            "growth_rate": "fast",
            "max_height_m": 20,
            "average_canopy_diameter_m": 7,
            "co2_absorption_kg_per_year": 15,
            "water_requirement": "medium",
            "drought_tolerance": "medium",
            "root_depth": "deep",
            "lifespan_years": 60,
            "suitable_soil_types": ["ร่วน", "ร่วนปนทราย", "ร่วนปนเหนียว"],
            "suitable_regions": ["ภาคกลาง", "ภาคตะวันออก", "ภาคใต้"],
            "peak_growth_months": [3, 4, 5, 6, 7, 8],
            "notes": "ผลใหญ่ กินได้ทั้งดิบและสุก เนื้อไม้ใช้ทำเฟอร์นิเจอร์"
        },
        {
            "name": "มะขาม",
            "english_name": "Tamarind",
            "scientific_name": "Tamarindus indica",
            "growth_rate": "medium",
            "max_height_m": 20,
            "average_canopy_diameter_m": 9,
            "co2_absorption_kg_per_year": 18,
            "water_requirement": "low",
            "drought_tolerance": "high",
            "root_depth": "deep",
            "lifespan_years": 100,
            "suitable_soil_types": ["ร่วน", "ร่วนปนทราย", "ทราย"],
            "suitable_regions": ["ภาคเหนือ", "ภาคตะวันออกเฉียงเหนือ", "ภาคกลาง"],
            "peak_growth_months": [4, 5, 6, 7, 8],
            "notes": "ไม้ผลทนแล้ง ให้ร่มเงาดี และมีอายุยืน"
        },
        {
            "name": "ฝรั่ง",
            "english_name": "Guava",
            "scientific_name": "Psidium guajava",
            "growth_rate": "fast",
            "max_height_m": 10,
            "average_canopy_diameter_m": 5,
            "co2_absorption_kg_per_year": 12,
            "water_requirement": "medium",
            "drought_tolerance": "medium",
            "root_depth": "medium",
            "lifespan_years": 40,
            "suitable_soil_types": ["ร่วน", "ร่วนปนทราย"],
            "suitable_regions": ["ทุกภาค"],
            "peak_growth_months": [3, 4, 5, 6, 7, 8],
            "notes": "ไม้ผลโตเร็ว ดูแลง่าย เหมาะกับสวนครัวและเชิงพาณิชย์ขนาดเล็ก"
        }
    ],
    "conservation": [
        {
            "name": "ต้นจามจุรี",
            "english_name": "Rain Tree",
            "scientific_name": "Samanea saman",
            "growth_rate": "fast",
            "max_height_m": 25,
            "average_canopy_diameter_m": 15,
            "co2_absorption_kg_per_year": 35,
            "water_requirement": "medium",
            "drought_tolerance": "high",
            "root_depth": "deep",
            "lifespan_years": 80,
            "suitable_soil_types": ["ร่วน", "เหนียว", "ทราย", "ผสม"],
            "suitable_regions": ["ทุกภาค"],
            "peak_growth_months": [4, 5, 6, 7, 8, 9, 10],
            "notes": "ทรงพุ่มกว้างมาก ให้ร่มเงาดีเยี่ยม ปลูกได้ทุกสภาพดิน"
        },
        {
            "name": "ประดู่",
            "english_name": "Burma Padauk",
            "scientific_name": "Pterocarpus indicus",
            "growth_rate": "medium",
            "max_height_m": 20,
            "average_canopy_diameter_m": 10,
            "co2_absorption_kg_per_year": 25,
            "water_requirement": "medium",
            "drought_tolerance": "medium",
            "root_depth": "medium",
            "lifespan_years": 100,
            "suitable_soil_types": ["ร่วน", "ร่วนปนเหนียว"],
            "suitable_regions": ["ภาคกลาง", "ภาคเหนือ", "ภาคตะวันออกเฉียงเหนือ"],
            "peak_growth_months": [5, 6, 7, 8, 9],
            "notes": "ต้นไม้ประจำจังหวัดหลายจังหวัด ดอกสีเหลืองสวยงาม"
        },
        {
            "name": "ตะเคียนทอง",
            "english_name": "Iron Wood",
            "scientific_name": "Hopea odorata",
            "growth_rate": "slow",
            "max_height_m": 35,
            "average_canopy_diameter_m": 10,
            "co2_absorption_kg_per_year": 30,
            "water_requirement": "high",
            "drought_tolerance": "low",
            "root_depth": "deep",
            "lifespan_years": 200,
            "suitable_soil_types": ["ร่วน", "เหนียว"],
            "suitable_regions": ["ภาคใต้", "ภาคตะวันออก", "ภาคกลาง"],
            "peak_growth_months": [5, 6, 7, 8, 9, 10],
            "notes": "ไม้ยืนต้นขนาดใหญ่ ดูดซับ CO₂ ได้มาก เนื้อไม้แข็งแรงมาก"
        },
        {
            "name": "พะยอม",
            "english_name": "Shorea roxburghii",
            "scientific_name": "Shorea roxburghii",
            "growth_rate": "medium",
            "max_height_m": 25,
            "average_canopy_diameter_m": 10,
            "co2_absorption_kg_per_year": 24,
            "water_requirement": "medium",
            "drought_tolerance": "medium",
            "root_depth": "deep",
            "lifespan_years": 120,
            "suitable_soil_types": ["ร่วน", "ร่วนปนทราย"],
            "suitable_regions": ["ภาคเหนือ", "ภาคตะวันออกเฉียงเหนือ", "ภาคกลาง"],
            "peak_growth_months": [5, 6, 7, 8, 9],
            "notes": "ไม้พื้นถิ่น ให้ร่มเงาดี เหมาะกับการฟื้นฟูป่า"
        },
        {
            "name": "ยางนา",
            "english_name": "Yang Na",
            "scientific_name": "Dipterocarpus alatus",
            "growth_rate": "medium",
            "max_height_m": 35,
            "average_canopy_diameter_m": 12,
            "co2_absorption_kg_per_year": 30,
            "water_requirement": "high",
            "drought_tolerance": "low",
            "root_depth": "deep",
            "lifespan_years": 150,
            "suitable_soil_types": ["ร่วน", "เหนียว"],
            "suitable_regions": ["ภาคกลาง", "ภาคตะวันออก", "ภาคใต้"],
            "peak_growth_months": [5, 6, 7, 8, 9, 10],
            "notes": "ไม้ยืนต้นขนาดใหญ่ เหมาะกับพื้นที่ชุ่มน้ำและลุ่มแม่น้ำ"
        }
    ]
}


# ==============================
# Estimation Model Functions
# ----- Planning-Level DSS -----
# ==============================

def calc_canopy_coverage(diameter_m):
    radius = diameter_m / 2
    return round(math.pi * radius ** 2, 1)


def calc_temperature_reduction_range(canopy_coverage_m2, tree_data=None, site_area=None):
    nominal_area = site_area if site_area else max(canopy_coverage_m2, 100.0)
    canopy_fraction = min(canopy_coverage_m2 / nominal_area, 1.0)

    e_factor = 1.0
    if tree_data:
        water_req = tree_data.get("water_requirement", "medium")
        if water_req == "low":
            e_factor = 0.75
        elif water_req == "high":
            e_factor = 1.1

    low_coeff = 0.8
    high_coeff = 2.0

    min_reduction = round(canopy_fraction * low_coeff * e_factor, 2)
    max_reduction = round(canopy_fraction * high_coeff * e_factor, 2)

    min_reduction = round(max(0.1, min_reduction), 1)
    max_reduction = round(max(0.3, max_reduction), 1)
    if min_reduction >= max_reduction:
        max_reduction = round(min_reduction + 0.2, 1)

    return [min_reduction, max_reduction]


def calc_co2_range(annual_co2_midpoint):
    return {
        "low": round(annual_co2_midpoint * 0.70, 1),
        "mid": round(annual_co2_midpoint, 1),
        "high": round(annual_co2_midpoint * 1.15, 1)
    }


def calc_green_potential_score(tree_data):
    co2 = tree_data["co2_absorption_kg_per_year"]
    canopy_d = tree_data["average_canopy_diameter_m"]
    lifespan = tree_data["lifespan_years"]

    co2_score = min(co2 / 40 * 100, 100)
    canopy_score = min(canopy_d / 15 * 100, 100)
    lifespan_score = min(lifespan / 200 * 100, 100)

    drought_map = {"high": 100, "medium": 60, "low": 30}
    drought_score = drought_map.get(tree_data.get("drought_tolerance", "medium"), 50)

    growth_map = {"fast": 90, "medium": 60, "slow": 35}
    growth_score = growth_map.get(tree_data.get("growth_rate", "medium"), 50)

    W1, W2, W3, W4, W5 = 0.30, 0.25, 0.15, 0.15, 0.15
    score = (
        co2_score * W1 +
        canopy_score * W2 +
        drought_score * W3 +
        lifespan_score * W4 +
        growth_score * W5
    )

    return {
        "total": round(score),
        "breakdown": {
            "co2_absorption": {"score": round(co2_score, 1), "weight": W1},
            "canopy_coverage": {"score": round(canopy_score, 1), "weight": W2},
            "drought_tolerance": {"score": round(drought_score, 1), "weight": W3},
            "lifespan": {"score": round(lifespan_score, 1), "weight": W4},
            "growth_rate": {"score": round(growth_score, 1), "weight": W5}
        }
    }


def calc_monthly_co2(annual_co2, peak_months):
    peak_count = len(peak_months)
    off_peak_count = 12 - peak_count

    if peak_count == 0 or off_peak_count == 0:
        return [round(annual_co2 / 12, 1)] * 12

    base = annual_co2 / (peak_count * 1.5 + off_peak_count * 0.6)
    peak_val = round(base * 1.5, 1)
    off_val = round(base * 0.6, 1)

    monthly = []
    for month in range(1, 13):
        if month in peak_months:
            monthly.append(peak_val)
        else:
            monthly.append(off_val)

    diff = round(annual_co2 - sum(monthly), 1)
    if diff != 0:
        monthly[peak_months[0] - 1] = round(monthly[peak_months[0] - 1] + diff, 1)

    return monthly


def compute_scientific_data(tree_data):
    canopy_area = calc_canopy_coverage(tree_data["average_canopy_diameter_m"])
    temp_reduction = calc_temperature_reduction_range(canopy_area, tree_data)
    green_score = calc_green_potential_score(tree_data)
    co2_range = calc_co2_range(tree_data["co2_absorption_kg_per_year"])
    monthly_co2 = calc_monthly_co2(
        tree_data["co2_absorption_kg_per_year"],
        tree_data.get("peak_growth_months", [5, 6, 7, 8])
    )

    return {
        "scientific_name": tree_data["scientific_name"],
        "english_name": tree_data["english_name"],
        "co2_absorption_kg_per_year": tree_data["co2_absorption_kg_per_year"],
        "co2_absorption_range": co2_range,
        "canopy_coverage_m2": canopy_area,
        "temperature_reduction_celsius": temp_reduction,
        "green_potential_score": green_score["total"],
        "green_score_breakdown": green_score["breakdown"],
        "monthly_co2_data": monthly_co2,
        "growth_rate": tree_data["growth_rate"],
        "max_height_m": tree_data["max_height_m"],
        "water_requirement": tree_data["water_requirement"],
        "drought_tolerance": tree_data["drought_tolerance"],
        "lifespan_years": tree_data["lifespan_years"],
        "data_note": "Values represent estimated mature-tree performance under favorable tropical conditions."
    }


# ==============================
# Helper Functions
# ==============================

def get_all_tree_names():
    result = {}
    for category in ["economic", "edible", "conservation"]:
        result[category] = [t["name"] for t in TREE_DATABASE.get(category, [])]
    return result


def lookup_tree(name, category):
    trees = TREE_DATABASE.get(category, [])
    for tree in trees:
        if tree["name"] == name:
            return tree
    for tree in trees:
        if tree["name"] in name or name in tree["name"]:
            return tree
    return None


def build_tree_list_prompt():
    names = get_all_tree_names()
    lines = []
    lines.append("รายชื่อต้นไม้ที่สามารถแนะนำได้ (ห้ามแนะนำต้นไม้นอกรายชื่อนี้):\n")
    lines.append("ไม้เศรษฐกิจ (economic): " + ", ".join(names["economic"]))
    lines.append("ไม้กินได้ (edible): " + ", ".join(names["edible"]))
    lines.append("ไม้อนุรักษ์ (conservation): " + ", ".join(names["conservation"]))
    return "\n".join(lines)


# ==============================
# Province-to-Region Mapping
# ==============================
def get_region_for_province(province_name):
    """Maps a Thai province name to its region."""
    province_regions = {
        # Northern
        "เชียงราย": "เหนือ", "เชียงใหม่": "เหนือ", "น่าน": "เหนือ", "พะเยา": "เหนือ",
        "แพร่": "เหนือ", "แม่ฮ่องสอน": "เหนือ", "ลำปาง": "เหนือ", "ลำพูน": "เหนือ",
        "อุตรดิตถ์": "เหนือ",
        # Northeastern (Isan)
        "กาฬสินธุ์": "ตะวันออกเฉียงเหนือ", "ขอนแก่น": "ตะวันออกเฉียงเหนือ", "ชัยภูมิ": "ตะวันออกเฉียงเหนือ",
        "นครพนม": "ตะวันออกเฉียงเหนือ", "นครราชสีมา": "ตะวันออกเฉียงเหนือ", "บึงกาฬ": "ตะวันออกเฉียงเหนือ",
        "บุรีรัมย์": "ตะวันออกเฉียงเหนือ", "มหาสารคาม": "ตะวันออกเฉียงเหนือ", "มุกดาหาร": "ตะวันออกเฉียงเหนือ",
        "ยโสธร": "ตะวันออกเฉียงเหนือ", "ร้อยเอ็ด": "ตะวันออกเฉียงเหนือ", "เลย": "ตะวันออกเฉียงเหนือ",
        "ศรีสะเกษ": "ตะวันออกเฉียงเหนือ", "สกลนคร": "ตะวันออกเฉียงเหนือ", "สุรินทร์": "ตะวันออกเฉียงเหนือ",
        "หนองคาย": "ตะวันออกเฉียงเหนือ", "หนองบัวลำภู": "ตะวันออกเฉียงเหนือ", "อุดรธานี": "ตะวันออกเฉียงเหนือ",
        "อุบลราชธานี": "ตะวันออกเฉียงเหนือ", "อำนาจเจริญ": "ตะวันออกเฉียงเหนือ",
        # Central
        "กรุงเทพมหานคร": "กลาง", "กำแพงเพชร": "กลาง", "ชัยนาท": "กลาง", "นครนายก": "กลาง",
        "นครปฐม": "กลาง", "นครสวรรค์": "กลาง", "นนทบุรี": "กลาง", "ปทุมธานี": "กลาง",
        "พระนครศรีอยุธยา": "กลาง", "พิจิตร": "กลาง", "พิษณุโลก": "กลาง", "เพชรบูรณ์": "กลาง",
        "ลพบุรี": "กลาง", "สมุทรปราการ": "กลาง", "สมุทรสงคราม": "กลาง", "สมุทรสาคร": "กลาง",
        "สระบุรี": "กลาง", "สิงห์บุรี": "กลาง", "สุโขทัย": "กลาง", "สุพรรณบุรี": "กลาง",
        "อ่างทอง": "กลาง", "อุทัยธานี": "กลาง",
        # Eastern
        "จันทบุรี": "ตะวันออก", "ฉะเชิงเทรา": "ตะวันออก", "ชลบุรี": "ตะวันออก", "ตราด": "ตะวันออก",
        "ปราจีนบุรี": "ตะวันออก", "ระยอง": "ตะวันออก", "สระแก้ว": "ตะวันออก",
        # Western
        "กาญจนบุรี": "ตะวันตก", "ตาก": "ตะวันตก", "ประจวบคีรีขันธ์": "ตะวันตก", "เพชรบุรี": "ตะวันตก",
        "ราชบุรี": "ตะวันตก",
        # Southern
        "กระบี่": "ใต้", "ชุมพร": "ใต้", "ตรัง": "ใต้", "นครศรีธรรมราช": "ใต้",
        "นราธิวาส": "ใต้", "ปัตตานี": "ใต้", "พังงา": "ใต้", "พัทลุง": "ใต้",
        "ภูเก็ต": "ใต้", "ยะลา": "ใต้", "ระนอง": "ใต้", "สงขลา": "ใต้",
        "สตูล": "ใต้", "สุราษฎร์ธานี": "ใต้"
    }
    return province_regions.get(province_name, "ไม่ทราบภาค")


# ==============================
# API Endpoints
# ==============================

@app.get("/api")
def read_root():
    return {"message": "GreenLens AI — Environmental Decision Support System is running."}


@app.post("/api/analyze")
async def analyze_image(file: UploadFile = File(...), province: str = Form(...), latitude: float = Form(None), longitude: float = Form(None)):
    if not client:
        raise HTTPException(status_code=500, detail="OpenAI API Key not found.")

    contents = await file.read()
    encoded_image = base64.b64encode(contents).decode("utf-8")
    media_type = file.content_type

    climate_context_text = ""
    current_weather_data = None
    if latitude is not None and longitude is not None:
        try:
            import urllib.request
            import json as libjson
            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m"
            req = urllib.request.Request(weather_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    data = libjson.loads(response.read().decode())
                    w = data.get("current", {})
                    t = w.get("temperature_2m", "-")
                    h = w.get("relative_humidity_2m", "-")
                    p = w.get("precipitation", "-")
                    ws = w.get("wind_speed_10m", "-")
                    climate_context_text = f"""
ข้อมูลภาพรวมภูมิอากาศปัจจุบัน (จาก Open-Meteo พิกัด {latitude}, {longitude}):
- อุณหภูมิ: {t} °C
- ความชื้นสัมพัทธ์: {h} %
- ปริมาณน้ำฝน: {p} mm
- ความเร็วลม: {ws} km/h

คำเตือน: ข้อมูลสภาพอากาศให้ใช้เป็นข้อมูลแวดล้อมเท่านั้น (contextual background) ห้ามใช้ประเมินความเหมาะสมทางการเกษตรแบบตรงตัว ห้ามใช้คัดเลือกพันธุ์ไม้ และห้ามอ้างถึงในการเปลี่ยนแปลงการคำนวณด้านวิทยาศาสตร์ของระบบหลัก
"""
                    # เก็บข้อมูลดิบไว้ใช้ซ้ำ (ไม่ต้องเรียก API อีกรอบ)
                    current_weather_data = {
                        "temperature_c": w.get("temperature_2m"),
                        "humidity_percent": w.get("relative_humidity_2m"),
                        "precipitation_mm": w.get("precipitation"),
                        "wind_speed_kmh": w.get("wind_speed_10m"),
                        "latitude": latitude,
                        "longitude": longitude,
                        "source": "Open-Meteo"
                    }
        except Exception as e:
            print("Error fetching Open-Meteo data:", e)

    # 2.5 Fetch Climate Profile (5-Year Historical)
    climate_profile = None
    if latitude is not None and longitude is not None:
        try:
            import datetime
            import urllib.request
            import json as libjson
            end_date = datetime.date.today()
            start_date = end_date.replace(year=end_date.year - 5)
            archive_url = f"https://archive-api.open-meteo.com/v1/archive?latitude={latitude}&longitude={longitude}&start_date={start_date.isoformat()}&end_date={end_date.isoformat()}&daily=temperature_2m_mean,precipitation_sum&timezone=auto"
            req_arch = urllib.request.Request(archive_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req_arch, timeout=5) as response_arch:
                if response_arch.status == 200:
                    data_arch = libjson.loads(response_arch.read().decode())
                    daily = data_arch.get("daily", {})
                    temps = daily.get("temperature_2m_mean", [])
                    precips = daily.get("precipitation_sum", [])
                    
                    valid_temps = [t for t in temps if t is not None]
                    valid_precips = [p for p in precips if p is not None]
                    
                    avg_temp = sum(valid_temps) / len(valid_temps) if valid_temps else 0
                    total_precip_5y = sum(valid_precips)
                    avg_annual_precip = total_precip_5y / 5.0 if valid_precips else 0
                    
                    monthly_precip = {}
                    dates = daily.get("time", [])
                    for i, date_str in enumerate(dates):
                        if precips[i] is not None:
                            ym = date_str[:7]
                            monthly_precip[ym] = monthly_precip.get(ym, 0) + precips[i]
                            
                    dry_months = sum(1 for p in monthly_precip.values() if p < 60)
                    avg_dry_months = dry_months / 5.0
                    
                    climate_profile = {
                        "avg_annual_temperature_c": round(avg_temp, 1),
                        "avg_annual_precipitation_mm": round(avg_annual_precip, 1),
                        "avg_dry_months_per_year": round(avg_dry_months, 1),
                        "data_period": f"{start_date.isoformat()} to {end_date.isoformat()}",
                        "note": "Climate profile is contextual only and does not influence deterministic impact models."
                    }
                    
                    # Compute Climate Risk Index
                    tr = min(max(((avg_temp - 25.0) / 10.0) * 100.0, 0.0), 100.0)
                    dr = min((avg_dry_months / 6.0) * 100.0, 100.0)
                    if avg_annual_precip < 1000:
                        rr = 100.0
                    elif avg_annual_precip > 2000:
                        rr = 0.0
                    else:
                        rr = 100.0 - (((avg_annual_precip - 1000.0) / 1000.0) * 100.0)
                        
                    cri = (tr * 0.4) + (dr * 0.35) + (rr * 0.25)
                    cri = min(max(round(cri), 0), 100)
                    
                    if cri <= 30:
                        cl_level = "Low Climate Stress"
                    elif cri <= 60:
                        cl_level = "Moderate Seasonal Stress"
                    elif cri <= 80:
                        cl_level = "High Climate Stress"
                    else:
                        cl_level = "Severe Environmental Stress"
                        
                    climate_profile["climate_risk_index"] = cri
                    climate_profile["climate_risk_level"] = cl_level
        except Exception as e:
            print("Error fetching Open-Meteo archive data:", e)

    climate_profile_text = f"ข้อมูล Climate Profile 5 ปีย้อนหลัง:\n{json.dumps(climate_profile, ensure_ascii=False)}" if climate_profile else "ไม่มีข้อมูล Historical 5 ปี"

    prompt = f"""คุณคือที่ปรึกษาระบบ Decision Support System (DSS) สำหรับการจัดการพื้นที่สีเขียว

หน้าที่ของคุณคือการวิเคราะห์ "บริบทของพื้นที่และสภาพแวดล้อมเบื้องต้น" (Contextual Analysis) จากรูปภาพและข้อมูลสภาพอากาศ ณ ปัจจุบันเท่านั้น

กฎที่ต้องปฏิบัติตามอย่างเคร่งครัด:
1. ข้อมูลสภาพอากาศ (อุณหภูมิ, ความชื้น, ลม) ให้ใช้บรรยายเป็น "ข้อมูลแวดล้อมเฉพาะกิจหน้างาน" (Short-term contextual layer) เท่านั้น
2. ห้ามทึกทักหรือสรุปสภาพภูมิอากาศระยะยาว (Long-term climate history) ของระดับจังหวัดจากข้อมูลสภาพอากาศปัจจุบัน
3. ห้ามแนะนำชื่อต้นไม้ ห้ามคัดเลือกสายพันธุ์ และห้ามระบุความเหมาะสมในการเจริญเติบโตของพืช
4. ห้ามคำนวณผลกระทบทางสิ่งแวดล้อมหรือประเมินค่าตัวเลขใดๆ (ระบบ Backend มีโมเดลคำนวณแยกต่างหาก)

ข้อมูลที่ได้รับ:
- รูปภาพของพื้นที่
- ข้อมูลสถานที่: จังหวัด {province}, ประเทศไทย
{climate_context_text}
{climate_profile_text}
- แผนที่การเติบโต: ประเมินการเจริญเติบโตที่ projection_year = 1, 5, 10, 20 ปี

งานของคุณ (วิเคราะห์และตอบกลับเป็น JSON เท่านั้น โครงสร้างตามด้านล่าง ห้ามเพิ่มคีย์อื่น):
1. surface_context: บรรยายสภาพพื้นผิวที่เห็นจากภาพแบบคร่าวๆ (เช่น ลานคอนกรีต, ที่ดินรกร้าง, พื้นที่ดินทราย)
2. vegetation_density: ประเมินความหนาแน่นของพืชพรรณเดิมในภาพ (ตัวอย่าง: เบาบาง, ปานกลาง, หนาแน่น, ไม่มี, ไม่ทราบ)
3. climate_context_summary: อธิบายข้อมูลสภาพอากาศที่ได้รับแบบบรรยายสั้นๆ (อิงตามตัวเลขที่ได้ ห้ามคาดเดาอนาคต) ให้ระบุตัวเลขอุณหภูมิ ความชื้น ลม ที่ได้รับมาด้วย
4. environmental_notes: ข้อสังเกตสั้นๆ เกี่ยวกับสภาพแวดล้อม ณ วันนี้
5. confidence_level: ระดับความมั่นใจในการประเมินภาพ (high / medium / low)
6. climate_risk_analysis: บทวิเคราะห์ความเสี่ยงด้านสภาพอากาศในระยะยาว (Qualitative Only ดึงจาก profile)
7. long_term_growth_advisory: คำแนะนำเชิงคุณภาพสำหรับการเติบโตของพืชพรรณระยะยาว (Do NOT select tree species. Do NOT compute scores. Provide qualitative long-term environmental advisory only.)
8. action_plan: แนะนำขั้นตอนที่ผู้ใช้ควรปฏิบัติ (Step-by-step Action Plan) จำนวน 5-7 ขั้นตอน
   กฎสำคัญ:
   - ห้ามเขียนแบบกว้างๆ ทั่วไป ต้องอ้างอิงจากข้อมูลที่ได้รับจริง
   - ทุกขั้นตอน ต้องระบุ "เพราะอะไร" โดยอิงจากข้อมูล เช่น "เนื่องจากอุณหภูมิปัจจุบันอยู่ที่ X°C และความชื้น Y%" หรือ "จากภาพพบว่าพื้นที่เป็นลักษณะ..."
   - เรียงลำดับจากง่ายไปยาก: สำรวจ → ปรับปรุงดิน → วางระบบน้ำ → ปลูก → ดูแลระยะยาว
   - (เป็น array ของ string)
9. ai_summary: สรุปภาพรวมจาก AI แบบเฉพาะเจาะจง โดยต้อง:
   - ระบุชื่อจังหวัด, ตัวเลขอุณหภูมิ/ความชื้น/ลม ที่ได้รับ
   - อ้างอิงสภาพพื้นที่จากรูปภาพ
   - บอกว่าพื้นที่นี้มีศักยภาพอย่างไร และจุดที่ต้องระวัง
   - เขียน 3-5 ประโยค เหมือนผู้เชี่ยวชาญด้านการเกษตร/สิ่งแวดล้อมสรุปให้ฟังตัวต่อตัว

รูปแบบ JSON (ตอบกลับแค่คีย์เหล่านี้เท่านั้น ห้ามมี markdown หรือข้อความอื่น):
{{
  "surface_context": "...",
  "vegetation_density": "...",
  "climate_context_summary": "...",
  "environmental_notes": "...",
  "confidence_level": "...",
  "climate_risk_analysis": "...",
  "long_term_growth_advisory": "...",
  "action_plan": ["ขั้นตอนที่ 1...", "ขั้นตอนที่ 2...", "..."],
  "ai_summary": "..."
}}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-5.2",
            max_completion_tokens=2500,
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

        response_text = response.choices[0].message.content

        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        ai_result = json.loads(response_text)

        # Scientific Model Layer & Deterministic Context-Aware Tree Selection
        recommendations = []
        total_co2 = 0
        total_canopy = 0
        total_temp_reduction_min = 0.0
        total_temp_reduction_max = 0.0

        region = get_region_for_province(province)
        
        # Analyze surface context for soil type hints
        surface_lower = ai_result.get("surface_context", "").lower()
        detected_soil = []
        if "ทราย" in surface_lower: detected_soil.append("ทราย")
        if "เหนียว" in surface_lower: detected_soil.append("เหนียว")
        if "ร่วน" in surface_lower or "ดินทั่วไป" in surface_lower: detected_soil.append("ร่วน")
        
        # Climate constraints
        precip = climate_profile.get("avg_annual_precipitation_mm", 1200) if climate_profile else 1200
        temp = climate_profile.get("avg_annual_temperature_c", 28) if climate_profile else 28

        for category in ["economic", "edible", "conservation"]:
            best_tree = None
            best_score = -1
            best_sci = None
            
            for tree_data in TREE_DATABASE.get(category, []):
                sci = compute_scientific_data(tree_data)
                base_score = sci["green_potential_score"]
                ranking_score = float(base_score)
                
                # 1. ภูมิภาค (Region exact match multiplier)
                suitable_reg = tree_data.get("suitable_regions", [])
                if suitable_reg:
                    if "ทุกภาค" in suitable_reg:
                        ranking_score *= 1.05
                    elif region in suitable_reg:
                        ranking_score *= 1.30
                    else:
                        ranking_score *= 0.50
                
                # 2. ความเหมาะสมของดินจากภาพ (Soil Match)
                suitable_soils = tree_data.get("suitable_soil_types", [])
                if detected_soil and suitable_soils:
                    if any(s in suitable_soils for s in detected_soil):
                        ranking_score *= 1.25
                
                # 3. จัดคู่สภาพอากาศเชิงพื้นที่จริงๆ (Precipitation & Water Req)
                water_req = tree_data.get("water_requirement", "medium")
                drought_tol = tree_data.get("drought_tolerance", "medium")
                
                if precip < 1100:  # Dry area
                    if drought_tol == "high": ranking_score *= 1.20
                    elif drought_tol == "low": ranking_score *= 0.60
                elif precip > 1800: # Wet area
                    if water_req == "high": ranking_score *= 1.20
                    elif drought_tol == "high": ranking_score *= 0.80
                else: # Moderate area
                    if water_req == "medium": ranking_score *= 1.10
                
                if ranking_score > best_score:
                    best_score = ranking_score
                    best_tree = tree_data
                    best_sci = sci
            
            if best_tree:
                drought = best_tree.get("drought_tolerance", "medium")
                drought_th = {"high": "ทนทานสูง", "medium": "ปานกลาง", "low": "ต่ำ (ต้องการน้ำ)"}.get(drought, "ปานกลาง")
                
                reason_text = f"ระบบคัดเลือกจากฐานข้อมูล: เหมาะสมอย่างมากกับภูมิภาค '{region}' และสภาพฝนเฉลี่ย {round(precip)} มม./ปี โดยมีทนแล้งระดับ{drought_th} (คะแนนความเหมาะสม {round(best_score, 1)})"
                ben_text = f"เมื่อโตเต็มวัยผลิตร่มเงากว่า {best_sci['canopy_coverage_m2']} ตร.ม. ช่วยลดอุณหภูมิรอบข้างสูงสุด {best_sci['temperature_reduction_celsius'][1]}°C และรับ CO₂ {best_sci['co2_absorption_kg_per_year']} กก./ปี"

                recommendations.append({
                    "category": category,
                    "tree_name": best_tree["name"],
                    "reason": reason_text,
                    "care_notes": best_tree.get("notes", "ดูแลตามความต้องการพื้นฐานตามสายพันธุ์"),
                    "environmental_benefits": ben_text,
                    "scientific_data": best_sci
                })
                total_co2 += best_sci["co2_absorption_kg_per_year"]
                total_canopy += best_sci["canopy_coverage_m2"]
                total_temp_reduction_min += best_sci["temperature_reduction_celsius"][0]
                total_temp_reduction_max += best_sci["temperature_reduction_celsius"][1]

        ai_result["recommendations"] = recommendations

        tree_count = len([r for r in ai_result["recommendations"] if r.get("scientific_data")])
        ai_result["environmental_impact"] = {
            "total_co2_absorption": {
                "value": round(total_co2, 1),
                "unit": "kg/ปี",
                "description": "ค่าประมาณการดูดซับ CO₂ รวม (ต้นไม้โตเต็มวัย สภาวะเอื้ออำนวย)"
            },
            "average_temperature_reduction": {
                "value": [
                    round(total_temp_reduction_min / max(tree_count, 1), 1),
                    round(total_temp_reduction_max / max(tree_count, 1), 1)
                ],
                "unit": "°C",
                "description": "ช่วงประมาณการลดอุณหภูมิจุลภาคใต้ร่มเงา (ไม่ใช่อุณหภูมิระดับเมือง)"
            },
            "total_canopy_coverage": {
                "value": round(total_canopy, 1),
                "unit": "m²",
                "description": "ค่าประมาณพื้นที่ร่มเงาที่ทรงพุ่มโตเต็มที่"
            }
        }

        ai_result["model_limitations"] = {
            "scope": "Planning-level Decision Support System (DSS). Not a substitute for field measurements.",
            "temperature_model": "Applies to localized pedestrian-level microclimate only. Does not predict city-wide temperature changes.",
            "co2_model": "CO₂ values represent mature-tree estimates under favorable conditions. Young trees absorb significantly less. Urban stress factors may reduce actual rates by 20–40%.",
            "soil_analysis": "Soil texture is inferred from visual surface characteristics in the uploaded image. This is a preliminary observation, not a laboratory soil analysis.",
            "general": "All numerical outputs are estimation ranges based on simplified parametric models. Environmental variability (wind, humidity, surrounding land use) is not individually modeled."
        }

        ai_result["province"] = province
        ai_result["planting_plan_summary"] = None
        
        if climate_profile:
            ai_result["climate_profile"] = climate_profile

        # ส่งข้อมูลสภาพอากาศปัจจุบัน (ตัวเลข) กลับไปให้ Frontend
        if current_weather_data:
            ai_result["current_weather"] = current_weather_data

        return ai_result

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Analysis failed: {str(e)}")

@app.post("/api/calculate_plan")
async def calculate_plan(req: dict):
    plan = req.get("plantingPlan", [])
    proj_year = req.get("projection_year")
    ecosystem_stress_mode = req.get("ecosystem_stress_mode", False)
    # If not provided, assume mature mapping (e.g. year 20)
    if proj_year not in [1, 5, 10, 20]:
        proj_year = 20
        
    GROWTH_SCALES = {
        "fast": {1: 0.25, 5: 0.70, 10: 1.0, 20: 1.0},
        "medium": {1: 0.15, 5: 0.50, 10: 0.85, 20: 1.0},
        "slow": {1: 0.10, 5: 0.35, 10: 0.65, 20: 1.0}
    }

    if not plan:
        return {"planting_plan_summary": None}
        
    drought_map = {"high": 100, "medium": 60, "low": 30}
    growth_map = {"fast": 90, "medium": 60, "slow": 35}

    def get_metrics(yr, stress_active):
        total_co2_low = total_co2_mid = total_co2_high = 0.0
        total_canopy = 0.0
        total_trees = 0
        total_drought_score = 0.0
        total_lifespan_score = 0.0
        total_growth_score = 0.0

        for item in plan:
            qty = max(int(item.get("quantity", 1)), 1)
            total_trees += qty
            
            tree_node = lookup_tree(item["tree_name"], item["category"])
            growth_rate = tree_node.get("growth_rate", "medium") if tree_node else "medium"
            scale = GROWTH_SCALES.get(growth_rate, GROWTH_SCALES["medium"]).get(yr, 1.0)
            
            co2 = item.get("co2_range", {})
            total_co2_low += float(co2.get("low", 0)) * qty * scale
            total_co2_mid += float(co2.get("mid", 0)) * qty * scale
            total_co2_high += float(co2.get("high", 0)) * qty * scale
            
            total_canopy += float(item.get("canopy_area_m2", 0)) * qty * scale
            
            if tree_node:
                d = tree_node.get("drought_tolerance", "medium")
                d_score = drought_map.get(d, 50)
                if stress_active and tree_node.get("water_requirement") == "high":
                    d_score -= (d_score * 0.10)
                l = float(tree_node.get("lifespan_years", 50))
                l_score = min((l / 200.0) * 100, 100)
                g = tree_node.get("growth_rate", "medium")
                g_score = growth_map.get(g, 50)
            else:
                d_score = 50
                l_score = 50
                g_score = 50
            
            total_drought_score += d_score * qty
            total_lifespan_score += l_score * qty
            total_growth_score += g_score * qty
            
        avg_drought = total_drought_score / total_trees if total_trees > 0 else 0
        avg_lifespan = total_lifespan_score / total_trees if total_trees > 0 else 0
        avg_growth = total_growth_score / total_trees if total_trees > 0 else 0
        
        # Require site area provided from frontend, map to minimum 1.0 to avoid division by 0
        plan_site_area = max(float(req.get("site_area") or 100.0), 1.0)
        cooling_range = calc_temperature_reduction_range(total_canopy, tree_data=None, site_area=plan_site_area)
        
        max_co2_plan = 40.0 * max(total_trees, 1)
        co2_score = min((total_co2_mid / max_co2_plan) * 100, 100)
        
        max_canopy_plan = 15.0 * max(total_trees, 1)
        avg_canopy_m2 = total_canopy / max(total_trees, 1) if total_trees > 0 else 0
        avg_canopy_d = 2 * math.sqrt(avg_canopy_m2 / math.pi) if avg_canopy_m2 > 0 else 0
        canopy_score = min((avg_canopy_d * total_trees) / max_canopy_plan * 100, 100)

        W1, W2, W3, W4, W5 = 0.30, 0.25, 0.15, 0.15, 0.15
        
        # Ecosystem Stress Mode applies environmental stress factors
        # to simulate harsher seasonal conditions for resilience testing.
        # This is not a predictive climate model.
        if stress_active:
            cooling_range = [max(0.0, round(c * 0.9, 2)) for c in cooling_range]
            # Shift weights to heavily emphasize drought tolerance for resilience testing
            W1 = 0.25
            W2 = 0.20
            W3 = 0.25

        plan_gps = min((co2_score * W1 + canopy_score * W2 + avg_drought * W3 + avg_lifespan * W4 + avg_growth * W5), 100.0)
        canopy_ratio = min(total_canopy / plan_site_area, 1.0)
        
        return {
            "projection_year": yr,
            "scaled_total_co2_range": {
                "low": round(total_co2_low, 1),
                "mid": round(total_co2_mid, 1),
                "high": round(total_co2_high, 1)
            },
            "scaled_total_canopy_area_m2": round(total_canopy, 1),
            "scaled_temperature_range": cooling_range,
            "scaled_plan_gps_score": round(plan_gps),
            "total_tree_count": total_trees,
            "canopy_density_ratio": round(canopy_ratio, 2),
            "canopy_density_percent": round(canopy_ratio * 100),
            "stress_mode_active": stress_active
        }
        
    active_summary = get_metrics(proj_year, ecosystem_stress_mode)
    
    timeline = []
    for y in [1, 5, 10, 20]:
        m = get_metrics(y, ecosystem_stress_mode)
        timeline.append({
            "year": y,
            "co2": m["scaled_total_co2_range"]["mid"],
            "cooling": m["scaled_temperature_range"][1]
        })
        
    active_summary["impact_timeline"] = timeline
    
    return {
        "planting_plan_summary": active_summary,
        "stress_mode_active": ecosystem_stress_mode
    }


@app.post("/api/count-trees")
async def count_trees(file: UploadFile = File(...)):
    """Analyze an uploaded image to count the number of trees using AI Vision.
    
    This endpoint is used by the Campaign page to verify tree planting reports.
    Instead of letting users self-report tree counts (which can be faked),
    the AI analyzes the photo and provides a verified count.
    """
    if not client:
        raise HTTPException(status_code=500, detail="OpenAI API Key not found.")

    try:
        # 1. Read and encode image
        contents = await file.read()
        encoded_image = base64.b64encode(contents).decode("utf-8")
        media_type = file.content_type

        # 2. Build the prompt for tree counting
        prompt = """คุณคือ AI ผู้เชี่ยวชาญด้านการนับต้นไม้จากรูปภาพ

งานของคุณ: นับจำนวนต้นไม้ที่เห็นในรูปภาพนี้อย่างแม่นยำที่สุด

กฎการนับ:
1. นับเฉพาะต้นไม้ที่มองเห็นชัดเจน (ต้นไม้ที่ปลูกใหม่ กล้าไม้ หรือต้นไม้ใหญ่)
2. หากเห็นกล้าไม้ในถุงดำหรือกระถาง ให้นับแต่ละถุง/กระถางเป็น 1 ต้น
3. หากเห็นต้นไม้ที่ปลูกเรียงแถว ให้นับทีละต้น
4. หากมีต้นไม้ทับซ้อนกัน ให้ประมาณการอย่างระมัดระวัง
5. หากไม่เห็นต้นไม้เลยในรูป ให้ตอบ 0
6. หากรูปไม่ชัดหรือไม่สามารถนับได้แม่นยำ ให้ประมาณและระบุ confidence เป็น "low"

ตอบกลับเป็น JSON เท่านั้น (ห้ามมี markdown หรือข้อความอื่น):
{
  "tree_count": <จำนวนต้นไม้ที่นับได้ (integer)>,
  "confidence": "<high/medium/low>",
  "description": "<อธิบายสั้นๆ ว่าเห็นอะไรในรูป เช่น 'เห็นกล้าไม้ในถุงดำ 5 ถุง วางเรียงบนพื้นดิน' เขียนเป็นภาษาไทย>"
}"""

        # 3. Call OpenAI API with vision
        response = client.chat.completions.create(
            model="gpt-5.2",
            max_completion_tokens=500,
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

        # 4. Parse AI response
        response_text = response.choices[0].message.content

        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        result = json.loads(response_text)

        # Validate and sanitize
        tree_count = max(0, int(result.get("tree_count", 0)))
        confidence = result.get("confidence", "medium")
        if confidence not in ["high", "medium", "low"]:
            confidence = "medium"
        description = result.get("description", "ไม่สามารถระบุรายละเอียดได้")

        return {
            "tree_count": tree_count,
            "confidence": confidence,
            "description": description
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองอีกครั้ง")
    except Exception as e:
        print(f"Error counting trees: {str(e)}")
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ: {str(e)}")
