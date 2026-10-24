-- ====================================================================
-- VisitLink Phase a2: Deterministic Seed Data (Coimbatore Hub)
-- Stable Readable IDs, Fictional Demo Names, Real 384-dim Embeddings
-- ====================================================================

-- 1. Seed Demo Profiles
INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-000000000001', 'admin@visitlink.local') ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-000000000002', 'coordinator@visitlink.local') ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-000000000003', 'manager@visitlink.local') ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, role, full_name, email, phone) VALUES ('00000000-0000-0000-0000-000000000001', 'admin', 'VisitLink Platform Admin', 'admin@visitlink.local', '+91 98400 11111') ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, role, full_name, email, phone) VALUES ('00000000-0000-0000-0000-000000000002', 'coordinator', 'Prof. R. Soundararajan [Demo]', 'coordinator@visitlink.local', '+91 98400 22222') ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, role, full_name, email, phone) VALUES ('00000000-0000-0000-0000-000000000003', 'industry_manager', 'K. Murugesan [Demo Facility Head]', 'manager@visitlink.local', '+91 98400 33333') ON CONFLICT (id) DO NOTHING;

-- 2. Seed Educational Institutions (including CIET)

INSERT INTO institutions (readable_id, profile_id, name, institution_type, affiliation_number, location, address, city, state, pincode, verification_status)
VALUES (
    'inst-ciet',
    '00000000-0000-0000-0000-000000000002',
    'Coimbatore Institute of Engineering and Technology (CIET) [Demo]',
    'college',
    'Anna University / Autonomous, AICTE Approved',
    ST_SetSRID(ST_MakePoint(76.7972, 10.9635), 4326)::geography,
    'Vellimalai Pattinam, Narasipuram Post, Thondamuthur',
    'Coimbatore',
    'Tamil Nadu',
    '641109',
    'verified'
) ON CONFLICT (readable_id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;


INSERT INTO institutions (readable_id, profile_id, name, institution_type, affiliation_number, location, address, city, state, pincode, verification_status)
VALUES (
    'inst-psg-tech',
    '00000000-0000-0000-0000-000000000002',
    'PSG College of Technology [Demo]',
    'college',
    'Anna University / Autonomous',
    ST_SetSRID(ST_MakePoint(77.003, 11.0245), 4326)::geography,
    'Post Box No. 1611, Peelamedu',
    'Coimbatore',
    'Tamil Nadu',
    '641004',
    'verified'
) ON CONFLICT (readable_id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;


INSERT INTO institutions (readable_id, profile_id, name, institution_type, affiliation_number, location, address, city, state, pincode, verification_status)
VALUES (
    'inst-cit',
    '00000000-0000-0000-0000-000000000002',
    'Coimbatore Institute of Technology (CIT) [Demo]',
    'college',
    'Anna University / Autonomous',
    ST_SetSRID(ST_MakePoint(77.027, 11.028), 4326)::geography,
    'Civil Aerodrome Post, Avinashi Road',
    'Coimbatore',
    'Tamil Nadu',
    '641014',
    'verified'
) ON CONFLICT (readable_id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;


INSERT INTO institutions (readable_id, profile_id, name, institution_type, affiliation_number, location, address, city, state, pincode, verification_status)
VALUES (
    'inst-gct',
    '00000000-0000-0000-0000-000000000002',
    'Government College of Technology (GCT) [Demo]',
    'college',
    'Government of Tamil Nadu / Anna University',
    ST_SetSRID(ST_MakePoint(76.934, 11.0185), 4326)::geography,
    'Thadagam Road',
    'Coimbatore',
    'Tamil Nadu',
    '641013',
    'verified'
) ON CONFLICT (readable_id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;


INSERT INTO institutions (readable_id, profile_id, name, institution_type, affiliation_number, location, address, city, state, pincode, verification_status)
VALUES (
    'inst-kct',
    '00000000-0000-0000-0000-000000000002',
    'Kumaraguru College of Technology (KCT) [Demo]',
    'college',
    'Anna University / Autonomous',
    ST_SetSRID(ST_MakePoint(76.989, 11.077), 4326)::geography,
    'Athipalayam Road, Chinnavedampatti',
    'Coimbatore',
    'Tamil Nadu',
    '641049',
    'verified'
) ON CONFLICT (readable_id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;


INSERT INTO institutions (readable_id, profile_id, name, institution_type, affiliation_number, location, address, city, state, pincode, verification_status)
VALUES (
    'inst-skcet',
    '00000000-0000-0000-0000-000000000002',
    'Sri Krishna College of Engineering & Technology [Demo]',
    'college',
    'Anna University / Autonomous',
    ST_SetSRID(ST_MakePoint(76.956, 10.938), 4326)::geography,
    'Palakkad Main Road, Kuniyamuthur',
    'Coimbatore',
    'Tamil Nadu',
    '641008',
    'verified'
) ON CONFLICT (readable_id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;


INSERT INTO institutions (readable_id, profile_id, name, institution_type, affiliation_number, location, address, city, state, pincode, verification_status)
VALUES (
    'inst-amrita',
    '00000000-0000-0000-0000-000000000002',
    'Amrita Vishwa Vidyapeetham School of Engineering [Demo]',
    'university',
    'Deemed-to-be University',
    ST_SetSRID(ST_MakePoint(76.901, 10.902), 4326)::geography,
    'Amritanagar Post, Ettimadai',
    'Coimbatore',
    'Tamil Nadu',
    '641112',
    'verified'
) ON CONFLICT (readable_id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;


INSERT INTO institutions (readable_id, profile_id, name, institution_type, affiliation_number, location, address, city, state, pincode, verification_status)
VALUES (
    'inst-psg-poly',
    '00000000-0000-0000-0000-000000000002',
    'PSG Polytechnic College [Demo]',
    'polytechnic',
    'DOTE Tamil Nadu',
    ST_SetSRID(ST_MakePoint(77.004, 11.025), 4326)::geography,
    'Peelamedu',
    'Coimbatore',
    'Tamil Nadu',
    '641004',
    'verified'
) ON CONFLICT (readable_id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;


INSERT INTO institutions (readable_id, profile_id, name, institution_type, affiliation_number, location, address, city, state, pincode, verification_status)
VALUES (
    'inst-stanes-hss',
    '00000000-0000-0000-0000-000000000002',
    'Stanes Anglo-Indian Higher Secondary School [Demo]',
    'school',
    'Anglo-Indian Board / State',
    ST_SetSRID(ST_MakePoint(76.972, 11.006), 4326)::geography,
    'Avinashi Road, Race Course',
    'Coimbatore',
    'Tamil Nadu',
    '641018',
    'verified'
) ON CONFLICT (readable_id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;


INSERT INTO institutions (readable_id, profile_id, name, institution_type, affiliation_number, location, address, city, state, pincode, verification_status)
VALUES (
    'inst-chinmaya',
    '00000000-0000-0000-0000-000000000002',
    'Chinmaya Vidyalaya Higher Secondary School [Demo]',
    'school',
    'CBSE',
    ST_SetSRID(ST_MakePoint(76.948, 11.011), 4326)::geography,
    'R.S. Puram West',
    'Coimbatore',
    'Tamil Nadu',
    '641002',
    'verified'
) ON CONFLICT (readable_id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;


INSERT INTO institutions (readable_id, profile_id, name, institution_type, affiliation_number, location, address, city, state, pincode, verification_status)
VALUES (
    'inst-kv-sulur',
    '00000000-0000-0000-0000-000000000002',
    'Kendriya Vidyalaya Air Force Station Sulur [Demo]',
    'school',
    'CBSE',
    ST_SetSRID(ST_MakePoint(77.126, 11.012), 4326)::geography,
    'AFS Sulur',
    'Coimbatore',
    'Tamil Nadu',
    '641401',
    'verified'
) ON CONFLICT (readable_id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;


-- 3. Seed 20 Realistic Industries with 384-dim Vectors & Slots


-- Industry: foundry-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'foundry-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Kovai Precision Foundry & Heavy Castings [Demo]',
    'foundry',
    'Specialized high-capacity foundry manufacturing ductile iron and steel castings for wind turbine gearboxes, marine engines, and railway bogies.',
    'Cupola furnace tapping, green sand automated moulding line, spectrographic metallurgy lab, shot blasting, and ultrasonic flaw testing.',
    'Manufacturing processes, foundry technology, metallurgy, casting defect analysis, nondestructive testing, thermal engineering.',
    '[-0.026881,0.043612,0.002655,-0.039439,-0.01165,-0.019545,0.017889,0.023367,-0.06041,-0.0046,-0.003755,-0.04765,-0.002329,0.058257,-0.007605,-0.033517,0.03182,0.036855,0.036209,-0.03314,0.046331,0.006993,-0.037958,0.014739,0.056318,-0.009308,-0.001908,-0.044823,0.034163,-0.168202,-0.005307,-0.014537,-0.065149,-0.050988,-0.02999,-0.02789,-0.033651,-0.01871,0.008036,-0.027621,0.005068,-0.00266,-0.028752,-0.03427,-0.033167,0.035293,0.06041,0.011771,0.044716,-0.019208,-0.00234,-0.057341,0.024431,-0.001422,0.012303,-0.058741,0.116837,0.035266,0.068594,-0.016179,0.008985,-0.026692,-0.156895,0.080655,-0.002236,0.020366,-0.019518,-0.082163,0.024983,0.026329,0.0445,-0.047569,-0.000338,0.06181,0.020446,-0.004563,-0.026921,-0.032224,-0.061703,0.012155,-0.014806,-0.012693,-0.076455,-0.039654,-0.057611,0.076132,-0.034782,-0.005317,0.119744,0.024552,0.008238,-0.036236,0.036236,0.003276,-0.01451,0.030717,0.027782,-0.012256,0.000306,0.342434,-0.041512,-0.019181,0.053223,0.045254,-0.001124,0.016664,-0.049104,-0.002194,0.001015,0.002448,0.044419,0.016301,-0.020864,-0.031901,-0.043423,-0.045308,-0.01587,-0.00181,0.014201,0.026207,0.001177,-0.012565,0.049104,-0.023192,0.042077,-0.012316,-0.037501,0.030797,0.052711,0.015237,-0.018306,-0.014914,-0.046089,-0.025198,-0.009779,0.000291,0.074409,-0.060034,-0.007821,0.004503,-0.047838,0.007753,0.022452,-0.109999,-0.006845,0.088893,-0.056695,0.040597,-0.013905,0.005219,-0.068325,-0.017485,-0.055995,-0.003759,0.039331,-0.000338,-0.025211,0.075594,-0.000813,-0.00019,-0.015385,-0.035859,0.000584,0.025763,0.004385,-0.120713,-0.107091,0.029748,-0.012626,-0.044608,-0.037608,0.06531,0.014322,0.009705,-0.022317,-0.018104,-0.0529,0.009604,-0.03069,0.061649,0.031928,0.062241,0.003624,-0.028186,-0.008743,-0.02544,-0.014228,-0.024808,0.027594,-0.060734,-0.031713,0.01416,-0.053599,0.034297,0.044258,-0.002788,0.045739,0.023838,0.043827,-0.044635,-0.017229,0.000146,-0.005657,0.064341,-0.005273,0.058795,-0.054703,0.016179,0.032763,0.022317,-0.042454,-0.009692,0.025615,0.056372,-0.021591,-0.05788,0.038282,-0.022627,-0.032144,0.050369,0.093362,-0.034728,-0.022964,-0.340926,-0.022896,0.006777,0.065418,0.036209,0.000569,0.001084,0.035132,0.02999,-0.041054,0.077155,0.044473,-0.031013,-0.043612,0.025642,-0.074302,-0.045766,-0.091316,-0.033167,0.003306,-0.004351,0.008372,-0.046412,0.034297,0.028778,0.024552,0.117052,-0.06278,0.011441,-0.029263,-0.01587,0.032117,0.023327,-0.007262,0.023448,0.009914,-0.007646,0.103161,-0.012256,0.044527,-0.00148,0.005482,-0.038362,-0.054946,0.076671,-0.023798,-0.019841,0.005256,-0.014443,0.02439,-0.021079,0.064987,-0.014389,-0.003099,0.009873,-0.012612,-0.038847,0.036559,-0.03244,-0.035509,0.087224,-0.00635,0.028186,0.018522,-0.006374,0.022802,0.017795,0.015843,0.045604,-0.005879,-0.071179,0.061218,-0.013999,-0.053869,0.094492,-0.052873,0.050907,-0.031551,0.073925,0.013137,0.070156,-0.002865,-0.021119,0.022062,0.044985,0.094331,-0.003513,-0.019598,0.015587,0.039358,-0.016852,0.047515,-0.000705,-0.05228,0.019948,0.062726,-0.252195,-0.040301,0.078771,0.058849,-0.026746,-0.096269,-0.047165,-0.078609,-0.008366,0.029748,-0.02151,0.025723,0.025709,0.03279,-0.001158,0.050342,0.049857,-0.049427,0.043746,-0.072633,-0.046304,0.027702,0.141819,0.023192,-0.027621,-0.024471,0.066441,-0.023421,-0.0494,0.017256,0.064502,-0.030932,0.077801,0.010048,0.012054,0.088193,-0.011199,0.036639,-0.015803,0.003772,-0.01266,-0.002017,-0.056857,-0.0134,0.008675,-0.061164,-0.029371,-0.067841,0.020944,-0.007397,0.004809,0.063103,0.032197,0.05438,-0.003402,0.041754,0.048108,0.003224,-0.028375,0.009301,-0.023825,0.037878,-0.046412,0.019127,0.027163]'::vector,
    'undergraduate',
    16,
    15,
    45,
    15,
    ARRAY['Steel-toe safety shoes','Hard hat / Helmet','Safety goggles','Heavy cotton lab coats'],
    FALSE,
    'Strict long trousers and thick cotton shirts. No synthetic fibers or loose jewelry.',
    ST_SetSRID(ST_MakePoint(76.9942, 10.9125), 4326)::geography,
    'SF No. 142, Malumichampatti Industrial Area',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for foundry-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 45, TRUE, TRUE
FROM industries WHERE readable_id = 'foundry-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 45, TRUE, TRUE
FROM industries WHERE readable_id = 'foundry-cbe-01';


-- Industry: pumps-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'pumps-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Siruvani IoT Pumps & Hydro-Dynamics [Demo]',
    'pumps',
    'Next-generation fluid engineering facility designing smart solar-powered submersible pumps, BLDC motor drives, and cloud-connected agricultural irrigation systems.',
    'Automated stator winding, computerized hydraulic pump testing flume, dynamic balancing rig, embedded electronics assembly.',
    'Fluid mechanics, hydraulic machinery, electrical drives, embedded systems, IoT sensors, quality control.',
    '[-0.016416,-0.008856,-0.022663,0.005923,0.034888,-0.026894,0.002756,0.00666,-0.038465,0.002539,-0.025119,-0.014962,0.003967,-0.062142,0.063263,-0.026693,0.039453,0.012553,0.040521,0.005395,0.068869,-0.013474,-0.06999,-0.05368,-0.018659,0.001231,0.035075,-0.049863,-0.032833,-0.15589,0.021034,-0.063797,-0.01647,0.045806,-0.015322,0.025732,-0.001366,-0.000541,-0.006383,-0.005032,-0.019927,-0.052506,0.003854,0.065559,-0.004157,0.005042,0.027214,-0.007301,0.015215,-0.085953,0.040547,-0.075969,0.00359,-0.018966,0.018178,-0.064545,0.014962,0.030724,0.081789,-0.017457,0.070631,0.045032,-0.163684,0.083977,0.034675,0.011098,-0.019566,-0.068549,0.039773,0.003667,0.014962,-0.017377,-0.038412,0.017898,0.000508,-0.013133,-0.010844,-0.03956,-0.077838,0.020994,0.0331,0.024852,-0.054214,0.01647,-0.007321,0.04965,-0.002811,-0.043297,0.072286,-0.007294,-0.067694,0.045058,0.007241,-0.000672,0.004705,-0.008495,-0.027468,0.015896,0.003844,0.360254,-0.012085,0.000659,0.044204,-0.014801,-0.040894,0.010631,-0.00683,-0.005462,-0.005652,0.040467,0.039346,0.033981,0.004698,-0.045058,-0.038786,-0.026867,-0.091398,0.037958,-0.020554,0.018178,-0.044204,0.061502,0.043937,-0.023477,0.027134,-0.003467,0.037985,0.083977,-0.021648,0.046126,-0.008775,0.001163,-0.08622,-0.041829,0.050237,0.002539,0.026453,-0.049303,0.013507,0.076557,-0.024491,0.00381,0.004361,-0.131652,-0.038652,0.088836,0.007768,-0.029336,0.075222,-0.00094,0.015909,0.05312,-0.002279,0.00361,0.015829,0.010437,-0.024638,0.034755,0.034007,0.010511,-0.055042,-0.017351,-0.034301,0.05352,-0.001083,-0.201695,0.036917,-0.033233,-0.022636,0.05005,-0.017644,0.002703,0.011598,0.018178,0.026373,-0.035022,-0.02632,0.006577,-0.018512,0.088088,-0.061875,0.004351,0.077144,-0.012139,0.065879,0.065292,-0.044605,-0.001332,0.017498,-0.008589,-0.051865,-0.024865,-0.051732,0.068228,0.043697,-0.00361,0.027921,-0.006109,0.025119,-0.02301,-0.06289,0.014348,0.011231,0.060114,-0.025559,0.025706,-0.035983,0.011124,-0.074101,0.059847,0.01316,0.024771,0.058352,-0.01615,-0.087287,-0.018685,-0.038946,-0.009963,-0.001244,0.004781,0.031658,0.017498,-0.049303,-0.306867,-0.047755,0.015282,-0.009156,0.0599,-0.038145,0.009696,-0.05675,-0.005596,-0.043083,0.056643,0.023997,-0.016683,-0.039533,0.02696,0.015883,0.053627,-0.051198,0.012706,-0.008836,0.007294,0.050557,0.061662,-0.010744,0.038091,-0.06684,0.096363,-0.05352,0.03278,0.015883,-0.045833,0.058726,0.032432,-0.068175,0.020834,-0.021675,-0.01615,-0.023357,-0.001422,-0.004291,-0.041962,0.083871,-0.009456,-0.059046,0.029149,-0.066894,-0.01033,-0.005405,-0.049303,0.001617,0.036517,-0.067694,0.014721,-0.015469,0.001412,-0.00969,-0.06652,-0.035289,-0.028989,-0.056323,-0.014628,0.032673,0.00361,-0.015309,0.0002,-0.040574,-0.00084,0.029203,0.050237,-0.018005,0.018779,0.114995,0.051919,0.009963,0.070471,-0.026386,0.064438,-0.04682,0.00354,0.03035,0.020327,-0.00635,0.063957,0.090491,0.008795,0.021301,-0.055522,-0.042122,-0.039133,0.030938,-0.008642,0.020767,-0.008669,0.018806,0.057231,0.034862,-0.25647,0.008602,0.036784,0.022663,-0.054348,-0.044338,0.00644,-0.088942,0.029389,0.06321,0.013567,-0.014228,0.033447,0.027321,0.045753,0.048529,0.073247,-0.02297,0.016003,-0.028802,0.0129,0.049089,0.115636,-0.019126,-0.010938,0.032432,-0.016657,0.055255,0.020941,-0.012339,0.001091,-0.008468,0.110297,-0.007261,-0.015776,0.064385,0.036143,-0.039133,0.007781,-0.014188,-0.002568,0.02624,-0.021555,0.041428,0.000631,-0.03625,-0.01284,-0.113287,0.028162,0.023197,-0.008562,-0.006787,-0.066413,0.026013,0.014828,0.05974,0.025986,-0.074795,-0.006049,-0.044898,0.048929,-0.060434,-0.011398,0.041268,0.029523]'::vector,
    'high_school',
    14,
    10,
    50,
    15,
    ARRAY['Closed-toe shoes','Safety vest'],
    TRUE,
    'Casual formal / college uniform. Comfortable walking shoes.',
    ST_SetSRID(ST_MakePoint(77.0012, 11.0825), 4326)::geography,
    '45/2 IT Corridor Road, Saravanampatti',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for pumps-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 50, TRUE, TRUE
FROM industries WHERE readable_id = 'pumps-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 50, TRUE, TRUE
FROM industries WHERE readable_id = 'pumps-cbe-01';


-- Industry: textiles-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'textiles-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Marudham Automated Textile Machineries [Demo]',
    'textiles',
    'World-class manufacturer of automated ring spinning frames, carding machines, and robotic sliver handling systems for modern yarn spinning mills.',
    'High-precision CNC machine shop, 25,000 RPM spindle testing cell, automated laser sheet metal cutting, digital inverter assembly.',
    'Textile technology, mechanical design, mechatronics, CNC programming, kinematic mechanisms.',
    '[-0.017484,0.005526,-0.021754,0.030268,0.034485,-0.002142,-0.013348,0.054762,-0.057904,-0.044287,0.031691,-0.027408,0.006426,0.058226,0.043535,-0.00887,0.006852,-0.002363,0.030725,0.040689,0.053473,-0.001332,-0.08836,0.020425,0.003814,0.00047,-0.03811,-0.016396,-0.026763,-0.097867,0.013382,0.026239,0.056991,0.001384,0.052774,-0.05076,-0.03102,0.005925,0.008594,-0.017967,-0.02965,0.013657,0.047618,0.027112,0.037036,0.04042,0.116775,-0.028334,0.013368,-0.02769,0.00475,-0.061342,0.031477,-0.096739,-0.001193,-0.047457,0.039346,0.002461,0.031718,-0.01083,0.047403,-0.030671,-0.10861,0.059301,-0.017054,-0.009447,-0.027448,-0.099855,0.050491,0.052479,0.009239,-0.037466,-0.025017,0.062738,0.034431,-0.025044,-0.006009,-0.05683,-0.056078,-0.012421,-0.028576,-0.050303,-0.026589,-0.026642,-0.025179,0.070205,0.010172,-0.044825,0.061986,-0.003186,-0.018948,0.048907,-0.045523,0.023957,-0.04794,-0.027958,0.004589,0.079819,0.001631,0.365902,-0.012643,-0.046758,0.042434,-0.049014,-0.022077,-0.031396,-0.049713,0.030966,0.006113,0.019525,0.040017,-0.011032,0.069506,0.008339,-0.010864,-0.069829,-0.029999,-0.00168,0.047859,0.02354,0.007533,0.058334,0.054225,-0.032443,-0.049901,-0.03333,-0.040823,0.074448,0.024574,-0.046758,0.024641,0.018558,-0.007164,-0.010669,0.048101,-0.001335,0.062309,-0.018424,-0.030322,0.047591,-0.089703,-0.005341,0.048155,-0.093409,-0.063007,0.01461,-0.021419,0.011206,-0.053097,0.023231,-0.00523,0.047403,0.001746,-0.046087,-0.021472,0.071225,0.032766,0.085083,0.027905,0.001538,0.011515,0.031638,-0.056991,0.10195,0.020277,-0.200139,-0.060966,0.037009,-0.031503,0.026521,-0.004546,0.084707,-0.081001,0.009581,0.037976,-0.015738,0.000636,0.028334,0.055541,0.069721,0.05315,-0.003569,0.064779,-0.025622,0.054144,-0.009232,-0.028469,-0.012804,0.055111,-0.077832,-0.017336,0.028334,-0.004666,0.041494,0.045603,-0.06161,0.001487,0.011314,0.003968,-0.051539,0.033706,0.034135,0.034968,0.030751,0.0197,0.048665,-0.019471,0.000392,-0.02679,0.066767,-0.038433,-0.043079,0.057474,-0.005237,-0.019955,0.0122,0.018424,0.059891,-0.012052,0.011716,0.009078,0.020398,-0.064189,-0.317129,-0.028576,-0.013576,0.029435,0.001376,-0.003112,-0.059139,-0.080195,0.011669,-0.046919,0.025326,0.013596,-0.000547,-0.040474,0.031879,-0.02017,-0.035639,-0.031047,-0.059623,-0.005106,0.050115,0.073213,-0.063759,0.017054,0.006449,-0.014933,0.107267,-0.088951,-0.053983,0.007742,-0.022157,0.0188,-0.020452,-0.003595,0.023634,-0.041924,-0.000811,-0.030107,-0.020358,0.056346,-0.010071,0.002172,0.021566,-0.049041,0.029838,-0.086158,-0.050921,-0.039023,-0.000707,0.01978,-0.037224,-0.009299,-0.023285,-0.013281,-0.039534,0.011179,-0.026884,-0.044502,-0.017565,0.001026,0.018612,-0.023191,0.003797,-0.007842,0.009447,-0.032175,0.023661,0.028334,0.046409,-0.026575,0.055917,0.084761,0.068539,-0.058441,0.033733,-0.053473,-0.008823,0.037922,0.008118,-0.028657,0.033007,0.044261,0.054627,0.055702,-0.017148,0.034538,-0.034538,-0.023325,-0.015268,0.036982,0.045201,0.052022,-0.050948,0.017739,-0.003693,0.039077,-0.223451,0.017283,0.012838,0.032954,-0.050035,-0.032443,-0.016665,-0.050921,0.063222,0.051055,0.05401,0.064941,0.050894,-0.000754,0.083203,0.062309,0.072085,-0.004002,0.03999,-0.057689,-0.046006,0.003127,0.111403,0.049283,0.029462,0.010877,-0.033437,-0.046731,0.003968,0.002494,0.075576,0.029086,0.089542,-0.00756,-0.012314,-0.001883,-0.007225,-0.037331,-0.009272,0.005083,-0.06956,0.001005,-0.100607,-0.079981,0.041199,0.063598,-0.100875,-0.030751,-0.025608,0.015711,-0.035398,0.074663,-0.050384,-0.000812,-0.013704,0.014395,0.03478,-0.013885,-0.054439,-0.022372,-0.001361,-0.06161,-0.021069,0.020949,0.020868]'::vector,
    'high_school',
    14,
    15,
    60,
    15,
    ARRAY['Hair caps / nets','Closed-toe shoes','Dust mask'],
    TRUE,
    'Fitted clothing. Hair securely tied back. No dupattas, scarves, or lanyards near spindles.',
    ST_SetSRID(ST_MakePoint(76.9421, 11.1442), 4326)::geography,
    'Mettupalayam Highway, Periyanaickenpalayam',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for textiles-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 60, TRUE, TRUE
FROM industries WHERE readable_id = 'textiles-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 60, TRUE, TRUE
FROM industries WHERE readable_id = 'textiles-cbe-01';


-- Industry: automotive-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'automotive-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Kongu Sensorics & Automotive Telematics [Demo]',
    'automotive',
    'Pioneering tier-1 supplier producing digital instrument clusters, telematics control units (TCU), tire pressure monitoring sensors, and EV battery management electronics.',
    'Surface mount technology (SMT) pick-and-place lines, automated optical inspection (AOI), thermal shock chambers, environmental test lab.',
    'Automotive electronics, telematics, microcontroller programming, sensor integration, ESD safety standards, PCB manufacturing.',
    '[-0.056061,0.086354,0.066708,-0.022533,0.05268,0.020297,0.019818,0.075227,-0.046637,-0.022866,0.020337,-0.10898,0.019512,0.046424,0.079007,-0.011772,0.037667,-0.006612,0.081189,-0.015586,0.040781,-0.028722,-0.026074,-0.023265,0.03386,0.004672,0.025262,0.00109,-0.047303,-0.127028,-0.03008,0.011839,0.034951,0.072671,-0.003454,0.047143,-0.040595,-0.031251,-0.027285,-0.028935,-0.018926,0.021349,0.0148,-0.057764,0.003437,-0.056487,0.039104,-0.019046,-0.000711,-0.042591,0.063887,0.03213,0.040781,0.01331,-0.012198,-0.051855,0.016704,0.001467,0.011293,-0.004455,0.069051,0.020737,-0.160675,0.07709,0.065431,0.033221,-0.025501,-0.022613,0.016038,-0.053425,0.032343,-0.01705,-0.01673,0.044801,-0.005743,-0.011187,-0.02843,-0.022933,-0.045892,-0.03386,-0.020963,0.007979,-0.007207,-0.013523,-0.047676,-0.024503,0.014747,-0.015107,0.083585,0.059148,-0.05803,-0.018115,-0.018474,-0.012205,-0.026114,-0.029122,0.012638,-0.029095,0.009583,0.360534,-0.039264,-0.010142,0.002449,-0.038785,0.042485,0.008259,-0.045573,0.002174,-0.024477,0.031837,0.056966,-0.011546,-0.052467,-0.042405,0.026287,-0.03756,-0.021642,0.03189,0.020417,0.063727,-0.037853,0.029761,0.005424,-0.059468,0.006126,-0.02642,0.064153,0.056966,0.025062,0.013829,-4e-06,-0.050763,-0.082361,-0.015759,0.010521,0.005321,0.022986,0.017822,-0.029681,0.036096,-0.052361,-0.008252,0.072724,-0.092583,-0.012012,0.056061,-0.034179,0.012238,-0.023798,0.003111,-0.019339,0.01713,0.048847,0.052573,0.018181,0.025608,0.005836,0.001449,-0.016198,0.01524,0.004871,0.011892,-0.079858,0.085555,0.019073,-0.174624,0.017795,-0.016185,0.006412,-0.033248,-0.022879,0.053558,-0.028643,0.008392,0.024304,0.01504,-0.044641,0.013549,-0.077782,0.024157,-0.009383,0.027897,0.049858,-0.032822,0.004096,0.057977,-0.032822,-0.011693,0.011353,0.005224,-0.027871,0.01126,-0.012039,0.023611,0.01299,-0.003773,-0.026047,-0.04536,-0.037081,0.021841,0.01319,-0.008225,-0.047676,0.086407,0.017396,-0.007786,0.001797,-0.009117,0.027178,0.049991,-0.001943,-0.017263,0.04307,0.002602,-0.030266,-0.043523,-0.023425,-0.005048,-0.01343,0.022374,-0.001678,0.093115,-0.050497,-0.344137,-0.02795,0.006582,0.049752,0.038359,-0.028456,-0.048128,0.028509,0.021242,-0.040621,0.103443,0.017383,-0.004828,-0.076025,0.008152,0.015812,-0.052573,-0.045839,-0.033594,-0.009383,0.003382,0.093914,-0.079007,-0.026034,0.050045,0.013642,0.090027,-0.101207,0.037773,0.030559,0.024503,0.027844,0.021722,0.017995,0.018154,-0.040462,-0.035005,0.034259,-0.03583,-0.022054,-0.073363,0.054676,0.014867,-0.044055,-0.006305,-0.066762,-0.023558,0.008312,-0.017968,-0.006482,0.02047,0.023745,-0.041713,-0.018101,-0.012338,-0.010568,-0.028323,-0.016012,-0.010322,-0.077409,0.016304,0.04142,0.018154,-0.021575,-0.047888,0.018873,0.036229,0.047995,0.054836,-0.007839,-0.022334,0.103497,0.00586,0.004675,-0.019965,-0.055102,0.097853,0.006861,0.042618,-0.011945,0.029122,-0.004439,0.038359,0.061651,-0.006122,0.029095,0.051855,-0.059148,-0.030746,0.019299,0.027005,0.017036,0.019219,-0.001251,0.046957,0.062875,-0.243196,-0.016517,0.054277,-0.006652,-0.091092,-0.022347,-0.020497,-0.064792,0.021469,0.021069,-0.019206,0.010548,0.034898,0.025541,0.069477,0.057125,0.067401,-0.034978,0.01303,0.028323,-0.056433,-0.045253,0.166106,0.042831,0.069583,0.021162,-0.015958,-0.019619,0.013044,-0.006855,0.034818,-0.010129,0.063993,0.047143,0.01295,0.004156,0.014348,0.027418,-0.02811,0.055369,-0.030373,-0.011992,-0.02811,-0.083479,0.084756,0.015027,-0.09008,-0.088696,-0.006242,0.032982,-0.038385,-0.046185,-0.005161,-0.055635,-0.041926,0.024663,0.007354,-0.013949,-0.025941,-0.053292,0.033887,0.001692,-0.030932,0.002981,0.079166]'::vector,
    'undergraduate',
    15,
    10,
    40,
    12,
    ARRAY['ESD wristband (cleanroom)','Shoe covers','Safety glasses'],
    TRUE,
    'Formal or college uniform. Anti-static lab coats provided for cleanroom visit.',
    ST_SetSRID(ST_MakePoint(76.9385, 11.139), 4326)::geography,
    'Industrial Estate, Periyanaickenpalayam',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for automotive-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 40, TRUE, TRUE
FROM industries WHERE readable_id = 'automotive-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 40, TRUE, TRUE
FROM industries WHERE readable_id = 'automotive-cbe-01';


-- Industry: compressors-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'compressors-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Vellalore Industrial Compressors & Pneumatics [Demo]',
    'manufacturing',
    'Manufacturing powerhouse building energy-efficient rotary screw air compressors, reciprocating piston units, and oil-free medical air systems.',
    'High-precision rotor grinding machine, computerized compressor performance test rig, robotic powder coating booth.',
    'Thermodynamics, pneumatics, compressed air systems, rotor dynamics, energy conservation in industry.',
    '[-0.067445,0.026689,-0.012188,0.036557,0.009427,0.030406,-0.047923,0.039151,-0.022277,-0.042307,-0.037253,-0.031583,0.044901,-0.01757,0.004523,0.020351,0.006619,0.078677,-0.007281,-0.011506,0.031316,0.01658,-0.038082,-0.019415,0.030754,0.038911,-0.01511,-0.000406,-0.010998,-0.127723,0.033241,-0.028321,0.093065,0.037467,0.063648,0.033214,-0.07734,0.05279,-0.030433,0.029604,0.006047,-0.035942,-0.024764,-0.029711,0.021795,-0.009922,0.055304,-0.006047,0.020819,-0.02915,0.094776,-0.058192,-0.060064,-0.015538,0.007501,-0.0399,0.014334,0.02689,0.054127,-0.064931,0.046372,0.01277,-0.137992,0.085791,-0.001753,0.024028,-0.031637,-0.059583,0.033107,-0.01999,0.001269,-0.033268,-0.031102,0.03744,-0.030674,-0.003144,-0.026756,-0.048431,-0.014963,0.001361,0.014856,-0.052041,-0.092155,-0.060064,-0.061722,0.008999,0.04565,-0.012121,0.053245,0.001986,-0.038643,0.017516,-0.017142,0.007214,0.043858,0.023694,-0.022437,0.078944,0.014575,0.370975,-0.035193,-0.012275,0.066857,0.015029,-0.019776,-0.054983,-0.016794,0.006291,-0.004302,0.066964,0.078731,0.063862,0.050677,-0.058994,-0.01507,-0.05755,-0.021795,0.047682,-0.014254,0.019629,-0.01295,0.079854,0.006873,-0.043885,0.047442,-0.008177,-0.050677,0.052656,0.030139,0.015805,0.004316,-0.014521,-0.028802,-0.022237,0.044607,-0.031583,0.053485,0.058246,0.024924,0.064022,-0.047201,0.006261,0.061669,-0.127295,-0.044981,0.070387,-0.056748,0.037092,-0.012054,0.021381,-0.030995,0.009962,0.013512,-0.002728,0.034445,-0.03177,0.017824,0.031022,0.029096,0.014267,0.002542,-0.024242,-0.029497,0.094027,0.020137,-0.137351,-0.003751,-0.009126,-0.0095,0.012676,-0.017463,0.01658,-0.108789,-0.059583,0.040435,0.020004,0.00284,0.005405,0.010283,0.091514,0.01289,-0.016273,0.045195,0.006181,0.050704,0.006308,-0.030941,0.017155,-0.064878,-0.033856,-0.040595,-0.012415,-0.027572,0.042574,0.064717,0.024322,0.027224,0.012188,-0.032439,-0.037012,-0.026007,0.009139,-0.006796,0.057443,0.060332,0.029765,-0.028053,-0.019549,-0.078249,0.044313,-0.082207,-0.059743,0.015858,-0.0186,-0.071189,-0.012763,-0.021528,-0.006799,-0.034257,0.007943,0.051159,0.007535,-0.024697,-0.323266,-0.023373,0.001192,0.017851,0.064557,-0.021929,0.013866,-0.032065,-0.015832,-0.090016,0.032706,-0.002562,-0.019041,-0.010369,0.048271,-0.003348,0.032252,-0.079693,-0.061187,-0.021608,0.016313,0.028855,-0.030273,-0.011078,-0.029925,-0.050597,0.089695,-0.086218,0.000688,-0.001137,-0.03982,0.071724,0.00119,-0.028615,0.005359,-0.044821,0.013759,-0.02217,-0.037413,0.038911,-0.016046,0.002785,-0.011065,-0.029283,0.041077,-0.098253,-0.035728,0.030487,-0.025767,0.014789,-0.036584,0.023908,0.017062,-0.04327,0.000365,-0.020538,-0.013478,-0.015404,-0.02237,-0.004433,0.051426,0.033589,0.039018,0.008671,0.029952,0.00354,0.007996,0.01396,0.040087,-0.023413,-0.027812,0.120663,0.015457,0.015939,0.077019,-0.010777,0.076752,-0.009139,0.012415,-0.008197,0.041719,0.049287,0.033428,0.103013,0.020204,0.028695,-0.013365,-0.023814,-0.015056,-0.005893,-0.042628,0.046586,0.026556,0.026917,0.019402,0.024216,-0.249456,0.021127,0.047014,0.04918,-0.038322,-0.028454,-0.030727,-0.068461,0.075949,0.043109,0.023226,-0.017356,0.022611,0.003039,0.041505,0.035514,0.068889,-0.065627,0.05287,-0.009835,-0.060706,-0.047522,0.104243,0.025045,-0.018305,-0.034445,-0.025579,0.004643,-0.042735,0.038616,0.029497,-0.072205,0.102906,0.025245,-0.051827,-0.009801,-0.000181,0.060759,0.015872,-0.011386,-0.022023,-0.0186,-0.038322,-0.041799,0.064022,-0.099536,-0.028026,-0.086112,0.025285,-0.002424,-0.006602,0.055304,-0.023788,0.009815,0.01404,0.029497,0.034391,-0.037814,0.020792,-0.053753,0.033696,-0.040595,0.017851,0.060706,0.044232]'::vector,
    'undergraduate',
    16,
    15,
    55,
    15,
    ARRAY['Ear defenders / plugs','Safety shoes','Safety glasses'],
    FALSE,
    'Full trousers, closed shoes, fitted short/long sleeve shirts.',
    ST_SetSRID(ST_MakePoint(77.021, 10.9856), 4326)::geography,
    'Trichy Road, Singanallur',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for compressors-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 55, TRUE, TRUE
FROM industries WHERE readable_id = 'compressors-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 55, TRUE, TRUE
FROM industries WHERE readable_id = 'compressors-cbe-01';


-- Industry: precision-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'precision-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Anamalai Horns & Electric Mobility Accessories [Demo]',
    'automotive',
    'Leading manufacturer of automotive electric horns, electronic reverse warning buzzers, industrial floor cleaning machines, and EV battery connectors.',
    'Acoustic anechoic test chamber, high-speed progressive metal stamping press, automated injection moulding cell.',
    'Acoustics, electro-mechanical design, tool and die design, plastic injection moulding, product lifecycle testing.',
    '[-0.040266,0.042191,0.025641,0.009017,0.009071,0.01284,0.022513,0.018342,-0.054918,-0.022406,0.007159,-0.061762,0.021416,0.014505,0.018261,-0.008817,0.037565,-0.036362,0.04433,-0.023983,0.043314,0.024665,0.023034,-0.042458,0.05334,0.003392,0.008242,-0.054971,-0.038902,-0.138177,0.0016,-0.039384,0.040961,0.029437,-0.046763,0.010755,-0.05211,0.021857,0.048046,-0.037298,-0.051549,0.00084,-0.016497,-0.036309,0.020694,0.011323,0.070372,-0.072671,-0.00299,-0.039918,0.033796,-0.041843,0.046469,0.00521,0.001271,-0.057859,0.027539,0.027833,0.054864,0.051522,0.00141,-0.019197,-0.115076,0.034517,0.007206,0.002027,0.004037,-0.074489,-0.013168,0.04163,0.034437,-0.069302,-0.035079,0.031202,0.003726,-0.004562,0.03679,-0.041335,-0.057271,-0.022232,-0.016884,-0.021951,-0.098606,-0.068286,0.003673,0.023529,0.081441,-0.042031,0.037057,0.006905,-0.047271,0.037432,0.031389,-0.001397,-0.001429,0.020347,-0.015253,0.01885,0.006033,0.388221,-0.019277,-0.009565,-0.00207,-0.049811,-0.024237,-0.020882,-0.069677,0.016497,-0.007506,0.085291,0.069302,-0.010461,-0.01901,-0.022713,0.01141,-0.017606,-0.012192,0.021363,-0.000801,-0.00373,-0.056255,0.012814,0.053126,-0.047779,0.013422,-0.035239,-0.019304,0.039571,0.00509,0.042539,0.020641,0.003402,-0.061442,0.034731,0.011811,-0.005578,0.022071,-0.008583,0.005267,0.042619,-0.075238,-0.042966,0.00996,-0.105558,-0.028395,0.000781,-0.054731,-0.05711,-0.043608,0.019973,-0.045613,0.033181,0.0177,0.033501,0.019665,0.034357,-0.067538,0.042752,0.004458,0.047512,0.013602,-0.031282,-0.008389,0.08604,-0.006738,-0.145128,-0.080906,0.002523,0.030106,0.000816,-0.008683,0.068233,-0.109033,0.023047,-0.016818,0.045079,0.01254,-0.00384,-0.025922,0.039571,0.028929,-0.014398,0.033288,0.009104,0.06203,0.02262,-0.063046,-0.048447,0.015721,0.006437,-0.002144,0.049223,-0.020333,0.088981,0.002002,-0.019772,0.026309,0.016523,0.023996,-0.00247,-0.015574,0.036041,0.001162,-0.00885,-0.01917,0.0331,-0.015026,-0.002219,0.023956,0.020654,-0.049089,-0.020307,0.059837,-0.050667,0.03786,-0.058821,-0.049463,-0.011824,0.011758,0.030667,0.001034,0.01905,-0.067163,-0.339881,0.03794,-0.036763,0.033715,0.029224,-0.059944,0.056522,-0.008128,0.028208,-0.057324,0.04195,0.072029,-0.000641,0.019411,-0.007553,0.078072,0.01155,-0.093205,0.025467,0.023221,-0.006604,0.048635,0.033715,0.009532,0.059517,-0.005317,0.106627,-0.039678,-0.001895,-0.014411,-0.058447,0.028395,0.050881,-0.029705,-0.03032,-0.045266,-0.01127,-0.000376,-0.033582,0.005077,-0.077537,-0.003008,-0.019759,-0.063688,0.049357,-0.096788,0.001947,-0.004418,0.024518,-0.068981,0.042699,-0.004525,0.011651,0.086681,0.036389,-0.024638,-0.055666,0.00891,0.002097,-0.051977,0.038608,0.022018,0.00322,-0.030159,-0.051014,0.013629,0.069784,0.019585,0.030213,0.005849,-0.031951,0.105825,0.00643,8.5e-05,0.081922,-0.024625,0.050907,-0.056148,0.014826,-0.00766,-0.047244,0.025414,0.054196,-0.012486,0.016483,0.054142,-0.007132,-0.052752,0.035935,0.033395,0.028208,0.016243,0.052084,-0.020761,0.033582,0.034758,-0.221596,-0.001498,0.033689,0.030427,-0.073473,-0.007861,-0.082564,-0.048073,-0.001574,0.005367,-0.039036,0.030293,0.014077,-0.000836,0.083526,0.046629,0.08604,-0.062351,0.039731,-0.009953,-0.042004,0.028956,0.163523,0.089622,-0.017072,0.014358,0.054169,-0.028421,0.022726,0.01397,0.053447,-0.042218,0.088232,-0.020614,0.039999,0.028956,-0.026189,0.048688,-0.022579,0.01532,-0.05973,0.004943,-0.048421,-0.048474,0.037298,0.012286,-0.07096,-0.084382,-0.002319,0.008355,-0.002473,-0.011437,-0.01409,-0.002069,-0.020935,0.003817,0.029437,0.03155,0.033849,-0.082938,0.073794,-0.010661,-0.018555,0.043047,0.048287]'::vector,
    'middle_school',
    12,
    10,
    45,
    15,
    ARRAY['Safety glasses','Closed-toe shoes'],
    TRUE,
    'Neat formal or school/college uniform.',
    ST_SetSRID(ST_MakePoint(76.982, 11.036), 4326)::geography,
    'Sathy Road, Ganapathy',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for precision-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 45, TRUE, TRUE
FROM industries WHERE readable_id = 'precision-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 45, TRUE, TRUE
FROM industries WHERE readable_id = 'precision-cbe-01';


-- Industry: electrical-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'electrical-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Nilgiri Switchgear & Industrial Relays [Demo]',
    'electronics',
    'Pioneering producer of low-voltage rotary switches, motor control gears, solar photovoltaic disconnect switches, and wire harness assemblies.',
    'High-voltage flashover testing facility, robotic contact spot welding, automated wire harness crimping and continuity test bench.',
    'Electrical machines, switchgear protection, power distribution, circuit breakers, electrical safety standards.',
    '[-0.070188,0.048324,-0.010063,0.050035,0.025124,0.000793,0.033811,0.043353,-0.029561,-0.058374,0.00205,-0.026086,0.00567,0.030978,0.014086,-0.015155,-0.023681,0.025044,0.052868,0.031272,0.054792,-0.001789,-0.019592,0.009368,0.044101,-0.016331,-0.001869,0.02038,-0.047308,-0.140803,0.02336,-0.006552,-0.009288,0.041295,-0.016598,-0.053937,-0.029481,-0.035388,-0.016758,-0.012215,-0.005402,-0.061795,-0.00868,0.028225,0.007377,-0.019124,0.006111,-0.08724,0.030604,-0.060298,0.042578,-0.051986,0.059336,-0.001237,0.029294,-0.051612,0.05939,0.054418,0.073181,0.026741,0.004758,0.027249,-0.150639,0.046213,0.011526,0.001025,-0.021663,-0.038729,0.078206,0.026207,0.023521,-0.023881,-0.048779,0.02197,-0.006144,0.017467,-0.012302,-0.024202,-0.028973,-0.017854,0.040038,-0.039344,-0.032234,0.014968,-0.006448,0.049233,0.049393,-0.046854,0.013498,0.015048,0.00999,0.049179,0.047843,-0.021235,-0.000921,-0.005095,-0.01724,0.012041,-0.016785,0.37355,-0.068584,-0.028171,0.054739,0.011867,-0.03218,-0.067942,-0.030229,0.052627,0.003399,-0.022291,0.074999,-0.018723,-0.002481,-0.055594,0.021062,-0.063292,0.025325,0.015034,-0.028251,0.054365,-0.019498,0.138665,0.035254,-0.012208,0.007457,0.000197,-0.012148,0.051104,0.056236,-0.029721,0.028332,-0.007865,0.004808,-0.022465,-0.029187,0.038274,0.082803,0.020981,0.003896,0.054659,0.002075,-0.019324,0.074518,-0.079329,-0.003002,-0.007176,-0.073448,0.014046,-0.036537,-0.011199,0.006816,0.02316,-0.012936,-0.012769,-0.004814,-0.001168,-0.043433,0.041909,0.040279,0.038034,-0.026781,-0.01142,0.031325,0.063613,-0.013805,-0.177901,-0.029347,-0.010544,-0.02618,-0.043246,-0.028599,0.06821,-0.041562,-0.040707,0.025231,0.005767,-0.001894,0.017854,-0.090715,0.053536,-0.015061,-0.008479,0.022839,0.044502,0.023173,0.029294,-0.025926,0.002051,-0.04509,0.018643,-0.079061,-0.01589,-0.048003,0.068958,0.036056,-0.000868,-0.022612,-0.020687,0.006782,-0.044529,-0.008199,0.0017,-0.003212,0.051318,-0.025458,0.079649,0.016852,-0.069012,-0.016585,0.074731,0.009248,-0.046079,0.047549,0.028626,-0.041027,-0.041776,-0.061902,0.030871,-0.007918,0.008787,0.046293,0.044315,-0.016277,-0.325012,0.009963,-0.022839,0.031806,0.055808,0.006575,0.032982,-0.057893,0.012629,-0.061688,0.13225,0.052467,-0.027276,-0.029962,-0.005409,0.062757,-0.010972,-0.036163,-0.011353,-0.001352,0.028733,0.031058,0.056449,-0.028118,0.037366,-0.05212,0.083552,-0.069439,0.006365,-0.047308,-0.037205,0.025726,0.006361,-0.023801,0.030577,0.01911,-0.020313,0.059871,0.006502,0.003809,0.003625,0.027877,-0.038782,-0.064361,0.101834,-0.098787,-0.043192,0.00204,0.041936,-0.039932,0.015997,-0.042177,0.007658,0.03643,0.006351,-0.041321,-0.074678,-0.039878,-0.023267,-0.043379,0.012221,0.043567,0.014754,-0.02892,0.040707,0.019525,0.007136,0.056984,-0.013872,0.023026,-0.061528,0.104346,0.030176,-0.004223,-0.019658,0.005894,0.008373,-0.040226,0.016077,0.008987,-0.013858,0.035628,0.034853,0.042497,0.042551,0.022705,0.000507,-0.056877,0.110547,0.002295,0.005813,0.02622,-0.016211,-0.024857,0.011693,-0.010431,-0.259796,-0.007203,0.026701,-0.032341,-0.041883,0.000753,-0.009816,-0.042872,0.056343,0.052066,-0.00054,0.018923,0.056182,-0.038916,0.036457,0.02467,0.064414,-0.019017,-0.015235,0.032929,-0.003715,-0.001463,0.143155,-0.008433,0.019057,-0.015743,-2.4e-05,-0.041963,-0.048805,-0.032982,0.008653,-0.025525,0.025619,0.00451,-0.00596,0.058534,-0.019471,-0.044983,0.025833,-0.043379,-0.040332,0.051184,-0.071684,-0.013645,0.064842,-0.061421,-0.063078,-0.0812,0.044155,-0.044101,-0.034319,0.043433,0.002203,0.009923,-0.013317,-0.030363,0.035361,-0.004981,-0.077992,-0.063238,0.051692,-0.013752,0.001732,0.034639,0.110012]'::vector,
    'high_school',
    14,
    10,
    50,
    15,
    ARRAY['Insulated safety shoes','Safety goggles'],
    TRUE,
    'Standard uniform. No conductive bracelets or metallic chains.',
    ST_SetSRID(ST_MakePoint(76.915, 11.121), 4326)::geography,
    'Samichettipalayam Post, Jothipuram',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for electrical-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 50, TRUE, TRUE
FROM industries WHERE readable_id = 'electrical-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 50, TRUE, TRUE
FROM industries WHERE readable_id = 'electrical-cbe-01';


-- Industry: agritech-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'agritech-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Bhavani Bio-Poultry Research & Automated Hatcheries [Demo]',
    'food_processing',
    'Modern bio-agricultural facility with climate-controlled automated incubators, egg candling robots, and microbial feed quality testing laboratories.',
    'Robotic egg handling system, PCR pathogen detection lab, climate and humidity automation control console.',
    'Bio-technology, food safety, veterinary microbiology, automation in agriculture, environmental controls.',
    '[0.027783,0.010449,0.008771,0.005847,0.043393,-0.029355,0.038385,0.026318,-0.017261,0.000577,-0.025199,-0.069791,0.008264,0.042674,-0.013352,-0.062652,-0.006979,0.006833,0.063611,0.024467,0.041315,0.002273,-0.050745,-0.033351,-0.029035,0.016356,0.024893,-0.007219,-0.012227,-0.12605,-0.020018,-0.036227,0.000782,0.007285,-0.016036,0.019392,-0.010289,-0.052397,-0.03423,0.007638,0.073414,-0.051198,0.024054,0.024467,0.000105,-0.013019,-0.029808,-0.008371,-0.014012,-0.084016,-0.020751,-0.054661,-0.005075,0.002382,-0.077996,-0.048801,0.018647,0.02115,0.002645,-0.003102,0.059509,0.057165,-0.13905,0.101597,-0.014757,-0.010942,-0.04896,-0.095204,0.047735,0.01497,-0.034096,-0.020338,0.068939,-0.002442,-0.023055,-0.032924,0.008884,-0.031166,0.021297,-0.029222,0.009257,0.053542,-0.041155,0.004795,-0.091208,0.091474,-0.055567,-0.017421,0.123919,0.034017,0.063558,-0.047256,0.019819,0.006416,-0.023455,0.006603,-0.0122,-0.048241,0.003361,0.353964,-0.037453,-0.077783,0.007492,0.029941,-0.000161,-0.023428,-0.02773,-0.023934,-0.016622,0.065849,-0.019952,0.003143,0.017608,-0.006859,-0.017248,-0.035029,0.00134,0.025359,-0.011201,0.05823,-0.011854,0.017688,0.013146,-0.003023,0.021297,0.008517,-0.021097,0.067927,-0.019432,-0.04001,0.063771,-0.006723,-0.045018,-0.012353,0.048614,0.021523,0.026345,0.010289,-0.004752,-0.010995,-0.063398,-0.026611,0.0496,-0.15141,-0.025546,0.095736,-0.06782,0.042008,-0.003962,-0.019699,-0.025785,0.078901,-0.007232,0.013865,0.050425,0.024161,0.026065,-0.001398,-0.002354,0.008231,-0.062759,0.032312,-0.010862,0.051331,0.076078,-0.148107,-0.049546,0.024946,-0.005421,0.069738,-0.011441,-0.002018,-0.01818,-0.025999,-0.020871,-0.009903,-0.040143,0.061267,-0.016675,0.058124,0.000195,-0.053196,0.028742,0.032392,0.071283,-0.006913,-0.051944,0.025133,0.018114,-0.011721,-0.038918,-0.022682,-0.019845,0.065529,0.009776,0.006133,0.047495,0.000331,0.047495,-0.020817,-0.022842,-0.017328,0.001369,0.029968,0.037772,0.042754,-0.009969,-0.020085,-0.001816,0.037133,-0.026145,0.008371,-0.038066,-0.011754,-0.070803,0.012726,-0.036707,-0.026864,0.037,0.022216,0.095204,0.069205,-0.04326,-0.326687,-0.044432,-0.000521,0.00032,-0.008544,-0.0246,-0.038145,-0.016968,0.087745,-0.045471,0.064464,-0.006087,0.058923,-0.00084,0.028902,0.035535,0.061906,-0.05594,-0.032871,-0.034523,-0.006133,-0.011927,0.024667,0.013073,0.053249,-0.063824,0.081672,-0.096749,0.087585,0.018607,-0.050266,0.045258,-0.007838,-0.075865,0.019312,-0.009004,-0.035775,0.020245,-0.058603,-0.023255,-0.015024,0.058177,-0.018353,-0.063878,-0.006406,-0.026944,0.03708,-0.020698,-0.026385,0.015783,-0.025346,-0.013272,-0.013825,0.040463,-0.04643,0.0183,-0.009623,0.000125,-0.019685,0.014025,0.024041,0.011368,-0.027357,0.013292,0.011254,-0.03106,0.011428,0.033484,0.039983,-0.019566,0.025439,0.100052,0.019113,0.028369,0.061054,-0.037826,0.080766,-0.10474,-0.032019,0.009969,0.004465,-0.018993,0.014757,0.061054,0.056206,0.068513,-0.020738,-0.020658,0.065156,-0.007971,0.008311,-0.011348,-0.0435,-0.014091,0.060521,0.095417,-0.246134,0.073201,-0.006503,0.066062,-0.017847,-0.05578,-0.054714,-0.025479,0.015117,0.032951,0.02789,-0.051438,0.065263,0.073201,-0.010822,0.065955,0.053063,-0.021297,0.003253,-0.035748,-0.056952,0.009183,0.127968,0.053702,0.005977,-0.016609,0.003629,-0.027677,-0.012473,0.003853,0.086413,-0.051198,0.043926,-0.005614,0.020897,0.006483,0.006566,0.002536,-0.020551,0.036893,-0.049094,0.012606,-0.070217,-0.046456,0.033217,-0.031273,0.003736,-0.074426,0.055567,0.04302,-0.009523,-0.032898,-0.041955,0.003093,-0.000819,0.008391,0.078262,-0.042567,-0.045071,-0.002036,0.072455,-0.062013,-0.000239,0.078742,-0.008817]'::vector,
    'middle_school',
    12,
    10,
    35,
    10,
    ARRAY['Sanitized lab apron','Hair cover','Disposable shoe booties','Face mask'],
    TRUE,
    'Clean casuals or uniform. Must pass through sanitization misting chamber.',
    ST_SetSRID(ST_MakePoint(77.042, 11.048), 4326)::geography,
    'Nehru Nagar, Avinashi Road',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for agritech-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 35, TRUE, TRUE
FROM industries WHERE readable_id = 'agritech-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 35, TRUE, TRUE
FROM industries WHERE readable_id = 'agritech-cbe-01';


-- Industry: spinning-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'spinning-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Noyyal Automated Spinning & Weaving Mills [Demo]',
    'textiles',
    '100,000-spindle eco-friendly textile mill powered by captive wind energy, converting raw combed cotton into premium export-quality compact yarn.',
    'Automated blowroom line, continuous roving transport system, circular knitting machines, automated yarn cone packaging line.',
    'Textile spinning, industrial logistics, automated material handling, green manufacturing, energy accounting.',
    '[-0.031461,-0.026423,-0.037315,0.009529,0.061159,0.033814,-0.031648,0.022534,-0.002442,-0.020743,0.050199,0.003102,-0.011735,0.036968,0.00408,0.002078,0.029964,0.042447,-0.029082,0.021812,0.03507,0.00697,-0.049371,-0.003639,0.024111,0.022854,-0.044025,-0.030954,-0.007812,-0.135896,0.04611,0.017976,-0.014835,-0.014822,0.025006,-0.005092,-0.008888,-0.017228,-0.001486,-0.029136,0.028895,0.020876,0.029457,0.025166,-0.01811,0.026556,0.068108,0.002521,0.007732,-0.047499,0.020355,-0.015864,-0.025501,-0.069178,0.01422,-0.052578,0.047419,0.015316,0.023269,-0.006382,0.014301,-0.006733,-0.119751,0.058111,0.027345,-0.073882,-0.007765,-0.019259,0.051188,0.009155,0.001986,-0.011387,-0.062762,0.025902,0.004487,0.02943,-0.003913,-0.058218,-0.041592,-0.004477,-0.039988,-0.033867,-0.058806,0.015129,-0.046724,0.066184,-0.024177,-0.083933,0.087247,-0.03523,-0.005052,0.03654,0.014969,0.030018,0.001483,-0.025808,-0.046323,0.063564,-0.001823,0.370159,-0.022387,-0.045602,0.062549,-0.005052,-0.025781,-0.052632,-0.066612,-0.011574,0.023282,0.007083,-0.000638,-0.022213,0.062281,-0.046457,0.001264,-0.057309,-0.024271,-0.012597,0.005256,0.045815,-0.038759,0.02093,0.063564,0.009997,-0.033733,0.006355,-0.04079,0.045896,0.054797,0.021625,0.040576,0.001366,-0.013532,-0.022186,0.041913,-0.014007,0.088156,0.023563,-0.025607,0.027853,-0.029644,-0.016599,0.013031,-0.147016,-0.033172,0.033894,0.000169,3e-05,-0.031381,0.00408,-0.02379,0.097512,-0.009483,-0.06736,0.04087,0.102804,0.050761,0.090455,0.021812,0.033814,-0.046858,0.026891,-0.009075,0.090669,-0.027345,-0.179306,-0.047473,0.014648,-0.04202,0.029751,0.018818,0.036594,-0.072171,-0.033947,0.013465,0.026757,-0.046671,0.003017,0.064473,0.080244,0.032237,-0.001174,0.037502,-0.039587,0.041913,0.050814,-0.072385,0.005042,0.024512,-0.07153,-0.025153,0.022934,-0.00419,0.024739,0.068964,-0.015958,-0.004357,0.003819,0.019433,-0.05175,-0.005252,0.075646,0.028441,0.047018,0.036594,0.055385,-0.075272,-0.028334,0.046404,0.078961,0.00212,-0.026971,0.015985,0.046911,-0.084147,0.045147,0.022467,0.002118,0.024338,0.020796,-0.006315,-0.037235,-0.084574,-0.311567,-0.016746,0.0168,0.017722,0.011775,-0.009703,0.037502,-0.056561,-0.006816,-0.013078,0.083505,0.03376,-0.008026,-0.046537,0.028655,-0.002728,-0.013626,-0.049504,-0.058379,0.041485,0.074524,0.044051,-0.002075,-0.004397,0.004795,-0.028281,0.096656,-0.096175,-0.007571,-0.007638,-0.041405,0.022467,-0.073561,-0.031034,-0.024097,-0.023389,0.021531,-0.035872,-0.027332,0.049691,-0.011641,-0.004578,-0.023469,-0.077731,0.045602,-0.09409,-0.015089,-0.062762,-0.032985,-0.020342,-0.047713,-0.01541,0.011908,-0.021972,-0.075326,-0.018858,-0.021117,0.017882,-0.021237,-0.01811,0.008373,-0.015985,-0.025982,-0.007805,-0.003685,-0.016252,0.048595,0.005095,-0.009429,-0.040389,0.024485,0.092379,0.084681,-0.044426,0.047125,-0.035204,-0.006609,0.020876,0.033172,-0.008808,0.034001,0.027746,0.051723,0.005136,-0.020729,0.03809,-0.049852,-6e-05,-0.008681,0.017094,0.040657,0.00822,-0.009643,-0.0197,0.086713,0.067467,-0.275427,-0.018831,0.029964,0.035311,-0.046404,-0.014381,0.022213,8e-05,0.005516,0.051456,0.038919,0.025955,0.017294,-0.017187,0.097725,-0.01704,0.059234,-0.013338,0.01815,-0.020008,-0.034562,0.032878,0.108417,0.035872,0.015597,-0.012369,-0.039881,-0.023736,-0.005951,0.021812,0.068376,0.022373,0.089225,-0.018604,0.023095,-0.045842,-0.02788,-0.021037,0.026409,-0.03229,-0.055438,0.003508,-0.027251,-0.051242,0.024284,0.004073,-0.019566,-0.069766,-0.045575,0.012456,0.019259,0.139104,-0.044693,0.073134,0.030045,0.020876,0.030312,-0.008186,-0.035444,-0.049317,-0.002686,-0.053006,-0.012917,0.009462,0.04758]'::vector,
    'high_school',
    15,
    15,
    50,
    15,
    ARRAY['Dust mask','Ear plugs','Closed shoes'],
    TRUE,
    'Fitted attire. Strict prohibition of loose apparel near spinning drums.',
    ST_SetSRID(ST_MakePoint(77.123, 11.085), 4326)::geography,
    'NH 544 Avinashi Bypass, Kaniyur',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for spinning-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 50, TRUE, TRUE
FROM industries WHERE readable_id = 'spinning-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 50, TRUE, TRUE
FROM industries WHERE readable_id = 'spinning-cbe-01';


-- Industry: bioenergy-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'bioenergy-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Periyar Bio-Ethanol & Co-Generation Facility [Demo]',
    'renewable_energy',
    'Large-scale bio-refinery producing fuel-grade anhydrous bio-ethanol from sugarcane molasses, featuring a 35 MW bagasse co-generation power plant.',
    'Continuous fermentation towers, molecular sieve dehydration unit, steam turbine generator control room, anaerobic effluent digester.',
    'Chemical engineering, distillation columns, bio-fuels, renewable energy grid integration, industrial effluent treatment.',
    '[-0.025447,0.048913,-0.020679,0.022796,0.03868,-0.054591,-0.061717,0.009616,0.002039,0.019996,-0.008404,-0.078485,-0.035653,0.030564,0.007293,-0.032358,-0.02597,0.021202,-0.021429,-0.03426,0.038814,-0.025729,-0.034314,-0.028581,-0.001872,-0.015068,-0.026974,0.015255,-0.033912,-0.155363,0.001077,0.021376,0.050975,-0.025822,-0.045243,0.042993,-0.032358,0.005347,-0.051431,0.044921,-0.012335,0.000963,0.017197,0.060752,-0.027202,-0.001976,-0.005193,-0.004534,-0.005592,-0.103665,0.022943,-0.057163,0.0461,0.009724,-0.035841,-0.065199,0.073717,0.032546,0.005669,0.007875,0.002262,-0.044386,-0.192972,0.044145,-0.031983,-0.093754,0.00595,-0.059252,0.050895,0.030082,-0.025434,0.01563,0.033349,-0.034394,0.033939,-0.00973,-0.030215,0.001726,-0.031796,0.031662,0.00734,-0.004651,-0.0802,-0.040368,-0.05952,0.045189,0.035037,0.024296,0.054109,0.048296,-0.030269,-0.009489,0.013313,0.016568,-0.068413,0.001999,0.012965,0.007507,0.0491,0.331298,0.008136,0.007741,0.080521,-0.008384,-0.011183,-0.002205,-0.059092,0.030215,0.029278,0.035385,0.005183,-0.007782,0.006261,-0.010802,-0.033162,-0.051056,-0.004296,-0.021148,-0.107093,0.025769,-0.006583,0.039966,0.013768,0.052877,0.065253,-0.015617,-0.013996,0.032439,0.04768,0.01265,0.007782,-0.027483,0.003216,0.011512,-0.013266,-0.056145,0.073556,-0.007694,0.02222,0.014652,-0.014184,0.01788,0.055716,-0.114862,-0.055074,0.025715,-0.007319,0.044493,-0.068413,0.013701,0.017478,0.093379,0.0521,0.022327,0.079128,0.041011,0.038814,-0.00365,0.033725,0.007674,0.022662,0.041653,0.018496,0.104629,0.063324,-0.141113,-0.06761,-0.010132,0.008719,0.048189,-0.037609,0.011746,0.005592,-0.015938,0.027537,-0.027376,-0.027644,0.073074,0.039859,0.047895,0.055609,-0.022019,0.025247,0.023238,0.059145,-0.025528,-0.057806,-0.03201,-0.023867,-0.054913,-0.109451,0.057645,-0.076717,0.095414,0.030189,-0.027992,-0.007386,-0.043877,-0.000917,0.00255,0.051243,0.050814,-0.012255,0.050252,-0.004835,-0.000762,0.009817,0.056681,-0.061181,0.063592,-0.008833,-0.020425,-0.007018,0.018443,-0.07361,0.05952,-0.025729,-0.037501,0.005578,0.011545,0.101736,-0.022233,-0.042966,-0.336013,0.040716,-0.038921,-0.014143,0.033832,-0.021684,-0.01413,-0.01776,-0.05502,-0.016648,0.055663,0.043207,0.001159,0.00159,-0.001644,0.036055,0.026117,-0.064931,-0.011458,0.004236,0.039832,-0.02017,0.106665,-0.019086,0.078378,-0.111754,0.071896,-0.045323,0.065842,-0.011116,0.022581,0.024416,-0.015818,-0.045591,0.011224,-0.08036,0.003094,-0.03635,0.046582,-0.016969,0.033992,0.087271,-0.036296,-0.076128,0.043984,-0.062574,-0.010601,-0.00521,-0.017197,0.032626,-0.001572,-0.03043,0.042216,-0.02455,0.045645,0.027376,0.005069,0.044305,-0.011867,-0.015751,0.020211,-0.003867,-0.018416,0.010929,-0.040555,-0.019072,-0.045162,0.002515,0.039725,0.002578,0.001599,0.039403,-0.001687,0.012,0.069753,-0.024229,0.003459,-0.068574,0.012844,0.031689,0.018389,-0.029573,0.084057,-0.012362,0.024952,0.008893,-0.019983,-0.080414,0.00888,0.021068,0.019273,0.058395,0.005669,0.014853,0.035359,0.071735,-0.26551,0.016835,-0.025072,0.007132,0.019461,-0.022287,0.018108,0.0356,-0.00597,0.033966,0.018014,-0.004845,0.011003,-0.014518,0.053761,0.004269,0.030671,-0.02751,0.00969,-0.039216,-0.03126,-0.073664,0.067663,0.02684,-0.047466,-0.037314,-0.009757,0.031635,-0.018684,0.033323,0.02751,0.027202,0.104361,-0.030671,0.002282,0.055824,0.030939,0.000808,0.044305,-0.014572,-0.025354,-0.010346,-0.083307,-0.046582,0.047841,0.000927,-0.026988,-0.091343,-0.006797,-0.023077,0.012583,0.038546,-0.010681,0.010567,0.040394,0.031823,0.035332,-0.108754,-0.027456,-0.05802,-0.026104,0.049502,-0.002222,0.019407,0.02743]'::vector,
    'undergraduate',
    17,
    10,
    40,
    12,
    ARRAY['Hard hat','Flame-retardant jacket','Safety shoes','Safety glasses'],
    FALSE,
    'Cotton full trousers and shirts. No lighters, cellphones, or matchboxes permitted inside distillation zone.',
    ST_SetSRID(ST_MakePoint(77.682, 11.435), 4326)::geography,
    'Appakudal Industrial Area, Bhavani',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for bioenergy-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 40, TRUE, TRUE
FROM industries WHERE readable_id = 'bioenergy-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 40, TRUE, TRUE
FROM industries WHERE readable_id = 'bioenergy-cbe-01';


-- Industry: robotics-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'robotics-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'CODISSIA Centre of Excellence for Robotics & 3D Printing [Demo]',
    'research_lab',
    'Collaborative industrial research hub housing 6-axis articulated robot arms, metal selective laser melting (SLM) 3D printers, and digital twins simulations.',
    'Robotic welding cell demonstration, industrial 3D laser metal deposition, computerized coordinate measuring machine (CMM) demo.',
    'Robotics, forward kinematics, additive manufacturing, 3D CAD modeling, digital twin technology.',
    '[-0.052981,0.015355,0.011443,0.027265,0.055384,0.025529,-0.075786,0.108205,-0.045878,-0.041739,0.023927,-0.039869,-0.02386,0.012985,0.058482,-0.016944,-0.029855,-0.002527,0.021564,0.014487,0.083637,-0.055117,-0.03338,-0.009447,0.061633,0.046198,-0.020843,-0.024101,0.035784,-0.173791,0.004056,-0.012457,0.017424,-0.050898,0.013118,-0.00245,-0.020829,0.03071,-0.016757,-0.002093,-0.000467,-0.044436,0.012471,0.041044,-0.010535,0.028306,0.026424,-0.01177,0.006836,-0.041124,0.037092,-0.08086,0.021804,-0.011209,-0.006996,0.035089,0.075252,-0.0048,0.051993,-0.0286,0.036745,0.022966,-0.149864,0.080647,0.066173,0.035837,-0.053408,-0.109167,0.035623,0.01912,-0.01665,-0.076107,0.051432,0.072261,0.038694,-0.021216,0.00114,-0.040991,0.000154,-0.034315,-0.09464,0.005231,-0.029001,-0.022084,-0.068096,0.056506,0.021363,-0.008973,-0.011576,0.004139,-0.003169,0.013499,-0.037493,0.025623,-0.070659,-0.02581,0.036692,0.045023,0.01908,0.390522,-0.032873,-0.019881,0.033567,0.021724,-0.028867,-0.020736,-0.018506,-0.010047,0.005908,0.024034,0.068843,0.002968,-0.022071,-0.023526,-0.02406,-0.091809,0.013612,0.039389,0.017772,-0.016183,0.034876,0.07349,-0.002567,-0.014741,-0.009433,-0.019601,-0.002851,0.069004,0.014527,-0.036077,-0.005858,-0.000224,-0.039602,0.007404,0.026677,0.005007,0.024328,-0.05194,0.009974,0.042673,0.017144,-0.002629,0.03824,-0.049536,-0.018613,0.080059,-0.049563,0.036638,-0.010909,-0.007317,0.003071,0.032526,0.038454,0.055117,0.013018,-0.049376,-0.000338,0.020696,0.010281,0.066867,-0.032152,-0.027332,-0.033086,0.129141,-0.007577,-0.160118,-0.047747,0.020375,-0.03525,-0.038774,-0.037172,0.006462,-0.045611,-0.022552,-0.001608,-0.002926,-0.045103,-0.000534,0.000569,0.040136,0.016063,-0.00465,0.058269,-0.049883,0.021136,0.020242,-0.050978,-0.003043,-0.002253,-0.009373,0.015448,0.038267,-0.033994,0.030069,0.017211,0.032659,0.022645,-0.029642,0.009707,-0.021751,-0.03055,0.039495,0.00502,0.012851,0.02868,-0.007344,0.023032,0.022939,0.027091,0.061099,-0.122732,0.009126,0.049109,-0.086041,-0.006516,-0.010301,0.002572,0.006579,-0.056079,0.00984,0.047827,0.004189,-0.049056,-0.316605,0.067188,0.006002,0.015208,-0.020415,-0.044943,-0.037172,-0.060512,0.022445,-0.013132,0.073543,0.072208,-0.038374,-0.045611,0.017211,-0.001889,0.00151,0.020829,-0.052954,0.015889,0.008425,0.012431,-0.013118,0.017505,0.049269,-0.0286,0.090901,-0.052928,-0.03079,0.01681,-0.015849,0.036611,-0.02868,-0.026971,-0.019708,-0.000192,0.037626,-0.028253,0.022752,0.018826,-0.067295,0.013886,0.003572,-0.066333,0.06409,-0.009593,-0.046492,0.08289,0.025382,0.088871,-0.027091,-0.003188,-0.017424,-0.033807,-0.060512,0.029909,-0.050444,0.006369,-0.057628,-0.048789,0.03079,-0.039282,0.00016,0.017411,0.020108,0.015395,-0.011556,-0.001137,0.079258,-0.025409,0.080166,0.116003,0.096883,-0.032125,0.036585,-0.031938,0.045584,0.02828,0.018973,-0.024595,-0.015876,0.037493,-0.002756,0.071033,0.032365,0.036318,-0.015235,-0.034876,-0.038641,-0.043047,0.005968,0.038,0.036825,0.007223,0.009513,-0.030469,-0.256574,0.015368,0.035517,0.094159,-0.019267,-0.101957,-0.005394,-0.057361,0.022124,0.021951,0.005187,0.039095,0.029054,0.052233,0.049323,0.037199,0.051913,-0.079792,-0.013419,-0.076214,-0.061954,0.028867,0.09747,-0.011309,-0.0096,0.029294,0.01155,-0.010869,-0.013252,-0.010468,-0.046439,-0.003932,0.015115,0.006265,-0.032766,0.116644,0.007177,0.008151,-0.018613,0.005581,-0.043928,0.020495,-0.013846,-0.036424,0.032819,0.003972,-0.032953,-0.034502,0.025997,-0.003442,-0.078564,-0.003351,-0.018079,-0.031377,-0.009146,-0.00096,0.079472,-0.029108,-0.013739,-0.007944,0.028119,0.019547,-0.020055,0.017091,-0.000116]'::vector,
    'middle_school',
    12,
    10,
    45,
    15,
    ARRAY['Safety glasses (laser area)','Clean lab footwear'],
    TRUE,
    'Casual formal / school or college uniform.',
    ST_SetSRID(ST_MakePoint(77.165, 11.072), 4326)::geography,
    'CODISSIA Industrial Park, Mopperipalayam',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for robotics-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 45, TRUE, TRUE
FROM industries WHERE readable_id = 'robotics-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 45, TRUE, TRUE
FROM industries WHERE readable_id = 'robotics-cbe-01';


-- Industry: diecasting-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'diecasting-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Siruvani Powertrain Die-Casting & Machining [Demo]',
    'automotive',
    'High-pressure aluminum die-casting plant producing cylinder heads, transmission housings, and suspension crossmembers for major automotive OEMs.',
    '1800-ton cold chamber die casting press, robotic molten metal ladling, 5-axis horizontal machining center (HMC) line, X-ray porosity inspection.',
    'Automotive manufacturing, high-pressure die casting, CNC machining, GD&T inspection, quality assurance.',
    '[-0.040769,0.011286,0.020531,-0.034579,0.009045,0.04792,0.01853,0.03522,-0.037968,-0.031591,-0.019624,-0.078764,0.047066,-0.037968,-0.014555,-0.020425,0.066917,0.04277,0.064836,-0.042664,0.062221,-0.026895,-0.032765,-0.042504,0.076362,-0.003702,0.012554,-0.041596,0.01809,-0.202993,0.005893,-0.035059,-0.036954,-0.026962,-0.021652,0.013941,-0.027068,0.03666,-0.033112,-0.022706,0.012894,0.025694,-0.056565,-0.010312,0.000232,0.040769,0.028629,-0.009572,0.073427,-0.005576,0.009845,-0.023093,0.054804,-0.055337,0.024854,-0.088849,0.105605,0.020278,0.080738,0.028683,0.003212,-0.009238,-0.17962,0.047333,0.010873,0.025481,-0.029697,-0.026508,-0.001283,0.009539,0.024627,-0.124549,-0.028816,0.03658,-0.059713,-0.067131,0.000645,-0.061741,-0.05934,0.008165,-0.035673,0.0117,-0.070332,-0.036634,-0.0365,-0.026428,0.029777,-0.006324,0.023907,0.015755,-0.008752,0.016209,0.010673,-0.020305,-0.032125,0.021865,0.019384,0.045359,-0.00015,0.37098,0.01184,-0.045866,-0.028576,-0.026295,-0.053336,0.079671,-0.00586,0.039329,0.013094,0.022906,0.079031,-0.003072,-0.01178,-0.010626,-0.015395,-0.031911,-0.006951,0.031217,-0.025307,0.030657,-0.013247,-0.013608,-0.016943,-0.013361,0.046559,0.001628,0.013548,0.055124,0.02452,-0.02348,-0.001966,0.009252,-0.067984,-0.002913,0.0722,0.013994,0.072467,0.032178,-0.003422,-0.015062,-0.086128,0.007671,-0.033005,-0.081539,0.028763,0.061848,-0.076149,-0.051042,-0.006434,-0.015289,-0.006644,0.00309,-0.04712,-0.020972,0.008091,-0.038501,-0.035273,0.033752,-0.000405,0.037381,0.021065,0.009499,-0.061101,0.074548,0.031431,-0.141625,-0.031804,-0.018143,-0.006013,0.028362,0.01853,0.040182,-0.021559,0.027909,-0.00511,0.01841,-0.055764,-0.002188,-0.020798,0.049601,0.042023,0.007051,0.020465,-0.039248,0.082926,0.026695,-0.039142,-0.001869,0.014541,0.001496,-0.020318,0.019624,-0.031591,0.109608,-0.001505,0.015182,0.021372,0.029003,0.040743,-0.037888,-0.057525,-0.003906,-0.023586,0.032231,-0.003996,0.040583,-0.036047,0.028096,0.046746,-0.001323,-0.093705,-0.032178,0.040556,0.013928,-0.051068,-0.016009,-0.04229,0.004039,-0.00565,-0.000993,0.04864,-0.017049,-0.035513,-0.302035,-0.043037,-0.001933,-0.014768,0.018584,-0.041063,0.009439,-0.049014,0.028469,-0.02983,0.091197,0.064676,-0.03007,-0.015382,0.019851,-0.008158,-0.026121,-0.025788,-0.046773,0.041383,0.020678,0.073854,-0.026321,-0.027936,0.014755,0.014181,0.097921,-0.097601,0.024267,-0.014288,-0.007631,0.037941,0.010019,-0.025267,-0.034072,-0.041276,0.025227,0.053817,-0.025441,0.025801,-0.017623,0.011266,-0.027989,-0.057739,0.085007,-0.04173,-0.009639,0.055818,0.007471,0.015956,0.040182,0.017743,-0.004639,0.002165,-0.04816,0.005787,-0.094239,-0.052056,-0.056725,0.003422,0.015822,0.022679,0.020785,0.003629,-0.022946,0.002063,0.04173,0.016369,0.056511,0.027642,-0.053737,0.057259,0.049201,-0.002903,0.087515,0.003729,0.024107,-0.004786,0.041677,-0.002777,0.021092,0.01162,0.030337,0.116652,0.094346,0.048347,-0.037407,-0.014982,0.018063,0.050988,0.001181,0.002993,-0.011046,-0.037754,0.045545,-0.012887,-0.254435,-0.010879,0.045946,0.076949,-0.063769,-0.091891,-0.01202,-0.033112,-0.039088,0.023453,-0.04269,0.004022,0.063929,0.002131,0.025094,0.021118,0.04181,-0.031778,0.052429,0.038368,-0.057419,-0.025454,0.13106,-0.002166,0.009525,-0.032685,-0.018984,0.019317,0.015569,-0.020518,0.027349,0.026295,0.125403,-0.024974,-0.012374,0.056085,0.007638,0.018384,0.034286,0.006354,-0.057579,0.026441,-0.047813,0.042023,-0.002313,0.004513,-0.052429,-0.075402,0.018944,-0.011493,-0.018944,0.057685,-0.013314,0.009785,-0.048881,-0.038048,0.035059,-0.001443,0.013134,0.00511,0.014488,0.044451,-0.026508,0.083727,0.034046]'::vector,
    'undergraduate',
    16,
    12,
    40,
    12,
    ARRAY['Steel-toe shoes','High-visibility vest','Ear defenders','Safety glasses'],
    FALSE,
    'Strict rugged cotton attire. No sandals, shorts, or loose sleeves.',
    ST_SetSRID(ST_MakePoint(76.968, 10.941), 4326)::geography,
    'SIDCO Industrial Estate, Kurichi',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for diecasting-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 40, TRUE, TRUE
FROM industries WHERE readable_id = 'diecasting-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 40, TRUE, TRUE
FROM industries WHERE readable_id = 'diecasting-cbe-01';


-- Industry: motors-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'motors-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Thudiyalur Submersible Hydraulics & Motors [Demo]',
    'manufacturing',
    'Integrated plant manufacturing water-filled submersible motors, stainless steel impellers, and agricultural borewell pumping units.',
    'Rotor dynamic balancing, automated wire enameling and dipping line, hydrostatic pressure testing tank, computerized flowmeter calibration.',
    'Electromagnetism, induction motors, fluid dynamics, pump head-loss calculations, factory production planning.',
    '[-0.031465,-0.040471,0.004223,-0.004573,-0.026963,-0.054671,-0.01829,0.0225,-0.012915,-0.032131,-0.041243,-0.077051,0.022966,-0.037646,0.004896,-0.030027,-0.013048,0.063144,0.043348,-0.000991,0.074334,-0.030746,-0.040844,-0.036821,0.022393,0.003897,-0.013361,-0.033543,-0.013748,-0.158366,0.036554,-0.031305,-0.013561,0.022367,-0.00774,0.026976,-0.050515,0.032638,-0.012396,-0.02563,0.006451,-0.045986,-0.029067,0.055471,-0.036075,-0.004186,0.010244,-0.032638,0.040204,-0.050968,0.005515,-0.089893,-0.012222,-0.042549,-0.005588,-0.095755,0.01869,0.006614,0.070444,-0.016825,0.021221,-0.002096,-0.127993,0.079289,-0.019063,-0.004849,-0.054298,-0.063836,0.059094,0.016079,-0.006887,-0.035035,-0.038339,0.046838,-0.002698,-0.048277,0.002256,-0.051101,-0.046225,0.042922,0.033437,-0.001342,-0.039112,-0.032398,-0.013608,0.030373,0.065115,-0.053979,0.061652,0.028694,-0.061705,-0.009145,0.052247,0.012649,-0.068419,0.015746,0.002644,0.003287,0.026003,0.3519,0.003753,-0.044654,0.083499,-0.010617,-0.02984,0.004293,-0.084724,0.035622,0.014081,0.009225,0.059147,-0.009298,0.062877,-0.045826,-0.029174,-0.069165,-0.050249,-0.001445,-0.071456,0.023339,-0.021954,0.020781,0.038419,-0.000137,0.038179,0.003315,-0.003617,0.065062,0.047717,-0.005965,-0.021607,-0.030106,-0.055151,-0.020049,0.074867,-0.036607,0.046146,0.007194,0.02635,0.055364,-0.032691,-0.025098,0.012895,-0.082593,-0.035169,0.077478,-0.037327,-0.016479,0.039085,0.028375,-0.036288,0.071296,0.030719,-0.062238,0.054218,0.037247,-0.010131,0.056483,-0.007373,0.004666,-0.033437,-0.047318,-0.011809,0.030719,0.00698,-0.139502,-0.010571,0.043162,-0.013468,0.01544,-0.061172,0.021448,-0.019503,-0.001303,0.029067,0.037886,0.010917,0.06698,-0.014241,0.043348,0.012089,0.023273,0.065222,-0.012822,0.03698,0.030666,-0.083073,0.014467,-0.039964,0.014907,-0.026736,-0.075133,-0.057122,0.03349,0.040151,0.006707,0.058028,0.022247,0.031492,-0.017877,-0.010244,-0.004369,0.029707,0.026763,-0.012755,0.102202,0.052087,0.008479,-0.041909,0.117549,-0.059147,0.042922,0.040524,-0.047478,-0.056963,-0.00774,-0.017078,-0.009651,-0.057975,-0.003563,0.080408,-0.054165,-0.025071,-0.318649,-0.028108,-0.026736,0.000633,0.072309,-0.016319,0.011776,-0.034849,-0.015573,-0.040471,0.027975,0.01845,-0.024525,-0.041909,0.027069,0.051181,0.012615,-0.082806,-0.027815,-0.002529,0.030666,0.045213,0.038313,0.044733,0.013974,-0.041456,0.101456,-0.088401,0.050835,-0.003087,-0.057815,0.077105,0.024551,-0.010744,0.007054,-0.023273,-0.040924,-0.078224,0.016039,-0.010604,-0.005202,0.005695,-0.023193,-0.034636,0.041217,-0.042202,-0.062771,-0.02595,-0.042842,0.011789,0.018277,-0.002724,0.025897,0.011963,-0.031332,0.007766,-0.031572,0.017784,-0.021488,-0.079716,0.03413,0.006078,-0.019902,0.000369,0.013162,0.009159,0.012442,0.053233,0.051421,-0.046838,-0.02968,0.057282,0.022047,0.024631,0.06373,-0.007027,0.013341,-0.009765,-0.00363,0.019982,0.039565,0.041776,0.049742,0.057229,0.011017,0.03325,-0.038259,-0.056376,-0.019742,0.04436,-0.031412,0.019383,-0.043295,-0.007647,0.031892,0.036368,-0.266642,-0.008213,0.040098,0.009731,-0.023353,-0.055311,-0.004876,-0.027682,0.031439,0.041403,0.001047,0.06,-0.029121,0.070391,0.032771,0.063623,0.061705,-0.058561,0.085204,-0.068526,-0.051527,0.008013,0.143552,0.031998,0.004586,0.023859,0.039085,0.01089,-0.010844,0.042282,0.030053,-0.004533,0.124369,-0.012362,0.015693,0.069645,-0.018157,0.024511,0.038179,-0.033304,-0.028588,0.040844,-0.035542,-0.021874,0.040471,0.014947,-0.007926,-0.122238,6.2e-05,-0.019916,0.008592,0.046971,-0.003603,0.000607,0.044307,0.071776,0.034769,-0.015519,0.028002,-0.009931,0.063517,-0.058241,-0.000253,0.030906,0.059893]'::vector,
    'high_school',
    14,
    15,
    50,
    15,
    ARRAY['Closed-toe safety shoes','Safety vest'],
    TRUE,
    'College uniform or neat casuals.',
    ST_SetSRID(ST_MakePoint(76.936, 11.082), 4326)::geography,
    'Mettupalayam Road, Thudiyalur',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for motors-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 50, TRUE, TRUE
FROM industries WHERE readable_id = 'motors-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 50, TRUE, TRUE
FROM industries WHERE readable_id = 'motors-cbe-01';


-- Industry: appliances-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'appliances-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Kovai Smart Consumer Appliances & Assembly [Demo]',
    'manufacturing',
    'High-volume assembly plant producing heavy-duty mixer grinders, induction cooktops, and BLDC ceiling fans with lean manufacturing assembly lines.',
    'Universal motor assembly line, Poka-Yoke error proofing stations, sound pressure decibel testing booth, automated packaging robot.',
    'Lean manufacturing, assembly line balancing, Poka-Yoke, consumer electronics, quality control.',
    '[-0.015899,0.016661,-0.00575,-0.013586,-0.016661,0.010537,0.005275,0.024791,-0.030247,0.009561,-0.005335,-0.067126,-0.006408,-0.004272,0.042869,-0.047763,-0.007943,0.009694,0.013773,-0.007528,0.040115,-0.004098,-0.070281,-0.017183,0.057712,-0.023721,-0.0118,-0.009454,0.004968,-0.185277,-0.006295,-0.004613,0.05814,-8.8e-05,0.002516,0.020927,-0.006372,-0.021381,-0.002128,-0.027653,-0.035542,-0.039847,0.021689,-0.023574,0.009641,0.010831,0.027332,-0.030247,0.020472,-0.098522,0.028562,-0.045009,0.026516,-0.027024,-0.006632,-0.058942,0.038484,0.01642,0.065361,0.002969,0.052925,-0.008478,-0.136819,0.073384,0.022036,0.020472,-0.004814,-0.100448,0.024256,0.003463,0.039607,-0.026128,0.006622,-0.008805,0.007635,-0.034392,0.01271,-0.010878,-0.061082,0.002908,0.006485,0.037387,-0.088574,-0.032787,-0.068409,0.006405,0.021288,-0.005365,0.085632,0.015297,-0.034205,0.012048,0.039259,-0.032867,-0.010991,-0.017062,-0.01848,-0.019496,0.039072,0.359857,-0.041318,-0.028909,0.085204,-0.015484,0.01051,-0.003375,-0.083332,-0.012215,0.029284,0.052845,0.010189,0.018814,0.010704,0.011807,-0.03367,-0.054877,0.020044,0.020098,-0.030728,0.008244,-0.000831,-0.019763,0.009233,-0.006716,-0.023855,-0.027653,0.003423,0.033295,0.025994,-0.003791,0.028054,0.008331,-0.008852,-0.019255,0.023267,-0.020967,0.043431,-0.046721,0.022799,0.041425,-0.062365,0.007054,-0.007007,-0.127726,-0.041425,0.079962,-0.035836,0.069051,0.030273,-0.02078,-0.046587,0.042896,0.037574,-0.049582,0.029872,0.018012,0.036825,0.030568,-0.011012,0.042549,-0.050679,0.015591,-0.01618,0.010664,0.002676,-0.1396,-0.075683,0.027653,-0.014722,-0.011299,-0.020793,0.027626,-0.009654,0.005068,0.017503,-0.035889,-0.002783,0.077609,-0.004894,0.038644,-0.007274,0.001168,0.066377,-0.029391,0.117884,-0.055573,-0.038296,-0.048379,0.02336,0.008417,-0.024443,0.014254,-0.043324,0.059103,0.034873,-0.0163,-0.003296,0.063114,0.070442,-0.019442,-0.054931,0.05124,-0.045143,0.040436,-0.043538,0.037521,-0.003747,0.006238,0.041078,0.043993,-0.068677,-0.024524,0.053487,0.015324,-0.061403,-0.021274,-0.004877,0.009374,-0.011426,-0.036558,0.073918,0.012549,0.003373,-0.317924,0.055466,0.011359,0.030594,0.006338,0.023574,-0.005111,-0.021515,-0.00168,-0.05108,0.09665,0.047683,0.053433,-0.010002,0.034526,0.068516,0.020205,-0.073758,-0.048646,0.007883,-0.007949,0.052818,-0.0015,0.027973,0.053166,0.010697,0.092692,-0.073865,0.030461,-0.016581,0.017276,0.03827,-0.016808,-0.03736,0.050277,0.008264,-0.022585,0.038189,-0.025139,0.067554,-0.053487,0.02435,-0.070923,-0.065307,0.053487,-0.060654,-0.038002,-0.031076,-0.010684,-0.005449,-0.016688,-0.013639,0.028027,0.036317,-0.024764,0.018506,-0.012248,-0.007388,-0.042415,-0.033402,0.025433,0.013545,-0.00465,0.028027,-0.032038,0.018734,0.031504,0.041238,0.034205,0.025272,-0.073758,0.09879,-0.005633,0.002826,0.121949,-0.019991,0.047897,-0.042816,-0.007588,0.019643,0.018132,0.026663,0.008685,0.057284,0.0303,0.047362,0.023133,-0.01503,0.035034,-0.007107,-0.012589,0.05814,-0.00291,-0.026061,0.037334,0.060012,-0.245182,0.004329,-0.036237,0.038457,-0.022785,-0.043297,-0.114675,-0.052898,0.016126,0.006011,0.021074,0.05223,0.011145,0.040837,0.088146,0.075737,0.074346,-0.030273,0.087771,-0.08162,-0.043565,0.015658,0.125693,0.03712,-0.06857,-0.056589,0.03038,-0.044233,-0.015912,0.059477,-0.023481,-0.046507,0.153185,0.040409,0.058835,0.021435,-0.043003,-0.044715,-0.020218,-0.00831,-0.053433,0.002646,-0.047977,-0.022799,0.039527,-0.057124,-0.083065,-0.089857,0.030648,-0.055573,0.020445,-0.017838,-0.028375,0.035676,-0.054931,-0.021475,0.047175,0.012329,-0.009594,0.01392,0.011025,-0.013258,0.038457,0.004971,-0.001357]'::vector,
    'middle_school',
    12,
    15,
    50,
    15,
    ARRAY['Safety glasses','Closed shoes'],
    TRUE,
    'Comfortable formal / school or college uniform.',
    ST_SetSRID(ST_MakePoint(76.892, 11.018), 4326)::geography,
    'Marudhamalai Main Road, Vadavalli',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for appliances-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 50, TRUE, TRUE
FROM industries WHERE readable_id = 'appliances-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 50, TRUE, TRUE
FROM industries WHERE readable_id = 'appliances-cbe-01';


-- Industry: biomedical-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'biomedical-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Avinashi MedTech Imaging & Clinical Sensors [Demo]',
    'pharmaceuticals',
    'Advanced biomedical device facility prototyping patient monitoring telemetry, pulse oximetry sensors, and ultrasound transducer arrays.',
    'ISO Class 7 cleanroom, digital oscilloscope signal analysis bench, phantom tissue ultrasound testing, biomedical calibration station.',
    'Biomedical instrumentation, medical imaging, biosensors, FDA ISO 13485 compliance, clinical engineering.',
    '[-0.057657,-0.028536,-0.005733,-0.018074,0.081029,-0.031677,0.062715,0.067559,-0.00553,0.042804,-0.018194,-0.042564,-0.014108,0.027657,0.039822,-0.024716,0.061597,-0.014042,0.08417,0.031757,0.032954,0.038518,0.040701,-0.023771,0.033034,0.023704,-0.002422,-0.036921,-0.068837,-0.097639,-0.048926,-0.018128,0.060106,-0.017436,0.052866,0.013542,-0.013975,0.017369,-0.004395,0.013117,-0.023292,-0.014787,-0.034871,0.017941,0.028962,-0.07826,-0.036335,-0.029441,0.049219,-0.059999,0.003853,-0.061171,0.003773,0.026712,0.017236,-0.082785,0.017302,-0.002156,0.027191,0.014042,0.080816,0.021455,-0.116592,0.092102,-0.002268,-0.011313,0.002552,-0.113717,0.057444,-0.044241,0.003441,-0.035137,-0.009836,0.002882,0.017609,-0.006681,0.058402,-0.009763,-0.030931,-0.045758,-0.023877,0.001374,-0.021388,-0.018753,-0.006668,0.00261,0.024543,-0.016584,0.02819,0.037453,-0.056273,0.012637,-0.022959,-0.014255,-0.066228,-0.067826,0.011852,0.002397,0.019858,0.335614,-0.038198,-0.055315,-0.021375,-0.010009,0.02232,-0.053531,-0.046876,-0.046131,0.006415,0.068944,0.010807,0.021029,0.063726,-0.033487,-0.071659,0.034445,-0.014161,0.044667,-0.002229,-0.026127,0.028802,0.017382,-0.031517,-0.048181,0.028908,-0.029734,-0.015439,0.061916,0.044853,0.047781,0.023624,0.004033,-0.043709,-0.000149,0.047781,0.022653,-0.004638,-0.01854,0.02968,0.062289,-0.050976,0.007926,0.059999,-0.049565,-0.102856,0.099768,-0.027604,0.057444,-0.016371,-0.054383,-0.010548,0.063566,0.000593,0.079911,-0.010694,0.070221,-0.03354,-0.023092,-0.020696,-0.002758,-0.0374,-0.040221,-0.028003,0.073469,0.039955,-0.103708,-0.018926,0.003547,-0.012664,0.012764,-0.014601,-0.009417,-0.010628,0.009317,-0.025195,-0.048127,0.05015,0.035084,-0.008897,0.002126,-0.046024,-0.04472,-0.012671,0.056752,0.063087,-0.026233,-0.027444,-0.060425,0.031331,0.061437,0.004395,0.017276,-0.053664,0.074214,-0.000987,-0.043469,-0.039929,0.006808,0.037054,0.003161,0.062023,0.043203,0.017302,0.05968,0.040541,0.02795,0.032049,-0.008485,-0.006758,0.108819,-0.036069,0.053265,0.019978,-0.025408,0.002071,-0.003241,-0.040088,0.022054,-0.019459,0.039263,0.028083,0.038145,-0.054995,-0.330716,0.062236,-0.00357,0.037293,0.023585,-0.036628,-0.02075,-0.017835,-0.003773,-0.000476,0.074054,0.07629,-0.025887,-0.077408,-0.011919,-0.012804,0.052892,-0.072777,-0.032262,-0.070487,0.032608,0.026885,-0.040301,0.010248,0.04456,-0.050843,0.097,-0.079538,0.036867,0.02031,-0.018194,0.016184,-0.019073,-0.083957,-0.017955,-0.029175,-0.011047,0.000113,-0.055634,0.012571,-0.023358,0.034818,-0.004855,-0.010874,0.021255,-0.065004,-0.010022,-0.006834,0.003038,-0.046397,0.003334,0.014374,-0.02067,0.030372,0.035031,0.010089,-0.059094,-0.017609,-0.056645,-0.000493,0.041792,0.085128,-0.026167,0.009896,-0.023585,-0.031677,0.059946,0.033726,0.08039,-0.003206,0.015812,0.104613,-0.041047,-0.035883,0.106956,-0.023797,0.026406,-0.066708,-0.023678,-0.005414,0.031916,0.021801,0.008458,0.050177,0.016251,0.069636,0.051961,-0.045173,-0.013629,0.017569,0.021868,0.051774,-0.015306,-0.012358,0.015945,0.062182,-0.26108,0.012345,0.0559,-0.017875,-0.046557,-0.067506,-0.050044,-0.0411,-0.021349,0.018979,-0.039742,-0.071925,0.04677,-0.001514,0.032608,0.062768,0.128624,-0.06692,0.02968,-0.022786,0.004781,-0.038571,0.126388,-0.034285,-0.010541,0.006505,-0.025488,-0.014188,-0.015599,0.006315,0.00566,-0.023305,0.060905,0.02039,0.032129,0.071339,-0.001213,0.050177,-0.047276,-0.022107,-0.021056,-0.02976,-0.086885,-0.047382,0.071978,-0.016025,-0.005071,-0.085607,0.044827,-0.015665,0.004166,0.043123,-0.020656,-0.001479,-0.005291,0.01297,0.039875,-0.027285,-0.014428,-0.0674,0.041286,0.04496,-0.051322,0.114995,-0.032715]'::vector,
    'undergraduate',
    16,
    8,
    30,
    10,
    ARRAY['Cleanroom gown','Shoe covers','Latex/Nitrile gloves'],
    TRUE,
    'Clean formal or scrubs/lab coats.',
    ST_SetSRID(ST_MakePoint(77.031, 11.042), 4326)::geography,
    'Health City Campus, Avinashi Road',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for biomedical-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 30, TRUE, TRUE
FROM industries WHERE readable_id = 'biomedical-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 30, TRUE, TRUE
FROM industries WHERE readable_id = 'biomedical-cbe-01';


-- Industry: biotech-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'biotech-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Botanical Bio-Fertilizers & Microbial Labs [Demo]',
    'research_lab',
    'Centuries-old agricultural biotechnology lab culturing mycorrhizal fungi, Rhizobium nitrogen-fixing inoculants, and biological pest controls.',
    '500-liter bioreactor fermentation vessel, automated laminar air flow sterile inoculators, mass spectrometry soil nutrient analyzer.',
    'Agricultural microbiology, biotechnology, soil science, organic farming, bioreactor design.',
    '[0.063024,0.020941,0.006908,-0.021762,0.039322,-0.072719,-0.026906,0.035659,-0.051765,0.020348,-0.008928,-0.095936,-0.016362,0.017251,-0.007555,-0.030731,0.013332,0.034043,0.0303,0.010383,0.037733,0.013507,-0.038407,0.009238,0.022503,0.02296,-0.049934,-0.072666,-0.044251,-0.128525,0.001284,0.003195,0.002375,0.028845,0.017331,0.002927,-1.3e-05,-0.04856,-0.025304,0.002478,0.049772,-0.031916,-0.02968,0.09265,-0.051388,-0.051415,0.047456,-0.040669,0.024482,-0.086886,-0.005373,-0.095236,0.019553,0.034663,-0.04953,-0.085486,0.049315,-0.017911,0.021775,0.049288,0.042231,-0.007285,-0.130249,0.060707,0.021479,0.009938,-0.067225,-0.030408,0.038891,-0.001514,-0.032131,0.021735,-0.009184,-0.005915,0.045679,-0.017816,-0.010194,-0.066417,0.009965,0.002907,-0.021547,0.062593,-0.061946,0.009433,-0.075898,0.008565,0.008733,-0.005945,0.080045,0.053812,-0.009642,-0.029411,-0.005121,0.008659,-0.032401,-0.000957,-0.022435,0.035875,0.008114,0.37534,-0.033586,-0.015056,0.013507,-0.02226,-0.003249,-0.005757,-0.101376,0.015217,0.02995,0.035498,0.047618,-0.007157,0.00253,0.024792,0.028145,-0.030327,0.02222,0.018907,-0.050392,0.062,-0.00368,0.013621,-0.028199,-0.014705,0.067925,-0.002537,-0.023162,0.059576,-0.020792,0.051119,0.013096,0.031485,-0.048614,-0.020079,0.032724,0.029411,0.063239,-0.014867,-0.038757,0.039053,-0.046325,0.069218,-0.038461,-0.119475,-0.063885,0.059522,-0.00131,0.058607,0.043039,-0.024752,0.000811,0.118506,0.005249,0.006595,0.070511,0.0411,-0.005626,0.019998,0.012261,0.007811,-0.05656,0.021425,-0.019621,0.064801,0.069057,-0.085701,-0.028172,0.019096,-0.000132,0.006434,0.029519,-0.025923,-0.017008,0.020752,-0.020927,-0.053759,0.005811,0.04145,0.027297,-0.003724,0.029519,0.021264,0.054971,0.025209,0.041315,0.00408,-0.074335,0.016025,-0.007737,0.024388,-0.012403,0.013615,-0.008922,0.099706,0.015365,-0.017331,0.015567,0.047591,-0.012255,-0.044871,0.013911,0.019553,0.003767,0.052735,-0.024576,0.02191,0.039726,0.048076,-7e-05,0.030057,-0.109833,0.049395,-0.062862,0.022247,-0.056775,0.023405,-0.028549,-0.02657,0.01721,0.057852,0.076329,-0.007939,-0.034124,-0.341512,-0.030219,0.014517,0.042931,0.067441,-0.011655,-0.040427,-0.014315,0.050715,0.021466,0.039349,0.056129,0.014867,-0.061354,-0.006026,-0.003003,0.014544,-0.085378,-0.044036,-0.001978,0.08123,-0.024267,0.051308,0.042662,0.04514,-0.071319,0.052223,-0.069218,0.022624,-0.018059,-0.008861,0.032562,0.037464,-0.070942,-0.087802,-0.097552,-0.042285,0.010639,-0.053355,0.021897,0.007945,0.043335,0.00645,-0.062593,0.013568,-0.003969,-0.033209,-0.025762,-0.011312,0.006659,-0.002414,0.00709,0.016133,0.032966,0.049988,0.009864,-0.052439,0.005403,-0.033747,0.000586,-0.018301,-0.00438,0.005878,0.008383,-0.004235,-0.020173,-0.002964,0.044467,0.052439,-0.047214,0.048049,0.046056,0.045598,0.02898,0.060707,-0.013332,0.043605,-0.048291,-0.010484,0.043282,0.004306,0.007003,0.00166,0.005999,0.070565,0.079884,-0.035471,-0.018732,0.035309,0.015985,-0.021654,0.046002,-0.026812,0.013924,0.047348,0.006316,-0.248,0.020927,0.038945,0.058068,-0.024374,-0.005003,-0.016672,-0.044359,0.034124,0.030246,0.064262,-0.04409,0.045975,0.031943,0.053031,0.063347,0.056075,-0.047968,-0.009272,-0.053247,-0.020375,-0.047483,0.083978,0.002862,-0.049665,-0.037087,0.010989,-0.034878,0.00274,-0.0155,0.057044,-0.009945,0.103316,-0.035282,0.026906,0.018517,-0.013096,-0.027364,0.014652,0.036602,-0.044413,-0.080207,-0.135635,-0.05155,0.012726,-0.041504,-0.009433,-0.10003,0.000207,0.030812,-0.031027,-0.043928,0.026718,0.027108,-0.034151,0.027054,0.01752,-0.036656,-0.089795,-0.028576,-0.012012,0.013581,-0.016523,0.049746,-0.022812]'::vector,
    'middle_school',
    12,
    10,
    35,
    10,
    ARRAY['Lab apron','Safety goggles','Nitrile gloves'],
    TRUE,
    'Full length pants, closed shoes. Hair tied.',
    ST_SetSRID(ST_MakePoint(76.961, 11.008), 4326)::geography,
    'Race Course Road, Central Coimbatore',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for biotech-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 35, TRUE, TRUE
FROM industries WHERE readable_id = 'biotech-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 35, TRUE, TRUE
FROM industries WHERE readable_id = 'biotech-cbe-01';


-- Industry: gears-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'gears-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Singanallur Heavy Industrial Gearboxes & Metrology [Demo]',
    'manufacturing',
    'Manufacturer of custom helical, bevel, and planetary gearboxes engineered for cement mills, steel rolling plants, and thermal power stations.',
    'Gear hobbing and grinding machines with sub-micron accuracy, Klingelnberg gear metrology center, full load torque testing dynamometer.',
    'Machine design, gear kinematics, tribology and lubrication, precision metrology, vibration analysis.',
    '[-0.06131,0.040308,0.021566,0.021122,0.015032,-0.021136,0.012121,0.007758,-0.094976,-0.043186,0.009405,-0.059696,0.066526,0.002131,0.005213,-0.024618,0.011657,0.067656,0.053807,-0.006716,0.060987,-0.03251,-0.023677,0.020154,0.039851,0.005956,-0.012309,-0.01208,-0.011213,-0.134128,0.049666,-0.013297,-0.018675,-0.005479,-0.002474,-0.016161,-0.001904,0.001545,-0.001672,-0.031569,0.06814,-0.023583,-0.000429,0.028799,0.004907,0.013445,0.061901,-0.010487,-0.012679,-0.013533,0.036678,-0.038641,0.062923,0.003281,-0.027885,-0.061417,0.043535,0.005876,0.069431,0.000178,0.039798,-0.040631,-0.169301,0.069215,-0.052678,0.050581,-0.027307,-0.116704,-0.037135,0.030978,0.053323,-0.096697,0.006813,0.062439,0.022077,-0.009607,0.003687,-0.02447,-0.037404,0.019361,0.023394,-0.018796,-0.008195,-0.033962,-0.067978,0.008907,-0.023005,-0.000221,0.103151,0.00041,-0.011146,-0.027778,0.006692,-0.022561,0.000711,0.059051,-0.002321,0.024645,-0.031704,0.380981,-0.032725,-0.056738,0.049962,-0.010857,-0.014843,-0.01721,-0.07739,0.041949,0.033344,0.003489,0.062654,0.004037,-0.012692,-0.058513,-0.008538,-0.066419,-0.033962,-0.003065,0.027052,0.048053,-0.031246,0.053565,0.010138,-0.019643,0.065558,0.016013,-0.015986,0.060611,0.017465,-0.017183,0.014265,0.030009,-0.134344,0.009559,0.01245,-0.007328,0.01079,-0.005042,0.018716,0.020006,-0.041519,-0.037808,0.016968,-0.085027,-0.03528,0.068785,-0.060826,0.015126,-0.028477,-0.014588,-0.026218,0.022615,-0.032833,-0.039798,0.041734,0.013654,0.003778,0.024201,-0.00761,0.045929,0.021553,-0.005207,-0.025384,0.068678,-0.016954,-0.103796,-0.01569,0.00403,0.017237,-0.021821,-0.032268,0.002509,-0.048806,-0.003008,0.026137,-0.021741,-0.024309,0.019253,-0.075293,0.015852,0.060449,0.031677,0.063138,-0.036114,0.048886,0.003879,-0.009008,0.017721,-0.011287,0.002511,-0.007993,0.025035,0.051898,0.024389,0.038668,0.005808,-0.024551,0.060826,-0.010964,-0.061202,0.005405,0.053135,-0.002713,0.023179,0.000947,0.074916,0.038211,-0.005418,-0.03528,0.01204,-0.073518,0.009559,0.001402,0.012208,-0.014453,-0.029794,0.014642,0.036624,-0.078412,0.049854,-0.007213,0.018312,-0.068839,-0.348928,0.025909,0.036463,0.055044,0.096912,0.002892,0.022198,-0.02045,0.038561,-0.052544,0.053377,0.098042,-0.012423,-0.035388,-0.035146,0.02685,-0.030951,-0.039905,-0.048537,-0.028504,0.020181,0.070883,-0.069162,0.019186,0.013217,-0.032295,0.092395,-0.096159,0.027697,0.009371,-0.020477,0.008948,0.087501,0.010884,0.046789,-0.037539,-0.005563,0.00481,0.02603,0.071797,-0.069807,0.02611,-0.032188,-0.045202,0.041841,-0.072711,-0.012201,-0.069269,-0.014265,-0.037996,-0.031112,0.029606,0.049182,-0.007697,0.028557,-0.032483,-0.079541,-0.036114,-0.047246,-0.017694,0.031381,0.010407,0.022978,-0.036302,0.013996,-0.026984,0.014104,0.038964,0.029499,-0.011973,-0.03407,0.061471,-0.00365,-0.020867,0.050849,0.018151,0.046063,-0.029767,-0.00481,0.046574,0.026178,0.035791,0.002363,0.077982,0.044154,0.02923,-0.013371,-0.044476,0.024645,0.022937,0.006726,0.085134,-0.00882,-0.073464,0.011321,0.040282,-0.250617,0.002792,0.011993,0.051844,-0.023731,-0.061686,-0.076745,-0.042836,0.017425,-0.005909,0.002066,0.034957,-0.045794,-0.007274,0.017882,-0.004071,0.084543,-0.022158,0.040362,-0.033855,-0.047031,-0.016618,0.142841,0.017748,0.013196,-0.000563,0.001293,-0.01881,-0.038749,-0.03684,0.061579,-0.045821,0.091265,0.024739,-0.012228,0.055985,-0.022184,0.00726,0.001623,0.024121,0.015637,0.043966,-0.052678,-0.004729,0.074755,-0.008114,-0.01405,-0.118102,-0.007899,0.01768,0.013331,0.028369,-0.023394,0.006138,-0.014144,0.032026,0.053754,-0.01128,-0.004349,-0.03364,0.003499,-0.030036,-0.031354,0.015112,0.047139]'::vector,
    'undergraduate',
    16,
    15,
    45,
    15,
    ARRAY['Hard hat','Steel-toe shoes','Ear plugs'],
    FALSE,
    'Heavy duty cotton garments. No neckties, scarves, or loose wristbands.',
    ST_SetSRID(ST_MakePoint(77.012, 10.998), 4326)::geography,
    'Trichy Main Road, Singanallur',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for gears-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 45, TRUE, TRUE
FROM industries WHERE readable_id = 'gears-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 45, TRUE, TRUE
FROM industries WHERE readable_id = 'gears-cbe-01';


-- Industry: windenergy-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'windenergy-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Palladam Green Wind Power Substation & SCADA [Demo]',
    'renewable_energy',
    'Grid-connected 110kV wind energy evacuation substation integrating real-time SCADA telemetry for over 150 wind turbine generators in the Palghat Gap pass.',
    'Live SCADA grid synchronization displays, transformer yard inspection, wind turbine nacelle components display, power factor capacitor banks.',
    'Renewable energy, power systems, high-voltage substations, SCADA, grid stability and forecasting.',
    '[-0.005621,0.000359,-0.025825,-0.021628,0.068866,0.069885,-0.004405,-0.019214,-0.021601,0.030169,-0.01908,-0.045884,0.043551,0.035211,-0.027447,0.002119,-0.000285,0.029633,0.088388,0.018329,0.055779,-0.021574,-0.034218,0.003071,0.068383,0.042987,0.016264,-0.006439,-0.004931,-0.143738,-0.009855,-0.012778,0.009292,-0.016841,-0.021614,-0.035827,-0.001151,0.032556,-0.026106,0.007743,-0.024792,0.008548,0.075355,0.011491,-0.013174,-0.051757,0.068705,-0.092947,0.021561,-0.055565,0.021601,-6.8e-05,0.053714,0.040279,0.009513,-0.014267,0.041995,-0.003278,0.023907,-0.028265,-0.033655,0.06361,-0.17195,0.052159,0.026522,-0.051837,0.003421,-0.030196,0.03446,-0.040976,0.028694,-0.025704,-0.051649,-0.002625,0.000261,0.024283,-0.08206,-0.001581,-0.082918,-0.030142,0.059855,-0.040145,-0.023465,-0.013522,-0.000448,0.001434,0.05468,0.018034,0.062162,0.038,-0.001673,-0.044007,-0.002737,0.010807,-0.02498,0.001251,0.048378,0.031966,-0.008762,0.361706,0.018195,-0.017833,-0.022017,0.030303,-0.014387,-0.003563,-0.05653,0.022593,-0.040333,-0.003634,-0.022459,-0.06731,0.029633,-0.040681,0.002127,-0.051488,-0.033843,-0.025919,-0.048807,0.014696,-0.018933,0.047171,0.117136,-0.00415,0.075945,-0.008642,0.03513,0.02624,-0.00136,0.029525,-0.003164,0.016626,0.03993,-0.016412,0.020086,-0.029552,0.054867,-0.013797,-0.010003,0.012349,-0.013985,0.007328,0.107268,-0.075838,-0.058783,0.059855,-0.029901,0.0262,-0.091124,0.015634,-0.020086,0.063878,0.028372,-0.029659,0.057817,0.05417,0.033736,0.059587,0.071333,-0.005347,-0.03749,-0.005444,-0.065487,0.114347,0.054465,-0.167552,-0.001083,-0.039206,-0.0321,-0.020381,-0.067257,0.038134,0.020555,-0.064682,0.032877,-0.024189,-0.049155,-0.014977,0.026978,0.021574,-0.044731,0.009272,0.018343,0.025932,-0.008534,-0.002212,-0.040279,-0.033333,-0.039287,-0.027702,-0.076214,-0.041191,0.002172,0.071923,0.026267,-0.008132,-0.046179,-0.063985,0.076053,-0.008488,-0.037436,0.061142,0.00157,0.029364,-0.028211,0.062215,-0.035237,-0.04945,-0.048646,0.078734,0.024564,0.002487,0.076428,0.017123,-0.023894,0.047734,0.034862,0.020461,0.01971,0.061625,0.043631,0.025235,-0.03816,-0.321803,0.013945,-0.00836,-0.042451,-0.004971,-0.022942,0.002202,-0.037892,-0.033655,-0.046769,0.102548,-0.011223,-0.020528,-0.092786,0.086082,0.056637,0.036069,-0.048324,-0.012108,-0.008226,0.005373,0.086082,0.008461,0.005853,0.025758,-0.059855,0.084151,-0.093269,0.026978,-0.021588,0.008528,0.021159,0.024725,-0.045347,0.02388,-0.019456,-0.00775,0.058836,-0.003547,0.02856,-0.040359,0.038241,0.014146,-0.058622,0.048512,-0.103245,-0.04103,0.00718,-0.001555,-0.016278,-0.004096,-0.025677,0.048244,0.007247,0.055082,0.013006,-0.032797,-0.015366,-0.089729,-0.040788,0.028292,0.063181,-0.005437,0.018839,0.023746,0.059694,-0.028345,0.062752,0.002226,-0.006708,-0.004663,0.090587,0.060231,-0.025127,-0.010278,0.012765,0.024712,0.000366,0.009694,-0.009386,-0.027233,-0.012155,0.066238,0.056208,-0.020971,-0.007569,-0.019885,-0.004747,0.000559,0.027487,-0.002233,0.028158,0.003882,-0.023223,0.079485,0.002963,-0.264951,-0.044596,0.04052,0.010385,-0.025315,-0.034942,0.002239,-0.046098,-0.021266,0.005132,-0.028882,0.0119,0.016466,-0.003912,-0.088657,0.026173,0.013918,-0.077608,-0.015728,-0.025932,-0.014682,-0.005521,0.118423,0.008896,-0.009661,-0.031108,-0.005635,0.017659,0.031108,-0.008736,-0.00479,-0.057549,0.042129,0.017444,0.008984,0.088067,0.000867,0.053473,0.057013,-0.042719,-0.024323,0.036739,-0.002695,-0.010955,0.039019,-0.003976,-0.007562,-0.099544,0.029847,-0.01664,0.016573,0.004468,-0.006801,-0.05291,0.019255,-0.010358,0.008943,-0.0321,-0.040869,-0.034567,0.017096,0.007294,0.012061,-0.045321,0.066989]'::vector,
    'undergraduate',
    16,
    10,
    35,
    10,
    ARRAY['Safety helmet with chin strap','Safety shoes','High-visibility jacket'],
    TRUE,
    'Full trousers, sturdy boots. Windbreaker jacket recommended.',
    ST_SetSRID(ST_MakePoint(77.215, 10.985), 4326)::geography,
    'Wind Corridor, Palladam Road',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for windenergy-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 35, TRUE, TRUE
FROM industries WHERE readable_id = 'windenergy-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 35, TRUE, TRUE
FROM industries WHERE readable_id = 'windenergy-cbe-01';


-- Industry: aerospace-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'aerospace-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Aerodrome Ground Support Equipment & GSE Hydraulics [Demo]',
    'manufacturing',
    'Specialized aviation support manufacturer designing aircraft ground power units (GPU), jet engine air start units, and aircraft towbar systems.',
    'Aircraft 400Hz solid-state power converter test bay, heavy duty hydraulic lifting ram manufacturing, diesel-driven generator load test.',
    'Aerospace GSE, 400Hz electrical systems, heavy mobile hydraulics, aviation safety protocols.',
    '[0.003418,0.081078,0.014761,0.021513,0.029201,0.013905,-0.003934,0.0434,-0.023893,0.028532,-0.065675,-0.078992,0.038346,0.030431,-0.048481,0.01908,0.053268,-0.028506,0.000685,-0.019494,0.06129,0.025056,0.008029,-0.001319,-0.007414,-0.000139,-0.006979,0.008811,-0.000205,-0.159161,-0.034816,-0.025684,0.001283,0.044069,-0.00099,0.024401,0.012401,0.022877,-0.016339,-0.004529,0.012916,-0.011124,-0.016285,-0.04824,-0.006027,-0.013665,0.038533,-0.035458,0.011224,-0.038025,0.065301,-0.001935,-0.029548,0.008617,-0.023278,-0.049016,0.052546,-0.019039,0.032089,-0.023906,-0.011057,-0.081773,-0.158305,0.06498,0.031099,0.002021,0.000878,-0.041127,0.016873,-0.033319,-0.009065,-0.037838,0.00146,0.039068,0.032543,0.026326,-0.033132,0.024561,-0.027463,0.011111,0.058295,-0.035619,-0.03987,0.008831,-0.006953,-0.054498,0.037865,0.053161,0.111348,0.043133,-0.027757,-0.039443,0.029361,0.035726,-0.000885,-0.014026,-0.018157,-0.035218,-0.046101,0.368166,0.033105,0.003597,0.055086,0.007574,0.022636,0.037571,-0.041502,0.03019,-0.033105,0.020577,0.075676,0.048962,0.00968,-0.001262,-0.02392,-0.083805,-0.072146,0.003981,-0.051048,0.004419,-0.004643,0.023585,-0.014266,-0.025564,0.019013,-0.025176,-0.013277,0.058455,-0.023224,0.045299,-0.000434,-0.064392,-0.045192,-0.046716,0.018505,0.016379,0.099689,-0.012307,-0.02182,0.069205,-0.07359,0.002627,0.035512,-0.03733,-0.005211,0.061022,-0.072093,-0.036635,-0.007688,-0.00083,0.025323,0.056904,0.068296,-0.077869,0.027677,0.053856,0.042705,0.047438,0.00597,-0.003107,0.032757,0.037089,-0.022984,0.060434,0.073804,-0.107123,-0.036341,-0.000994,0.039763,0.002547,-0.053107,0.068831,-0.016593,-0.035726,0.000394,-0.034335,0.005913,0.02039,0.005806,0.019681,-0.011686,-0.005315,-0.034736,-0.003207,0.005853,-0.001386,-0.067173,-0.032624,0.013812,-0.035111,-0.044283,-0.026072,-0.057813,0.009486,0.064071,-0.012127,-0.068296,-0.03971,0.062948,0.004212,0.036046,0.014707,0.04562,0.02995,-0.076853,0.073804,0.044416,0.002741,-0.04562,0.060167,-0.03142,0.009092,0.042972,-0.049149,-0.069526,-0.030725,-0.049042,-0.002818,-0.095037,-0.004198,0.04693,0.00976,0.00071,-0.351694,-0.03717,0.002458,0.01813,0.044657,0.014199,-0.015924,-0.008136,-0.056744,-0.008791,0.103861,0.049363,-0.061236,-0.007253,-0.013825,0.032383,-0.048294,-0.085731,-0.018224,-0.00302,0.00176,0.057867,-0.010643,0.048775,0.025216,-0.034522,0.133918,-0.09509,0.042224,-0.047812,0.010242,-0.000201,0.017315,0.006886,0.067012,-0.014333,-0.00974,-0.027998,0.025644,0.006879,-0.067387,0.068242,0.008731,-0.04094,0.031447,-0.044898,-0.01563,-0.044817,-0.045941,-0.001351,0.002323,0.001325,0.013217,0.004145,0.010355,-0.048588,-0.084447,0.03233,-0.065408,-0.015002,-0.00593,0.039282,-0.020042,-0.015817,0.019574,-0.021098,-0.062252,0.038587,0.06022,0.023198,0.030992,0.061183,-0.012428,0.026447,0.075088,-0.073216,0.044176,-0.023318,-0.000961,-0.008811,0.012782,0.006959,0.034121,0.044015,0.013277,0.011244,-0.015697,-0.013451,0.023305,0.002928,-0.038453,0.042865,-0.043668,-0.013758,0.031581,0.018839,-0.245159,-0.000657,0.02634,-0.003307,-0.032971,-0.037009,0.008724,-0.016726,-0.030458,0.069686,-0.047144,-0.010041,-0.005285,0.055407,0.023104,0.023719,0.083538,-0.034282,-0.005843,-0.030698,-0.031821,0.001592,0.12996,0.040245,0.018197,-0.0288,0.009627,-0.020256,0.02047,0.026968,0.074714,-0.011686,0.11659,-0.059418,0.034683,0.089688,0.016927,0.058455,0.031046,-0.005188,-0.02396,0.053669,-0.019748,-0.03134,0.040031,-0.03027,0.012314,-0.141726,-0.025684,-0.028104,-0.034522,0.048534,-0.020791,-0.029174,0.012314,0.047705,0.024535,0.025016,-0.022877,-0.024013,-0.01452,0.022141,-0.026259,0.065622,0.029736]'::vector,
    'undergraduate',
    16,
    12,
    40,
    12,
    ARRAY['Steel-toe shoes','Reflective safety jacket','Ear protection'],
    FALSE,
    'Rugged workwear, fully laced boots.',
    ST_SetSRID(ST_MakePoint(77.042, 11.031), 4326)::geography,
    'Civil Aerodrome Post, SITRA',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for aerospace-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 40, TRUE, TRUE
FROM industries WHERE readable_id = 'aerospace-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 40, TRUE, TRUE
FROM industries WHERE readable_id = 'aerospace-cbe-01';


-- Industry: datacenter-cbe-01
INSERT INTO industries (
    readable_id, profile_id, name, sector, description, highlights, curriculum_topics,
    embedding, min_education_level, min_age, min_group_size, max_group_size,
    student_to_teacher_ratio, ppe_requirements, minors_allowed, dress_code,
    location, address, city, state, pincode, verification_status, is_active
) VALUES (
    'datacenter-cbe-01',
    '00000000-0000-0000-0000-000000000003',
    'Peelamedu Tech Park & Tier-3 Cloud Data Center [Demo]',
    'information_technology',
    'State-of-the-art enterprise cloud facility with N+1 redundant UPS systems, dual underground fiber backbones, and hot/cold containment server suites.',
    'Server hall cold-aisle containment walkthrough, dual modular diesel generator backup farm, precision HVAC chillers, NOC monitoring wall.',
    'Computer networks, cloud computing, data center architecture, HVAC thermal management, cyber security operations.',
    '[-0.02012,0.009688,0.002645,-0.00154,0.113117,-0.004851,0.013927,-0.024665,-0.056399,0.019602,0.055814,-0.025077,-0.001076,-0.035588,0.06618,0.051668,0.03907,0.006047,0.050685,0.026432,0.039788,-0.047974,-0.038671,0.002975,0.036678,0.010465,-0.009834,-0.025276,-0.046884,-0.101901,0.018778,-0.05523,0.040691,0.028279,-0.01202,0.000668,0.060864,-0.000847,-0.06432,0.000197,-0.079203,-0.012146,-0.012485,0.027216,-0.006857,-0.024452,-0.005824,-0.032399,0.023509,-0.07729,0.049064,-0.01814,-0.057569,-0.001252,0.033249,0.026419,0.070539,0.021289,0.006598,0.030512,0.047044,0.017289,-0.132785,0.039044,0.13151,-0.019748,-0.015296,-0.087974,0.074791,0.022273,0.003412,0.017356,-0.03115,0.042605,-0.002445,-0.002836,0.002937,0.04622,0.000993,-0.050897,0.005515,-0.001039,-0.043057,0.011694,-0.061981,-0.014379,-0.028306,-0.02194,-0.02622,0.001697,0.005615,0.020425,-0.022007,-0.022299,-0.059323,-0.028572,-0.046353,0.01299,0.027641,0.375924,-0.040027,-0.035004,-0.021954,0.065595,-0.014751,-0.02998,0.039416,-0.071283,-0.005967,0.004136,0.052652,0.017528,-0.009787,-0.027907,0.007329,-0.017555,0.02614,0.04505,-0.011854,0.026126,-0.019083,0.023163,0.05507,-0.025077,0.011967,0.00256,0.042153,0.073728,0.018326,0.029608,-0.003462,0.006997,-0.006983,-0.050738,0.052758,0.053502,0.045741,-0.030193,0.021954,0.051854,0.021183,0.031602,0.052572,-0.095044,-0.049196,0.049675,-0.017608,0.002767,-0.037343,0.009249,-0.003515,0.06028,0.060173,-0.050897,0.045343,-0.040877,0.009023,-0.00392,-0.005349,-0.00314,0.02715,0.001593,-0.012532,0.120347,0.009156,-0.223471,0.011096,0.042658,-0.017475,-0.009422,-0.05608,0.034047,-0.035216,-0.034897,0.009356,-0.004937,-0.038911,-0.018339,0.025276,0.055283,-0.04101,-0.051376,0.022658,-0.030645,0.070114,-0.031921,-0.0581,0.017555,0.023083,-0.009209,-0.130234,0.024146,-0.024399,0.028944,0.022445,0.006694,0.040505,0.023004,0.052705,-0.039575,-0.000617,0.004688,-0.017608,0.02711,-0.027123,0.039628,-0.003003,-0.016771,-0.048532,0.006083,0.017768,0.015548,0.033249,0.014645,-0.009874,0.047469,0.049675,-0.019057,-0.048931,0.009349,0.042127,0.046273,-0.088665,-0.317239,-0.007369,-0.043216,-0.029502,0.010758,-0.005206,0.024731,0.014751,0.011083,0.017994,0.084785,-0.019322,0.031602,-0.04909,-0.014844,0.010904,0.027402,-0.003997,-0.045449,-0.013754,0.041781,-0.018007,-0.026565,-0.014459,0.046911,-0.036067,0.10626,-0.100891,0.061396,0.007488,0.035562,0.016199,-0.044731,-0.068094,0.025675,-0.050366,0.025542,0.010206,-0.028359,-0.018844,-0.045794,0.074207,-0.058313,-0.1002,0.112267,-0.032505,-0.033834,0.03697,0.006588,-0.020332,-0.041675,-0.045157,-0.017714,0.05826,0.012199,0.019628,-0.032346,0.014445,-0.033808,-0.010851,-0.012797,0.004076,-0.034047,0.019788,0.037635,0.015695,0.008153,0.064851,0.059217,-0.060652,-0.023004,0.051084,-0.014671,-0.02117,0.040745,-0.061396,0.032319,-0.046618,-0.022273,0.032186,0.061502,-0.021236,0.068253,0.012572,-0.008259,0.065861,-0.019269,-0.060226,-0.008558,-0.03907,0.010226,-0.012678,0.012764,-0.070645,0.118539,0.007768,-0.269823,0.046432,0.038193,-0.053263,0.026897,-0.067828,-0.06028,0.009216,0.048399,0.013336,-0.009748,0.01806,0.01693,-0.00994,-0.009681,0.034127,0.074685,-0.06012,-0.021688,-0.000667,-0.008824,0.012292,0.099084,-0.017914,-0.022406,0.022499,-0.014764,0.070805,-0.02311,0.016585,0.005319,-0.038432,0.019349,-0.00994,-0.000103,0.055868,0.023389,0.06634,0.000261,0.023495,-0.007309,-0.014286,-0.033941,-0.049409,0.027509,-0.028837,0.025223,-0.068466,0.038539,0.000614,0.010299,-0.011236,0.020877,-0.020146,-0.054193,0.0943,0.001341,-0.039841,-0.048851,-0.071283,-0.012638,-0.020293,0.015801,0.018884,0.046299]'::vector,
    'high_school',
    14,
    10,
    35,
    12,
    ARRAY['Shoe booties','Antistatic wrist strap (server hall)'],
    TRUE,
    'Formal or college uniform. Warm sweater recommended for cold-aisle server rooms.',
    ST_SetSRID(ST_MakePoint(77.008, 11.026), 4326)::geography,
    'ELCOT IT Park, Peelamedu',
    'Coimbatore',
    'Tamil Nadu',
    '641001',
    'verified',
    TRUE
) ON CONFLICT (readable_id) DO UPDATE SET 
    embedding = EXCLUDED.embedding,
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- Recurring Visit Slots for datacenter-cbe-01
INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 2, '10:00:00', '13:00:00', 35, TRUE, TRUE
FROM industries WHERE readable_id = 'datacenter-cbe-01';

INSERT INTO visit_slots (industry_id, day_of_week, start_time, end_time, max_capacity, is_recurring, is_active)
SELECT id, 4, '14:00:00', '17:00:00', 35, TRUE, TRUE
FROM industries WHERE readable_id = 'datacenter-cbe-01';
