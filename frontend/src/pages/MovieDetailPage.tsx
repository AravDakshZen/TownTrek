import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Film, MapPin, Calendar, Clock, Tag, CheckCircle2, AlertCircle, Utensils, Plus, Minus, Popcorn } from 'lucide-react';
import api from '../services/api';
import { Movie, Show, Seat, MovieBookingDetail } from '../types';
import { SeatMap } from '../components/SeatMap';
import { useAuth } from '../context/AuthContext';
import { getMovieImage } from '../utils/locationImages';
import { CINEMA_SNACKS, SnackAddon } from '../utils/cinemaSnacks';

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  // Snack addons state: key is snack id, value is quantity
  const [selectedSnacks, setSelectedSnacks] = useState<Record<string, number>>({});

  const [couponCode, setCouponCode] = useState('');
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<MovieBookingDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/movies/${id}`).then((res) => setMovie(res.data)),
      api.get(`/movies/${id}/shows`).then((res) => {
        setShows(res.data);
        if (res.data.length > 0) {
          setSelectedShow(res.data[0]);
        }
      }),
    ]).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (selectedShow) {
      setSelectedSeats([]);
      api.get(`/movies/shows/${selectedShow.showId}/seats`)
        .then((res) => setSeats(res.data))
        .catch(() => setSeats([]));
    }
  }, [selectedShow]);

  const toggleSeat = (code: string) => {
    setSelectedSeats((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleUpdateSnack = (snackId: string, delta: number) => {
    setSelectedSnacks((prev) => {
      const current = prev[snackId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[snackId];
        return copy;
      }
      return { ...prev, [snackId]: next };
    });
  };

  // Base seat cost
  const seatBaseTotal = selectedSeats.reduce((acc, code) => {
    const seat = seats.find((s) => s.seatCode.toUpperCase() === code.toUpperCase());
    return acc + (seat ? Number(seat.price) : 0);
  }, 0);

  // Snack addons total cost
  const snackTotal = Object.entries(selectedSnacks).reduce((sum, [snackId, qty]) => {
    const item = CINEMA_SNACKS.find((s) => s.id === snackId);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  // Coupon discount on seats
  const isCouponValid = couponCode.trim().toUpperCase() === 'CINE10';
  const seatDiscount = isCouponValid ? Math.round(seatBaseTotal * 0.10 * 100) / 100 : 0;
  const seatFinalTotal = seatBaseTotal - seatDiscount;

  // Combined Grand Total
  const grandTotal = Math.round((seatFinalTotal + snackTotal) * 100) / 100;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShow || !movie) return;
    if (selectedSeats.length === 0) {
      setBookingError('Please choose at least one seat from the seat map.');
      return;
    }
    if (!customerName.trim()) {
      setBookingError('Please provide your name for the ticket.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const payload = {
        showId: selectedShow.showId,
        movieId: movie.movieId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        seatCodes: selectedSeats,
        couponCode: couponCode.trim() || undefined,
      };

      const res = await api.post('/movies/book', payload);
      setConfirmedBooking(res.data);
      localStorage.setItem('towntrek_last_booking_name', customerName.trim());
      if (customerEmail.trim()) {
        localStorage.setItem('towntrek_last_booking_email', customerEmail.trim());
      }
    } catch (err: any) {
      setBookingError(err.response?.data?.error || 'Failed to complete reservation. Some seats may have been booked.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        Loading cinema details, showtimes and live seat statuses...
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-rose-500 font-semibold">
        Requested movie was not found in the district catalog.
      </div>
    );
  }

  const posterImage = movie.posterUrl || getMovieImage(movie.movieId);

  if (confirmedBooking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Movie Reservation Confirmed!</h1>
            <p className="text-xs text-slate-500 mt-1">
              Booking ID: #{confirmedBooking.bookingId} &bull; Stored securely in MySQL
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-3 text-xs border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Film Title:</span>
              <span className="font-bold text-slate-900">{confirmedBooking.movieName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cinema &amp; Screen:</span>
              <span className="font-bold text-slate-900">{confirmedBooking.theatreName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Schedule:</span>
              <span className="font-bold text-slate-900">{confirmedBooking.showDate} at {confirmedBooking.showTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Allocated Seats:</span>
              <span className="font-bold text-brand-600">{confirmedBooking.seats}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ticket Holder:</span>
              <span className="font-bold text-slate-900">{confirmedBooking.customerName}</span>
            </div>

            {snackTotal > 0 && (
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Snack &amp; Beverage Addons:</span>
                {Object.entries(selectedSnacks).map(([snackId, qty]) => {
                  const s = CINEMA_SNACKS.find((item) => item.id === snackId);
                  if (!s) return null;
                  return (
                    <div key={snackId} className="flex justify-between text-slate-600">
                      <span>{s.name} &times; {qty}</span>
                      <span>Rs. {s.price * qty}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between text-base">
              <span className="font-bold text-slate-700">Total Payable:</span>
              <span className="font-extrabold text-slate-900">Rs. {grandTotal}</span>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/passes')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm"
            >
              View My Passes
            </button>
            <button
              onClick={() => {
                setConfirmedBooking(null);
                setSelectedSeats([]);
                setSelectedSnacks({});
              }}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Book Another Show
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Movie Photo Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white border border-slate-800 shadow-2xl">
        <div className="absolute inset-0">
          <img
            src={posterImage}
            alt={movie.movieName}
            className="w-full h-full object-cover opacity-25 filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Poster Thumbnail */}
            <div className="w-32 h-44 sm:w-40 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-slate-900">
              <img
                src={posterImage}
                alt={movie.movieName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-300 bg-brand-500/20 border border-brand-400/30 px-3 py-1 rounded-full backdrop-blur-md">
                  {movie.genre}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200">
                  {movie.language}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200 flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-slate-400" />
                  {movie.durationMinutes} Mins
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow">
                {movie.movieName}
              </h1>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Experience high-fidelity cinematic screening with Dolby Atmos surround audio, multi-tier recliner seats, and curated gourmet snacks.
              </p>
            </div>
          </div>

          {/* Selected Showtime Summary Widget */}
          {selectedShow && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-left md:text-right min-w-[250px] shrink-0 shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Selected Cinema</span>
              <span className="font-bold text-white text-base block mt-0.5">{selectedShow.theatreName}</span>
              <span className="text-xs text-slate-300 flex items-center md:justify-end space-x-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>{selectedShow.theatreLocation}</span>
              </span>
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center md:justify-end space-x-2 text-xs font-bold text-brand-300">
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedShow.showDate}</span>
                <span>&bull;</span>
                <Clock className="w-3.5 h-3.5" />
                <span>{selectedShow.showTime}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 1: Available Showtimes & Venues */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">1</span>
          <span>Select Showtime &amp; Cinema</span>
        </h2>
        {shows.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-100 text-slate-500 text-sm">
            No active shows are currently scheduled for this movie.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shows.map((show) => {
              const isSelected = selectedShow?.showId === show.showId;
              return (
                <button
                  key={show.showId}
                  onClick={() => setSelectedShow(show)}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{show.showDate}</span>
                    </span>
                    <span className="flex items-center space-x-1 font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{show.showTime}</span>
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{show.theatreName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{show.theatreLocation}</span>
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 2: Interactive Seat Map */}
      {selectedShow && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">2</span>
            <span>Choose Your Seats</span>
          </h2>
          <SeatMap
            seats={seats}
            selectedSeats={selectedSeats}
            onToggleSeat={toggleSeat}
          />
        </div>
      )}

      {/* Step 3: Gourmet Snacks & Beverages Addons */}
      {selectedShow && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>Select Cinema Snack Addons (Optional)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fresh gourmet popcorn, nachos, chilled beverages, and combo meals prepared for your seat.
              </p>
            </div>
            {snackTotal > 0 && (
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-bold">
                Addons Total: ₹ {snackTotal}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CINEMA_SNACKS.map((snack) => {
              const qty = selectedSnacks[snack.id] || 0;
              return (
                <div
                  key={snack.id}
                  className={`bg-white rounded-2xl border transition-all p-4 flex gap-4 items-center justify-between shadow-sm ${
                    qty > 0 ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <img
                      src={snack.image}
                      alt={snack.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{snack.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{snack.description}</p>
                    <span className="text-xs font-extrabold text-slate-900 block pt-0.5">₹ {snack.price}</span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {qty > 0 && (
                      <button
                        type="button"
                        onClick={() => handleUpdateSnack(snack.id, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {qty > 0 && (
                      <span className="w-5 text-center font-bold text-xs text-slate-900">{qty}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleUpdateSnack(snack.id, 1)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-colors ${
                        qty > 0
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-slate-900 hover:bg-brand-600 text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 4: Final Booking Summary & Confirmation */}
      {selectedShow && (
        <div className="pt-4 border-t border-slate-200">
          <div className="max-w-xl mx-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">4</span>
              <span>Confirm &amp; Generate Cinema Pass</span>
            </h2>

            <form onSubmit={handleBooking} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
              {bookingError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guest Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aravindh Murugesh"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guest Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@district.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Promo / Coupon Code</label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter CINE10 for 10% off seats"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase font-mono"
                  />
                </div>
                {isCouponValid && (
                  <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
                    ✓ 10% CINE10 discount applied to ticket seats!
                  </span>
                )}
              </div>

              {/* Complete Cost Breakdown */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Selected Seats:</span>
                  <span className="font-bold text-slate-900">
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Seats Subtotal:</span>
                  <span className="font-semibold text-slate-900">Rs. {seatBaseTotal}</span>
                </div>

                {isCouponValid && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>CINE10 Coupon Discount:</span>
                    <span>- Rs. {seatDiscount}</span>
                  </div>
                )}

                {/* Addons summary */}
                <div className="flex justify-between text-slate-600 pt-1 border-t border-dashed border-slate-200">
                  <span>Snack &amp; Beverage Addons:</span>
                  <span className="font-semibold text-slate-900">Rs. {snackTotal}</span>
                </div>

                {Object.entries(selectedSnacks).map(([snackId, qty]) => {
                  const s = CINEMA_SNACKS.find((item) => item.id === snackId);
                  if (!s) return null;
                  return (
                    <div key={snackId} className="flex justify-between text-[11px] text-slate-500 pl-2">
                      <span>• {s.name} &times; {qty}</span>
                      <span>Rs. {s.price * qty}</span>
                    </div>
                  );
                })}

                {/* Grand Combined Total */}
                <div className="pt-3 border-t border-slate-200 flex justify-between text-lg font-extrabold text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-brand-600">Rs. {grandTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingLoading || selectedSeats.length === 0}
                className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm shadow-lg transition-all"
              >
                {bookingLoading ? 'Reserving Seats...' : `Confirm Reservation & Pass (Rs. ${grandTotal})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
