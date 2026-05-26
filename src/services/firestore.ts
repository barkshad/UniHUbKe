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

  // Note: For a real seed function, you would generate actual ids for agents and categories to use as refs
  // But here we'll just demonstrate the structure
  
  // Settings
  const settingsRef = doc(db, 'settings', 'general');
  batch.set(settingsRef, {
    heroTitle: "Find your perfect student home",
    heroSubtitle: "Verified properties around JKUAT",
    ctaText: "Browse Properties",
    featuredProperties: []
  });

  await batch.commit();
}
