// constants/mockData.ts

export interface DatabaseEvent {
  id: string;
  title: string;
  description: string;
  summary: string;
  category: string;
  tags: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  created_at: string;
  organizer_id: string;
  contact_email: string;
  contact_phone: string;
  image_url: string;
}

export const MOCK_EVENTS: DatabaseEvent[] = [
  {
    id: 'kol-ev-01',
    title: 'Secret Midnight Jazz Session',
    description: 'An intimate late-night candle-lit musical performance featuring vintage blue notes and premium boutique wines.',
    summary: '🎧 Live Smooth Jazz & Acoustic Night',
    category: 'Music',
    tags: ['Jazz', 'Nightlife', 'Music', 'Social'],
    location: { latitude: 22.5414, longitude: 88.3527, address: 'The Someplace Else, Park Street' },
    created_at: new Date().toISOString(), organizer_id: 'org_01', contact_email: 'jazz@parkst.in', contact_phone: '+919830012345',
    image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800'
  },
  {
    id: 'kol-ev-02',
    title: 'Puchka & Kathi Roll Street Fest',
    description: 'An open-air culinary battlefield celebrating South Kolkata authentic street food, spicy chaats, and local music bands.',
    summary: '🍕 Unlimited Street Food Challenge & Local DJs',
    category: 'Food',
    tags: ['Street Food', 'Foodie', 'Outdoor', 'Traditional'],
    location: { latitude: 22.5186, longitude: 88.3654, address: 'Gariahat Crossing Food Alley' },
    created_at: new Date().toISOString(), organizer_id: 'org_02', contact_email: 'eat@kolkatastreet.co.in', contact_phone: '+919830054321',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'
  },
  {
    id: 'kol-ev-03',
    title: 'Kolkata FIFA Retro Tournament',
    description: 'A competitive high-stakes arcade and controller battleground featuring classic titles, custom neon badges, and sports energy drinks.',
    summary: '🎮 Retro Gaming & Console Competitions',
    category: 'Gaming',
    tags: ['Arcade', 'Esports', 'Nostalgia', 'Gaming'],
    location: { latitude: 22.5735, longitude: 88.4331, address: 'Pixel Arena Lounge, Sector V, Salt Lake' },
    created_at: new Date().toISOString(), organizer_id: 'org_03', contact_email: 'compete@pixelarena.in', contact_phone: '+919874561230',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'
  },
  {
    id: 'kol-ev-04',
    title: 'Eco Park Morning Yoga & Matcha',
    description: 'Start your day with a peaceful 360-degree open lake view meditation session followed by artisan hand-whisked iced matcha teas.',
    summary: '🧘 High-Rise Mindfulness & Healthy Drinks',
    category: 'Wellness',
    tags: ['Yoga', 'Mindfulness', 'Matcha', 'Morning'],
    location: { latitude: 22.6145, longitude: 88.4721, address: 'Amphitheater Meadows, Eco Park, New Town' }, // Pushed further North-East
    created_at: new Date().toISOString(), organizer_id: 'org_04', contact_email: 'hello@kolkatayoga.com', contact_phone: '+919123456789',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
  },
  {
    id: 'kol-ev-05',
    title: 'Indie Film Screening & Director Talk',
    description: 'Exclusive screening of award-winning regional indie dramas followed by an interactive coffee session with the executive crew.',
    summary: '🍿 Independent Cinema & Filmmaker Q&A',
    category: 'Music',
    tags: ['Cinema', 'Art', 'Culture', 'Discussion'],
    location: { latitude: 22.5392, longitude: 88.3432, address: 'Nandan Film Center, Rabindra Sadan' },
    created_at: new Date().toISOString(), organizer_id: 'org_05', contact_email: 'cinema@nandan.org', contact_phone: '+919831122334',
    image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800'
  },
  {
    id: 'kol-ev-06',
    title: 'AI Developers & Founders Mixer',
    description: 'An informal networking event for technology builders, product designers, and venture leads discussing generative tech models.',
    summary: '🧑‍💻 Tech Startups & Software Showcase',
    category: 'Tech',
    tags: ['AI', 'Tech', 'Networking', 'Coding'],
    location: { latitude: 22.5642, longitude: 88.4115, address: 'Nasscom Startup Warehouse, Salt Lake Sector III' }, // Separated from Sector V cluster
    created_at: new Date().toISOString(), organizer_id: 'org_06', contact_email: 'dev@futurekolkata.io', contact_phone: '+919007012345',
    image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800'
  },
  {
    id: 'kol-ev-07',
    title: 'College Rock Band Showdown',
    description: 'Experience pure distortion and energy as elite local universities battle live on stage for the ultimate city trophy.',
    summary: '🎸 High-Energy College Rock Fest',
    category: 'Music',
    tags: ['Rock', 'Live Music', 'Concert', 'College'],
    location: { latitude: 22.5782, longitude: 88.3612, address: 'College Street Heritage Campus' },
    created_at: new Date().toISOString(), organizer_id: 'org_07', contact_email: 'rock@showdown.in', contact_phone: '+919830599999',
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'
  },
  {
    id: 'kol-ev-08',
    title: 'Continental Pastry Masterclass',
    description: 'Learn the exact science behind baking structural sourdough loaves, flaky croissants, and fine French macarons.',
    summary: '🍕 Premium Baking & Dessert Designing Workshop',
    category: 'Food',
    tags: ['Baking', 'Desserts', 'Workshop', 'Chef'],
    location: { latitude: 22.5310, longitude: 88.3542, address: 'Flurys Academy, Elgin Road' },
    created_at: new Date().toISOString(), organizer_id: 'org_08', contact_email: 'bake@flurys.com', contact_phone: '+913322495555',
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800'
  },
  {
    id: 'kol-ev-09',
    title: 'Valorant LAN Finals Cafe Night',
    description: 'Watch the top 4 local rosters lock horns live on giant projection arrays with live casting, merchandise stalls, and finger foods.',
    summary: '🎮 Esports Watch Party & Live Action',
    category: 'Gaming',
    tags: ['Esports', 'Valorant', 'Gaming', 'Tournament'],
    location: { latitude: 22.5912, longitude: 88.4021, address: 'Ultadanga Gaming Lounge Hub' }, // Shifted North-West
    created_at: new Date().toISOString(), organizer_id: 'org_09', contact_email: 'gg@gamingcafe.in', contact_phone: '+919875123456',
    image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800'
  },
  {
    id: 'kol-ev-10',
    title: 'Pottery & Abstract Canvas Jam',
    description: 'Get your hands dirty with real clay pottery wheels while sketching custom fluorescent paintings on a dynamic public accent wall.',
    summary: '🎨 Creative Art Studio Session & Free Drinks',
    category: 'Art',
    tags: ['Art', 'Pottery', 'Painting', 'Creative'],
    location: { latitude: 22.5592, longitude: 88.3411, address: 'Babughat Riverfront Art Pavilion' }, // Shifted right next to Hooghly river
    created_at: new Date().toISOString(), organizer_id: 'org_10', contact_email: 'create@artjam.in', contact_phone: '+919903112233',
    image_url: 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?w=800'
  },
  {
    id: 'kol-ev-11',
    title: 'Micro-Brewery Craft Beer Tasting',
    description: 'Sample crisp, newly introduced batches of Belgian wheat, apple ciders, and chocolate stouts brewed natively in the city center.',
    summary: '🍻 Premium Brewery Tour & Food Pairings',
    category: 'Food',
    tags: ['Brewery', 'Beer', 'Nightlife', 'Tasting'],
    location: { latitude: 22.5358, longitude: 88.3892, address: 'The Grid Brewery, Topsia Ground' },
    created_at: new Date().toISOString(), organizer_id: 'org_11', contact_email: 'cheers@thegrid.in', contact_phone: '+913340012222',
    image_url: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=800'
  },
  {
    id: 'kol-ev-12',
    title: 'Web3 & Smart Contract Hackathon',
    description: 'A 24-hour sprint to build localized decentralized ledger primitives. Mentors from global chains will guide team sprints.',
    summary: '🧑‍💻 24-Hour Blockchain Engineering Sprint',
    category: 'Tech',
    tags: ['Web3', 'Blockchain', 'Hackathon', 'Coding'],
    location: { latitude: 22.5894, longitude: 88.4485, address: 'DLF IT Park 2, New Town' }, // Shifted deep into New Town block layout
    created_at: new Date().toISOString(), organizer_id: 'org_12', contact_email: 'hack@web3kolkata.io', contact_phone: '+918100123456',
    image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800'
  },
  {
    id: 'kol-ev-13',
    title: 'Heritage Street Photography Walk',
    description: 'Capture the architectural majesty of colonial structures, moving hand-pulled rickshaws, and early morning yellow taxi frames.',
    summary: '📸 Guided Heritage Photography Expedition',
    category: 'Art',
    tags: ['Photography', 'Heritage', 'Walk', 'Culture'],
    location: { latitude: 22.5621, longitude: 88.3498, address: 'BBD Bagh Colonial District Center' }, // Spread out near Dalhousie Square
    created_at: new Date().toISOString(), organizer_id: 'org_13', contact_email: 'walk@kolkataphoto.co.in', contact_phone: '+919748123456',
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'
  },
  {
    id: 'kol-ev-14',
    title: 'Sufi Musical Evening',
    description: 'Immerse yourself in deeply spiritual and rich classical live performances under the starry open skies.',
    summary: '🎧 Mystic Sufi Chants & Live Instruments',
    category: 'Music',
    tags: ['Sufi', 'Classical', 'Music', 'Live'],
    location: { latitude: 22.5115, longitude: 88.3492, address: 'Southern Avenue Amphitheater, Lake area' }, // Spread out South
    created_at: new Date().toISOString(), organizer_id: 'org_14', contact_email: 'sufi@mancha.org', contact_phone: '+919433012211',
    image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800'
  },
  {
    id: 'kol-ev-15',
    title: 'Bhojohori Manna Seafood Cook-off',
    description: 'Watch master regional chefs demonstrate the perfect geometric math behind smoking mustard hilsa and jumbo prawns.',
    summary: '🍕 Traditional Bengali Culinary Showcase',
    category: 'Food',
    tags: ['Seafood', 'Traditional', 'Cooking', 'Food'],
    location: { latitude: 22.4994, longitude: 88.3712, address: 'Jadavpur 8B Bus Stand Avenue' }, // Spread out deep South-East
    created_at: new Date().toISOString(), organizer_id: 'org_15', contact_email: 'bhoj@manna.in', contact_phone: '+919836012244',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'
  },
  {
    id: 'kol-ev-16',
    title: 'Anime Cosplay & Comic Hub',
    description: 'Dress up as your favorite characters, buy limited-edition manga merchandise panels, and meet regional voice artists.',
    summary: '🎮 Otaku Culture Gathering & Merch Stalls',
    category: 'Gaming',
    tags: ['Anime', 'Cosplay', 'Comic', 'Gaming'],
    location: { latitude: 22.5810, longitude: 88.4194, address: 'Mani Square Exhibition Banquet Ground' },
    created_at: new Date().toISOString(), organizer_id: 'org_16', contact_email: 'otaku@kolkata.in', contact_phone: '+919903554433',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'
  },
  {
    id: 'kol-ev-17',
    title: 'Open Mic Standup & Poetry Jam',
    description: 'Catch the absolute sharpest wit and heartbreaking slam poetry from the city’s newest underground comedy clubs.',
    summary: '🎙️ Live Standup Comedy & Poetry Reading',
    category: 'Music',
    tags: ['Comedy', 'Poetry', 'Open Mic', 'Theatre'],
    location: { latitude: 22.5451, longitude: 88.3634, address: 'Beckaganja Creative Art Cellar, Ballygunge' }, // Shifted toward Central-East
    created_at: new Date().toISOString(), organizer_id: 'org_17', contact_email: 'laughs@capsule.in', contact_phone: '+919163012244',
    image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800'
  },
  {
    id: 'kol-ev-18',
    title: 'UI/UX Design Systems Workshop',
    description: 'An exhaustive asset design sprint focusing on atomic design patterns, layout token configurations, and interactive prototypes.',
    summary: '🎨 Figma Masterclass & Product Asset Design',
    category: 'Art',
    tags: ['Design', 'Figma', 'UIUX', 'Product'],
    location: { latitude: 22.5691, longitude: 88.4311, address: 'Webel IT Park Infrastructure, Sector V' },
    created_at: new Date().toISOString(), organizer_id: 'org_18', contact_email: 'design@webel.in', contact_phone: '+913323577777',
    image_url: 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?w=800'
  },
  {
    id: 'kol-ev-19',
    title: 'Sunset Rooftop Electronic Deck',
    description: 'Groove to high-fidelity minimal techno and progressive house tracks as the sun slips beneath the Hooghly river horizons.',
    summary: '🎧 Rooftop Electronic Dance Music (EDM)',
    category: 'Music',
    tags: ['Techno', 'EDM', 'Rooftop', 'Dance'],
    location: { latitude: 22.5142, longitude: 88.3912, address: 'Ozora Sky Bar, Acropolis Mall, Kasba' }, // Shifted onto Kasba bypass highway edge
    created_at: new Date().toISOString(), organizer_id: 'org_19', contact_email: 'beats@ozora.in', contact_phone: '+913340600000',
    image_url: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=800'
  },
  {
    id: 'kol-ev-20',
    title: 'Cyber Security Capture-The-Flag (CTF)',
    description: 'Penetrate vulnerable server networks, decrypt hidden payloads, and secure flags in this intense ethical hacking event.',
    summary: '🧑‍💻 Cyber Security Network & Exploitation Battle',
    category: 'Tech',
    tags: ['Cybersecurity', 'CTF', 'Hacking', 'Coding'],
    location: { latitude: 22.6312, longitude: 88.3994, address: 'Dum Dum Cantonment Technical Annex' }, // Way North to catch the upper viewport perimeter
    created_at: new Date().toISOString(), organizer_id: 'org_20', contact_email: 'ctf@cyberkol.org', contact_phone: '+918240123456',
    image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800'
  }
];