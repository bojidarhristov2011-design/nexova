// Maps common business-type phrases to Geoapify Places categories.
const CATEGORY_MAP: Array<{ keywords: string[]; category: string }> = [
  { keywords: ['hair', 'salon', 'hairdresser', 'barber'], category: 'service.beauty.hairdresser' },
  { keywords: ['massage'], category: 'service.beauty.massage' },
  { keywords: ['tattoo'], category: 'service.beauty.tattoo' },
  { keywords: ['beauty', 'nail', 'cosmetic', 'spa'], category: 'service.beauty' },
  { keywords: ['restaurant'], category: 'catering.restaurant' },
  { keywords: ['cafe', 'coffee'], category: 'catering.cafe' },
  { keywords: ['hotel'], category: 'accommodation.hotel' },
  { keywords: ['dentist', 'dental'], category: 'healthcare.dentist' },
  { keywords: ['vet', 'veterinary'], category: 'pet.veterinary' },
  { keywords: ['gym', 'fitness', 'trainer'], category: 'sport.fitness' },
  { keywords: ['pharmacy'], category: 'healthcare.pharmacy' },
  { keywords: ['bakery'], category: 'commercial.food_and_drink.bakery' },
  { keywords: ['supermarket', 'grocery'], category: 'commercial.supermarket' },
  { keywords: ['clothing', 'fashion'], category: 'commercial.clothing' },
  { keywords: ['lawyer', 'attorney', 'legal'], category: 'office.lawyer' },
  { keywords: ['accountant', 'accounting'], category: 'office.accountant' },
  { keywords: ['photographer', 'photo'], category: 'service.photographer' },
  { keywords: ['electrician'], category: 'service.electrician' },
  { keywords: ['clean'], category: 'service.cleaning' },
  { keywords: ['marketing', 'advertising'], category: 'office.advertising_agency' },
  { keywords: ['real estate', 'estate agent'], category: 'office.estate_agent' },
  { keywords: ['car repair', 'auto repair', 'mechanic'], category: 'service.vehicle.repair.car' },
]

function buildCategory(businessType: string): string {
  const lower = businessType.toLowerCase()
  const match = CATEGORY_MAP.find(m => m.keywords.some(k => lower.includes(k)))
  return match ? match.category : 'commercial'
}

export interface BusinessResult {
  placeId: string
  name: string
  address: string
  phone: string
  website: string
}

export async function searchBusinesses(businessType: string, location: string): Promise<BusinessResult[]> {
  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) throw new Error('Lead search is not set up — missing GEOAPIFY_API_KEY')

  const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`, {
    headers: { 'User-Agent': 'Nexova-LeadFinder/1.0 (contact: bojidarhristov2011@gmail.com)' },
  })
  const geoData = await geoRes.json()
  if (!geoData?.length) throw new Error(`Could not find location "${location}"`)
  const { lat, lon } = geoData[0]

  const category = buildCategory(businessType)
  const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},6000&bias=proximity:${lon},${lat}&limit=25&apiKey=${apiKey}`

  const placesRes = await fetch(url)
  if (!placesRes.ok) throw new Error(`Search failed (${placesRes.status})`)
  const data = await placesRes.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.features || []).map((f: any) => {
    const p = f.properties
    return {
      placeId: p.place_id || String(Math.random()),
      name: p.name || p.address_line1 || 'Unknown business',
      address: p.formatted || p.address_line2 || '',
      phone: p.contact?.phone || p.datasource?.raw?.phone || '',
      website: p.website || p.datasource?.raw?.website || '',
    }
  }).filter((r: BusinessResult) => r.name !== 'Unknown business')
}
