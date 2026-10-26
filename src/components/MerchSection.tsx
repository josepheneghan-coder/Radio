import React, { useState } from 'react';
import { ShoppingBag, Check, ShieldCheck } from 'lucide-react';
import { MERCH_ITEMS } from '../data/radioData';
import { MerchItem } from '../types/radio';
import { audioEngine } from '../utils/audioEngine';

export const MerchSection: React.FC = () => {
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const handleAddToCart = (item: MerchItem) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
    audioEngine.playFX('scratch');
    setJustAdded(item.id);
    setTimeout(() => setJustAdded(null), 1800);
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <section id="merch" className="w-full bg-[#0a0a0a] text-white py-16 px-4 md:px-8 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-yellow-400 font-mono text-xs uppercase tracking-widest mb-1">
              <ShoppingBag size={14} />
              <span>STATION SUPPLY // SUPPORT INDEPENDENT RADIO</span>
            </div>
            <h2 className="font-display font-black text-section-display uppercase">
              MERCH & PHYSICAL RELEASES
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="font-mono text-xs text-neutral-400 hidden sm:block">
              100% OF REVENUE FUNDS STUDIO GEAR & STREAM BANDWIDTH
            </div>
            {totalItems > 0 && (
              <div className="px-3 py-1.5 bg-yellow-400 text-black font-ui font-bold text-xs rounded flex items-center gap-1.5">
                <ShoppingBag size={14} />
                <span>BAG: {totalItems}</span>
              </div>
            )}
          </div>
        </div>

        {/* Merch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MERCH_ITEMS.map((item) => {
            const isAdded = justAdded === item.id;
            const quantity = cart[item.id] || 0;

            return (
              <div
                key={item.id}
                className="bg-[#121212] border border-neutral-800 hover:border-neutral-600 transition-colors flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-neutral-900">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {item.badge && (
                    <div className="absolute top-3 left-3 bg-black/90 px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest uppercase text-yellow-400 border border-white/20">
                      {item.badge}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1">
                      <span className="font-ui uppercase tracking-wider">{item.category}</span>
                      <strong className="text-white text-sm tabular-nums font-bold">{item.price}</strong>
                    </div>
                    <h3 className="font-display font-black text-lg md:text-xl uppercase text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="font-ui text-xs text-neutral-400 mt-2 leading-relaxed">
                      {item.specs}
                    </p>
                  </div>

                  {/* Add to Bag Button */}
                  <div className="mt-5 pt-4 border-t border-neutral-800">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`min-h-[44px] w-full py-2.5 font-ui font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                        isAdded
                          ? 'bg-green-500 text-black'
                          : 'bg-white text-black hover:bg-yellow-400'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} />
                          <span>ADDED TO BAG</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} />
                          <span>ADD TO BAG {quantity > 0 ? `(${quantity})` : ''}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ethical Underground Guarantee */}
        <div className="mt-8 p-4 bg-neutral-900/50 border border-neutral-800 font-mono text-xs text-neutral-400 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-yellow-400" />
            <span>Printed on heavy sustainable cotton. Worldwide shipping via Berlin Post.</span>
          </div>
          <span className="text-white">FREE STICKER PACK INCLUDED WITH EVERY ORDER</span>
        </div>
      </div>
    </section>
  );
};
