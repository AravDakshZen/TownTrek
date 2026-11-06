import React, { useEffect, useState } from 'react';
import { Music, MapPin, Calendar, Clock, Ticket, AlertCircle, ArrowUpRight, X, User, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { PartyConcert } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCity } from '../context/CityContext';
import { AnimatedTicket } from '../components/ui/ticket-confirmation-card';
import { SlideActionButton } from '../components/ui/slide-action-button';
import { getConcertImage, FALLBACK_IMAGE } from '../utils/locationImages';

export const EntertainmentPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { toast } = useToast();
  const { selectedCity, matchesCity, isCityMatchingActive } = useCity();
  const [events, setEvents] = useState<PartyConcert[]>([]);
  const [category, setCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Selected Concert for viewing details & booking
  const [selectedEvent, setSelectedEvent] = useState<PartyConcert | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const fetchEvents = () => {
    setLoading(true);
    const url = category === 'ALL' ? '/parties' : `/parties?category=${category}`;
    api.get(url)
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, [category]);

  const handleCardClick = (event: PartyConcert) => {
    setSelectedEvent(event);
    setTicketCount(1);
    setConfirmedBookingData(null);
    setBookingError(null);
    if (user) {
      setCustomerName(user.fullName);
      setCustomerEmail(user.email);
    }
  };

  const handleDirectBooking = async () => {
    if (!selectedEvent) return;
    if (!isAuthenticated) {
      openAuthModal(`Sign in or create an account to book passes for "${selectedEvent.title}".`);
      return;
    }
    if (!customerName.trim() || !customerEmail.trim()) {
      setBookingError('Name and email are required to issue party passes.');
      toast.error('Missing Information', 'Please provide attendee name and email.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const res = await api.post('/parties/book', {
        eventId: selectedEvent.eventId,
        ticketsCount: ticketCount,
        customerName: customerName.trim(),
        userEmail: customerEmail.trim(),
      });
      localStorage.setItem('towntrek_last_booking_name', customerName.trim());
      localStorage.setItem('towntrek_last_booking_email', customerEmail.trim());
      if (res.data?.bookingId) {
        try {
          const stored = JSON.parse(localStorage.getItem('towntrek_booked_party_ids') || '[]');
          if (!stored.includes(res.data.bookingId)) {
            stored.push(res.data.bookingId);
            localStorage.setItem('towntrek_booked_party_ids', JSON.stringify(stored));
          }
        } catch (_) {}
      }
      
      const totalPrice = Number(selectedEvent.ticketPrice) * ticketCount;
      setConfirmedBookingData({
        bookingId: res.data?.bookingId || Math.floor(1000 + Math.random() * 9000),
        eventTitle: selectedEvent.title,
        venue: selectedEvent.venue,
        eventDate: selectedEvent.eventDate,
        eventTime: selectedEvent.eventTime,
        ticketCount,
        totalPrice,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
      });
      toast.success('Pass Confirmed!', `${selectedEvent.title} • ${ticketCount} Passes`);
      fetchEvents();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to complete booking.';
      setBookingError(msg);
      toast.error('Booking Failed', msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    handleDirectBooking();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-['Be_Vietnam_Pro',sans-serif]">
      {/* Filter categories & District Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-[24px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-3 font-['Be_Vietnam_Pro',sans-serif]">
            <Music className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            <span>Parties, Live Concerts &amp; Comedy Nights</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-light desc-lighter">
            Browse live performances, DJ sets, and standup shows. Click on any card to view artist details and issue passes.
          </p>
          {isCityMatchingActive && (
            <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
              <MapPin className="w-3.5 h-3.5" />
              <span>Matching district: <strong>{selectedCity}</strong></span>
            </div>
          )}
        </div>

        {/* Filter categories - Glass Type */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Shows' },
            { id: 'CONCERT', label: 'Concerts' },
            { id: 'CLUB_PARTY', label: 'Club Parties' },
            { id: 'COMEDY_NIGHT', label: 'Standup Comedy' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all border ${
                category === cat.id
                  ? 'bg-purple-500/25 border-purple-500/50 text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'bg-white/40 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/70 hover:border-purple-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading events from district database...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No events found in this category.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(isCityMatchingActive && events.some(e => matchesCity(`${e.city || ''} ${e.venue} ${e.location}`))
            ? events.filter(e => matchesCity(`${e.city || ''} ${e.venue} ${e.location}`))
            : events
          ).map((e) => {
            const imageUrl = getConcertImage(e.eventId);
            return (
              <div
                key={e.eventId}
                onClick={() => handleCardClick(e)}
                className="group cursor-pointer bg-card text-card-foreground rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Event Photo Header */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={imageUrl}
                    alt={e.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className="font-bold text-[11px] text-purple-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                      {e.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider">Performer</p>
                      <p className="text-white font-bold text-base drop-shadow-md">{e.artistPerformer}</p>
                    </div>
                    <div className="bg-purple-500/20 backdrop-blur-md border border-purple-400/40 text-purple-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                      ₹ {e.ticketPrice}
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-purple-500 transition-colors line-clamp-1">
                      {e.title}
                    </h3>
                    <p className="text-muted-foreground text-xs line-clamp-2 mt-1 leading-relaxed">
                      {e.description}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground border-t border-border pt-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="truncate">{e.venue}, {e.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>{e.eventDate}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>{e.eventTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">
                      Available: <strong className="text-foreground">{e.availableSeats} passes</strong>
                    </span>
                    <span className="inline-flex items-center space-x-1 text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
                      <span>View &amp; Book</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal with Crystal Glass Window & Blur */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 text-slate-900 dark:text-slate-100 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ring-1 ring-black/5 dark:ring-white/10 font-['Be_Vietnam_Pro',sans-serif]">
            {/* Modal Header */}
            <div className="relative h-44 w-full overflow-hidden bg-slate-950 shrink-0">
              <img
                src={getConcertImage(selectedEvent.eventId)}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/80 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest block mb-0.5">
                  {selectedEvent.category.replace('_', ' ')}
                </span>
                <h2 className="text-[24px] font-bold text-white drop-shadow font-['Be_Vietnam_Pro',sans-serif] leading-tight">
                  {selectedEvent.title}
                </h2>
                <p className="text-xs text-purple-200/90 font-light desc-lighter">Performer: {selectedEvent.artistPerformer}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              {confirmedBookingData ? (
                /* Confirmed Booking Pass View with AnimatedTicket */
                <div className="space-y-6">
                  <AnimatedTicket
                    ticketId={`#TT-CN-${confirmedBookingData.bookingId}`}
                    amount={confirmedBookingData.totalPrice}
                    date={new Date(confirmedBookingData.eventDate)}
                    cardHolder={confirmedBookingData.customerName}
                    eventTitle={confirmedBookingData.eventTitle}
                    venue={confirmedBookingData.venue}
                    seatCodes={`${confirmedBookingData.ticketCount} Attendee Pass(es)`}
                    status="CONFIRMED"
                  />

                  <div className="flex justify-center space-x-3 pt-2">
                    <a
                      href="/passes"
                      className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 shadow-md transition-colors"
                    >
                      View in My Passes
                    </a>
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(null)}
                      className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Booking Form */
                <form onSubmit={handleConfirmBooking} className="space-y-5">
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-100/70 dark:bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block font-medium">Date &amp; Time</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedEvent.eventDate} at {selectedEvent.eventTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block font-medium">Ticket Price</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">₹ {selectedEvent.ticketPrice} / pass</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-200/80 dark:border-white/10">
                      <span className="text-slate-500 dark:text-slate-400 block font-medium">Venue Address</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedEvent.venue}, {selectedEvent.location}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Description</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-100/70 dark:bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 font-light desc-lighter">
                      {selectedEvent.description}
                    </p>
                  </div>

                  {bookingError && (
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Attendee Name</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Aravindh Murugesh"
                        className="w-full px-4 py-2.5 text-xs rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white shadow-sm font-['Be_Vietnam_Pro',sans-serif]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Attendee Email</label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="name@district.com"
                        className="w-full px-4 py-2.5 text-xs rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white shadow-sm font-['Be_Vietnam_Pro',sans-serif]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Number of Passes</label>
                    <div className="flex items-center space-x-3">
                      <select
                        value={ticketCount}
                        onChange={(e) => setTicketCount(Number(e.target.value))}
                        className="px-4 py-2.5 text-xs rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-slate-900 dark:text-white"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>{n} Pass{n > 1 ? 'es' : ''}</option>
                        ))}
                      </select>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Total: <strong className="text-slate-900 dark:text-white text-sm">₹ {Number(selectedEvent.ticketPrice) * ticketCount}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Slide Action Button for Pass Booking */}
                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-3">
                    <div className="w-full">
                      <SlideActionButton
                        onComplete={handleDirectBooking}
                        disabled={bookingLoading}
                        className="w-full"
                      >
                        {bookingLoading ? 'Issuing Pass...' : `Slide to book pass • ₹${Number(selectedEvent.ticketPrice) * ticketCount}`}
                      </SlideActionButton>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
