// Utility functions for the POS app

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateSKU = (name: string, category: string): string => {
  const namePrefix = name.substring(0, 3).toUpperCase();
  const categoryPrefix = category.substring(0, 2).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${namePrefix}${categoryPrefix}${timestamp}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateBarcode = (barcode: string): boolean => {
  // Simple validation for UPC/EAN barcodes
  return /^\d{8,13}$/.test(barcode);
};

export const calculateDiscount = (originalPrice: number, discountPercent: number): number => {
  return (originalPrice * discountPercent) / 100;
};

export const calculateTax = (amount: number, taxPercent: number = 8.5): number => {
  return (amount * taxPercent) / 100;
};