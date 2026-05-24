export type UserRole = 'student' | 'landlord' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  favorites?: string[];
  createdAt: number;
  updatedAt?: number;
}

export type PropertyType = 'hostel' | 'apartment' | 'bedsitter';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  location: string;
  coordinates?: { lat: number; lng: number };
  images: string[];
  landlordId: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  deposit?: number;
  university?: string;
  distanceFromCampus?: string;
  hasWifi?: boolean;
  hasWater?: boolean;
  genderRestriction?: 'none' | 'male_only' | 'female_only';
  videoUrl?: string;
  amenities?: string[];
  status: 'available' | 'rented';
  isVerified?: boolean;
  createdAt: number;
  updatedAt?: number;
}
