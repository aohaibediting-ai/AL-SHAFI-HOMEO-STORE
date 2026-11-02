import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    store_name: 'AL SHAFI HOMEO STORE',
    store_slogan: 'Natural Homeopathy & Holistic Health Care',
    store_email: 'info@alshafihomeo.com',
    store_phone: '+923485349232',
    store_address: 'Raja Bazar, Rawalpindi, Pakistan',
    currency: 'PKR',
    currency_symbol: 'Rs.',
    min_order_amount: '0',
    free_delivery_threshold: '3000',
    delivery_charge: '200',
    enable_cod: 'true',
    enable_bank_transfer: 'true',
    enable_online_payment: 'false',
    enable_store_pickup: 'true',
    store_pickup_address: 'Al Shafi Homeo Dispensary, Raja Bazar, Rawalpindi',
    store_pickup_hours: 'Mon-Sat: 10:00 AM - 9:00 PM, Sun: 2:00 PM - 8:00 PM',
    chief_physician: 'Dr. Musab Maqsood',
    doctor_qualification: '4-Year Homeopathic Medical Degree (DHMS / BHMS)',
    doctor_experience: '5+ Years Clinical Practice & Healthcare Marketing',
    bank_details: 'Bank: HBL / EasyPaisa / JazzCash\nAccount Title: AL SHAFI HOMEO STORE\nAccount Number: Contact store admin\nBranch: Raja Bazar, Rawalpindi'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/public');
      if (res.settings) {
        setSettings(prev => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      console.error('Settings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const formatPrice = (amount) => {
    const num = parseFloat(amount) || 0;
    const symbol = settings.currency_symbol || 'Rs.';
    return `${symbol} ${num.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, formatPrice, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
