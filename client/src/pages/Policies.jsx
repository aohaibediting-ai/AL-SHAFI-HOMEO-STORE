import React from 'react';
import { useLocation } from 'react-router-dom';

export const Policies = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Store Policy';
  let content = null;

  if (path.includes('shipping-policy')) {
    title = 'Shipping and Delivery Policy';
    content = (
      <div className="space-y-4">
        <p><strong>1. Order Processing Time:</strong> All confirmed orders are reviewed and carefully packaged by our licensed dispensary staff within 24 business hours.</p>
        <p><strong>2. Delivery Transit Times:</strong> Major urban hubs (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad) receive parcels within 2 to 3 working days. Other areas typically take 3 to 4 working days.</p>
        <p><strong>3. Delivery Charges:</strong> Orders of Rs. 3,000 or more qualify for <strong>FREE Nationwide Delivery</strong>. Orders below Rs. 3,000 carry a standard delivery fee of Rs. 200.</p>
        <p><strong>4. Leak-Proof Packing:</strong> Homeopathic dilutions and tinctures are sealed with tamper-evident caps and shipped in shock-absorbent bubble wrapping.</p>
        <p><strong>5. Tracking:</strong> A courier tracking number is provided via SMS/Email or viewable directly on our order tracking page once the shipment leaves our dispensary.</p>
      </div>
    );
  } else if (path.includes('return-policy')) {
    title = 'Return & Refund Policy';
    content = (
      <div className="space-y-4">
        <p><strong>1. Eligibility:</strong> Returns are accepted within 7 days of delivery only if the medicine delivered was damaged in transit, defective, or incorrect.</p>
        <p><strong>2. Medical Hygiene:</strong> Due to healthcare safety regulations, bottles or containers that have been opened or had their security seals broken cannot be returned or refunded.</p>
        <p><strong>3. Refund Processing:</strong> Verified refunds are credited to the customer via original payment method, direct bank transfer, or store credit within 3-5 business days of inspection.</p>
      </div>
    );
  } else if (path.includes('privacy-policy')) {
    title = 'Privacy and Data Protection';
    content = (
      <div className="space-y-4">
        <p><strong>1. Data Collection:</strong> We collect only essential contact information (name, delivery address, phone number, and email) solely to process and ship your orders.</p>
        <p><strong>2. Confidentiality:</strong> Your personal information and purchase history are kept strictly confidential. We never sell, rent, or lease customer data to third-party marketing entities.</p>
        <p><strong>3. Payment Security:</strong> We do not store sensitive payment card details or banking passwords on our servers.</p>
      </div>
    );
  } else {
    title = 'Terms and Conditions of Service';
    content = (
      <div className="space-y-4">
        <p><strong>1. General Acceptance:</strong> By accessing AL SHAFI HOMEO STORE and placing orders, you agree to comply with our store terms and valid usage guidelines.</p>
        <p><strong>2. Product Information:</strong> Information on this website is for educational and identification purposes. No information should be construed as an absolute medical claim or treatment guarantee.</p>
        <p><strong>3. Pricing & Availability:</strong> All prices are displayed in PKR. While we maintain accurate stock counts, in rare cases of stock discrepancies, we reserve the right to contact the customer and process a replacement or full refund.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div>
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Legal & Governance</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-1">{title}</h1>
      </div>
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-sm text-slate-700 leading-relaxed">
        {content}
      </div>
    </div>
  );
};

export default Policies;
