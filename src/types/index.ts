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

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  ctaText: string;
  featuredProperties: string[];
}
