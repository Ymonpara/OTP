'use client';

import React, { useState } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import { ServiceItem } from '@/types';
import { ServiceIcon } from '@/components/ServiceIcon';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';

export default function AdminServicesPage() {
  const { services, updateService, toggleServiceStatus } = usePlatform();
  const [search, setSearch] = useState('');
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Edit form states
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [minMargin, setMinMargin] = useState<number>(0);
  const [maxProviderCost, setMaxProviderCost] = useState<number>(0);

  const handleOpenEdit = (s: ServiceItem) => {
    setEditingService(s);
    setSellingPrice(s.sellingPrice);
    setMinMargin(s.minimumMargin);
    setMaxProviderCost(s.maximumProviderCost);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    updateService(editingService.id, {
      sellingPrice,
      minimumMargin: minMargin,
      maximumProviderCost: maxProviderCost,
    });
    setEditingService(null);
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase()) ||
    s.serviceCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Service Pricing & Margins</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Section 12 & 31: Configure customer selling prices, minimum profit margins, and max provider cost limits.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Filter services by name, slug or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
        />
      </div>

      {/* Services Table */}
      <div className="rounded-2xl glass-panel border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Service Name</th>
                <th className="px-4 py-3">Service Code</th>
                <th className="px-4 py-3">Selling Price (₹)</th>
                <th className="px-4 py-3">Est. Provider Cost</th>
                <th className="px-4 py-3">Min. Margin (₹)</th>
                <th className="px-4 py-3">Max Provider Cost (₹)</th>
                <th className="px-4 py-3">Active Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-zinc-900/40 transition">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <ServiceIcon name={service.iconName} className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white">{service.name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 font-mono text-zinc-400">{service.serviceCode}</td>

                  <td className="px-4 py-3.5 font-mono font-bold text-emerald-400 text-sm">
                    ₹{service.sellingPrice.toFixed(2)}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-zinc-400">
                    ₹{service.providerCostEstimate.toFixed(2)}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-purple-300 font-semibold">
                    ₹{service.minimumMargin.toFixed(2)}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-rose-300">
                    ₹{service.maximumProviderCost.toFixed(2)}
                  </td>

                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleServiceStatus(service.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition flex items-center gap-1 ${
                        service.enabled
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                      }`}
                    >
                      {service.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(service)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-purple-600 hover:text-white text-zinc-300 transition text-xs font-semibold flex items-center gap-1 ml-auto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Price</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Pricing Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-sm text-white">
                Edit Pricing: {editingService.name}
              </h3>
              <button
                onClick={() => setEditingService(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">
                  Customer Selling Price (₹)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  The exact price customer will be charged upon order.
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">
                  Minimum Protected Margin (₹)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={minMargin}
                  onChange={(e) => setMinMargin(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-purple-300 font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">
                  Maximum Provider Cost Cap (₹)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={maxProviderCost}
                  onChange={(e) => setMaxProviderCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-rose-300 font-mono text-xs focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Section 29: If carrier price is higher than this, backend will abort order purchase.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
