import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'Are your homeopathic remedies genuine and authentic?',
      a: 'Yes, 100%. All mother tinctures, dilutions, and biochemic tissue salts are sourced directly from certified manufacturers including Dr. Willmar Schwabe Germany, Dr. Reckeweg, and licensed laboratories adhering to strict Pharmacopoeial specifications.'
    },
    {
      q: 'How are liquid bottles packaged to prevent transit breakage and leakage?',
      a: 'All glass bottles and dropper vials are secured with tamper-evident caps, individually enclosed in high-grade shock-absorbing bubble envelopes, and placed inside rigid protective corrugated shipping cartons.'
    },
    {
      q: 'How long does nationwide delivery take?',
      a: 'Orders are dispatched within 24 hours on business days. Standard courier transit time is 2 to 3 days for major urban centers (Lahore, Karachi, Islamabad, Rawalpindi) and 3 to 4 days for other regions across Pakistan.'
    },
    {
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes, we provide Cash on Delivery across Pakistan. You can inspect your parcel and pay the delivery courier in cash upon arrival.'
    },
    {
      q: 'How does Direct Bank Transfer or Mobile Wallet work?',
      a: 'When placing your order, select "Direct Bank Transfer". Transfer the total amount via online banking, EasyPaisa, or JazzCash to our verified account. You can then upload a screenshot of your payment receipt on the Order Confirmation page for fast verification.'
    },
    {
      q: 'Can I choose Store Pickup instead of home delivery?',
      a: 'Yes, if you reside near our dispensary in Raja Bazar, Rawalpindi, you can select "Store Pickup" at checkout. Your order will be prepared with zero delivery charges, and you can pay cash or card upon collection.'
    },
    {
      q: 'How should homeopathic medicines be stored at home?',
      a: 'Keep remedies in a cool, dry place away from direct sunlight, moisture, and strong aromatic substances such as camphor, menthol, cloves, raw garlic, and electronic appliances (microwaves/routers).'
    },
    {
      q: 'Can I track my order if I checked out as a guest without registering?',
      a: 'Absolutely. You will receive a unique Order Number (e.g. ASH-20261024-XXXX). Simply visit our "Track Order" page and enter your Order Number and phone number to see live updates.'
    },
    {
      q: 'What is your return or exchange policy?',
      a: 'Unopened medicines in their original tamper-evident seals may be returned within 7 days of delivery if damaged or incorrectly dispatched. Due to medical hygiene regulations, opened bottles cannot be accepted for return.'
    },
    {
      q: 'Do you make medical diagnoses or prescribe treatment plans?',
      a: 'No. While our staff can verify potencies and dispense prescriptions accurately, homeopathic remedies should be taken under the guidance of a qualified, registered homeopathic physician who evaluates your constitutional totality.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Common Questions</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Clear answers about ordering, potencies, shipping security, and dispensary policies.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-slate-900 hover:text-emerald-700 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
                  isOpen ? 'rotate-180 text-emerald-700' : ''
                }`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQ;
