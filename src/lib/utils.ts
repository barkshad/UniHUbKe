import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  const formatter = new Intl.NumberFormat('en-KE', { 
    style: 'currency', 
    currency: 'KES', 
    minimumFractionDigits: 0 
  });
  return formatter.format(amount).replace('KES', 'KSh');
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
