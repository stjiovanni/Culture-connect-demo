"use client";

import { useViewMode } from '@/context/ViewModeContext';
import { getProducts, getCompanies, getVoteCounts, Product } from '@/lib/data';
import seedData from '@/lib/seed.json';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { viewMode } = useViewMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (viewMode !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="glass-pill p-8 rounded-[16px] text-center max-w-md">
          <p className="heading text-[#DDD6F3]">Access Denied</p>
          <p className="body-text text-[#86847F]">Switch to Admin view in the navigation bar to see the dashboard.</p>
        </div>
      </div>
    );
  }

  const products = getProducts();
  const companies = getCompanies();
  const totalResidents = seedData.residents?.length || 0;
  const totalVotes = seedData.votes?.length || 0;

  // Rank products by yes votes
  const rankedProducts = products.map(p => {
    const votes = getVoteCounts(p.id);
    return { ...p, votes };
  }).sort((a, b) => b.votes.yes - a.votes.yes);

  // Companies with product count
  const companyStats = companies.map(c => {
    const count = products.filter(p => p.company_id === c.id).length;
    return { ...c, productCount: count };
  }).sort((a, b) => b.productCount - a.productCount);

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <div className="mb-2">
        <h1 className="heading font-serif text-white tracking-normal">Intelligence Dashboard</h1>
        <p className="body-text text-[#86847F]">Strategic overview of platform metrics and rankings.</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Offerings', value: products.length },
          { label: 'Partners', value: companies.length },
          { label: 'Citizens', value: totalResidents },
          { label: 'Engagement', value: totalVotes }
        ].map(stat => (
          <div key={stat.label} className="glass-pill p-8 rounded-[16px] flex flex-col justify-between h-40 border border-white/5 shadow-2xl">
            <span className="text-[10px] font-black tracking-tight text-[#86847F]">{stat.label}</span>
            <span className="text-5xl font-black text-white tracking-tighter">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Ranked Products Table */}
      <div className="glass-pill rounded-[16px] overflow-hidden border border-white/5 shadow-3xl">
        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
          <h2 className="heading font-bold text-white tracking-tight">Top Tier Rankings</h2>
          <span className="text-[10px] font-black text-[#86847F] tracking-tight">Based on Citizen Sentiment</span>
        </div>
        <div className="overflow-x-auto scroll-area">
          <table className="w-full text-left text-sm text-[#9E9B96]">
            <thead>
              <tr className="text-[10px] bg-white/[0.02] text-[#86847F] border-b border-white/5">
                <th className="px-8 py-5 font-black tracking-tight">Rank</th>
                <th className="px-8 py-5 font-black tracking-tight">Offering</th>
                <th className="px-8 py-5 font-black tracking-tight">Tier</th>
                <th className="px-8 py-5 font-black tracking-tight">Heritage</th>
                <th className="px-8 py-5 font-black tracking-tight text-right">Approval</th>
                <th className="px-8 py-5 font-black tracking-tight text-right">Contention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rankedProducts.map((p, index) => (
                <tr key={p.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-8 py-6 font-black text-[#6E5B98] text-lg">#{index + 1}</td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-base tracking-tight">{p.name}</span>
                      <span className="text-[11px] text-[#86847F] font-bold tracking-tight">ID: CC-{p.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-[100px] text-[9px] font-black tracking-tight text-[#DDD6F3]">{p.category}</span>
                  </td>
                  <td className="px-8 py-6 font-bold text-[#E8E6E1]">{p.company_name}</td>
                  <td className="px-8 py-6 text-right font-black text-white text-lg">{p.votes.yes}</td>
                  <td className="px-8 py-6 text-right font-bold text-[#86847F]">{p.votes.no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-pill rounded-[16px] overflow-hidden border border-white/5 shadow-3xl">
        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
          <h2 className="heading font-bold text-white tracking-tight">Heritage Directory</h2>
        </div>
        <div className="overflow-x-auto scroll-area">
          <table className="w-full text-left text-sm text-[#9E9B96]">
            <thead>
              <tr className="text-[10px] bg-white/[0.02] text-[#86847F] border-b border-white/5">
                <th className="px-8 py-5 font-black tracking-tight">Heritage Name</th>
                <th className="px-8 py-5 font-black tracking-tight">Domain</th>
                <th className="px-8 py-5 font-black tracking-tight">Intelligence</th>
                <th className="px-8 py-5 font-black tracking-tight text-right">Portfolio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {companyStats.map(c => (
                <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-8 py-6 font-bold text-white text-base tracking-tight">{c.name}</td>
                  <td className="px-8 py-6">
                    <span className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-[100px] text-[9px] font-black tracking-tight text-[#DDD6F3]">{c.category}</span>
                  </td>
                  <td className="px-8 py-6 font-medium text-[#86847F]">{c.contact_email}</td>
                  <td className="px-8 py-6 text-right font-black text-white text-lg">{c.productCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
