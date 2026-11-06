import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ServiceCategory, ProviderProfile } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Star,
  ShieldCheck,
  AlertCircle,
  FileText,
  Zap,
  Droplet,
  Thermometer,
  Wrench,
  Hammer,
  Paintbrush,
} from 'lucide-react';

export const BookServicePage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [step, setStep] = useState<number>(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>('09:00 AM - 11:00 AM');
  const [description, setDescription] = useState<string>('');
  const [street, setStreet] = useState<string>(profile?.address?.street || '');
  const [city, setCity] = useState<string>(profile?.address?.city || '');
  const [state, setState] = useState<string>(profile?.address?.state || '');
  const [zipCode, setZipCode] = useState<string>(profile?.address?.zipCode || '');
  const [landmark, setLandmark] = useState<string>(profile?.address?.landmark || '');

  useEffect(() => {
    Promise.all([
      api.get('/services/categories'),
      api.get('/services/providers'),
    ])
      .then(([catsRes, provsRes]) => {
        setCategories(catsRes.data.data);
        setProviders(provsRes.data.data);

        // Check if preselected in query
        const catParam = searchParams.get('category');
        const provParam = searchParams.get('provider');

        if (catParam) setSelectedCategoryId(catParam);
        if (provParam) {
          setSelectedProviderId(provParam);
          setStep(2);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const selectedCategory = categories.find((c) => c._id === selectedCategoryId);
  const selectedProvider = providers.find((p) => p.user.id === selectedProviderId);

  const availableProvidersForCategory = providers.filter((p) =>
    !selectedCategoryId || p.categories.some((c) => c._id === selectedCategoryId)
  );

  const timeSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '01:00 PM - 03:00 PM',
    '03:00 PM - 05:00 PM',
    '05:00 PM - 07:00 PM',
  ];

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

  const calculateEstimate = () => {
    if (!selectedCategory) return 0;
    if (selectedProvider) {
      return selectedProvider.hourlyRate * selectedCategory.estimatedDurationHours;
    }
    return selectedCategory.basePrice;
  };

  const handleSubmitBooking = async () => {
    if (!selectedProviderId || !selectedCategoryId || !description || !street || !city || !state || !zipCode) {
      setError('Please fill in all required fields before confirming.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const payload = {
        providerId: selectedProviderId,
        categoryId: selectedCategoryId,
        appointmentDate,
        timeSlot,
        address: {
          street,
          city,
          state,
          zipCode,
          landmark,
        },
        description,
        estimatedCost: calculateEstimate(),
      };

      const res = await api.post('/appointments', payload);
      if (res.data.success) {
        navigate('/customer/my-appointments');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Preparing booking portal..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Book a Home Service Appointment
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Define clear project scope, select certified specialists, and lock your initial estimate.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { num: 1, label: 'Category' },
            { num: 2, label: 'Specialist' },
            { num: 3, label: 'Schedule' },
            { num: 4, label: 'Scope & Review' },
          ].map((item, idx) => (
            <React.Fragment key={item.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    step >= item.num
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {item.num}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${step >= item.num ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
              {idx < 3 && <div className={`flex-1 h-0.5 mx-2 ${step > item.num ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Select Category */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Step 1: Choose Service Category</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select the category that matches your household repair or installation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              const isSelected = selectedCategoryId === cat._id;
              return (
                <div
                  key={cat._id}
                  onClick={() => setSelectedCategoryId(cat._id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{cat.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Est. duration: ~{cat.estimatedDurationHours}h</span>
                    <span className="font-bold text-slate-900">${cat.basePrice} base</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                if (!selectedCategoryId) {
                  setError('Please select a service category to proceed.');
                  return;
                }
                setError('');
                setStep(2);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1.5"
            >
              <span>Next: Select Specialist</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Specialist */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 2: Choose Service Provider</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing specialists for <span className="font-semibold text-slate-800">{selectedCategory?.name}</span>
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableProvidersForCategory.map((p) => {
              const isSelected = selectedProviderId === p.user.id;
              return (
                <div
                  key={p._id}
                  onClick={() => setSelectedProviderId(p.user.id || p.user._id || '')}
                  className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <img
                        src={p.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user.name}`}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{p.user.name}</h4>
                          {p.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{p.businessName}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-amber-500 text-xs font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{p.ratingAverage.toFixed(1)}</span>
                          <span className="text-slate-400 font-normal">({p.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-600 line-clamp-2">{p.bio}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{p.experienceYears} yrs experience</span>
                    <span className="font-bold text-slate-900 text-sm">${p.hourlyRate} / hr</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!selectedProviderId) {
                  setError('Please select a service provider to proceed.');
                  return;
                }
                setError('');
                setStep(3);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1.5"
            >
              <span>Next: Pick Date & Time</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Schedule Date & Time Slot */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 3: Appointment Date & Time Window</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select when you would like the specialist to arrive on-site.</p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Preferred Appointment Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Available Arrival Window
              </label>
              <div className="space-y-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`w-full p-2.5 text-xs font-medium rounded-xl border text-left flex items-center justify-between transition ${
                      timeSlot === slot
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{slot}</span>
                    {timeSlot === slot && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!appointmentDate || !timeSlot) {
                  setError('Please select appointment date and arrival slot.');
                  return;
                }
                setError('');
                setStep(4);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1.5"
            >
              <span>Next: Address & Work Scope</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Scope Description, Address & Confirmation */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 4: Service Scope & Address</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Describe the requested work in detail. This becomes the locked initial scope.
              </p>
            </div>
            <button
              onClick={() => setStep(3)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          {/* Scope Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Detailed Description of Required Work <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Be specific about what requires fixing or installing. This protects you from scope disputes.
            </p>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Master bathroom faucet dripping constantly, water shut-off valve beneath vanity is stuck, and drain stopper is disconnected..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address Fields */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Service Location Address
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Street Address</label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="742 Evergreen Terrace"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Springfield"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="OR"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Zip Code</label>
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="97477"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Landmark / Access Instructions (Optional)</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Gate code #4021, ring front bell"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Cost Estimate Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500">Initial Estimated Cost</span>
              <p className="text-xs text-slate-400 mt-0.5">
                Based on {selectedCategory?.estimatedDurationHours || 2} hours @ ${selectedProvider?.hourlyRate || 75}/hr
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900">${calculateEstimate()}</span>
              <p className="text-[10px] text-slate-400">Locked agreement estimate</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmitBooking}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <span>{submitting ? 'Submitting Booking...' : 'Confirm & Send Booking Request'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
