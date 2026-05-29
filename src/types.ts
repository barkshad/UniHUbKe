export interface University {
  id: string;
  name: string;
  town?: string;
  nearbyAreas?: string[];
  coordinates?: { lat: number; lng: number };
  popularKeywords?: string[];
}

export type UserRole = 'tenant' | 'landlord' | 'admin';

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

import { Timestamp } from 'firebase/firestore';

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
}
