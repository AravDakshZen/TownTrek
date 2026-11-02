import React, { useEffect, useState } from 'react';
import { Music, MapPin, Calendar, Clock, Ticket, CheckCircle2, AlertCircle, ArrowUpRight, X, User, Mail, Sparkles } from 'lucide-react';
import api from '../services/api';
import { PartyConcert } from '../types';
import { useAuth } from '../context/AuthContext';
import { getConcertImage } from '../utils/locationImages';

export const EntertainmentPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
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
    if (!isAuthenticated) {
      openAuthModal(`Sign in or create an account to view artist details and book passes for "${event.title}".`);
      return;
    }
    setSelectedEvent(event);
    setTicketCount(1);
    setConfirmedBookingData(null);
    setBookingError(null);
    if (user) {
      setCustomerName(user.fullName);
      setCustomerEmail(user.email);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!customerName.trim() || !customerEmail.trim()) {
      setBookingError('Name and email are required to issue party passes.');
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
      fetchEvents();
    } catch (err: any) {
      setBookingError(err.response?.data?.error || 'Failed to complete booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
            <Music className="w-8 h-8 text-purple-600" />
            <span>Parties, Live Concerts &amp; Comedy Nights</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse live performances, DJ sets, and standup shows. Click on any card to view artist details and issue passes.
          </p>
        </div>

        {/* Filter categories */}
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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                category === cat.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading events from district database...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No events found in this category.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e) => {
            const imageUrl = getConcertImage(e.eventId);
            return (
              <div
                key={e.eventId}
                onClick={() => handleCardClick(e)}
                className="group cursor-pointer bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Event Photo Header */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={imageUrl}
                    alt={e.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className="font-bold text-[11px] text-purple-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                      {e.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="font-extrabold text-xs text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                      ₹ {e.ticketPrice}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                    <span className="truncate max-w-[200px] text-purple-200 font-semibold">
                      {e.artistPerformer}
                    </span>
                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[11px]">
                      {e.availableSlots} slots left
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors leading-snug">
                      {e.title}
                    </h2>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{e.venue} ({e.location})</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{e.eventDate} at {e.eventTime}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {e.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-purple-600 group-hover:underline flex items-center space-x-1">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Click to Select &amp; Book</span>
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Detail Modal & Booking Pass */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Header Image */}
            <div className="relative h-48 sm:h-56 w-full bg-slate-900 shrink-0 overflow-hidden">
              <img
                src={getConcertImage(selectedEvent.eventId)}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-900/60 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                  {selectedEvent.category.replace('_', ' ')}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold drop-shadow">{selectedEvent.title}</h2>
                <p className="text-xs text-purple-200">Performer: {selectedEvent.artistPerformer}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              {confirmedBookingData ? (
                /* Confirmed Booking Pass View */
                <div className="space-y-6 text-center">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pass Issued &amp; Confirmed</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">Your Concert Pass is Ready!</h3>
                    <p className="text-xs text-slate-500 mt-1">Pass ID: #{confirmedBookingData.bookingId} &bull; Synced with TownTrek District</p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Event:</span>
                      <span className="font-bold text-slate-900">{confirmedBookingData.eventTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Venue:</span>
                      <span className="font-bold text-slate-900">{confirmedBookingData.venue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date &amp; Time:</span>
                      <span className="font-bold text-slate-900">{confirmedBookingData.eventDate} at {confirmedBookingData.eventTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pass Holder:</span>
                      <span className="font-bold text-slate-900">{confirmedBookingData.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Passes Booked:</span>
                      <span className="font-bold text-purple-600">{confirmedBookingData.ticketCount} Attendee(s)</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                      <span className="font-bold text-slate-700">Total Paid:</span>
                      <span className="font-extrabold text-slate-900">₹ {confirmedBookingData.totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-3">
                    <a
                      href="/passes"
                      className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
                    >
                      View in My Passes
                    </a>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Booking Form */
                <form onSubmit={handleConfirmBooking} className="space-y-5">
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block font-medium">Date &amp; Time</span>
                      <span className="font-bold text-slate-800">{selectedEvent.eventDate} at {selectedEvent.eventTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Ticket Price</span>
                      <span className="font-bold text-purple-600">₹ {selectedEvent.ticketPrice} / pass</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block font-medium">Venue Address</span>
                      <span className="font-semibold text-slate-800">{selectedEvent.venue}, {selectedEvent.location}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Description</span>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                      {selectedEvent.description}
                    </p>
                  </div>

                  {bookingError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Attendee Name</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Aravindh Murugesh"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Attendee Email</label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="name@district.com"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Passes</label>
                    <div className="flex items-center space-x-3">
                      <select
                        value={ticketCount}
                        onChange={(e) => setTicketCount(Number(e.target.value))}
                        className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>{n} Pass{n > 1 ? 'es' : ''}</option>
                        ))}
                      </select>
                      <span className="text-xs text-slate-500">
                        Total: <strong className="text-slate-900 text-sm">₹ {Number(selectedEvent.ticketPrice) * ticketCount}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(null)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{bookingLoading ? 'Issuing Pass...' : `Confirm & Issue Pass (₹ ${Number(selectedEvent.ticketPrice) * ticketCount})`}</span>
                    </button>
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
