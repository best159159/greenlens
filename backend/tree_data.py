# ข้อมูลต้นไม้เก็บเป็นตัวแปร Python (เพื่อแก้ปัญหา File Not Found บน Serverless)
TREE_DATABASE_DATA = {
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
            "suitable_soil_types": [
                "ร่วน",
                "ร่วนปนทราย"
            ],
            "suitable_regions": [
                "ภาคเหนือ",
                "ภาคตะวันตก",
                "ภาคกลาง"
            ],
            "peak_growth_months": [
                5,
                6,
                7,
                8,
                9
            ],
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
            "suitable_soil_types": [
                "ร่วน",
                "เหนียว"
            ],
            "suitable_regions": [
                "ภาคใต้",
                "ภาคตะวันออก"
            ],
            "peak_growth_months": [
                4,
                5,
                6,
                7,
                8,
                9,
                60,
                10
            ],
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
            "suitable_soil_types": [
                "ร่วน",
                "ทราย",
                "ร่วนปนทราย"
            ],
            "suitable_regions": [
                "ภาคเหนือ",
                "ภาคตะวันออกเฉียงเหนือ",
                "ภาคกลาง"
            ],
            "peak_growth_months": [
                5,
                6,
                7,
                8
            ],
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
            "suitable_soil_types": [
                "ทราย",
                "ร่วน",
                "ร่วนปนทราย"
            ],
            "suitable_regions": [
                "ภาคเหนือ",
                "ภาคตะวันออกเฉียงเหนือ",
                "ภาคกลาง"
            ],
            "peak_growth_months": [
                5,
                6,
                7,
                8,
                9
            ],
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
            "suitable_soil_types": [
                "ร่วน",
                "ร่วนปนทราย"
            ],
            "suitable_regions": [
                "ภาคตะวันออกเฉียงเหนือ",
                "ภาคตะวันออก"
            ],
            "peak_growth_months": [
                5,
                6,
                7,
                8
            ],
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
            "suitable_soil_types": [
                "ร่วน",
                "ร่วนปนทราย",
                "เหนียว"
            ],
            "suitable_regions": [
                "ภาคเหนือ",
                "ภาคกลาง",
                "ภาคตะวันออกเฉียงเหนือ",
                "ภาคตะวันออก"
            ],
            "peak_growth_months": [
                3,
                4,
                5,
                6,
                7
            ],
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
            "suitable_soil_types": [
                "ร่วน",
                "ร่วนปนเหนียว"
            ],
            "suitable_regions": [
                "ภาคตะวันออก",
                "ภาคใต้"
            ],
            "peak_growth_months": [
                4,
                5,
                6,
                7,
                8,
                9
            ],
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
            "suitable_soil_types": [
                "ร่วน",
                "ร่วนปนทราย",
                "ร่วนปนเหนียว"
            ],
            "suitable_regions": [
                "ภาคกลาง",
                "ภาคตะวันออก",
                "ภาคใต้"
            ],
            "peak_growth_months": [
                3,
                4,
                5,
                6,
                7,
                8
            ],
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
            "suitable_soil_types": [
                "ร่วน",
                "ร่วนปนทราย",
                "ทราย"
            ],
            "suitable_regions": [
                "ภาคเหนือ",
                "ภาคตะวันออกเฉียงเหนือ",
                "ภาคกลาง"
            ],
            "peak_growth_months": [
                4,
                5,
                6,
                7,
                8
            ],
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
            "suitable_soil_types": [
                "ร่วน",
                "ร่วนปนทราย"
            ],
            "suitable_regions": [
                "ทุกภาค"
            ],
            "peak_growth_months": [
                3,
                4,
                5,
                6,
                7,
                8
            ],
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
            "suitable_soil_types": [
                "ร่วน",
                "เหนียว",
                "ทราย",
                "ผสม"
            ],
            "suitable_regions": [
                "ทุกภาค"
            ],
            "peak_growth_months": [
                4,
                5,
                6,
                7,
                8,
                9,
                10
            ],
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
            "suitable_soil_types": [
                "ร่วน",
                "ร่วนปนเหนียว"
            ],
            "suitable_regions": [
                "ภาคกลาง",
                "ภาคเหนือ",
                "ภาคตะวันออกเฉียงเหนือ"
            ],
            "peak_growth_months": [
                5,
                6,
                7,
                8,
                9
            ],
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
            "suitable_soil_types": [
                "ร่วน",
                "เหนียว"
            ],
            "suitable_regions": [
                "ภาคใต้",
                "ภาคตะวันออก",
                "ภาคกลาง"
            ],
            "peak_growth_months": [
                5,
                6,
                7,
                8,
                9,
                10
            ],
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
            "suitable_soil_types": [
                "ร่วน",
                "ร่วนปนทราย"
            ],
            "suitable_regions": [
                "ภาคเหนือ",
                "ภาคตะวันออกเฉียงเหนือ",
                "ภาคกลาง"
            ],
            "peak_growth_months": [
                5,
                6,
                7,
                8,
                9
            ],
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
            "suitable_soil_types": [
                "ร่วน",
                "เหนียว"
            ],
            "suitable_regions": [
                "ภาคกลาง",
                "ภาคตะวันออก",
                "ภาคใต้"
            ],
            "peak_growth_months": [
                5,
                6,
                7,
                8,
                9,
                10
            ],
            "notes": "ไม้ยืนต้นขนาดใหญ่ เหมาะกับพื้นที่ชุ่มน้ำและลุ่มแม่น้ำ"
        }
    ]
}
