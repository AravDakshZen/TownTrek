export interface User {
  userId: number;
  fullName: string;
  email: string;
  city?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: number;
  fullName?: string;
  email?: string;
  city?: string;
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
  city?: string;
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
  seats?: string;
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
  city?: string;
  eventDate: string;
  eventTime: string;
  ticketPrice: number;
  totalCapacity: number;
  availableSlots: number;
  availableSeats?: number;
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
  ticketCount?: number;
  totalAmount: number;
  totalPrice?: number;
  bookingStatus: 'CONFIRMED' | 'CANCELLED';
  status?: string;
  bookingDate: string;
}

export interface DistrictEvent {
  eventId: number;
  title: string;
  category: string;
  venue: string;
  location: string;
  city?: string;
  eventDate: string;
  eventTime: string;
  entryFee: number;
  maxCapacity: number;
  registeredCount: number;
  availableSlots: number;
  availableSeats?: number;
  organizer?: string;
  description: string;
}

export interface EventRegistration {
  registrationId?: number;
  regId: number;
  eventId: number;
  eventTitle: string;
  customerName: string;
  userEmail: string;
  ticketsCount?: number;
  attendeeCount?: number;
  totalAmount?: number;
  totalFee?: number;
  status: 'CONFIRMED' | 'CANCELLED';
  registrationDate?: string;
  regDate?: string;
  bookingStatus?: 'CONFIRMED' | 'CANCELLED';
  venue?: string;
  eventDate?: string;
  eventTime?: string;
}

export interface TouristAttraction {
  attractionId: number;
  name: string;
  category: string;
  description: string;
  location: string;
  city?: string;
  entryFee: number;
  openingHours: string;
  imageUrl?: string;
  bestTimeToVisit?: string;
  highlights?: string;
}

export interface CitySpot {
  spotId: number;
  name: string;
  category: string;
  description: string;
  address: string;
  city?: string;
  openingHours: string;
  priceRange?: string;
  rating?: number;
  spotType: string;
  timings?: string;
  contactNumber: string;
  cuisineOrSpecialty?: string;
}

export interface EmergencyService {
  serviceId: number;
  serviceName: string;
  category: string;
  contactNumber: string;
  phoneNumber?: string;
  alternateNumber?: string;
  notes?: string;
  address: string;
  coverageArea: string;
  isAvailable24x7: boolean;
  is247?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface QuickSearchResponse {
  attractions: TouristAttraction[];
  spots: CitySpot[];
  parties: PartyConcert[];
  events: DistrictEvent[];
}
