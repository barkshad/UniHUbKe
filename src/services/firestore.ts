import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Property, Agent, Category, SiteSettings } from '../types';

// Properties
export async function getProperties(status?: string): Promise<Property[]> {
  const propertiesRef = collection(db, 'properties');
  let q = query(propertiesRef, orderBy('createdAt', 'desc'));
  
  if (status) {
    q = query(propertiesRef, where('status', '==', status));
  }
  
  const snapshot = await getDocs(q);
  let props = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
  
  if (status) { // sort client side since we queried by status
    props = props.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  }
  return props;
}

export async function getProperty(id: string): Promise<Property | null> {
  const docRef = doc(db, 'properties', id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Property;
  }
  return null;
}

export async function createProperty(data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) {
  const propertiesRef = collection(db, 'properties');
  return await addDoc(propertiesRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateProperty(id: string, data: Partial<Property>) {
  const docRef = doc(db, 'properties', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProperty(id: string) {
  const docRef = doc(db, 'properties', id);
  await deleteDoc(docRef);
}

// Agents
export async function getAgents(): Promise<Agent[]> {
  const agentsRef = collection(db, 'agents');
  const snapshot = await getDocs(agentsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agent));
}

export async function getAgent(id: string): Promise<Agent | null> {
  const docRef = doc(db, 'agents', id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Agent;
  }
  return null;
}

export async function createAgent(data: Omit<Agent, 'id'>) {
  const agentsRef = collection(db, 'agents');
  return await addDoc(agentsRef, data);
}

export async function updateAgent(id: string, data: Partial<Agent>) {
  const docRef = doc(db, 'agents', id);
  await updateDoc(docRef, data);
}

export async function deleteAgent(id: string) {
  const docRef = doc(db, 'agents', id);
  await deleteDoc(docRef);
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const categoriesRef = collection(db, 'categories');
  const q = query(categoriesRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function createCategory(data: Omit<Category, 'id'>) {
  const categoriesRef = collection(db, 'categories');
  return await addDoc(categoriesRef, data);
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const docRef = doc(db, 'categories', id);
  await updateDoc(docRef, data);
}

export async function deleteCategory(id: string) {
  const docRef = doc(db, 'categories', id);
  await deleteDoc(docRef);
}

// Settings
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const docRef = doc(db, 'settings', 'general');
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return snapshot.data() as SiteSettings;
  }
  return null;
}

export async function updateSiteSettings(data: SiteSettings) {
  const docRef = doc(db, 'settings', 'general');
  await setDoc(docRef, data, { merge: true });
}

export async function seedData() {
  const batch = writeBatch(db);

  // Settings
  const settingsRef = doc(db, 'settings', 'general');
  batch.set(settingsRef, {
    heroTitle: "Find your perfect student home",
    heroSubtitle: "Verified properties around JKUAT",
    ctaText: "Browse Properties",
    featuredProperties: []
  });

  const categories = [
    { name: 'Bedsitters', slug: 'bedsitters', order: 1, isActive: true },
    { name: 'Single Rooms', slug: 'single-rooms', order: 2, isActive: true },
    { name: 'One Bedroom', slug: 'one-bedroom', order: 3, isActive: true },
    { name: 'Two Bedroom', slug: 'two-bedroom', order: 4, isActive: true }
  ];

  categories.forEach((cat) => {
    const docRef = doc(collection(db, 'categories'));
    batch.set(docRef, cat);
  });

  await batch.commit();
}

export async function pushMockListingsLive() {
  const batch = writeBatch(db);

  // 1. Check or Create Agent
  const agentsRef = collection(db, 'agents');
  const agentSnapshot = await getDocs(agentsRef);
  let agentId = '';
  
  if (agentSnapshot.empty) {
    const newAgentRef = doc(agentsRef);
    batch.set(newAgentRef, {
      name: "Trusted Campus Agent",
      phone: "+254712345678",
      whatsappNumber: "+254712345678",
      profilePhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Agent",
      isActive: true
    });
    agentId = newAgentRef.id;
  } else {
    agentId = agentSnapshot.docs[0].id; // Use first available agent
  }

  // 2. Fetch Categories mapping
  const catsSnapshot = await getDocs(collection(db, 'categories'));
  const cats = catsSnapshot.docs.map(d => ({ id: d.id, ...d.data() as any }));
  
  const getCatId = (typeStr: string) => {
    const match = cats.find(c => c.name.toLowerCase().includes(typeStr));
    return match ? match.id : (cats.length > 0 ? cats[0].id : '');
  };

  const images = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1de242407d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800"
  ];

  const mockData = [
    { title: "Sunrise Bedsitters", location: "Gate C, Juja", price: 6500, type: "bedsit" },
    { title: "Elite Single Rooms", location: "Gate B, Juja", price: 4000, type: "single" },
    { title: "The Haven One Bedroom", location: "Oasis, Juja", price: 12000, type: "one" },
    { title: "Greenfield Apartments", location: "Gate A, Juja", price: 18000, type: "two" },
    { title: "Ocean View Bedsits", location: "Seward, Juja", price: 7000, type: "bedsit" },
    { title: "Campus Edge Singles", location: "Gate C, Juja", price: 4500, type: "single" },
    { title: "Harmony One Bedroom", location: "Gachororo, Juja", price: 11000, type: "one" },
    { title: "Juja Square Bedsitters", location: "Juja Town", price: 6000, type: "bedsit" },
    { title: "Scholar's Retreat", location: "Gate C, Juja", price: 5000, type: "single" },
    { title: "Nova Apartments", location: "Highpoint, Juja", price: 13500, type: "one" },
    { title: "Prestige Bedsits", location: "Gate B, Juja", price: 8000, type: "bedsit" },
    { title: "Apex Single Units", location: "JKUAT Main, Juja", price: 4800, type: "single" },
    { title: "The Loft One Beds", location: "Gate A, Juja", price: 15000, type: "one" },
    { title: "Zenith Rooms", location: "Oasis, Juja", price: 7500, type: "bedsit" },
    { title: "Eco-Living Singles", location: "Gachororo, Juja", price: 4200, type: "single" },
    { title: "Pinnacle Studios", location: "Gate C, Juja", price: 8500, type: "bedsit" },
    { title: "Crest View Apartments", location: "Juja Town", price: 14000, type: "one" },
    { title: "Urban Suites", location: "Highpoint, Juja", price: 20000, type: "two" },
    { title: "Classic Bedsitters", location: "Gate B, Juja", price: 6800, type: "bedsit" },
    { title: "Main Campus Singles", location: "Gate A, Juja", price: 5500, type: "single" },
    { title: "Galaxy One Bedroom", location: "Gate C, Juja", price: 12500, type: "one" },
    { title: "Oasis Retreat Bedsits", location: "Oasis, Juja", price: 7200, type: "bedsit" }
  ];

  mockData.forEach((item, idx) => {
     const propRef = doc(collection(db, 'properties'));
     const img = images[idx % images.length];
     batch.set(propRef, {
        title: item.title,
        description: "Premium student accommodation closely located to the campus. Features ample security, 24/7 water supply, reliable Wi-Fi, and a serene environment perfect for studying.",
        price: item.price,
        deposit: item.price,
        location: item.location,
        categoryId: getCatId(item.type) || 'default',
        agentId: agentId,
        status: "available",
        features: ["Wi-Fi", "Water 24/7", "Secure", "Near Tarmac"],
        media: [{
          resource_type: "image",
          secure_url: img,
          order: 0,
          public_id: `mock_${idx}`
        }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
     });
  });

  await batch.commit();
}
