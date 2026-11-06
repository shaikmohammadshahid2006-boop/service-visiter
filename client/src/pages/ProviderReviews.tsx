import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Review } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Star, User, Calendar, MessageSquare } from 'lucide-react';

export const ProviderReviews: React.FC = () => {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get(`/reviews/provider/${user.id}`)
        .then((res) => setReviews(res.data.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return <LoadingSpinner message="Loading your customer reviews..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Ratings & Reviews</h1>
        <p className="text-xs text-slate-500 mt-1">
          Feedback submitted by customers upon completing service sign-offs.
        </p>
      </div>

      {/* Aggregate Score Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center gap-6">
        <div className="text-center pr-6 border-r border-slate-100">
          <span className="text-4xl font-black text-slate-900">
            {profile?.ratingAverage?.toFixed(1) || '5.0'}
          </span>
          <div className="flex items-center justify-center gap-1 mt-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {profile?.reviewCount || reviews.length} verified reviews
          </span>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900">Verified Quality Rating</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
            Every review on ServiceVisit Tracker is tied to a verified digital sign-off and locked work order. No fake or unverified reviews.
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        {reviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No reviews submitted yet. They will appear here when customers complete sign-offs.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={r.customer?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.customer?.name}`}
                      alt=""
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{r.customer?.name}</h4>
                      <div className="flex items-center gap-0.5 text-amber-400 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= r.rating ? 'fill-current text-amber-400' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed pl-10">
                  "{r.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

