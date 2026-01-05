
export interface Location {
  latitude: number;
  longitude: number;
}

export interface ParkingSlot {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating?: number;
  priceEstimate?: string;
  availability?: 'Available' | 'Limited' | 'Full' | 'Unknown';
  occupancy?: number; // 0 to 100
  lastUpdated?: string;
  mapsUri?: string;
  latitude: number;
  longitude: number;
}

export interface SearchResult {
  slots: ParkingSlot[];
  rawResponse: string;
  sources: { title: string; uri: string }[];
}
