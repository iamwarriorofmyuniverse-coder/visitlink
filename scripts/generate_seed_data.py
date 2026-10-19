import json
import os
from fastembed import TextEmbedding

# Initialize Embedding Model
print("Loading BAAI/bge-small-en-v1.5 embedding model...")
model = TextEmbedding("BAAI/bge-small-en-v1.5")

# Demo User IDs (Deterministic UUIDs for local seed)
DEMO_ADMIN_ID = "00000000-0000-0000-0000-000000000001"
DEMO_COORDINATOR_ID = "00000000-0000-0000-0000-000000000002"
DEMO_MANAGER_ID = "00000000-0000-0000-0000-000000000003"

# 20 Realistic Industries in Coimbatore Hub
INDUSTRIES_DATA = [
    {
        "readable_id": "foundry-cbe-01",
        "name": "Kovai Precision Foundry & Heavy Castings [Demo]",
        "sector": "foundry",
        "lat": 10.9125,
        "lng": 76.9942,
        "address": "SF No. 142, Malumichampatti Industrial Area",
        "city": "Coimbatore",
        "min_group_size": 15,
        "max_group_size": 45,
        "student_to_teacher_ratio": 15,
        "min_age": 16,
        "minors_allowed": False,
        "min_education_level": "undergraduate",
        "ppe_requirements": ["Steel-toe safety shoes", "Hard hat / Helmet", "Safety goggles", "Heavy cotton lab coats"],
        "dress_code": "Strict long trousers and thick cotton shirts. No synthetic fibers or loose jewelry.",
        "description": "Specialized high-capacity foundry manufacturing ductile iron and steel castings for wind turbine gearboxes, marine engines, and railway bogies.",
        "highlights": "Cupola furnace tapping, green sand automated moulding line, spectrographic metallurgy lab, shot blasting, and ultrasonic flaw testing.",
        "curriculum_topics": "Manufacturing processes, foundry technology, metallurgy, casting defect analysis, nondestructive testing, thermal engineering."
    },
    {
        "readable_id": "pumps-cbe-01",
        "name": "Siruvani IoT Pumps & Hydro-Dynamics [Demo]",
        "sector": "pumps",
        "lat": 11.0825,
        "lng": 77.0012,
        "address": "45/2 IT Corridor Road, Saravanampatti",
        "city": "Coimbatore",
        "min_group_size": 10,
        "max_group_size": 50,
        "student_to_teacher_ratio": 15,
        "min_age": 14,
        "minors_allowed": True,
        "min_education_level": "high_school",
        "ppe_requirements": ["Closed-toe shoes", "Safety vest"],
        "dress_code": "Casual formal / college uniform. Comfortable walking shoes.",
        "description": "Next-generation fluid engineering facility designing smart solar-powered submersible pumps, BLDC motor drives, and cloud-connected agricultural irrigation systems.",
        "highlights": "Automated stator winding, computerized hydraulic pump testing flume, dynamic balancing rig, embedded electronics assembly.",
        "curriculum_topics": "Fluid mechanics, hydraulic machinery, electrical drives, embedded systems, IoT sensors, quality control."
    },
    {
        "readable_id": "textiles-cbe-01",
        "name": "Marudham Automated Textile Machineries [Demo]",
        "sector": "textiles",
        "lat": 11.1442,
        "lng": 76.9421,
        "address": "Mettupalayam Highway, Periyanaickenpalayam",
        "city": "Coimbatore",
        "min_group_size": 15,
        "max_group_size": 60,
        "student_to_teacher_ratio": 15,
        "min_age": 14,
        "minors_allowed": True,
        "min_education_level": "high_school",
        "ppe_requirements": ["Hair caps / nets", "Closed-toe shoes", "Dust mask"],
        "dress_code": "Fitted clothing. Hair securely tied back. No dupattas, scarves, or lanyards near spindles.",
        "description": "World-class manufacturer of automated ring spinning frames, carding machines, and robotic sliver handling systems for modern yarn spinning mills.",
        "highlights": "High-precision CNC machine shop, 25,000 RPM spindle testing cell, automated laser sheet metal cutting, digital inverter assembly.",
        "curriculum_topics": "Textile technology, mechanical design, mechatronics, CNC programming, kinematic mechanisms."
    },
    {
        "readable_id": "automotive-cbe-01",
        "name": "Kongu Sensorics & Automotive Telematics [Demo]",
        "sector": "automotive",
        "lat": 11.1390,
        "lng": 76.9385,
        "address": "Industrial Estate, Periyanaickenpalayam",
        "city": "Coimbatore",
        "min_group_size": 10,
        "max_group_size": 40,
        "student_to_teacher_ratio": 12,
        "min_age": 15,
        "minors_allowed": True,
        "min_education_level": "undergraduate",
        "ppe_requirements": ["ESD wristband (cleanroom)", "Shoe covers", "Safety glasses"],
        "dress_code": "Formal or college uniform. Anti-static lab coats provided for cleanroom visit.",
        "description": "Pioneering tier-1 supplier producing digital instrument clusters, telematics control units (TCU), tire pressure monitoring sensors, and EV battery management electronics.",
        "highlights": "Surface mount technology (SMT) pick-and-place lines, automated optical inspection (AOI), thermal shock chambers, environmental test lab.",
        "curriculum_topics": "Automotive electronics, telematics, microcontroller programming, sensor integration, ESD safety standards, PCB manufacturing."
    },
    {
        "readable_id": "compressors-cbe-01",
        "name": "Vellalore Industrial Compressors & Pneumatics [Demo]",
        "sector": "manufacturing",
        "lat": 10.9856,
        "lng": 77.0210,
        "address": "Trichy Road, Singanallur",
        "city": "Coimbatore",
        "min_group_size": 15,
        "max_group_size": 55,
        "student_to_teacher_ratio": 15,
        "min_age": 16,
        "minors_allowed": False,
        "min_education_level": "undergraduate",
        "ppe_requirements": ["Ear defenders / plugs", "Safety shoes", "Safety glasses"],
        "dress_code": "Full trousers, closed shoes, fitted short/long sleeve shirts.",
        "description": "Manufacturing powerhouse building energy-efficient rotary screw air compressors, reciprocating piston units, and oil-free medical air systems.",
        "highlights": "High-precision rotor grinding machine, computerized compressor performance test rig, robotic powder coating booth.",
        "curriculum_topics": "Thermodynamics, pneumatics, compressed air systems, rotor dynamics, energy conservation in industry."
    },
    {
        "readable_id": "precision-cbe-01",
        "name": "Anamalai Horns & Electric Mobility Accessories [Demo]",
        "sector": "automotive",
        "lat": 11.0360,
        "lng": 76.9820,
        "address": "Sathy Road, Ganapathy",
        "city": "Coimbatore",
        "min_group_size": 10,
        "max_group_size": 45,
        "student_to_teacher_ratio": 15,
        "min_age": 12,
        "minors_allowed": True,
        "min_education_level": "middle_school",
        "ppe_requirements": ["Safety glasses", "Closed-toe shoes"],
        "dress_code": "Neat formal or school/college uniform.",
        "description": "Leading manufacturer of automotive electric horns, electronic reverse warning buzzers, industrial floor cleaning machines, and EV battery connectors.",
        "highlights": "Acoustic anechoic test chamber, high-speed progressive metal stamping press, automated injection moulding cell.",
        "curriculum_topics": "Acoustics, electro-mechanical design, tool and die design, plastic injection moulding, product lifecycle testing."
    },
    {
        "readable_id": "electrical-cbe-01",
        "name": "Nilgiri Switchgear & Industrial Relays [Demo]",
        "sector": "electronics",
        "lat": 11.1210,
        "lng": 76.9150,
        "address": "Samichettipalayam Post, Jothipuram",
        "city": "Coimbatore",
        "min_group_size": 10,
        "max_group_size": 50,
        "student_to_teacher_ratio": 15,
        "min_age": 14,
        "minors_allowed": True,
        "min_education_level": "high_school",
        "ppe_requirements": ["Insulated safety shoes", "Safety goggles"],
        "dress_code": "Standard uniform. No conductive bracelets or metallic chains.",
        "description": "Pioneering producer of low-voltage rotary switches, motor control gears, solar photovoltaic disconnect switches, and wire harness assemblies.",
        "highlights": "High-voltage flashover testing facility, robotic contact spot welding, automated wire harness crimping and continuity test bench.",
        "curriculum_topics": "Electrical machines, switchgear protection, power distribution, circuit breakers, electrical safety standards."
    },
    {
        "readable_id": "agritech-cbe-01",
        "name": "Bhavani Bio-Poultry Research & Automated Hatcheries [Demo]",
        "sector": "food_processing",
        "lat": 11.0480,
        "lng": 77.0420,
        "address": "Nehru Nagar, Avinashi Road",
        "city": "Coimbatore",
        "min_group_size": 10,
        "max_group_size": 35,
        "student_to_teacher_ratio": 10,
        "min_age": 12,
        "minors_allowed": True,
        "min_education_level": "middle_school",
        "ppe_requirements": ["Sanitized lab apron", "Hair cover", "Disposable shoe booties", "Face mask"],
        "dress_code": "Clean casuals or uniform. Must pass through sanitization misting chamber.",
        "description": "Modern bio-agricultural facility with climate-controlled automated incubators, egg candling robots, and microbial feed quality testing laboratories.",
        "highlights": "Robotic egg handling system, PCR pathogen detection lab, climate and humidity automation control console.",
        "curriculum_topics": "Bio-technology, food safety, veterinary microbiology, automation in agriculture, environmental controls."
    },
    {
        "readable_id": "spinning-cbe-01",
        "name": "Noyyal Automated Spinning & Weaving Mills [Demo]",
        "sector": "textiles",
        "lat": 11.0850,
        "lng": 77.1230,
        "address": "NH 544 Avinashi Bypass, Kaniyur",
        "city": "Coimbatore",
        "min_group_size": 15,
        "max_group_size": 50,
        "student_to_teacher_ratio": 15,
        "min_age": 15,
        "minors_allowed": True,
        "min_education_level": "high_school",
        "ppe_requirements": ["Dust mask", "Ear plugs", "Closed shoes"],
        "dress_code": "Fitted attire. Strict prohibition of loose apparel near spinning drums.",
        "description": "100,000-spindle eco-friendly textile mill powered by captive wind energy, converting raw combed cotton into premium export-quality compact yarn.",
        "highlights": "Automated blowroom line, continuous roving transport system, circular knitting machines, automated yarn cone packaging line.",
        "curriculum_topics": "Textile spinning, industrial logistics, automated material handling, green manufacturing, energy accounting."
    },
    {
        "readable_id": "bioenergy-cbe-01",
        "name": "Periyar Bio-Ethanol & Co-Generation Facility [Demo]",
        "sector": "renewable_energy",
        "lat": 11.4350,
        "lng": 77.6820,
        "address": "Appakudal Industrial Area, Bhavani",
        "city": "Coimbatore",
        "min_group_size": 10,
        "max_group_size": 40,
        "student_to_teacher_ratio": 12,
        "min_age": 17,
        "minors_allowed": False,
        "min_education_level": "undergraduate",
        "ppe_requirements": ["Hard hat", "Flame-retardant jacket", "Safety shoes", "Safety glasses"],
        "dress_code": "Cotton full trousers and shirts. No lighters, cellphones, or matchboxes permitted inside distillation zone.",
        "description": "Large-scale bio-refinery producing fuel-grade anhydrous bio-ethanol from sugarcane molasses, featuring a 35 MW bagasse co-generation power plant.",
        "highlights": "Continuous fermentation towers, molecular sieve dehydration unit, steam turbine generator control room, anaerobic effluent digester.",
        "curriculum_topics": "Chemical engineering, distillation columns, bio-fuels, renewable energy grid integration, industrial effluent treatment."
    },
    {
        "readable_id": "robotics-cbe-01",
        "name": "CODISSIA Centre of Excellence for Robotics & 3D Printing [Demo]",
        "sector": "research_lab",
        "lat": 11.0720,
        "lng": 77.1650,
        "address": "CODISSIA Industrial Park, Mopperipalayam",
        "city": "Coimbatore",
        "min_group_size": 10,
        "max_group_size": 45,
        "student_to_teacher_ratio": 15,
        "min_age": 12,
        "minors_allowed": True,
        "min_education_level": "middle_school",
        "ppe_requirements": ["Safety glasses (laser area)", "Clean lab footwear"],
        "dress_code": "Casual formal / school or college uniform.",
        "description": "Collaborative industrial research hub housing 6-axis articulated robot arms, metal selective laser melting (SLM) 3D printers, and digital twins simulations.",
        "highlights": "Robotic welding cell demonstration, industrial 3D laser metal deposition, computerized coordinate measuring machine (CMM) demo.",
        "curriculum_topics": "Robotics, forward kinematics, additive manufacturing, 3D CAD modeling, digital twin technology."
    },
    {
        "readable_id": "diecasting-cbe-01",
        "name": "Siruvani Powertrain Die-Casting & Machining [Demo]",
        "sector": "automotive",
        "lat": 10.9410,
        "lng": 76.9680,
        "address": "SIDCO Industrial Estate, Kurichi",
        "city": "Coimbatore",
        "min_group_size": 12,
        "max_group_size": 40,
        "student_to_teacher_ratio": 12,
        "min_age": 16,
        "minors_allowed": False,
        "min_education_level": "undergraduate",
        "ppe_requirements": ["Steel-toe shoes", "High-visibility vest", "Ear defenders", "Safety glasses"],
        "dress_code": "Strict rugged cotton attire. No sandals, shorts, or loose sleeves.",
        "description": "High-pressure aluminum die-casting plant producing cylinder heads, transmission housings, and suspension crossmembers for major automotive OEMs.",
        "highlights": "1800-ton cold chamber die casting press, robotic molten metal ladling, 5-axis horizontal machining center (HMC) line, X-ray porosity inspection.",
        "curriculum_topics": "Automotive manufacturing, high-pressure die casting, CNC machining, GD&T inspection, quality assurance."
    },
    {
        "readable_id": "motors-cbe-01",
        "name": "Thudiyalur Submersible Hydraulics & Motors [Demo]",
        "sector": "manufacturing",
        "lat": 11.0820,
        "lng": 76.9360,
        "address": "Mettupalayam Road, Thudiyalur",
        "city": "Coimbatore",
        "min_group_size": 15,
        "max_group_size": 50,
        "student_to_teacher_ratio": 15,
        "min_age": 14,
        "minors_allowed": True,
        "min_education_level": "high_school",
        "ppe_requirements": ["Closed-toe safety shoes", "Safety vest"],
        "dress_code": "College uniform or neat casuals.",
        "description": "Integrated plant manufacturing water-filled submersible motors, stainless steel impellers, and agricultural borewell pumping units.",
        "highlights": "Rotor dynamic balancing, automated wire enameling and dipping line, hydrostatic pressure testing tank, computerized flowmeter calibration.",
        "curriculum_topics": "Electromagnetism, induction motors, fluid dynamics, pump head-loss calculations, factory production planning."
    },
    {
        "readable_id": "appliances-cbe-01",
        "name": "Kovai Smart Consumer Appliances & Assembly [Demo]",
        "sector": "manufacturing",
        "lat": 11.0180,
        "lng": 76.8920,
        "address": "Marudhamalai Main Road, Vadavalli",
        "city": "Coimbatore",
        "min_group_size": 15,
        "max_group_size": 50,
        "student_to_teacher_ratio": 15,
        "min_age": 12,
        "minors_allowed": True,
        "min_education_level": "middle_school",
        "ppe_requirements": ["Safety glasses", "Closed shoes"],
        "dress_code": "Comfortable formal / school or college uniform.",
        "description": "High-volume assembly plant producing heavy-duty mixer grinders, induction cooktops, and BLDC ceiling fans with lean manufacturing assembly lines.",
        "highlights": "Universal motor assembly line, Poka-Yoke error proofing stations, sound pressure decibel testing booth, automated packaging robot.",
        "curriculum_topics": "Lean manufacturing, assembly line balancing, Poka-Yoke, consumer electronics, quality control."
    },
    {
        "readable_id": "biomedical-cbe-01",
        "name": "Avinashi MedTech Imaging & Clinical Sensors [Demo]",
        "sector": "pharmaceuticals",
        "lat": 11.0420,
        "lng": 77.0310,
        "address": "Health City Campus, Avinashi Road",
        "city": "Coimbatore",
        "min_group_size": 8,
        "max_group_size": 30,
        "student_to_teacher_ratio": 10,
        "min_age": 16,
        "minors_allowed": True,
        "min_education_level": "undergraduate",
        "ppe_requirements": ["Cleanroom gown", "Shoe covers", "Latex/Nitrile gloves"],
        "dress_code": "Clean formal or scrubs/lab coats.",
        "description": "Advanced biomedical device facility prototyping patient monitoring telemetry, pulse oximetry sensors, and ultrasound transducer arrays.",
        "highlights": "ISO Class 7 cleanroom, digital oscilloscope signal analysis bench, phantom tissue ultrasound testing, biomedical calibration station.",
        "curriculum_topics": "Biomedical instrumentation, medical imaging, biosensors, FDA ISO 13485 compliance, clinical engineering."
    },
    {
        "readable_id": "biotech-cbe-01",
        "name": "Botanical Bio-Fertilizers & Microbial Labs [Demo]",
        "sector": "research_lab",
        "lat": 11.0080,
        "lng": 76.9610,
        "address": "Race Course Road, Central Coimbatore",
        "city": "Coimbatore",
        "min_group_size": 10,
        "max_group_size": 35,
        "student_to_teacher_ratio": 10,
        "min_age": 12,
        "minors_allowed": True,
        "min_education_level": "middle_school",
        "ppe_requirements": ["Lab apron", "Safety goggles", "Nitrile gloves"],
        "dress_code": "Full length pants, closed shoes. Hair tied.",
        "description": "Centuries-old agricultural biotechnology lab culturing mycorrhizal fungi, Rhizobium nitrogen-fixing inoculants, and biological pest controls.",
        "highlights": "500-liter bioreactor fermentation vessel, automated laminar air flow sterile inoculators, mass spectrometry soil nutrient analyzer.",
        "curriculum_topics": "Agricultural microbiology, biotechnology, soil science, organic farming, bioreactor design."
    },
    {
        "readable_id": "gears-cbe-01",
        "name": "Singanallur Heavy Industrial Gearboxes & Metrology [Demo]",
        "sector": "manufacturing",
        "lat": 10.9980,
        "lng": 77.0120,
        "address": "Trichy Main Road, Singanallur",
        "city": "Coimbatore",
        "min_group_size": 15,
        "max_group_size": 45,
        "student_to_teacher_ratio": 15,
        "min_age": 16,
        "minors_allowed": False,
        "min_education_level": "undergraduate",
        "ppe_requirements": ["Hard hat", "Steel-toe shoes", "Ear plugs"],
        "dress_code": "Heavy duty cotton garments. No neckties, scarves, or loose wristbands.",
        "description": "Manufacturer of custom helical, bevel, and planetary gearboxes engineered for cement mills, steel rolling plants, and thermal power stations.",
        "highlights": "Gear hobbing and grinding machines with sub-micron accuracy, Klingelnberg gear metrology center, full load torque testing dynamometer.",
        "curriculum_topics": "Machine design, gear kinematics, tribology and lubrication, precision metrology, vibration analysis."
    },
    {
        "readable_id": "windenergy-cbe-01",
        "name": "Palladam Green Wind Power Substation & SCADA [Demo]",
        "sector": "renewable_energy",
        "lat": 10.9850,
        "lng": 77.2150,
        "address": "Wind Corridor, Palladam Road",
        "city": "Coimbatore",
        "min_group_size": 10,
        "max_group_size": 35,
        "student_to_teacher_ratio": 10,
        "min_age": 16,
        "minors_allowed": True,
        "min_education_level": "undergraduate",
        "ppe_requirements": ["Safety helmet with chin strap", "Safety shoes", "High-visibility jacket"],
        "dress_code": "Full trousers, sturdy boots. Windbreaker jacket recommended.",
        "description": "Grid-connected 110kV wind energy evacuation substation integrating real-time SCADA telemetry for over 150 wind turbine generators in the Palghat Gap pass.",
        "highlights": "Live SCADA grid synchronization displays, transformer yard inspection, wind turbine nacelle components display, power factor capacitor banks.",
        "curriculum_topics": "Renewable energy, power systems, high-voltage substations, SCADA, grid stability and forecasting."
    },
    {
        "readable_id": "aerospace-cbe-01",
        "name": "Aerodrome Ground Support Equipment & GSE Hydraulics [Demo]",
        "sector": "manufacturing",
        "lat": 11.0310,
        "lng": 77.0420,
        "address": "Civil Aerodrome Post, SITRA",
        "city": "Coimbatore",
        "min_group_size": 12,
        "max_group_size": 40,
        "student_to_teacher_ratio": 12,
        "min_age": 16,
        "minors_allowed": False,
        "min_education_level": "undergraduate",
        "ppe_requirements": ["Steel-toe shoes", "Reflective safety jacket", "Ear protection"],
        "dress_code": "Rugged workwear, fully laced boots.",
        "description": "Specialized aviation support manufacturer designing aircraft ground power units (GPU), jet engine air start units, and aircraft towbar systems.",
        "highlights": "Aircraft 400Hz solid-state power converter test bay, heavy duty hydraulic lifting ram manufacturing, diesel-driven generator load test.",
        "curriculum_topics": "Aerospace GSE, 400Hz electrical systems, heavy mobile hydraulics, aviation safety protocols."
    },
    {
        "readable_id": "datacenter-cbe-01",
        "name": "Peelamedu Tech Park & Tier-3 Cloud Data Center [Demo]",
        "sector": "information_technology",
        "lat": 11.0260,
        "lng": 77.0080,
        "address": "ELCOT IT Park, Peelamedu",
        "city": "Coimbatore",
        "min_group_size": 10,
        "max_group_size": 35,
        "student_to_teacher_ratio": 12,
        "min_age": 14,
        "minors_allowed": True,
        "min_education_level": "high_school",
        "ppe_requirements": ["Shoe booties", "Antistatic wrist strap (server hall)"],
        "dress_code": "Formal or college uniform. Warm sweater recommended for cold-aisle server rooms.",
        "description": "State-of-the-art enterprise cloud facility with N+1 redundant UPS systems, dual underground fiber backbones, and hot/cold containment server suites.",
        "highlights": "Server hall cold-aisle containment walkthrough, dual modular diesel generator backup farm, precision HVAC chillers, NOC monitoring wall.",
        "curriculum_topics": "Computer networks, cloud computing, data center architecture, HVAC thermal management, cyber security operations."
    }
]

# 10 Educational Institutions around Coimbatore
INSTITUTIONS_DATA = [
    {
        "readable_id": "inst-psg-tech",
        "name": "PSG College of Technology [Demo]",
        "type": "college",
        "affiliation": "Anna University / Autonomous",
        "lat": 11.0245,
        "lng": 77.0030,
        "address": "Post Box No. 1611, Peelamedu",
        "city": "Coimbatore",
        "pincode": "641004"
    },
    {
        "readable_id": "inst-cit",
        "name": "Coimbatore Institute of Technology (CIT) [Demo]",
        "type": "college",
        "affiliation": "Anna University / Autonomous",
        "lat": 11.0280,
        "lng": 77.0270,
        "address": "Civil Aerodrome Post, Avinashi Road",
        "city": "Coimbatore",
        "pincode": "641014"
    },
    {
        "readable_id": "inst-gct",
        "name": "Government College of Technology (GCT) [Demo]",
        "type": "college",
        "affiliation": "Government of Tamil Nadu / Anna University",
        "lat": 11.0185,
        "lng": 76.9340,
        "address": "Thadagam Road",
        "city": "Coimbatore",
        "pincode": "641013"
    },
    {
        "readable_id": "inst-kct",
        "name": "Kumaraguru College of Technology (KCT) [Demo]",
        "type": "college",
        "affiliation": "Anna University / Autonomous",
        "lat": 11.0770,
        "lng": 76.9890,
        "address": "Athipalayam Road, Chinnavedampatti",
        "city": "Coimbatore",
        "pincode": "641049"
    },
    {
        "readable_id": "inst-skcet",
        "name": "Sri Krishna College of Engineering & Technology [Demo]",
        "type": "college",
        "affiliation": "Anna University / Autonomous",
        "lat": 10.9380,
        "lng": 76.9560,
        "address": "Palakkad Main Road, Kuniyamuthur",
        "city": "Coimbatore",
        "pincode": "641008"
    },
    {
        "readable_id": "inst-amrita",
        "name": "Amrita Vishwa Vidyapeetham School of Engineering [Demo]",
        "type": "university",
        "affiliation": "Deemed-to-be University",
        "lat": 10.9020,
        "lng": 76.9010,
        "address": "Amritanagar Post, Ettimadai",
        "city": "Coimbatore",
        "pincode": "641112"
    },
    {
        "readable_id": "inst-psg-poly",
        "name": "PSG Polytechnic College [Demo]",
        "type": "polytechnic",
        "affiliation": "DOTE Tamil Nadu",
        "lat": 11.0250,
        "lng": 77.0040,
        "address": "Peelamedu",
        "city": "Coimbatore",
        "pincode": "641004"
    },
    {
        "readable_id": "inst-stanes-hss",
        "name": "Stanes Anglo-Indian Higher Secondary School [Demo]",
        "type": "school",
        "affiliation": "Anglo-Indian Board / State",
        "lat": 11.0060,
        "lng": 76.9720,
        "address": "Avinashi Road, Race Course",
        "city": "Coimbatore",
        "pincode": "641018"
    },
    {
        "readable_id": "inst-chinmaya",
        "name": "Chinmaya Vidyalaya Higher Secondary School [Demo]",
        "type": "school",
        "affiliation": "CBSE",
        "lat": 11.0110,
        "lng": 76.9480,
        "address": "R.S. Puram West",
        "city": "Coimbatore",
        "pincode": "641002"
    },
    {
        "readable_id": "inst-kv-sulur",
        "name": "Kendriya Vidyalaya Air Force Station Sulur [Demo]",
        "type": "school",
        "affiliation": "CBSE",
        "lat": 11.0120,
        "lng": 77.1260,
        "address": "AFS Sulur",
        "city": "Coimbatore",
        "pincode": "641401"
    }
]

print("Generating 384-dimensional embeddings for all 20 industries...")
embedding_texts = [
    f"{ind['name']}. Sector: {ind['sector']}. Highlights: {ind['highlights']}. Curriculum Topics: {ind['curriculum_topics']}. Description: {ind['description']}"
    for ind in INDUSTRIES_DATA
]
embeddings = list(model.embed(embedding_texts))

for ind, emb in zip(INDUSTRIES_DATA, embeddings):
    ind["embedding"] = [round(float(x), 6) for x in emb]

# Export seed_catalog.json for the user to author matching eval labels
catalog_path = os.path.join("supabase", "seed_catalog.json")
with open(catalog_path, "w", encoding="utf-8") as f:
    json.dump({
        "city": "Coimbatore",
        "industries": [
            {
                "readable_id": ind["readable_id"],
                "name": ind["name"],
                "sector": ind["sector"],
                "curriculum_topics": ind["curriculum_topics"],
                "highlights": ind["highlights"],
                "min_education_level": ind["min_education_level"],
                "min_group_size": ind["min_group_size"],
                "max_group_size": ind["max_group_size"],
                "lat": ind["lat"],
                "lng": ind["lng"]
            }
            for ind in INDUSTRIES_DATA
        ],
        "institutions": INSTITUTIONS_DATA
    }, f, indent=2)

print(f"Exported seed catalog to {catalog_path}")

# Generate supabase/seed.sql
sql_lines = [
    "-- ====================================================================",
    "-- VisitLink Phase a2: Deterministic Seed Data (Coimbatore Hub)",
    "-- Stable Readable IDs, Fictional Demo Names, Real 384-dim Embeddings",
    "-- ====================================================================",
    "",
    "-- 1. Seed Demo Profiles",
    f"INSERT INTO auth.users (id, email) VALUES ('{DEMO_ADMIN_ID}', 'admin@visitlink.local') ON CONFLICT (id) DO NOTHING;",
    f"INSERT INTO auth.users (id, email) VALUES ('{DEMO_COORDINATOR_ID}', 'coordinator@visitlink.local') ON CONFLICT (id) DO NOTHING;",
    f"INSERT INTO auth.users (id, email) VALUES ('{DEMO_MANAGER_ID}', 'manager@visitlink.local') ON CONFLICT (id) DO NOTHING;",
    "",
    f"INSERT INTO profiles (id, role, full_name, email, phone) VALUES ('{DEMO_ADMIN_ID}', 'admin', 'VisitLink Platform Admin', 'admin@visitlink.local', '+91 98400 11111') ON CONFLICT (id) DO NOTHING;",
    f"INSERT INTO profiles (id, role, full_name, email, phone) VALUES ('{DEMO_COORDINATOR_ID}', 'coordinator', 'Prof. R. Soundararajan [Demo]', 'coordinator@visitlink.local', '+91 98400 22222') ON CONFLICT (id) DO NOTHING;",
    f"INSERT INTO profiles (id, role, full_name, email, phone) VALUES ('{DEMO_MANAGER_ID}', 'industry_manager', 'K. Murugesan [Demo Facility Head]', 'manager@visitlink.local', '+91 98400 33333') ON CONFLICT (id) DO NOTHING;",
    "",
    "-- 2. Seed 10 Educational Institutions",
]

for inst in INSTITUTIONS_DATA:
    point_wkt = f"ST_SetSRID(ST_MakePoint({inst['lng']}, {inst['lat']}), 4326)::geography"
    sql_lines.append(f"""
INSERT INTO institutions (readable_id, profile_id, name, institution_type, affiliation_number, location, address, city, state, pincode, verification_status)
VALUES (
    '{inst['readable_id']}',
    '{DEMO_COORDINATOR_ID}',
    '{inst['name']}',
    '{inst['type']}',
    '{inst['affiliation']}',
    {point_wkt},
    '{inst['address']}',
    '{inst['city']}',
    'Tamil Nadu',
    '{inst['pincode']}',
    'verified'
) ON CONFLICT (readable_id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;
""")

sql_lines.append("\n-- 3. Seed 20 Realistic Industries with 384-dim Vectors & Slots\n")

for ind in INDUSTRIES_DATA:
    point_wkt = f"ST_SetSRID(ST_MakePoint({ind['lng']}, {ind['lat']}), 4326)::geography"
    emb_str = "[" + ",".join(str(x) for x in ind["embedding"]) + "]"
    ppe_sql = "ARRAY[" + ",".join(f"'{p}'" for p in ind["ppe_requirements"]) + "]"
    
    clean_desc = ind['description'].replace("'", "''")
    clean_highlights = ind['highlights'].replace("'", "''")
    clean_curriculum = ind['curriculum_topics'].replace("'", "''")
    clean_dress = ind['dress_code'].replace("'", "''")
    
    sql_lines.append(f"""
-- Industry: {ind['readable_id']}
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    '{ind['readable_id']}',
    '{DEMO_MANAGER_ID}',
    '{ind['name']}',
    '{ind['sector']}',
    '{clean_desc}',
    '{clean_highlights}',
    '{clean_curriculum}',
    '{emb_str}'::vector,
    '{ind['min_education_level']}',
    {ind['min_age']},
    {ind['min_group_size']},
    {ind['max_group_size']},
    {ind['student_to_teacher_ratio']},
    {ppe_sql},
    {'TRUE' if ind['minors_allowed'] else 'FALSE'},
    '{clean_dress}',
    {point_wkt},
    '{ind['address']}',
    '{ind['city']}',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for {ind['readable_id']}
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', {ind['max_group_size']}, TRUE, TRUE
FROM industries WHERE readable_id = '{ind['readable_id']}';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', {ind['max_group_size']}, TRUE, TRUE
FROM industries WHERE readable_id = '{ind['readable_id']}';
""")

seed_path = os.path.join("supabase", "seed.sql")
with open(seed_path, "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print(f"Successfully generated complete seed script at {seed_path}!")
