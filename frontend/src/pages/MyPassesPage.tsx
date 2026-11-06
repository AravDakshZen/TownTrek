import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, Film, Music, Calendar, LogIn, RefreshCw, Eye, Sparkles, Layers } from 'lucide-react';
import api from '../services/api';
import { MovieBookingDetail, PartyBooking, EventRegistration } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AnimatedTicket } from '../components/ui/ticket-confirmation-card';

export const MyPassesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [movieBookings, setMovieBookings] = useState<MovieBookingDetail[]>([]);
  const [partyBookings, setPartyBookings] = useState<PartyBooking[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'MOVIES' | 'PARTIES' | 'EVENTS'>('ALL');
  const [showAllDistrictPasses, setShowAllDistrictPasses] = useState(false);

  const fetchPasses = () => {
    if (!isAuthenticated || !user) {
      setMovieBookings([]);
      setPartyBookings([]);
      setEventRegistrations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();

    if (showAllDistrictPasses) {
      params.append('all', 'true');
    } else {
      if (user.fullName) params.append('name', user.fullName);
      if (user.email) params.append('email', user.email);

      const altName = localStorage.getItem('towntrek_last_booking_name');
      const altEmail = localStorage.getItem('towntrek_last_booking_email');
      if (altName && altName !== user.fullName) params.append('altName', altName);
      if (altEmail && altEmail !== user.email) params.append('altEmail', altEmail);

      try {
        const movieIds = JSON.parse(localStorage.getItem('towntrek_booked_movie_ids') || '[]');
        if (movieIds.length) params.append('movieIds', movieIds.join(','));
        const partyIds = JSON.parse(localStorage.getItem('towntrek_booked_party_ids') || '[]');
        if (partyIds.length) params.append('partyIds', partyIds.join(','));
        const eventIds = JSON.parse(localStorage.getItem('towntrek_booked_event_ids') || '[]');
        if (eventIds.length) params.append('eventIds', eventIds.join(','));
      } catch (_) {}
    }

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
  }, [isAuthenticated, user, showAllDistrictPasses]);

  const handleCancelMovie = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this cinema ticket?')) return;
    try {
      let res;
      try {
        res = await api.post(`/passes/movies/${bookingId}/cancel`);
      } catch {
        res = await api.post(`/movies/cancel/${bookingId}`);
      }
      if (res.data?.success) {
        toast.success('Cinema Pass Cancelled', 'Seats have been released back to availability.');
        fetchPasses();
      } else {
        toast.error('Cancellation Failed', res.data?.message || 'Unable to cancel pass.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to cancel movie pass.';
      toast.error('Error', msg);
    }
  };

  const handleCancelParty = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this concert pass?')) return;
    try {
      let res;
      try {
        res = await api.post(`/passes/parties/${bookingId}/cancel`);
      } catch {
        res = await api.post(`/parties/cancel/${bookingId}`);
      }
      if (res.data?.success) {
        toast.success('Concert Pass Cancelled', 'Pass released back to available slots.');
        fetchPasses();
      } else {
        toast.error('Cancellation Failed', res.data?.message || 'Unable to cancel pass.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to cancel concert pass.';
      toast.error('Error', msg);
    }
  };

  const handleCancelEvent = async (regId: number) => {
    if (!window.confirm('Are you sure you want to cancel this workshop RSVP?')) return;
    try {
      let res;
      try {
        res = await api.post(`/passes/events/${regId}/cancel`);
      } catch {
        res = await api.post(`/events/cancel/${regId}`);
      }
      if (res.data?.success) {
        toast.success('Workshop Cancelled', 'Your RSVP has been removed.');
        fetchPasses();
      } else {
        toast.error('Cancellation Failed', res.data?.message || 'Unable to cancel RSVP.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to cancel registration.';
      toast.error('Error', msg);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-brand-500/10 text-brand-600 rounded-3xl flex items-center justify-center mx-auto">
          <Ticket className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Sign In to View Passes</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Access all your movie cinema tickets, concert VIP passes, and workshop RSVPs in one liquid wallet.
          </p>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg transition-all"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to TownTrek</span>
        </button>
      </div>
    );
  }

  const parseSafeDate = (dateStr?: string) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const allUnifiedPasses = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'MOVIE' | 'PARTY' | 'EVENT';
      typeLabel: string;
      ticketId: string;
      amount: number;
      date: Date;
      cardHolder: string;
      last4Digits: string;
      barcodeValue: string;
      eventTitle: string;
      venue: string;
      seatCodes: string;
      status: string;
      onCancel: () => void;
      timestamp: number;
    }> = [];

    movieBookings.forEach((b) => {
      const d = parseSafeDate(b.showDate);
      list.push({
        id: `movie-${b.bookingId}`,
        type: 'MOVIE',
        typeLabel: 'Cinema Ticket',
        ticketId: `CINE-${b.bookingId}`,
        amount: b.totalAmount,
        date: d,
        cardHolder: b.customerName || user?.fullName || 'TownTrek Guest',
        last4Digits: '8237',
        barcodeValue: `28937${b.bookingId}7365`,
        eventTitle: b.movieName,
        venue: `${b.theatreName} (${b.showTime})`,
        seatCodes: b.seats || b.seatCodes,
        status: b.bookingStatus,
        onCancel: () => handleCancelMovie(b.bookingId),
        timestamp: b.bookingDate ? new Date(b.bookingDate).getTime() : d.getTime(),
      });
    });

    partyBookings.forEach((p) => {
      const d = parseSafeDate(p.eventDate);
      list.push({
        id: `party-${p.bookingId}`,
        type: 'PARTY',
        typeLabel: 'Concert & Gig Pass',
        ticketId: `GIG-${p.bookingId}`,
        amount: p.totalAmount || p.totalPrice || 0,
        date: d,
        cardHolder: p.customerName || user?.fullName || 'TownTrek Guest',
        last4Digits: '4190',
        barcodeValue: `84931${p.bookingId}9201`,
        eventTitle: p.eventTitle,
        venue: `${p.venue} (${p.eventTime})`,
        seatCodes: `${p.ticketsCount || p.ticketCount || 1} Pass(es)`,
        status: p.status || p.bookingStatus || 'CONFIRMED',
        onCancel: () => handleCancelParty(p.bookingId),
        timestamp: p.bookingDate ? new Date(p.bookingDate).getTime() : d.getTime(),
      });
    });

    eventRegistrations.forEach((e) => {
      const d = parseSafeDate(e.eventDate);
      list.push({
        id: `event-${e.regId}`,
        type: 'EVENT',
        typeLabel: 'Workshop & Masterclass',
        ticketId: `WKSP-${e.regId}`,
        amount: e.totalAmount || e.totalFee || 0,
        date: d,
        cardHolder: e.customerName || user?.fullName || 'TownTrek Guest',
        last4Digits: '6124',
        barcodeValue: `55092${e.regId}1198`,
        eventTitle: e.eventTitle,
        venue: e.venue || 'Metropolitan Workshop Arena',
        seatCodes: `${e.ticketsCount || e.attendeeCount || 1} Attendee(s)`,
        status: e.status || 'CONFIRMED',
        onCancel: () => handleCancelEvent(e.regId),
        timestamp: e.regDate ? new Date(e.regDate).getTime() : d.getTime(),
      });
    });

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [movieBookings, partyBookings, eventRegistrations, user]);

  const totalPasses = movieBookings.length + partyBookings.length + eventRegistrations.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-['Be_Vietnam_Pro',sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-[24px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-3 font-['Be_Vietnam_Pro',sans-serif]">
            <Ticket className="w-7 h-7 text-brand-600 dark:text-sky-400" />
            <span>My Liquid District Passes</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 font-light desc-lighter">
            Personal ticketing wallet for {user.fullName} ({user.email}) • {totalPasses} Active Pass(es)
          </p>
        </div>

        {/* Action Controls: Refresh & Filter Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setShowAllDistrictPasses((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border ${
              showAllDistrictPasses
                ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-brand-500'
            }`}
            title="Toggle between my personalized passes and all passes issued on this device"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showAllDistrictPasses ? 'Showing All Device Passes' : 'My Passes Only'}</span>
          </button>

          <button
            type="button"
            onClick={fetchPasses}
            disabled={loading}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-sky-400 transition-colors shadow-sm"
            title="Refresh passes from database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab Switcher - All Unified Passes Filter Included */}
      <div className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'ALL'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Passes ({allUnifiedPasses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('MOVIES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'MOVIES'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Movies ({movieBookings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('PARTIES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'PARTIES'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Concerts ({partyBookings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'EVENTS'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Workshops ({eventRegistrations.length})</span>
        </button>
      </div>

      {/* Main Content Area with AnimatedTicket confirmation cards */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          Loading your verified passes...
        </div>
      ) : (
        <div>
          {/* ALL PASSES (UNIFIED VIEW) TAB */}
          {activeTab === 'ALL' && (
            <div>
              {allUnifiedPasses.length === 0 ? (
                <div className="rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    You have not booked any district passes yet.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAllDistrictPasses(true)}
                      className="px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold hover:bg-brand-100 transition-colors flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Show All Passes Issued On Device</span>
                    </button>
                    <Link to="/movies" className="inline-block text-xs font-bold text-brand-600 dark:text-sky-400 hover:underline">
                      Browse Movies &rarr;
                    </Link>
                    <Link to="/entertainment" className="inline-block text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
                      Browse Concerts &rarr;
                    </Link>
                    <Link to="/events" className="inline-block text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                      Browse Workshops &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                  {allUnifiedPasses.map((pass) => (
                    <div key={pass.id} className="w-full flex flex-col items-center space-y-2.5">
                      <div className="self-center">
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border ${
                          pass.type === 'MOVIE'
                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                            : pass.type === 'PARTY'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}>
                          {pass.type === 'MOVIE' && <Film className="w-3 h-3" />}
                          {pass.type === 'PARTY' && <Music className="w-3 h-3" />}
                          {pass.type === 'EVENT' && <Calendar className="w-3 h-3" />}
                          <span>{pass.typeLabel}</span>
                        </span>
                      </div>
                      <AnimatedTicket
                        ticketId={pass.ticketId}
                        amount={pass.amount}
                        date={pass.date}
                        cardHolder={pass.cardHolder}
                        last4Digits={pass.last4Digits}
                        barcodeValue={pass.barcodeValue}
                        eventTitle={pass.eventTitle}
                        venue={pass.venue}
                        seatCodes={pass.seatCodes}
                        status={pass.status}
                        onCancel={pass.onCancel}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* MOVIES TAB */}
          {activeTab === 'MOVIES' && (
            <div>
              {movieBookings.length === 0 ? (
                <div className="rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    You have not booked any cinema passes matching &quot;{user.fullName}&quot; yet.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAllDistrictPasses(true)}
                      className="px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold hover:bg-brand-100 transition-colors flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Show All Cinema Bookings Issued</span>
                    </button>
                    <Link to="/movies" className="inline-block text-xs font-bold text-brand-600 dark:text-sky-400 hover:underline">
                      Browse Movies &amp; Cinemas &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                  {movieBookings.map((b) => (
                    <AnimatedTicket
                      key={b.bookingId}
                      ticketId={`CINE-${b.bookingId}`}
                      amount={b.totalAmount}
                      date={parseSafeDate(b.showDate)}
                      cardHolder={b.customerName || user.fullName}
                      last4Digits="8237"
                      barcodeValue={`28937${b.bookingId}7365`}
                      eventTitle={b.movieName}
                      venue={`${b.theatreName} (${b.showTime})`}
                      seatCodes={b.seats || b.seatCodes}
                      status={b.bookingStatus}
                      onCancel={() => handleCancelMovie(b.bookingId)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONCERTS TAB */}
          {activeTab === 'PARTIES' && (
            <div>
              {partyBookings.length === 0 ? (
                <div className="rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    You have not booked any concert passes matching &quot;{user.fullName}&quot; yet.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAllDistrictPasses(true)}
                      className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-colors flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Show All Concert Passes Issued</span>
                    </button>
                    <Link to="/entertainment" className="inline-block text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
                      Browse Concerts &amp; Gigs &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                  {partyBookings.map((p) => (
                    <AnimatedTicket
                      key={p.bookingId}
                      ticketId={`GIG-${p.bookingId}`}
                      amount={p.totalAmount || p.totalPrice || 0}
                      date={parseSafeDate(p.eventDate)}
                      cardHolder={p.customerName || user.fullName}
                      last4Digits="4190"
                      barcodeValue={`84931${p.bookingId}9201`}
                      eventTitle={p.eventTitle}
                      venue={`${p.venue} (${p.eventTime})`}
                      seatCodes={`${p.ticketsCount || p.ticketCount || 1} Pass(es)`}
                      status={p.status || p.bookingStatus || 'CONFIRMED'}
                      onCancel={() => handleCancelParty(p.bookingId)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'EVENTS' && (
            <div>
              {eventRegistrations.length === 0 ? (
                <div className="rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    You have not registered for any workshops matching &quot;{user.fullName}&quot; yet.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAllDistrictPasses(true)}
                      className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Show All Workshop RSVPs Issued</span>
                    </button>
                    <Link to="/events" className="inline-block text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                      Browse Workshops &amp; Carnivals &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                  {eventRegistrations.map((e) => (
                    <AnimatedTicket
                      key={e.regId}
                      ticketId={`WKSP-${e.regId}`}
                      amount={e.totalAmount || e.totalFee || 0}
                      date={parseSafeDate(e.eventDate)}
                      cardHolder={e.customerName || user.fullName}
                      last4Digits="6124"
                      barcodeValue={`55092${e.regId}1198`}
                      eventTitle={e.eventTitle}
                      venue={e.venue || 'Metropolitan Workshop Arena'}
                      seatCodes={`${e.ticketsCount || e.attendeeCount || 1} Attendee(s)`}
                      status={e.status || 'CONFIRMED'}
                      onCancel={() => handleCancelEvent(e.regId)}
                    />
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

export default MyPassesPage;
