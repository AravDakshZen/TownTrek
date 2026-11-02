export interface User {
  userId: number;
  fullName: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: number;
  fullName?: string;
  email?: string;
}

export interface Movie {
  movieId: number;
  movieName: string;
  genre: string;
  durationMinutes: number;
  language: string;
  posterUrl?: string;
}

export interface Show {
  showId: number;
  movieId: number;
  movieName: string;
  showDate: string;
  showTime: string;
  theatreId: number;
  theatreName: string;
  theatreLocation: string;
}

export interface Seat {
  seatId: number;
  showId: number;
  seatCode: string;
  seatType: string;
  price: number;
  status: 'AVAILABLE' | 'BOOKED';
}

export interface MovieBookingDetail {
  bookingId: number;
  customerName: string;
  movieName: string;
  theatreName: string;
  showDate: string;
  showTime: string;
  seatCodes: string;
  totalAmount: number;
  bookingStatus: 'CONFIRMED' | 'CANCELLED';
  bookingDate: string;
}

export interface PartyConcert {
  eventId: number;
  title: string;
  category: string;
  artistPerformer: string;
  venue: string;
  location: string;
  eventDate: string;
  eventTime: string;
  ticketPrice: number;
  totalCapacity: number;
  availableSlots: number;
  description: string;
}

export interface PartyBooking {
  bookingId: number;
  customerName: string;
  userEmail: string;
  eventId: number;
  eventTitle: string;
  artistPerformer: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  ticketsCount: number;
  totalAmount: number;
  bookingStatus: 'CONFIRMED' | 'CANCELLED';
  bookingDate: string;
}

export interface DistrictEvent {
  eventId: number;
  title: string;
  category: string;
  venue: string;
  location: string;
  eventDate: string;
  eventTime: string;
  entryFee: number;
  maxCapacity: number;
  registeredCount: number;
  availableSlots: number;
  description: string;
}

export interface EventRegistration {
  regId: number;
  customerName: string;
  userEmail: string;
  eventId: number;
  eventTitle: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  attendeeCount: number;
  totalFee: number;
  status: 'CONFIRMED' | 'CANCELLED';
  regDate: string;
}

export interface TouristAttraction {
  attractionId: number;
  name: string;
  category: string;
  location: string;
  openingHours: string;
  entryFee: number;
  highlights: string;
  bestTimeToVisit: string;
}

export interface CitySpot {
  spotId: number;
  name: string;
  spotType: string;
  cuisineOrSpecialty: string;
  priceRange: string;
  address: string;
  rating: number;
  contactNumber: string;
  timings: string;
}

export interface EmergencyService {
  serviceId: number;
  serviceName: string;
  category: string;
  phoneNumber: string;
  alternateNumber?: string;
  address: string;
  is247: boolean;
  notes?: string;
}

export interface QuickSearchResponse {
  attractions: TouristAttraction[];
  spots: CitySpot[];
  parties: PartyConcert[];
  events: DistrictEvent[];
}

