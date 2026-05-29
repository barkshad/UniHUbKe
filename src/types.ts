import { Timestamp } from 'firebase/firestore';

export interface MediaItem {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video';
  format: string;
  order: number;
}

export interface University {
  id?: string;
  name: string;
  slug: string;
  logo_url?: string;
  location: string;
  contact_email?: string;
  contact_phone?: string;
  description: string;
  verified: boolean;
  admin_user_id?: string;
  status: 'active' | 'inactive';
  metadata?: {
    founded_year?: number;
    student_count?: number;
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Hostel {
  id?: string;
  universityId: string;
  name: string;
  location: string;
  description: string;
  hostel_type: 'boys' | 'girls' | 'mixed';
  images: MediaItem[];
  amenities: string[];
  warden_name?: string;
  warden_phone?: string;
  warden_email?: string;
  status: 'active' | 'inactive';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface HostelRoom {
  id?: string;
  hostelId: string;
  room_number: string;
  bed_number?: string;
  room_type: 'single' | 'shared_double' | 'shared_quad';
  price_per_semester: number;
  price_per_year: number;
  price_per_month?: number;
  description: string;
  features: string[];
  images: MediaItem[];
  max_occupants: number;
  status: 'available' | 'booked' | 'maintenance' | 'closed';
  available_from?: Timestamp;
  available_until?: Timestamp;
  booking_deadline?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Apartment {
  id?: string;
  name: string;
  location: string;
  description: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  amenities: string[];
  images: MediaItem[];
  agentId: string;
  owner_type: 'individual' | 'company';
  owner_name?: string;
  contact_email?: string;
  contact_phone?: string;
  status: 'active' | 'inactive';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Room {
  id?: string;
  apartmentId: string;
  room_number: string;
  room_type: 'single' | 'double' | 'bedsitter' | 'studio' | 'one_bedroom' | 'two_bedroom';
  price: number;
  deposit?: number;
  description: string;
  features: string[];
  images: MediaItem[];
  status: 'available' | 'occupied' | 'maintenance' | 'hidden';
  max_occupants: number;
  square_meters?: number;
  availability_date?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type UserRole = 'tenant' | 'landlord' | 'admin' | 'university_admin';


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

export interface Property {
  id?: string;
  title: string;
  categoryId: string;
  price: number;
  deposit?: number;
  location: string;
  description: string;
  features: string[];
  agentId: string;
  status: 'available' | 'occupied' | 'hidden';
  media: MediaItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MediaItem {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video';
  format: string;
  order: number;
}

export interface Agent {
  id?: string;
  name: string;
  phone: string;
  whatsappNumber: string;
  profilePhotoURL?: string;
  isActive: boolean;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
}

export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  borderRadius: string;
  fontFamily: string;
  animationSpeed: string;
}

export interface TeamMember {
  name: string;
  role: string;
  photoUrl: string;
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  ctaText: string;
  featuredProperties: string[];
  theme?: ThemeConfig;
  features?: {
    enableBlog: boolean;
  };
  teamMembers?: TeamMember[];
}
