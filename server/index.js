import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// ─── ALL INDIAN CITIES DATA ───────────────────────────────────────────────────

const CITIES = {
  HYD: { id: 'HYD', name: 'Hyderabad', center: [17.3850, 78.4867], system: 'TSRTC' },
  BLR: { id: 'BLR', name: 'Bengaluru', center: [12.9716, 77.5946], system: 'BMTC' },
  CHN: { id: 'CHN', name: 'Chennai',   center: [13.0827, 80.2707], system: 'MTC' },
  MUM: { id: 'MUM', name: 'Mumbai',    center: [19.0760, 72.8777], system: 'BEST' },
  DEL: { id: 'DEL', name: 'Delhi',     center: [28.6139, 77.2090], system: 'DTC' },
  KOL: { id: 'KOL', name: 'Kolkata',   center: [22.5726, 88.3639], system: 'CSTC' },
  PUN: { id: 'PUN', name: 'Pune',      center: [18.5204, 73.8567], system: 'PMPML' },
  AHM: { id: 'AHM', name: 'Ahmedabad', center: [23.0225, 72.5714], system: 'AMTS' },
  JAI: { id: 'JAI', name: 'Jaipur',    center: [26.9124, 75.7873], system: 'JCT' },
  LKO: { id: 'LKO', name: 'Lucknow',   center: [26.8467, 80.9462], system: 'UPSRTC' },
};

const ROUTES = [
  // ── HYDERABAD (TSRTC) ────────────────────────────────────────────────────────
  {
    id: 'HYD_219D', cityId: 'HYD', name: 'Route 219D', color: '#3B82F6',
    description: 'Kukatpally → Ameerpet → Secunderabad',
    stops: [
      { id: 'H1_S1',  name: 'Kukatpally',       lat: 17.4947, lng: 78.3996, order: 1 },
      { id: 'H1_S2',  name: 'KPHB Colony',       lat: 17.4906, lng: 78.3846, order: 2 },
      { id: 'H1_S3',  name: 'JNTU',              lat: 17.4930, lng: 78.3912, order: 3 },
      { id: 'H1_S4',  name: 'Balanagar X Roads', lat: 17.4711, lng: 78.4111, order: 4 },
      { id: 'H1_S5',  name: 'Moosapet',          lat: 17.4578, lng: 78.4186, order: 5 },
      { id: 'H1_S6',  name: 'SR Nagar',          lat: 17.4519, lng: 78.4347, order: 6 },
      { id: 'H1_S7',  name: 'Erragadda',         lat: 17.4486, lng: 78.4361, order: 7 },
      { id: 'H1_S8',  name: 'Ameerpet',          lat: 17.4375, lng: 78.4483, order: 8 },
      { id: 'H1_S9',  name: 'Punjagutta',        lat: 17.4280, lng: 78.4486, order: 9 },
      { id: 'H1_S10', name: 'Begumpet',          lat: 17.4417, lng: 78.4689, order: 10 },
      { id: 'H1_S11', name: 'Paradise',          lat: 17.4436, lng: 78.4853, order: 11 },
      { id: 'H1_S12', name: 'Secunderabad',      lat: 17.4395, lng: 78.4992, order: 12 },
    ],
  },
  {
    id: 'HYD_10C', cityId: 'HYD', name: 'Route 10C', color: '#10B981',
    description: 'LB Nagar → Abids → Secunderabad',
    stops: [
      { id: 'H2_S1', name: 'LB Nagar',       lat: 17.3481, lng: 78.5523, order: 1 },
      { id: 'H2_S2', name: 'Dilsukhnagar',   lat: 17.3686, lng: 78.5265, order: 2 },
      { id: 'H2_S3', name: 'Koti',           lat: 17.3850, lng: 78.4858, order: 3 },
      { id: 'H2_S4', name: 'Abids',          lat: 17.3950, lng: 78.4736, order: 4 },
      { id: 'H2_S5', name: 'Nampally',       lat: 17.3955, lng: 78.4686, order: 5 },
      { id: 'H2_S6', name: 'Lakdikapul',     lat: 17.3858, lng: 78.4700, order: 6 },
      { id: 'H2_S7', name: 'Imlibun',        lat: 17.4008, lng: 78.4772, order: 7 },
      { id: 'H2_S8', name: 'Begumpet',       lat: 17.4417, lng: 78.4689, order: 8 },
      { id: 'H2_S9', name: 'Secunderabad',   lat: 17.4395, lng: 78.4992, order: 9 },
    ],
  },
  {
    id: 'HYD_8', cityId: 'HYD', name: 'Route 8', color: '#F59E0B',
    description: 'ECIL → Secunderabad → Mehdipatnam',
    stops: [
      { id: 'H3_S1', name: 'ECIL X Roads',   lat: 17.4726, lng: 78.5560, order: 1 },
      { id: 'H3_S2', name: 'Nacharam',       lat: 17.4272, lng: 78.5361, order: 2 },
      { id: 'H3_S3', name: 'Habsiguda',      lat: 17.4186, lng: 78.5444, order: 3 },
      { id: 'H3_S4', name: 'Tarnaka',        lat: 17.4286, lng: 78.5306, order: 4 },
      { id: 'H3_S5', name: 'Secunderabad',   lat: 17.4395, lng: 78.4992, order: 5 },
      { id: 'H3_S6', name: 'Nampally',       lat: 17.3955, lng: 78.4686, order: 6 },
      { id: 'H3_S7', name: 'Lakdikapul',     lat: 17.3858, lng: 78.4700, order: 7 },
      { id: 'H3_S8', name: 'Mehdipatnam',    lat: 17.3922, lng: 78.4306, order: 8 },
    ],
  },
  {
    id: 'HYD_5K', cityId: 'HYD', name: 'Route 5K', color: '#8B5CF6',
    description: 'Miyapur → Hitech City → Jubilee Hills → Hitec City',
    stops: [
      { id: 'H4_S1', name: 'Miyapur',         lat: 17.4972, lng: 78.3664, order: 1 },
      { id: 'H4_S2', name: 'Chandanagar',      lat: 17.4928, lng: 78.3808, order: 2 },
      { id: 'H4_S3', name: 'Hitech City',      lat: 17.4473, lng: 78.3762, order: 3 },
      { id: 'H4_S4', name: 'Madhapur',         lat: 17.4486, lng: 78.3908, order: 4 },
      { id: 'H4_S5', name: 'Peddamma Temple',  lat: 17.4350, lng: 78.4017, order: 5 },
      { id: 'H4_S6', name: 'Jubilee Hills',    lat: 17.4325, lng: 78.4108, order: 6 },
      { id: 'H4_S7', name: 'Road No.36',       lat: 17.4244, lng: 78.4278, order: 7 },
      { id: 'H4_S8', name: 'Banjara Hills',    lat: 17.4156, lng: 78.4392, order: 8 },
      { id: 'H4_S9', name: 'Panjagutta',       lat: 17.4280, lng: 78.4486, order: 9 },
    ],
  },
  {
    id: 'HYD_216', cityId: 'HYD', name: 'Route 216', color: '#EF4444',
    description: 'Uppal → Ghatkesar → Medchal',
    stops: [
      { id: 'H5_S1', name: 'Uppal',           lat: 17.4042, lng: 78.5592, order: 1 },
      { id: 'H5_S2', name: 'Nagole',          lat: 17.3927, lng: 78.5561, order: 2 },
      { id: 'H5_S3', name: 'Ghatkesar',       lat: 17.4464, lng: 78.6936, order: 3 },
      { id: 'H5_S4', name: 'Keesara',         lat: 17.5089, lng: 78.6678, order: 4 },
      { id: 'H5_S5', name: 'Medchal',         lat: 17.6292, lng: 78.4822, order: 5 },
    ],
  },

  // ── BENGALURU (BMTC) ─────────────────────────────────────────────────────────
  {
    id: 'BLR_500C', cityId: 'BLR', name: 'Route 500C', color: '#EC4899',
    description: 'Kempegowda → Koramangala → Electronic City',
    stops: [
      { id: 'B1_S1', name: 'Kempegowda Bus Stand', lat: 12.9766, lng: 77.5713, order: 1 },
      { id: 'B1_S2', name: 'Shivajinagar',          lat: 12.9850, lng: 77.6003, order: 2 },
      { id: 'B1_S3', name: 'Trinity Circle',        lat: 12.9716, lng: 77.6233, order: 3 },
      { id: 'B1_S4', name: 'Domlur',                lat: 12.9608, lng: 77.6397, order: 4 },
      { id: 'B1_S5', name: 'Koramangala',           lat: 12.9347, lng: 77.6280, order: 5 },
      { id: 'B1_S6', name: 'Silk Board',            lat: 12.9175, lng: 77.6233, order: 6 },
      { id: 'B1_S7', name: 'BTM Layout',            lat: 12.9166, lng: 77.6101, order: 7 },
      { id: 'B1_S8', name: 'Madivala',              lat: 12.9241, lng: 77.6175, order: 8 },
      { id: 'B1_S9', name: 'Electronic City',       lat: 12.8399, lng: 77.6770, order: 9 },
    ],
  },
  {
    id: 'BLR_201R', cityId: 'BLR', name: 'Route 201R', color: '#06B6D4',
    description: 'Whitefield → Marathahalli → Indiranagar',
    stops: [
      { id: 'B2_S1', name: 'Whitefield',       lat: 12.9698, lng: 77.7499, order: 1 },
      { id: 'B2_S2', name: 'Hoodi',            lat: 12.9716, lng: 77.7269, order: 2 },
      { id: 'B2_S3', name: 'Marathahalli',     lat: 12.9591, lng: 77.6974, order: 3 },
      { id: 'B2_S4', name: 'Bellandur',        lat: 12.9259, lng: 77.6762, order: 4 },
      { id: 'B2_S5', name: 'HSR Layout',       lat: 12.9108, lng: 77.6472, order: 5 },
      { id: 'B2_S6', name: 'Agara',            lat: 12.9214, lng: 77.6367, order: 6 },
      { id: 'B2_S7', name: 'Indiranagar',      lat: 12.9784, lng: 77.6408, order: 7 },
    ],
  },
  {
    id: 'BLR_335E', cityId: 'BLR', name: 'Route 335E', color: '#84CC16',
    description: 'Yelahanka → Hebbal → Manyata Tech Park',
    stops: [
      { id: 'B3_S1', name: 'Yelahanka',        lat: 13.1007, lng: 77.5963, order: 1 },
      { id: 'B3_S2', name: 'Kogilu',           lat: 13.0711, lng: 77.5875, order: 2 },
      { id: 'B3_S3', name: 'Hebbal',           lat: 13.0358, lng: 77.5970, order: 3 },
      { id: 'B3_S4', name: 'Manyata Tech Park',lat: 13.0475, lng: 77.6209, order: 4 },
      { id: 'B3_S5', name: 'Nagawara',         lat: 13.0489, lng: 77.6414, order: 5 },
      { id: 'B3_S6', name: 'Kalyan Nagar',     lat: 13.0278, lng: 77.6481, order: 6 },
      { id: 'B3_S7', name: 'HRBR Layout',      lat: 13.0197, lng: 77.6458, order: 7 },
    ],
  },
  {
    id: 'BLR_273', cityId: 'BLR', name: 'Route 273', color: '#F97316',
    description: 'Jayanagar → Banashankari → Kanakapura Road',
    stops: [
      { id: 'B4_S1', name: 'Jayanagar 4th Block',lat: 12.9252, lng: 77.5800, order: 1 },
      { id: 'B4_S2', name: 'Banashankari',       lat: 12.9263, lng: 77.5472, order: 2 },
      { id: 'B4_S3', name: 'JP Nagar',           lat: 12.9063, lng: 77.5850, order: 3 },
      { id: 'B4_S4', name: 'Kumaraswamy Layout', lat: 12.8977, lng: 77.5711, order: 4 },
      { id: 'B4_S5', name: 'Kanakapura Road',    lat: 12.8733, lng: 77.5644, order: 5 },
      { id: 'B4_S6', name: 'Uttarahalli',        lat: 12.8825, lng: 77.5375, order: 6 },
    ],
  },

  // ── CHENNAI (MTC) ─────────────────────────────────────────────────────────────
  {
    id: 'CHN_70A', cityId: 'CHN', name: 'Route 70A', color: '#3B82F6',
    description: 'Chennai Central → Guindy → Tambaram',
    stops: [
      { id: 'C1_S1', name: 'Chennai Central',  lat: 13.0839, lng: 80.2758, order: 1 },
      { id: 'C1_S2', name: 'Egmore',           lat: 13.0786, lng: 80.2627, order: 2 },
      { id: 'C1_S3', name: 'Nungambakkam',     lat: 13.0569, lng: 80.2425, order: 3 },
      { id: 'C1_S4', name: 'T. Nagar',         lat: 13.0400, lng: 80.2339, order: 4 },
      { id: 'C1_S5', name: 'Guindy',           lat: 13.0069, lng: 80.2206, order: 5 },
      { id: 'C1_S6', name: 'St. Thomas Mount', lat: 12.9897, lng: 80.1994, order: 6 },
      { id: 'C1_S7', name: 'Pallavaram',       lat: 12.9675, lng: 80.1508, order: 7 },
      { id: 'C1_S8', name: 'Tambaram',         lat: 12.9249, lng: 80.1000, order: 8 },
    ],
  },
  {
    id: 'CHN_23C', cityId: 'CHN', name: 'Route 23C', color: '#10B981',
    description: 'Anna Nagar → Adyar → Besant Nagar',
    stops: [
      { id: 'C2_S1', name: 'Anna Nagar',       lat: 13.0891, lng: 80.2100, order: 1 },
      { id: 'C2_S2', name: 'Koyambedu',        lat: 13.0700, lng: 80.1947, order: 2 },
      { id: 'C2_S3', name: 'Vadapalani',       lat: 13.0525, lng: 80.2125, order: 3 },
      { id: 'C2_S4', name: 'Ashok Nagar',      lat: 13.0331, lng: 80.2208, order: 4 },
      { id: 'C2_S5', name: 'Adyar',            lat: 13.0067, lng: 80.2567, order: 5 },
      { id: 'C2_S6', name: 'Besant Nagar',     lat: 12.9997, lng: 80.2706, order: 6 },
    ],
  },
  {
    id: 'CHN_15B', cityId: 'CHN', name: 'Route 15B', color: '#F59E0B',
    description: 'Porur → Vadapalani → Perambur',
    stops: [
      { id: 'C3_S1', name: 'Porur',            lat: 13.0339, lng: 80.1572, order: 1 },
      { id: 'C3_S2', name: 'Virugambakkam',    lat: 13.0506, lng: 80.1908, order: 2 },
      { id: 'C3_S3', name: 'Vadapalani',       lat: 13.0525, lng: 80.2125, order: 3 },
      { id: 'C3_S4', name: 'Arumbakkam',       lat: 13.0650, lng: 80.2200, order: 4 },
      { id: 'C3_S5', name: 'Villivakkam',      lat: 13.0920, lng: 80.2231, order: 5 },
      { id: 'C3_S6', name: 'Perambur',         lat: 13.1147, lng: 80.2481, order: 6 },
    ],
  },

  // ── MUMBAI (BEST) ─────────────────────────────────────────────────────────────
  {
    id: 'MUM_9LTD', cityId: 'MUM', name: 'Route 9 Ltd', color: '#EF4444',
    description: 'CSMT → Andheri → Borivali',
    stops: [
      { id: 'M1_S1', name: 'CSMT',             lat: 18.9398, lng: 72.8355, order: 1 },
      { id: 'M1_S2', name: 'Dadar',            lat: 19.0178, lng: 72.8478, order: 2 },
      { id: 'M1_S3', name: 'Mahim',            lat: 19.0386, lng: 72.8403, order: 3 },
      { id: 'M1_S4', name: 'Bandra',           lat: 19.0596, lng: 72.8295, order: 4 },
      { id: 'M1_S5', name: 'Vile Parle',       lat: 19.0961, lng: 72.8494, order: 5 },
      { id: 'M1_S6', name: 'Andheri',          lat: 19.1197, lng: 72.8468, order: 6 },
      { id: 'M1_S7', name: 'Jogeshwari',       lat: 19.1411, lng: 72.8497, order: 7 },
      { id: 'M1_S8', name: 'Goregaon',         lat: 19.1663, lng: 72.8526, order: 8 },
      { id: 'M1_S9', name: 'Malad',            lat: 19.1864, lng: 72.8483, order: 9 },
      { id: 'M1_S10',name: 'Borivali',         lat: 19.2294, lng: 72.8567, order: 10 },
    ],
  },
  {
    id: 'MUM_332', cityId: 'MUM', name: 'Route 332', color: '#8B5CF6',
    description: 'Kurla → Ghatkopar → Thane',
    stops: [
      { id: 'M2_S1', name: 'Kurla',            lat: 19.0728, lng: 72.8792, order: 1 },
      { id: 'M2_S2', name: 'Ghatkopar',        lat: 19.0858, lng: 72.9081, order: 2 },
      { id: 'M2_S3', name: 'Vikhroli',         lat: 19.1089, lng: 72.9225, order: 3 },
      { id: 'M2_S4', name: 'Kanjurmarg',       lat: 19.1261, lng: 72.9333, order: 4 },
      { id: 'M2_S5', name: 'Bhandup',          lat: 19.1447, lng: 72.9433, order: 5 },
      { id: 'M2_S6', name: 'Mulund',           lat: 19.1753, lng: 72.9584, order: 6 },
      { id: 'M2_S7', name: 'Thane',            lat: 19.2183, lng: 72.9781, order: 7 },
    ],
  },
  {
    id: 'MUM_103', cityId: 'MUM', name: 'Route 103', color: '#06B6D4',
    description: 'Colaba → Worli → Haji Ali',
    stops: [
      { id: 'M3_S1', name: 'Colaba',           lat: 18.9067, lng: 72.8147, order: 1 },
      { id: 'M3_S2', name: 'Churchgate',       lat: 18.9356, lng: 72.8258, order: 2 },
      { id: 'M3_S3', name: 'Marine Lines',     lat: 18.9414, lng: 72.8236, order: 3 },
      { id: 'M3_S4', name: 'Charni Road',      lat: 18.9514, lng: 72.8194, order: 4 },
      { id: 'M3_S5', name: 'Worli',            lat: 19.0178, lng: 72.8164, order: 5 },
      { id: 'M3_S6', name: 'Haji Ali',         lat: 18.9822, lng: 72.8089, order: 6 },
    ],
  },

  // ── DELHI (DTC) ───────────────────────────────────────────────────────────────
  {
    id: 'DEL_615', cityId: 'DEL', name: 'Route 615', color: '#84CC16',
    description: 'ISBT Kashmere Gate → Connaught Place → AIIMS',
    stops: [
      { id: 'D1_S1', name: 'ISBT Kashmere Gate', lat: 28.6675, lng: 77.2281, order: 1 },
      { id: 'D1_S2', name: 'Delhi University',   lat: 28.6881, lng: 77.2101, order: 2 },
      { id: 'D1_S3', name: 'Civil Lines',        lat: 28.6797, lng: 77.2225, order: 3 },
      { id: 'D1_S4', name: 'Connaught Place',    lat: 28.6328, lng: 77.2197, order: 4 },
      { id: 'D1_S5', name: 'Mandi House',        lat: 28.6267, lng: 77.2381, order: 5 },
      { id: 'D1_S6', name: 'ITO',               lat: 28.6281, lng: 77.2478, order: 6 },
      { id: 'D1_S7', name: 'Pragati Maidan',    lat: 28.6194, lng: 77.2425, order: 7 },
      { id: 'D1_S8', name: 'AIIMS',             lat: 28.5685, lng: 77.2100, order: 8 },
    ],
  },
  {
    id: 'DEL_429', cityId: 'DEL', name: 'Route 429', color: '#F97316',
    description: 'Rohini → Pitampura → Janakpuri',
    stops: [
      { id: 'D2_S1', name: 'Rohini Sector 16',  lat: 28.7497, lng: 77.0675, order: 1 },
      { id: 'D2_S2', name: 'Pitampura',         lat: 28.7006, lng: 77.1325, order: 2 },
      { id: 'D2_S3', name: 'Shalimar Bagh',     lat: 28.7178, lng: 77.1589, order: 3 },
      { id: 'D2_S4', name: 'Ashok Vihar',       lat: 28.6992, lng: 77.1739, order: 4 },
      { id: 'D2_S5', name: 'Rajouri Garden',    lat: 28.6492, lng: 77.1183, order: 5 },
      { id: 'D2_S6', name: 'Janakpuri',         lat: 28.6278, lng: 77.0836, order: 6 },
    ],
  },
  {
    id: 'DEL_521', cityId: 'DEL', name: 'Route 521', color: '#EC4899',
    description: 'Saket → Hauz Khas → Dwarka',
    stops: [
      { id: 'D3_S1', name: 'Saket',             lat: 28.5245, lng: 77.2167, order: 1 },
      { id: 'D3_S2', name: 'Hauz Khas',         lat: 28.5433, lng: 77.2061, order: 2 },
      { id: 'D3_S3', name: 'Green Park',        lat: 28.5578, lng: 77.2028, order: 3 },
      { id: 'D3_S4', name: 'IIT Delhi',         lat: 28.5458, lng: 77.1926, order: 4 },
      { id: 'D3_S5', name: 'Palam',             lat: 28.5906, lng: 77.0869, order: 5 },
      { id: 'D3_S6', name: 'Dwarka Sector 10',  lat: 28.5733, lng: 77.0469, order: 6 },
      { id: 'D3_S7', name: 'Dwarka Sector 21',  lat: 28.5528, lng: 77.0594, order: 7 },
    ],
  },

  // ── KOLKATA (CSTC) ────────────────────────────────────────────────────────────
  {
    id: 'KOL_S9', cityId: 'KOL', name: 'Route S9', color: '#3B82F6',
    description: 'Howrah → Esplanade → Salt Lake',
    stops: [
      { id: 'K1_S1', name: 'Howrah Station',   lat: 22.5839, lng: 88.3425, order: 1 },
      { id: 'K1_S2', name: 'Howrah Bridge',    lat: 22.5850, lng: 88.3469, order: 2 },
      { id: 'K1_S3', name: 'Esplanade',        lat: 22.5697, lng: 88.3504, order: 3 },
      { id: 'K1_S4', name: 'Park Street',      lat: 22.5536, lng: 88.3531, order: 4 },
      { id: 'K1_S5', name: 'Ballygunge',       lat: 22.5264, lng: 88.3625, order: 5 },
      { id: 'K1_S6', name: 'Dhakuria',         lat: 22.5083, lng: 88.3689, order: 6 },
      { id: 'K1_S7', name: 'Salt Lake Sector V',lat: 22.5769, lng: 88.4342, order: 7 },
    ],
  },
  {
    id: 'KOL_C14', cityId: 'KOL', name: 'Route C14', color: '#10B981',
    description: 'Dum Dum → Shyambazar → Gariahat',
    stops: [
      { id: 'K2_S1', name: 'Dum Dum',          lat: 22.6547, lng: 88.3967, order: 1 },
      { id: 'K2_S2', name: 'Belgachia',        lat: 22.6119, lng: 88.3736, order: 2 },
      { id: 'K2_S3', name: 'Shyambazar',       lat: 22.5992, lng: 88.3742, order: 3 },
      { id: 'K2_S4', name: 'Shyambazar 5-pt',  lat: 22.5925, lng: 88.3742, order: 4 },
      { id: 'K2_S5', name: 'Hedua',            lat: 22.5803, lng: 88.3681, order: 5 },
      { id: 'K2_S6', name: 'Gariahat',         lat: 22.5211, lng: 88.3669, order: 6 },
    ],
  },

  // ── PUNE (PMPML) ─────────────────────────────────────────────────────────────
  {
    id: 'PUN_151', cityId: 'PUN', name: 'Route 151', color: '#8B5CF6',
    description: 'Shivajinagar → Hinjewadi IT Park',
    stops: [
      { id: 'P1_S1', name: 'Shivajinagar',     lat: 18.5308, lng: 73.8475, order: 1 },
      { id: 'P1_S2', name: 'Paud Road',        lat: 18.5261, lng: 73.8200, order: 2 },
      { id: 'P1_S3', name: 'Kothrud',          lat: 18.5089, lng: 73.8128, order: 3 },
      { id: 'P1_S4', name: 'Warje',            lat: 18.4864, lng: 73.7958, order: 4 },
      { id: 'P1_S5', name: 'Hinjewadi Phase 1',lat: 18.5889, lng: 73.7375, order: 5 },
      { id: 'P1_S6', name: 'Hinjewadi Phase 2',lat: 18.5928, lng: 73.7217, order: 6 },
      { id: 'P1_S7', name: 'Hinjewadi Phase 3',lat: 18.5989, lng: 73.7108, order: 7 },
    ],
  },
  {
    id: 'PUN_4', cityId: 'PUN', name: 'Route 4', color: '#F59E0B',
    description: 'Swargate → Hadapsar → Magarpatta',
    stops: [
      { id: 'P2_S1', name: 'Swargate',         lat: 18.5018, lng: 73.8608, order: 1 },
      { id: 'P2_S2', name: 'Market Yard',      lat: 18.4972, lng: 73.8625, order: 2 },
      { id: 'P2_S3', name: 'Fatima Nagar',     lat: 18.5022, lng: 73.8869, order: 3 },
      { id: 'P2_S4', name: 'Hadapsar',         lat: 18.5019, lng: 73.9260, order: 4 },
      { id: 'P2_S5', name: 'Magarpatta City',  lat: 18.5167, lng: 73.9283, order: 5 },
      { id: 'P2_S6', name: 'Kharadi',          lat: 18.5512, lng: 73.9479, order: 6 },
    ],
  },
  {
    id: 'PUN_16', cityId: 'PUN', name: 'Route 16', color: '#EF4444',
    description: 'Pune Station → Wakad → Dehu Road',
    stops: [
      { id: 'P3_S1', name: 'Pune Station',     lat: 18.5287, lng: 73.8744, order: 1 },
      { id: 'P3_S2', name: 'Deccan',           lat: 18.5192, lng: 73.8458, order: 2 },
      { id: 'P3_S3', name: 'Aundh',            lat: 18.5578, lng: 73.8084, order: 3 },
      { id: 'P3_S4', name: 'Baner',            lat: 18.5590, lng: 73.7875, order: 4 },
      { id: 'P3_S5', name: 'Wakad',            lat: 18.5975, lng: 73.7614, order: 5 },
      { id: 'P3_S6', name: 'Dehu Road',        lat: 18.6922, lng: 73.7608, order: 6 },
    ],
  },

  // ── AHMEDABAD (AMTS/BRTS) ─────────────────────────────────────────────────────
  {
    id: 'AHM_BRTS1', cityId: 'AHM', name: 'BRTS Route 1', color: '#06B6D4',
    description: 'Naroda → Vastral → Maninagar',
    stops: [
      { id: 'A1_S1', name: 'Naroda GIDC',      lat: 23.0781, lng: 72.6528, order: 1 },
      { id: 'A1_S2', name: 'Naroda Patiya',    lat: 23.0675, lng: 72.6411, order: 2 },
      { id: 'A1_S3', name: 'Vastral',          lat: 23.0494, lng: 72.6392, order: 3 },
      { id: 'A1_S4', name: 'CTM Cross Roads',  lat: 23.0444, lng: 72.6047, order: 4 },
      { id: 'A1_S5', name: 'Isanpur',          lat: 22.9975, lng: 72.6111, order: 5 },
      { id: 'A1_S6', name: 'Maninagar',        lat: 22.9972, lng: 72.6050, order: 6 },
    ],
  },
  {
    id: 'AHM_BRTS2', cityId: 'AHM', name: 'BRTS Route 2', color: '#84CC16',
    description: 'Bopal → Ambawadi → Kalupur',
    stops: [
      { id: 'A2_S1', name: 'Bopal',            lat: 23.0375, lng: 72.4681, order: 1 },
      { id: 'A2_S2', name: 'South Bopal',      lat: 23.0300, lng: 72.4825, order: 2 },
      { id: 'A2_S3', name: 'Satellite',        lat: 23.0356, lng: 72.5050, order: 3 },
      { id: 'A2_S4', name: 'Shivranjani',      lat: 23.0258, lng: 72.5236, order: 4 },
      { id: 'A2_S5', name: 'Ambawadi',         lat: 23.0295, lng: 72.5586, order: 5 },
      { id: 'A2_S6', name: 'Nehru Nagar',      lat: 23.0428, lng: 72.5764, order: 6 },
      { id: 'A2_S7', name: 'Kalupur',          lat: 23.0297, lng: 72.5869, order: 7 },
    ],
  },

  // ── JAIPUR (JCT) ──────────────────────────────────────────────────────────────
  {
    id: 'JAI_5', cityId: 'JAI', name: 'Route 5', color: '#EC4899',
    description: 'Sindhi Camp → MI Road → Malviya Nagar',
    stops: [
      { id: 'J1_S1', name: 'Sindhi Camp',      lat: 26.9239, lng: 75.8064, order: 1 },
      { id: 'J1_S2', name: 'MI Road',          lat: 26.9197, lng: 75.7997, order: 2 },
      { id: 'J1_S3', name: 'Sansar Chandra Rd',lat: 26.9114, lng: 75.7942, order: 3 },
      { id: 'J1_S4', name: 'Tonk Road',        lat: 26.8969, lng: 75.7986, order: 4 },
      { id: 'J1_S5', name: 'Malviya Nagar',    lat: 26.8642, lng: 75.8125, order: 5 },
      { id: 'J1_S6', name: 'Sanganer',         lat: 26.8186, lng: 75.7981, order: 6 },
    ],
  },
  {
    id: 'JAI_12', cityId: 'JAI', name: 'Route 12', color: '#F97316',
    description: 'Amber Fort → Hawa Mahal → Bani Park',
    stops: [
      { id: 'J2_S1', name: 'Amber Fort',       lat: 26.9855, lng: 75.8513, order: 1 },
      { id: 'J2_S2', name: 'Jal Mahal',        lat: 26.9528, lng: 75.8486, order: 2 },
      { id: 'J2_S3', name: 'Hawa Mahal',       lat: 26.9239, lng: 75.8267, order: 3 },
      { id: 'J2_S4', name: 'Johri Bazaar',     lat: 26.9217, lng: 75.8228, order: 4 },
      { id: 'J2_S5', name: 'Ajmer Road',       lat: 26.9194, lng: 75.7786, order: 5 },
      { id: 'J2_S6', name: 'Bani Park',        lat: 26.9336, lng: 75.7906, order: 6 },
    ],
  },

  // ── LUCKNOW (UPSRTC) ─────────────────────────────────────────────────────────
  {
    id: 'LKO_3', cityId: 'LKO', name: 'Route 3', color: '#3B82F6',
    description: 'Alambagh → Hazratganj → Gomti Nagar',
    stops: [
      { id: 'L1_S1', name: 'Alambagh Bus Stand', lat: 26.8044, lng: 80.9139, order: 1 },
      { id: 'L1_S2', name: 'Charbagh',           lat: 26.8289, lng: 80.9183, order: 2 },
      { id: 'L1_S3', name: 'Aminabad',           lat: 26.8528, lng: 80.9211, order: 3 },
      { id: 'L1_S4', name: 'Hazratganj',         lat: 26.8543, lng: 80.9378, order: 4 },
      { id: 'L1_S5', name: 'Lekhraj Market',     lat: 26.8622, lng: 80.9650, order: 5 },
      { id: 'L1_S6', name: 'Gomti Nagar',        lat: 26.8631, lng: 80.9939, order: 6 },
      { id: 'L1_S7', name: 'Vibhuti Khand',      lat: 26.8539, lng: 81.0031, order: 7 },
    ],
  },
  {
    id: 'LKO_7', cityId: 'LKO', name: 'Route 7', color: '#10B981',
    description: 'IIIT Lucknow → Amausi Airport → Chinhat',
    stops: [
      { id: 'L2_S1', name: 'Mohanlalganj',     lat: 26.7289, lng: 80.8853, order: 1 },
      { id: 'L2_S2', name: 'Kakori',           lat: 26.8358, lng: 80.8472, order: 2 },
      { id: 'L2_S3', name: 'Amausi Airport',   lat: 26.7606, lng: 80.8893, order: 3 },
      { id: 'L2_S4', name: 'IT City',          lat: 26.8408, lng: 80.9208, order: 4 },
      { id: 'L2_S5', name: 'Chinhat',          lat: 26.8700, lng: 81.0233, order: 5 },
    ],
  },
];

// ─── In-Memory State ─────────────────────────────────────────────────────────
const crowdCounts = {};
const stopQueues = {};

function initCrowd() {
  ROUTES.forEach(route => {
    route.stops.forEach(stop => {
      if (crowdCounts[stop.id] === undefined) {
        crowdCounts[stop.id] = Math.floor(Math.random() * 28);
        stopQueues[stop.id] = [];
      }
    });
  });
}
initCrowd();

// Active buses — 3 per city
const buses = [];
let busNum = 10;
const CITY_IDS = Object.keys(CITIES);

CITY_IDS.forEach(cityId => {
  const cityRoutes = ROUTES.filter(r => r.cityId === cityId);
  cityRoutes.slice(0, 3).forEach((route, i) => {
    const num = String(busNum++).padStart(2, '0');
    buses.push({
      id: `BUS_${cityId}_${i}`,
      number: `#${num}`,
      routeId: route.id,
      cityId,
      currentStopIdx: Math.floor(Math.random() * Math.max(1, route.stops.length - 2)),
      speed: 30 + Math.floor(Math.random() * 20),
      driver: ['A. Kumar', 'S. Patel', 'R. Singh', 'M. Reddy', 'P. Sharma', 'V. Rao', 'D. Gupta', 'N. Iyer'][Math.floor(Math.random() * 8)],
      capacity: 60,
    });
  });
});

// Simulate bus movement
setInterval(() => {
  buses.forEach(bus => {
    const route = ROUTES.find(r => r.id === bus.routeId);
    if (route) {
      if (Math.random() < 0.25) {
        bus.currentStopIdx = bus.currentStopIdx < route.stops.length - 1
          ? bus.currentStopIdx + 1 : 0;
      }
    }
  });
}, 30000);

// Simulate crowd fluctuation
setInterval(() => {
  ROUTES.forEach(route => {
    route.stops.forEach(stop => {
      const delta = Math.floor(Math.random() * 7) - 3;
      crowdCounts[stop.id] = Math.max(0, (crowdCounts[stop.id] || 0) + delta);
    });
  });
}, 20000);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestStop(lat, lng, cityId = null) {
  let best = null, bestDist = Infinity;
  ROUTES.forEach(route => {
    if (cityId && route.cityId !== cityId) return;
    route.stops.forEach(stop => {
      const d = haversineKm(lat, lng, stop.lat, stop.lng);
      if (d < bestDist) { bestDist = d; best = { stop, route, distKm: d }; }
    });
  });
  return best;
}

function co2Comparison(distanceKm) {
  return {
    bus:  +(distanceKm * 0.089).toFixed(3),
    car:  +(distanceKm * 0.21).toFixed(3),
    auto: +(distanceKm * 0.12).toFixed(3),
    walk: 0,
    savedVsCar:  +((0.21 - 0.089) * distanceKm).toFixed(3),
    savedVsAuto: +((0.12 - 0.089) * distanceKm).toFixed(3),
    distanceKm: +distanceKm.toFixed(2),
  };
}

function routeDistanceKm(stops) {
  let t = 0;
  for (let i = 0; i < stops.length - 1; i++)
    t += haversineKm(stops[i].lat, stops[i].lng, stops[i+1].lat, stops[i+1].lng);
  return +t.toFixed(2);
}

function crowdLevel(count) {
  return count <= 5 ? 'low' : count <= 15 ? 'medium' : 'high';
}

function enrichStop(stop) {
  return { ...stop, passengerCount: crowdCounts[stop.id] || 0, crowdLevel: crowdLevel(crowdCounts[stop.id] || 0) };
}

function enrichRoute(route) {
  const stops = route.stops.map(enrichStop);
  return { ...route, stops, totalDistanceKm: routeDistanceKm(stops) };
}

function enrichBus(bus) {
  const route = ROUTES.find(r => r.id === bus.routeId);
  const city = CITIES[bus.cityId];
  const currentStop = route?.stops[bus.currentStopIdx];
  const nextStop = route?.stops[bus.currentStopIdx + 1];
  return {
    ...bus,
    currentStop,
    nextStop,
    lat: currentStop?.lat,
    lng: currentStop?.lng,
    passengerCount: crowdCounts[currentStop?.id] || 0,
    occupancyPct: Math.round(((crowdCounts[currentStop?.id] || 0) / bus.capacity) * 100),
    status: Math.random() > 0.2 ? 'on-time' : 'delayed',
    route: route ? { id: route.id, name: route.name, color: route.color } : null,
    cityName: city?.name,
    system: city?.system,
  };
}

// ─── API Routes ───────────────────────────────────────────────────────────────

// GET /api/cities
app.get('/api/cities', (req, res) => res.json(Object.values(CITIES)));

// GET /api/routes?cityId=HYD
app.get('/api/routes', (req, res) => {
  const { cityId } = req.query;
  let routes = ROUTES;
  if (cityId) routes = routes.filter(r => r.cityId === cityId);
  res.json(routes.map(enrichRoute));
});

// GET /api/routes/:id
app.get('/api/routes/:id', (req, res) => {
  const route = ROUTES.find(r => r.id === req.params.id);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  res.json(enrichRoute(route));
});

// GET /api/buses?cityId=HYD
app.get('/api/buses', (req, res) => {
  const { cityId } = req.query;
  let result = buses;
  if (cityId) result = result.filter(b => b.cityId === cityId);
  res.json(result.map(enrichBus));
});

// GET /api/stops?cityId=HYD
app.get('/api/stops', (req, res) => {
  const { cityId } = req.query;
  let routes = ROUTES;
  if (cityId) routes = routes.filter(r => r.cityId === cityId);
  const seen = new Set();
  const all = [];
  routes.forEach(route => {
    route.stops.forEach(stop => {
      if (!seen.has(stop.id)) {
        seen.add(stop.id);
        all.push({ ...enrichStop(stop), routeId: route.id, routeName: route.name, cityId: route.cityId });
      }
    });
  });
  res.json(all);
});

// GET /api/stops/:stopId/crowd
app.get('/api/stops/:stopId/crowd', (req, res) => {
  const { stopId } = req.params;
  const count = crowdCounts[stopId] ?? 0;
  res.json({ stopId, passengerCount: count, crowdLevel: crowdLevel(count), queue: stopQueues[stopId] || [] });
});

// POST /api/stops/:stopId/queue
app.post('/api/stops/:stopId/queue', (req, res) => {
  const { stopId } = req.params;
  const { passengerId = `P${Date.now()}` } = req.body;
  if (!stopQueues[stopId]) stopQueues[stopId] = [];
  if (!crowdCounts[stopId]) crowdCounts[stopId] = 0;
  if (!stopQueues[stopId].find(p => p.id === passengerId)) {
    stopQueues[stopId].push({ id: passengerId, joinedAt: new Date().toISOString() });
    crowdCounts[stopId]++;
  }
  // Find ETA
  let eta = null;
  ROUTES.forEach(route => {
    const idx = route.stops.findIndex(s => s.id === stopId);
    if (idx !== -1) {
      const bus = buses.find(b => b.routeId === route.id);
      if (bus) eta = Math.round(Math.max(0, idx - bus.currentStopIdx) * 1.5 * 60 / 35);
    }
  });
  res.json({ success: true, passengerId, passengerCount: crowdCounts[stopId], crowdLevel: crowdLevel(crowdCounts[stopId]), etaMinutes: eta });
});

// DELETE /api/stops/:stopId/queue/:passengerId
app.delete('/api/stops/:stopId/queue/:passengerId', (req, res) => {
  const { stopId, passengerId } = req.params;
  if (stopQueues[stopId]) {
    const before = stopQueues[stopId].length;
    stopQueues[stopId] = stopQueues[stopId].filter(p => p.id !== passengerId);
    if (stopQueues[stopId].length < before && crowdCounts[stopId] > 0) crowdCounts[stopId]--;
  }
  res.json({ success: true, passengerCount: crowdCounts[stopId] || 0 });
});

// POST /api/route/nearest  { lat, lng, cityId? }
app.post('/api/route/nearest', (req, res) => {
  const { lat, lng, cityId } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
  const nearest = findNearestStop(parseFloat(lat), parseFloat(lng), cityId || null);
  if (!nearest) return res.status(404).json({ error: 'No stops found' });
  const { stop, route, distKm } = nearest;
  const stopIdx = route.stops.findIndex(s => s.id === stop.id);
  const remaining = route.stops.slice(stopIdx);
  const totalDist = routeDistanceKm(remaining);
  res.json({
    nearestStop: enrichStop(stop),
    route: { id: route.id, name: route.name, color: route.color, cityId: route.cityId },
    city: CITIES[route.cityId],
    distanceToStopKm: +distKm.toFixed(3),
    remainingStops: remaining.map((s, i) => ({
      ...enrichStop(s), etaMinutes: Math.round(i * 1.5 * 60 / 35),
    })),
    co2: co2Comparison(totalDist),
  });
});

// GET /api/stats  — system-wide stats
app.get('/api/stats', (req, res) => {
  const totalStops = new Set(ROUTES.flatMap(r => r.stops.map(s => s.id))).size;
  const totalWaiting = Object.values(crowdCounts).reduce((a, b) => a + b, 0);
  const highCrowdStops = Object.values(crowdCounts).filter(c => c > 15).length;
  const cityStats = Object.values(CITIES).map(city => {
    const cityRoutes = ROUTES.filter(r => r.cityId === city.id);
    const cityStops = [...new Set(cityRoutes.flatMap(r => r.stops.map(s => s.id)))];
    const cityWaiting = cityStops.reduce((sum, sid) => sum + (crowdCounts[sid] || 0), 0);
    const cityBuses = buses.filter(b => b.cityId === city.id).length;
    return { ...city, routes: cityRoutes.length, stops: cityStops.length, totalWaiting: cityWaiting, activeBuses: cityBuses };
  });
  res.json({ totalCities: CITY_IDS.length, totalRoutes: ROUTES.length, totalStops, totalBuses: buses.length, totalWaiting, highCrowdStops, cityStats });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`RTC API running on port ${PORT} — ${ROUTES.length} routes, ${buses.length} buses, ${Object.keys(CITIES).length} cities`));
