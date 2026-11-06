import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ServiceCategory, ProviderProfile } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Star,
  CheckCircle,
  Calendar,
  Clock,
  ShieldCheck,
  Zap,
  Droplet,
  Thermometer,
  Wrench,
  Hammer,
  Paintbrush,
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }

    Promise.all([
      api.get('/services/categories').catch(() => ({ data: { data: [] } })),
      api.get('/services/providers').catch(() => ({ data: { data: [] } })),
    ])
      .then(([catsRes, provsRes]) => {
        setCategories(Array.isArray(catsRes.data?.data) ? catsRes.data.data : []);
        setProviders(Array.isArray(provsRes.data?.data) ? provsRes.data.data : []);
      })
      .catch((err) => {
        console.error(err);
        setCategories([]);
        setProviders([]);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const getCategoryIcon = (icon: string) => {
    switch (icon) {
      case 'Zap': return Zap;
      case 'Droplet': return Droplet;
      case 'Thermometer': return Thermometer;
      case 'Hammer': return Hammer;
      case 'Paintbrush': return Paintbrush;
      default: return Wrench;
    }
  };

  const filteredProviders = (providers || []).filter((p) => {
    if (!p) return false;
    const matchesCategory =
      selectedCategory === 'all' ||
      (p.categories || []).some((c: any) => (typeof c === 'string' ? c : c?._id) === selectedCategory);

    const businessName = p.businessName || '';
    const userName = p.user?.name || '';
    const bio = p.bio || '';
    const q = (searchQuery || '').toLowerCase();

    const matchesSearch =
      !q ||
      businessName.toLowerCase().includes(q) ||
      userName.toLowerCase().includes(q) ||
      bio.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const handleBook = (providerId: string, categoryId?: string) => {
    if (!user) {
      navigate('/login?redirect=/customer/book');
      return;
    }
    const catQuery = categoryId ? `&category=${categoryId}` : '';
    navigate(`/customer/book?provider=${providerId}${catQuery}`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading services and providers..." />;
  }

  return (
    <div className="bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Browse Verified Household Service Providers
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Compare licensed specialists, upfront hourly rates, and transparent customer ratings.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by specialist name, business, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat._id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Provider Cards */}
        {filteredProviders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No providers match your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <div
                key={provider._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-200 transition p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <img
                      src={provider.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.user.name}`}
                      alt={provider.user.name}
                      className="w-14 h-14 rounded-2xl border border-slate-200 object-cover bg-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {provider.user.name}
                        </h3>
                        {provider.isVerified && (
                          <span title="Verified License">
                            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-500 truncate">
                        {provider.businessName}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{provider.ratingAverage.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">({provider.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {provider.bio}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {provider.categories.map((c) => (
                      <span
                        key={c._id}
                        className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-medium"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400">Rate</span>
                    <p className="text-base font-bold text-slate-900">${provider.hourlyRate} <span className="text-xs font-normal text-slate-400">/hr</span></p>
                  </div>

                  <button
                    onClick={() => handleBook(provider.user.id || provider.user._id || '', provider.categories[0]?._id)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
