import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, Film, Music, Calendar, CheckCircle2, RotateCcw, AlertCircle, LogIn } from 'lucide-react';
import api from '../services/api';
import { MovieBookingDetail, PartyBooking, EventRegistration } from '../types';
import { useAuth } from '../context/AuthContext';

export const MyPassesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [movieBookings, setMovieBookings] = useState<MovieBookingDetail[]>([]);
  const [partyBookings, setPartyBookings] = useState<PartyBooking[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'MOVIES' | 'PARTIES' | 'EVENTS'>('MOVIES');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchPasses = () => {
    // If not authenticated or registered, strictly show 0 passes
    if (!isAuthenticated || !user) {
      setMovieBookings([]);
      setPartyBookings([]);
      setEventRegistrations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Fetch only the passes belonging to the signed-in user
    const params = new URLSearchParams();
    if (user.fullName) params.append('name', user.fullName);
    if (user.email) params.append('email', user.email);

    api.get(`/passes/all?${params.toString()}`)
      .then((res) => {
        setMovieBookings(res.data.movieBookings || []);
        setPartyBookings(res.data.partyBookings || []);
        setEventRegistrations(res.data.eventRegistrations || []);
      })
      .catch((err) => {
        console.error('Failed to load passes', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPasses();
  }, [isAuthenticated, user]);

  const handleCancelMovie = async (bookingId: number) => {
    if (!window.confirm(`Are you sure you want to cancel Movie Booking #${bookingId}?`)) return;
    try {
      await api.delete(`/movies/bookings/${bookingId}`);
      setActionMessage(`Movie Booking #${bookingId} successfully cancelled.`);
      fetchPasses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel movie booking.');
    }
  };

  const handleCancelParty = async (bookingId: number) => {
    if (!window.confirm(`Cancel Concert Pass #${bookingId}?`)) return;
    try {
      await api.delete(`/parties/bookings/${bookingId}`);
      setActionMessage(`Concert Pass #${bookingId} successfully cancelled.`);
      fetchPasses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel concert booking.');
    }
  };

  const handleCancelEvent = async (regId: number) => {
    if (!window.confirm(`Cancel Workshop Registration #${regId}?`)) return;
    try {
      await api.delete(`/events/registrations/${regId}`);
      setActionMessage(`Workshop Registration #${regId} cancelled.`);
      fetchPasses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel workshop registration.');
    }
  };

  // If user is not authenticated/registered, display strict prompt and 0 passes
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border border-amber-100">
          <Ticket className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">Member Sign In Required</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            You must be signed in to view your booked passes. If you do not have an account, please create one or sign in.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to View Passes</span>
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  const totalPassCount = movieBookings.length + partyBookings.length + eventRegistrations.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header displaying User Profile Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg border border-brand-100">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{user.fullName}</h1>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Active Passes</span>
            <span className="text-lg font-extrabold text-brand-600">{totalPassCount} Pass{totalPassCount !== 1 ? 'es' : ''}</span>
          </div>
          <button
            onClick={fetchPasses}
            title="Refresh Passes"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('MOVIES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'MOVIES'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Movie Passes ({movieBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PARTIES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'PARTIES'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Concert Passes ({partyBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'EVENTS'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Workshops ({eventRegistrations.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading your passes from MySQL database...</div>
      ) : (
        <div>
          {/* MOVIES TAB */}
          {activeTab === 'MOVIES' && (
            <div>
              {movieBookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <p className="text-slate-500 text-sm font-medium">You have not booked any movie passes yet.</p>
                  <Link to="/movies" className="inline-block text-xs font-bold text-brand-600 hover:underline">
                    Browse Movies &amp; Choose Seats &rarr;
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {movieBookings.map((b) => (
                    <div
                      key={b.bookingId}
                      className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                            Pass #{b.bookingId}
                          </span>
                          <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {b.bookingStatus}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">{b.movieName}</h3>

                        <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <p><strong className="text-slate-700">Cinema:</strong> {b.theatreName}</p>
                          <p><strong className="text-slate-700">Schedule:</strong> {b.showDate} at {b.showTime}</p>
                          <p><strong className="text-slate-700">Seats:</strong> <span className="font-bold text-brand-600">{b.seats}</span></p>
                          <p><strong className="text-slate-700">Total Paid:</strong> ₹ {b.totalAmount}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">{b.bookingDate}</span>
                        {b.bookingStatus === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancelMovie(b.bookingId)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                          >
                            Cancel Pass
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONCERTS TAB */}
          {activeTab === 'PARTIES' && (
            <div>
              {partyBookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <p className="text-slate-500 text-sm font-medium">You have not booked any concert passes yet.</p>
                  <Link to="/entertainment" className="inline-block text-xs font-bold text-purple-600 hover:underline">
                    Browse Concerts &amp; Gigs &rarr;
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {partyBookings.map((p) => (
                    <div
                      key={p.bookingId}
                      className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                            Pass #{p.bookingId}
                          </span>
                          <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {p.status}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">{p.eventTitle}</h3>

                        <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <p><strong className="text-slate-700">Venue:</strong> {p.venue}</p>
                          <p><strong className="text-slate-700">Schedule:</strong> {p.eventDate} at {p.eventTime}</p>
                          <p><strong className="text-slate-700">Tickets:</strong> {p.ticketCount} Attendee(s)</p>
                          <p><strong className="text-slate-700">Total Amount:</strong> ₹ {p.totalPrice}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">{p.bookingDate}</span>
                        {p.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancelParty(p.bookingId)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                          >
                            Cancel Pass
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'EVENTS' && (
            <div>
              {eventRegistrations.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <p className="text-slate-500 text-sm font-medium">You have not registered for any workshops yet.</p>
                  <Link to="/events" className="inline-block text-xs font-bold text-amber-600 hover:underline">
                    Browse Workshops &amp; Carnivals &rarr;
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventRegistrations.map((e) => (
                    <div
                      key={e.regId}
                      className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                            Reg #{e.regId}
                          </span>
                          <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {e.status}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">{e.eventTitle}</h3>

                        <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <p><strong className="text-slate-700">Venue:</strong> {e.venue}</p>
                          <p><strong className="text-slate-700">Schedule:</strong> {e.eventDate} at {e.eventTime}</p>
                          <p><strong className="text-slate-700">Attendees:</strong> {e.attendeeCount}</p>
                          <p><strong className="text-slate-700">Total Fee:</strong> {Number(e.totalFee) === 0 ? 'FREE' : `₹ ${e.totalFee}`}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">{e.regDate}</span>
                        {e.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancelEvent(e.regId)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                          >
                            Cancel Registration
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
