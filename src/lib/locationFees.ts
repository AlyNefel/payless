export interface ZoneFeeConfig {
  id: string;
  name: string;
  cities: string[];
  deliveryFee: number; // in DT (major units, e.g. 20)
  returnFee: number; // in DT (major units, e.g. 20)
  isActive: boolean;
}

export const DEFAULT_ZONES: ZoneFeeConfig[] = [
  {
    id: "tunis",
    name: "Grand Tunis / Aéroport Tunis-Carthage / La Soukra",
    cities: ["tunis", "carthage", "ariana", "la soukra", "marsa", "gammarth", "ben arous", "manouba"],
    deliveryFee: 0,
    returnFee: 0,
    isActive: true,
  },
  {
    id: "hammamet",
    name: "Hammamet & Yasmine Resort",
    cities: ["hammamet", "yasmine hammamet"],
    deliveryFee: 20,
    returnFee: 20,
    isActive: true,
  },
  {
    id: "nabeul",
    name: "Nabeul Ville & Cap Bon",
    cities: ["nabeul", "korba", "kelibia", "haouaria"],
    deliveryFee: 20,
    returnFee: 20,
    isActive: true,
  },
  {
    id: "sousse",
    name: "Sousse & Port El Kantaoui",
    cities: ["sousse", "port el kantaoui", "kantaoui", "hammam sousse"],
    deliveryFee: 35,
    returnFee: 35,
    isActive: true,
  },
  {
    id: "monastir",
    name: "Monastir & Aéroport MIR",
    cities: ["monastir", "skanes", "sahline"],
    deliveryFee: 35,
    returnFee: 35,
    isActive: true,
  },
  {
    id: "enfidha",
    name: "Aéroport Enfidha-Hammamet (NBE)",
    cities: ["enfidha", "aeroport enfidha"],
    deliveryFee: 35,
    returnFee: 35,
    isActive: true,
  },
  {
    id: "bizerte",
    name: "Bizerte Ville & Port",
    cities: ["bizerte", "menzel bourguiba", "ras jebel"],
    deliveryFee: 30,
    returnFee: 30,
    isActive: true,
  },
  {
    id: "sfax",
    name: "Sfax Ville & Centre d'Affaires",
    cities: ["sfax", "thyna", "sakiet"],
    deliveryFee: 50,
    returnFee: 50,
    isActive: true,
  },
  {
    id: "tabarka",
    name: "Tabarka, Ain Draham & Jendouba",
    cities: ["tabarka", "jendouba", "ain draham"],
    deliveryFee: 60,
    returnFee: 60,
    isActive: true,
  },
];

export function matchZone(
  location: { city?: string; name?: any; address?: string } | null,
  zones: ZoneFeeConfig[]
): ZoneFeeConfig | null {
  if (!location) return null;

  const locCity = (location.city || "").toLowerCase().trim();
  const locName = (typeof location.name === "object" ? Object.values(location.name).join(" ") : String(location.name || "")).toLowerCase();
  const locAddress = (location.address || "").toLowerCase();
  const combined = `${locCity} ${locName} ${locAddress}`;

  for (const zone of zones) {
    if (!zone.isActive) continue;
    for (const city of zone.cities) {
      if (combined.includes(city.toLowerCase())) {
        return zone;
      }
    }
  }

  return null;
}

