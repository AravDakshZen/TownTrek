package com.moviebooking;

import com.moviebooking.config.DBConnection;
import com.moviebooking.dao.AuthDAO;
import com.moviebooking.dao.MovieDAO;
import com.moviebooking.dao.ShowDAO;
import com.moviebooking.model.*;
import com.moviebooking.service.*;
import com.moviebooking.util.InputHelper;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

public class Main {
    private static final Scanner scanner = new Scanner(System.in);

    // Existing DAOs and Services
    private static final MovieDAO movieDAO = new MovieDAO();
    private static final ShowDAO showDAO = new ShowDAO();
    private static final BookingService bookingService = new BookingService();
    private static final AuthDAO authDAO = new AuthDAO();

    // TownTrek Services
    private static final PartyConcertService partyService = new PartyConcertService();
    private static final TownTrekEventService eventService = new TownTrekEventService();
    private static final TownTrekGuideService guideService = new TownTrekGuideService();
    private static final UnifiedBookingService unifiedBookingService = new UnifiedBookingService();

    // Event Topics
    private static final String[] EVENT_TOPIC_LABELS = {
            "Workshops & Learning", "Food Festivals", "Sports & Runs", "Cultural & Arts"
    };
    private static final String[] EVENT_TOPIC_CODES = {
            "WORKSHOP", "FOOD_FEST", "SPORTS", "CULTURAL"
    };
    private static final String[] PARTY_TOPIC_LABELS = {
            "Live Concerts", "Club Parties", "Standup Comedy"
    };
    private static final String[] PARTY_TOPIC_CODES = {
            "CONCERT", "CLUB_PARTY", "COMEDY_NIGHT"
    };

    // Session State
    private static String currentUserName = "Guest Explorer";
    private static String currentUserEmail = "guest@towntrek.com";
    private static String currentUserCity = "Chennai";

    private static final String DIVIDER = "____________________________________________________________________________________";
    private static final String SUB_DIVIDER = "______________________________________________________";

    public static void main(String[] args) {
        printWelcomeBanner();
        if (!authenticateUser()) {
            return;
        }

        while (true) {
            printMainMenu();
            int choice = InputHelper.readInt(scanner, "Choose an option (0-9): ");
            try {
                switch (choice) {
                    case 1 -> movieSectionMenu();
                    case 2 -> partiesConcertsMenu();
                    case 3 -> townTrekEventsMenu();
                    case 4 -> touristAttractionsMenu();
                    case 5 -> diningAndShoppingMenu();
                    case 6 -> emergencyServicesMenu();
                    case 7 -> myPassesMenu();
                    case 8 -> cityQuickSearch();
                    case 9 -> editProfileMenu();
                    case 0 -> {
                        System.out.println("\n" + DIVIDER);
                        System.out.println("  Thank you for using TownTrek. Have a wonderful day exploring!");
                        System.out.println(DIVIDER + "\n");
                        return;
                    }
                    default -> System.out.println("Please choose a valid option (0-9).");
                }
            } catch (Exception e) {
                System.out.println("\n[!] Notice: " + e.getMessage());
            }
        }
    }

    // ====================================================================
    // AESTHETIC HEADERS & MAIN NAVIGATION
    // ====================================================================

    private static void printWelcomeBanner() {
        System.out.println("\n" + DIVIDER);
        System.out.println("                           TOWNTREK  |  CITY CONSOLE");
        System.out.println("                Your Unified City Exploration & Booking Companion");
        System.out.println(DIVIDER);
    }

    private static void printMainMenu() {
        System.out.println("\n" + DIVIDER);
        System.out.println("                                TOWNTREK HUB");
        System.out.println(DIVIDER);
        System.out.printf(" Active User : %s (%s)%n", currentUserName, currentUserEmail);
        System.out.printf(" Active City : %s%n", currentUserCity);
        System.out.println(DIVIDER);
        System.out.println("  1. Movies & Cinema             Browse movies, cinemas, seat maps & book tickets");
        System.out.println("  2. Parties & Live Concerts     Discover DJ nights, music fests & comedy shows");
        System.out.println("  3. Nearby Events & Workshops   Register for workshops, food fests & sports");
        System.out.println("  4. Tourist Attractions         Explore monuments, beaches, museums & nature parks");
        System.out.println("  5. Dining & Shopping Centres   Locate top restaurants, cafes, markets & malls");
        System.out.println("  6. Emergency & Public Services 24/7 Police, trauma care, ambulance & civic helplines");
        System.out.println("  7. My Passes & Bookings        Unified ticket dashboard & cancellations");
        System.out.println("  8. City Quick Search           Find spots, events, or movies by keyword");
        System.out.println("  9. Edit Profile & Settings     Update name, email, switch city & password");
        System.out.println("  0. Sign Out / Exit");
        System.out.println(DIVIDER);
    }

    // ====================================================================
    // AUTHENTICATION FLOW
    // ====================================================================

    private static boolean authenticateUser() {
        while (true) {
            System.out.println("\n" + SUB_DIVIDER);
            System.out.println("                ACCOUNT SIGN IN / ACCESS");
            System.out.println(SUB_DIVIDER);
            System.out.println("  1. Sign In to Existing Account");
            System.out.println("  2. Create New Account");
            System.out.println("  3. Continue as Guest Explorer");
            System.out.println("  0. Exit TownTrek");
            System.out.println(SUB_DIVIDER);

            int choice = InputHelper.readInt(scanner, "Select option: ");
            try {
                switch (choice) {
                    case 1 -> {
                        if (signIn()) return true;
                    }
                    case 2 -> createAccount();
                    case 3 -> {
                        currentUserName = "Guest Explorer";
                        currentUserEmail = "guest@towntrek.com";
                        currentUserCity = "Chennai";
                        System.out.println("\nWelcome, Guest Explorer! You are browsing in guest mode [City: Chennai].");
                        return true;
                    }
                    case 0 -> {
                        System.out.println("Thank you for visiting TownTrek!");
                        return false;
                    }
                    default -> System.out.println("Invalid selection. Choose 0-3.");
                }
            } catch (Exception e) {
                System.out.println("Authentication error: " + e.getMessage());
            }
        }
    }


    private static void createAccount() throws Exception {
        System.out.println("\n" + SUB_DIVIDER);
        System.out.println("                  NEW USER REGISTRATION");
        System.out.println(SUB_DIVIDER);
        System.out.print("Enter your full name: ");
        String name = scanner.nextLine().trim();

        System.out.print("Enter your email address: ");
        String email = scanner.nextLine().trim().toLowerCase(Locale.ROOT);

        System.out.print("Create a password (minimum 8 characters): ");
        String password = scanner.nextLine();

        if (name.isBlank() || password.length() < 8
                || !email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            System.out.println("Invalid name, email, or password length (must be at least 8 chars).");
            return;
        }

        System.out.println("\nSelect your Preferred Metropolitan District City:");
        System.out.println("  1. Chennai");
        System.out.println("  2. Bangalore");
        System.out.println("  3. Mumbai");
        System.out.println("  4. Other (Custom District City)");
        int cityChoice = InputHelper.readInt(scanner, "Choose city (1-4, default 1): ");
        String city = switch (cityChoice) {
            case 2 -> "Bangalore";
            case 3 -> "Mumbai";
            case 4 -> {
                System.out.print("Enter your city/district name: ");
                String c = scanner.nextLine().trim();
                yield c.isBlank() ? "Chennai" : c;
            }
            default -> "Chennai";
        };

        if (authDAO.register(name, email, password, city)) {
            System.out.printf("Account created successfully for district: %s! Please sign in.%n", city);
        } else {
            System.out.println("An account with this email already exists. Please sign in.");
        }
    }

    private static boolean signIn() throws Exception {
        System.out.println("\n" + SUB_DIVIDER);
        System.out.println("                        SIGN IN");
        System.out.println(SUB_DIVIDER);
        System.out.print("Email address : ");
        String email = scanner.nextLine().trim().toLowerCase(Locale.ROOT);

        System.out.print("Password      : ");
        String password = scanner.nextLine();

        UserAccount user = authDAO.authenticate(email, password);
        if (user == null) {
            System.out.println("Invalid email or password. Please try again.");
            return false;
        }

        currentUserName = user.getFullName();
        currentUserEmail = user.getEmail();
        currentUserCity = (user.getCity() != null && !user.getCity().isBlank()) ? user.getCity() : "Chennai";
        System.out.printf("%nSign-in successful! Welcome back, %s [District: %s]!%n", currentUserName, currentUserCity);
        return true;
    }

    // ====================================================================
    // MODULE 1: MOVIES & CINEMA
    // ====================================================================

    private static void movieSectionMenu() throws Exception {
        while (true) {
            System.out.println("\n" + DIVIDER);
            System.out.println("                       MOVIES & CINEMA BOOKING");
            System.out.println(DIVIDER);
            System.out.println("  1. View All Movies in Theatres");
            System.out.println("  2. View Show Schedules & Venues");
            System.out.println("  3. View Available Seats (Interactive Map)");
            System.out.println("  4. Book Movie Tickets");
            System.out.println("  5. View Movie Ticket Details");
            System.out.println("  6. Cancel Movie Ticket");
            System.out.println("  0. Return to Main Menu");
            System.out.println(DIVIDER);

            int choice = InputHelper.readInt(scanner, "Choose movie option (0-6): ");
            switch (choice) {
                case 1 -> viewMovies();
                case 2 -> viewShows();
                case 3 -> viewSeats();
                case 4 -> bookTickets();
                case 5 -> viewYourTicket();
                case 6 -> cancelBooking();
                case 0 -> { return; }
                default -> System.out.println("Invalid choice. Select 0-6.");
            }
        }
    }

    private static void viewMovies() throws SQLException {
        List<Movie> movies = movieDAO.findAll();
        System.out.println("\n" + DIVIDER);
        System.out.println(" ID    MOVIE NAME                      GENRE          DURATION    LANGUAGE");
        System.out.println(DIVIDER);
        for (Movie m : movies) {
            System.out.printf(" %-4d  %-30s  %-13s  %-4d min    %-10s%n",
                    m.getMovieId(), m.getMovieName(), m.getGenre(),
                    m.getDurationMinutes(), m.getLanguage());
        }
        System.out.println(DIVIDER);
        if (movies.isEmpty()) System.out.println("No movies currently scheduled.");
    }

    private static List<Show> getShowsInDisplayOrder() throws SQLException {
        List<Show> shows = new ArrayList<>(showDAO.findAll());
        shows.sort(
                Comparator.comparing(Show::getShowDate)
                        .thenComparing(Show::getShowTime)
                        .thenComparing(Show::getMovieName, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(Show::getTheatreName, String.CASE_INSENSITIVE_ORDER)
        );
        return shows;
    }

    private static void viewShows() throws SQLException {
        List<Show> shows = getShowsInDisplayOrder();
        int[] widths = {4, 24, 10, 5, 18, 12};
        System.out.println("\n" + DIVIDER);
        printTableRow(widths, "NO.", "MOVIE", "DATE", "TIME", "CINEMA", "LOCATION");
        System.out.println(DIVIDER);

        for (int i = 0; i < shows.size(); i++) {
            Show show = shows.get(i);
            printTableRow(widths,
                    String.valueOf(i + 1),
                    show.getMovieName(),
                    String.valueOf(show.getShowDate()),
                    formatTime(show.getShowTime()),
                    show.getTheatreName(),
                    show.getTheatreLocation()
            );
        }
        System.out.println(DIVIDER);
        if (shows.isEmpty()) System.out.println("No shows currently scheduled.");
    }

    private static void viewSeats() throws Exception {
        List<Show> shows = getShowsInDisplayOrder();
        if (shows.isEmpty()) {
            System.out.println("No shows available.");
            return;
        }

        System.out.println("\nSelect a show number from the schedule:");
        for (int i = 0; i < shows.size(); i++) {
            Show item = shows.get(i);
            System.out.printf("  %d. %s | %s %s | %s%n",
                    i + 1, item.getMovieName(), item.getShowDate(),
                    item.getShowTime(), item.getTheatreName());
        }

        int displayNo = InputHelper.readInt(scanner, "Enter show number: ");
        if (displayNo < 1 || displayNo > shows.size()) {
            System.out.println("Invalid show number.");
            return;
        }

        Show show = shows.get(displayNo - 1);
        viewSeatsFor(show.getShowId(), show);
    }

    private static void viewSeatsFor(int showId, Show show) throws Exception {
        List<Seat> seats = bookingService.getSeats(showId);
        System.out.println("\n" + DIVIDER);
        System.out.println(" SEAT MAP: " + show.getMovieName() + " @ " + show.getTheatreName());
        System.out.println(" SHOWTIME: " + show.getShowDate() + " at " + show.getShowTime());
        System.out.println(DIVIDER);
        printScreenHeader();
        printSeatRows(seats);
        System.out.println(DIVIDER);
        System.out.println(" STATUS : O = Available  |  X = Booked  |  - = Missing");
        System.out.println(" PRICING: Rows A-B (Regular) Rs.150 | Rows C-D (Premium) Rs.250 | Row E (VIP) Rs.400");
        System.out.println(DIVIDER);
    }

    private static void printScreenHeader() {
        System.out.println("                 ALL EYES TOWARDS THE SCREEN");
        System.out.println("           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        System.out.println("                         C I N E M A");
        System.out.println("           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        System.out.println("                1   2   3   4   5   6   7   8");
        System.out.println("           _______________________________________");
    }

    private static void printSeatRows(List<Seat> seats) {
        for (char row = 'A'; row <= 'E'; row++) {
            System.out.printf("       %c   |   ", row);
            for (int col = 1; col <= 8; col++) {
                String code = "" + row + col;
                Optional<Seat> seat = seats.stream()
                        .filter(s -> s.getSeatCode().equalsIgnoreCase(code))
                        .findFirst();

                if (seat.isEmpty()) {
                    System.out.print("-   ");
                } else if ("BOOKED".equalsIgnoreCase(seat.get().getStatus())) {
                    System.out.print("X   ");
                } else if ("AVAILABLE".equalsIgnoreCase(seat.get().getStatus())) {
                    System.out.print("O   ");
                } else {
                    System.out.print("-   ");
                }
            }
            System.out.println();
        }
    }

    private static void bookTickets() throws Exception {
        List<String> moviesWithShows = showDAO.findMovieNames();
        Set<String> availableMovieNames = new HashSet<>(moviesWithShows);
        List<Movie> allMovies = movieDAO.findAll();
        List<String> movies = new ArrayList<>();

        for (Movie movie : allMovies) {
            if (availableMovieNames.contains(movie.getMovieName())) {
                movies.add(movie.getMovieName());
            }
        }

        if (movies.isEmpty()) {
            System.out.println("No movies currently have scheduled shows.");
            return;
        }

        System.out.println("\n" + SUB_DIVIDER);
        System.out.println("                 SELECT A MOVIE");
        System.out.println(SUB_DIVIDER);
        for (int i = 0; i < movies.size(); i++) {
            System.out.println("  " + (i + 1) + ". " + movies.get(i));
        }

        int movieChoice = InputHelper.readInt(scanner, "Choose movie (number): ");
        if (movieChoice < 1 || movieChoice > movies.size()) {
            System.out.println("Invalid movie choice.");
            return;
        }
        String movieName = movies.get(movieChoice - 1);

        List<LocalDate> dates = showDAO.findDatesByMovie(movieName);
        if (dates.isEmpty()) {
            System.out.println("No dates available for this movie.");
            return;
        }

        System.out.println("\n" + SUB_DIVIDER);
        System.out.println("                 SELECT A DATE");
        System.out.println(SUB_DIVIDER);
        for (int i = 0; i < dates.size(); i++) {
            System.out.println("  " + (i + 1) + ". " + dates.get(i));
        }
        int dateChoice = InputHelper.readInt(scanner, "Choose date: ");
        if (dateChoice < 1 || dateChoice > dates.size()) {
            System.out.println("Invalid date choice.");
            return;
        }
        LocalDate selectedDate = dates.get(dateChoice - 1);

        List<String> theatres = showDAO.findTheatresByMovieAndDate(movieName, selectedDate);
        if (theatres.isEmpty()) {
            System.out.println("No cinemas available on this date.");
            return;
        }

        System.out.println("\n" + SUB_DIVIDER);
        System.out.println("                 SELECT A CINEMA");
        System.out.println(SUB_DIVIDER);
        for (int i = 0; i < theatres.size(); i++) {
            System.out.println("  " + (i + 1) + ". " + theatres.get(i));
        }
        int theatreChoice = InputHelper.readInt(scanner, "Choose cinema: ");
        if (theatreChoice < 1 || theatreChoice > theatres.size()) {
            System.out.println("Invalid cinema choice.");
            return;
        }
        String theatreName = theatres.get(theatreChoice - 1);

        List<Show> shows = showDAO.findShowsByMovieDateAndTheatre(movieName, selectedDate, theatreName);
        if (shows.isEmpty()) {
            System.out.println("No showtimes available.");
            return;
        }

        System.out.println("\n" + SUB_DIVIDER);
        System.out.println("                 SELECT SHOW TIME");
        System.out.println(SUB_DIVIDER);
        for (int i = 0; i < shows.size(); i++) {
            System.out.println("  " + (i + 1) + ". " + shows.get(i).getShowTime());
        }
        int timeChoice = InputHelper.readInt(scanner, "Choose time: ");
        if (timeChoice < 1 || timeChoice > shows.size()) {
            System.out.println("Invalid showtime choice.");
            return;
        }
        Show show = shows.get(timeChoice - 1);

        viewSeatsFor(show.getShowId(), show);
        System.out.print("Enter seat codes separated by commas (e.g. C3,C4): ");
        String seatInput = scanner.nextLine().trim();

        // Food & Drinks Combos
        Map<Integer, Integer> selectedAddons = new LinkedHashMap<>();
        BigDecimal addonTotal = BigDecimal.ZERO;

        System.out.println("\n" + SUB_DIVIDER);
        System.out.println("           CINEMA CONCESSIONS & SNACKS");
        System.out.println(SUB_DIVIDER);
        System.out.println("  1. Butter Popcorn Tub       - Rs. 150");
        System.out.println("  2. Fresh Cold Orange Juice  - Rs. 100");
        System.out.println("  3. Chilled Soda / Soft Drink- Rs.  80");
        System.out.println("  4. Loaded Cheese Nachos     - Rs. 180");
        System.out.println("  5. Skip Concessions");
        System.out.println(SUB_DIVIDER);

        while (true) {
            int choice = InputHelper.readInt(scanner, "Choose snack item (5 to skip/finish): ");
            if (choice == 5) break;
            if (choice < 1 || choice > 4) {
                System.out.println("Invalid choice. Select 1-5.");
                continue;
            }
            int quantity = InputHelper.readInt(scanner, "Enter quantity: ");
            if (quantity <= 0) {
                System.out.println("Quantity must be at least 1.");
                continue;
            }

            BigDecimal price = switch (choice) {
                case 1 -> new BigDecimal("150.00");
                case 2 -> new BigDecimal("100.00");
                case 3 -> new BigDecimal("80.00");
                default -> new BigDecimal("180.00");
            };

            selectedAddons.merge(choice, quantity, Integer::sum);
            addonTotal = addonTotal.add(price.multiply(BigDecimal.valueOf(quantity)));
            System.out.println("Added! Choose another snack or press 5 to proceed.");
        }

        System.out.print("Enter Promo/Coupon code (or press Enter to skip, e.g. CINE10): ");
        String coupon = scanner.nextLine().trim();

        int bookingId = bookingService.book(show.getShowId(), show.getMovieId(), currentUserName, seatInput, coupon);

        System.out.println("\n" + DIVIDER);
        System.out.println("                   MOVIE BOOKING CONFIRMATION");
        System.out.println(DIVIDER);
        System.out.println(" Booking ID : " + bookingId);
        System.out.println(" Guest Name : " + currentUserName);
        System.out.println(" Movie      : " + show.getMovieName());
        System.out.println(" Cinema     : " + show.getTheatreName() + " (" + show.getTheatreLocation() + ")");
        System.out.println(" Date & Time: " + show.getShowDate() + " at " + show.getShowTime());
        System.out.println(" Seats      : " + seatInput.toUpperCase(Locale.ROOT).replace(" ", ""));
        if (!selectedAddons.isEmpty()) {
            System.out.println(" Snacks     : Included (Total Rs. " + addonTotal + ")");
        }
        System.out.println(" Status     : CONFIRMED");
        System.out.println(DIVIDER);
        System.out.println(" Please present your Booking ID at the cinema box office.");
        System.out.println(DIVIDER);
    }

    private static void viewYourTicket() throws Exception {
        if (!displayMovieBookingIds()) return;
        int bookingId = InputHelper.readInt(scanner, "Enter Movie Booking ID from the list above: ");
        MovieBookingDetail b = unifiedBookingService.getMovieBookingById(bookingId);
        if (b == null) {
            System.out.println("No booking record found for ID: " + bookingId);
            return;
        }

        System.out.println("\n" + DIVIDER);
        System.out.println("                       DIGITAL CINEMA PASS");
        System.out.println(DIVIDER);
        System.out.println(" Booking ID : " + b.getBookingId());
        System.out.println(" Guest Name : " + b.getCustomerName());
        System.out.println(" Movie      : " + b.getMovieName());
        System.out.println(" Cinema     : " + b.getTheatreName());
        System.out.println(" Show Date  : " + b.getShowDate());
        System.out.println(" Show Time  : " + b.getShowTime());
        System.out.println(" Seats      : " + b.getSeatCodes());
        System.out.println(" Total Paid : Rs. " + b.getTotalAmount());
        System.out.println(" Status     : " + b.getBookingStatus());
        if (b.getBookingDate() != null) {
            System.out.println(" Booked On  : " + b.getBookingDate());
        }
        System.out.println(DIVIDER);
    }

    private static void cancelBooking() throws Exception {
        if (!displayMovieBookingIds()) return;
        int bookingId = InputHelper.readInt(scanner, "Enter Movie Booking ID from the list above to cancel: ");
        boolean ok = bookingService.cancel(bookingId);
        if (ok) {
            System.out.println("Booking #" + bookingId + " has been successfully cancelled. Seats released.");
        } else {
            System.out.println("Cancellation failed. Booking may not exist or is already cancelled.");
        }
    }

    // ====================================================================
    // MODULE 2: PARTIES & CONCERTS
    // ====================================================================

    private static void partiesConcertsMenu() throws Exception {
        while (true) {
            System.out.println("\n" + DIVIDER);
            System.out.println("                   PARTIES, CONCERTS & COMEDY NIGHTS");
            System.out.println(DIVIDER);
            System.out.println("  1. View All Gigs, Parties & Shows");
            System.out.println("  2. Filter by Category (Concert, Club Party, Comedy Night)");
            System.out.println("  3. View Event Details & Performer Info");
            System.out.println("  4. Book Event Passes / Tickets");
            System.out.println("  5. Cancel Event Pass");
            System.out.println("  0. Return to Main Menu");
            System.out.println(DIVIDER);

            int choice = InputHelper.readInt(scanner, "Choose option (0-5): ");
            switch (choice) {
                case 1 -> displayPartyList(partyService.getAllEvents());
                case 2 -> {
                    System.out.println("\nSelect Category: 1. Live Concerts  2. Club Parties  3. Standup Comedy");
                    int cat = InputHelper.readInt(scanner, "Enter choice (1-3): ");
                    String category = switch (cat) {
                        case 1 -> "CONCERT";
                        case 2 -> "CLUB_PARTY";
                        case 3 -> "COMEDY_NIGHT";
                        default -> null;
                    };
                    if (category != null) {
                        displayPartyList(partyService.getEventsByCategory(category));
                    } else {
                        System.out.println("Invalid category.");
                    }
                }
                case 3 -> viewPartyDetails();
                case 4 -> bookPartyPass();
                case 5 -> cancelPartyPass();
                case 0 -> { return; }
                default -> System.out.println("Invalid choice. Select 0-5.");
            }
        }
    }

    private static void displayPartyList(List<PartyConcert> list) {
        int[] widths = {3, 27, 12, 10, 5, 8, 6};
        System.out.println("\n" + DIVIDER);
        printTableRow(widths, "ID", "EVENT TITLE", "CATEGORY", "DATE", "TIME", "PRICE", "SLOTS");
        System.out.println(DIVIDER);
        for (PartyConcert p : list) {
            printTableRow(widths,
                    String.valueOf(p.getEventId()),
                    p.getTitle(),
                    p.getCategory(),
                    String.valueOf(p.getEventDate()),
                    formatTime(p.getEventTime()),
                    "Rs." + p.getTicketPrice().intValue(),
                    String.valueOf(p.getAvailableSlots()));
        }
        System.out.println(DIVIDER);
        if (list.isEmpty()) System.out.println("No events found in this category.");
    }

    private static void viewPartyDetails() throws SQLException {
        String category = selectTopic("SELECT PARTY / CONCERT TOPIC", PARTY_TOPIC_LABELS, PARTY_TOPIC_CODES);
        if (category == null) return;

        List<PartyConcert> events = partyService.getEventsByCategory(category);
        System.out.println("\nEvents under this topic:");
        displayPartyList(events);
        if (events.isEmpty()) return;

        int id = InputHelper.readInt(scanner, "Enter Event ID from the list above: ");
        PartyConcert p = events.stream()
                .filter(item -> item.getEventId() == id)
                .findFirst()
                .orElse(null);
        if (p == null) {
            System.out.println("That event is not in the selected topic.");
            return;
        }

        System.out.println("\n" + DIVIDER);
        System.out.println("                     EVENT & ARTIST PROFILE");
        System.out.println(DIVIDER);
        System.out.println(" Title       : " + p.getTitle());
        System.out.println(" Category    : " + p.getCategory());
        System.out.println(" Performer   : " + p.getArtistPerformer());
        System.out.println(" Venue       : " + p.getVenue() + " (" + p.getLocation() + ")");
        System.out.println(" Date & Time : " + p.getEventDate() + " at " + p.getEventTime());
        System.out.println(" Ticket Price: Rs. " + p.getTicketPrice() + " per person");
        System.out.println(" Slots Left  : " + p.getAvailableSlots() + " / " + p.getTotalCapacity());
        System.out.println(" Overview    : " + p.getDescription());
        System.out.println(DIVIDER);
    }

    private static void bookPartyPass() throws Exception {
        String category = selectTopic("SELECT PARTY / CONCERT TOPIC", PARTY_TOPIC_LABELS, PARTY_TOPIC_CODES);
        if (category == null) return;

        List<PartyConcert> available = partyService.getEventsByCategory(category).stream()
                .filter(p -> p.getAvailableSlots() > 0)
                .toList();

        System.out.println("\nAvailable events under this topic:");
        displayPartyList(available);
        if (available.isEmpty()) return;

        int eventId = InputHelper.readInt(scanner, "Enter Event ID from the list above to book: ");
        PartyConcert p = available.stream()
                .filter(item -> item.getEventId() == eventId)
                .findFirst()
                .orElse(null);
        if (p == null) {
            System.out.println("That event is not in the selected topic or has no passes left.");
            return;
        }

        System.out.printf("Selected: %s (Rs. %.2f each, Available: %d)%n",
                p.getTitle(), p.getTicketPrice(), p.getAvailableSlots());

        int count = InputHelper.readInt(scanner, "Enter number of passes to book: ");
        if (count <= 0 || count > p.getAvailableSlots()) {
            System.out.println("Invalid count or exceeds available slots.");
            return;
        }

        BigDecimal total = p.getTicketPrice().multiply(BigDecimal.valueOf(count));
        System.out.printf("Total Payable: Rs. %.2f for %d pass(es). Confirm (Y/N): ", total, count);
        String confirm = scanner.nextLine().trim();
        if (!confirm.equalsIgnoreCase("y")) {
            System.out.println("Booking cancelled by user.");
            return;
        }

        int bookingId = partyService.bookTickets(currentUserName, currentUserEmail, eventId, count);

        System.out.println("\n" + DIVIDER);
        System.out.println("                     TOWNTREK PASS CONFIRMED");
        System.out.println(DIVIDER);
        System.out.println(" Pass ID     : " + bookingId);
        System.out.println(" Holder Name : " + currentUserName);
        System.out.println(" Event       : " + p.getTitle());
        System.out.println(" Artist/DJ   : " + p.getArtistPerformer());
        System.out.println(" Venue       : " + p.getVenue() + " (" + p.getLocation() + ")");
        System.out.println(" Date & Time : " + p.getEventDate() + " at " + p.getEventTime());
        System.out.println(" Passes      : " + count + " Ticket(s)");
        System.out.println(" Total Paid  : Rs. " + total);
        System.out.println(" Status      : CONFIRMED");
        System.out.println(DIVIDER);
    }

    private static void cancelPartyPass() throws Exception {
        if (!displayPartyBookingIds()) return;
        int bookingId = InputHelper.readInt(scanner, "Enter Pass ID from the list above to cancel: ");
        boolean ok = partyService.cancelBooking(bookingId);
        if (ok) {
            System.out.println("Pass #" + bookingId + " cancelled successfully. Capacity updated.");
        } else {
            System.out.println("Could not cancel. Either not found or already cancelled.");
        }
    }

    // ====================================================================
    // MODULE 3: NEARBY EVENTS & WORKSHOPS
    // ====================================================================

    private static void townTrekEventsMenu() throws Exception {
        while (true) {
            System.out.println("\n" + DIVIDER);
            System.out.println("                  TOWNTREK EVENTS, WORKSHOPS & FESTS");
            System.out.println(DIVIDER);
            System.out.println("  1. Explore All TownTrek Events");
            System.out.println("  2. Filter by Category (Workshops, Food Fests, Sports, Cultural)");
            System.out.println("  3. View Event Details & Agendas");
            System.out.println("  4. Register for Event / RSVP");
            System.out.println("  5. Cancel Event Registration");
            System.out.println("  0. Return to Main Menu");
            System.out.println(DIVIDER);

            int choice = InputHelper.readInt(scanner, "Choose option (0-5): ");
            switch (choice) {
                case 1 -> displayEventList(eventService.getAllEvents());
                case 2 -> {
                    System.out.println("\nSelect Category: 1. Workshops  2. Food Fests  3. Sports & Runs  4. Cultural");
                    int cat = InputHelper.readInt(scanner, "Enter choice (1-4): ");
                    String category = switch (cat) {
                        case 1 -> "WORKSHOP";
                        case 2 -> "FOOD_FEST";
                        case 3 -> "SPORTS";
                        case 4 -> "CULTURAL";
                        default -> null;
                    };
                    if (category != null) {
                        displayEventList(eventService.getEventsByCategory(category));
                    } else {
                        System.out.println("Invalid category.");
                    }
                }
                case 3 -> viewEventDetails();
                case 4 -> registerForEvent();
                case 5 -> cancelEventRegistration();
                case 0 -> { return; }
                default -> System.out.println("Invalid choice. Select 0-5.");
            }
        }
    }

    private static void displayEventList(List<TownTrekEvent> list) {
        int[] widths = {3, 29, 10, 10, 5, 8, 6};
        System.out.println("\n" + DIVIDER);
        printTableRow(widths, "ID", "EVENT TITLE", "CATEGORY", "DATE", "TIME", "FEE", "SPOTS");
        System.out.println(DIVIDER);
        for (TownTrekEvent e : list) {
            String fee = e.getEntryFee().compareTo(BigDecimal.ZERO) == 0
                    ? "FREE"
                    : "Rs." + e.getEntryFee().intValue();
            printTableRow(widths,
                    String.valueOf(e.getEventId()),
                    e.getTitle(),
                    e.getCategory(),
                    String.valueOf(e.getEventDate()),
                    formatTime(e.getEventTime()),
                    fee,
                    String.valueOf(e.getAvailableSlots()));
        }
        System.out.println(DIVIDER);
        if (list.isEmpty()) System.out.println("No events listed in this category.");
    }

    private static void viewEventDetails() throws SQLException {
        String category = selectTopic("SELECT EVENT TOPIC", EVENT_TOPIC_LABELS, EVENT_TOPIC_CODES);
        if (category == null) return;

        List<TownTrekEvent> events = eventService.getEventsByCategory(category);
        System.out.println("\nEvents under this topic:");
        displayEventList(events);
        if (events.isEmpty()) return;

        int id = InputHelper.readInt(scanner, "Enter Event ID from the list above: ");
        TownTrekEvent e = events.stream()
                .filter(item -> item.getEventId() == id)
                .findFirst()
                .orElse(null);
        if (e == null) {
            System.out.println("That event is not in the selected topic.");
            return;
        }

        System.out.println("\n" + DIVIDER);
        System.out.println("                       EVENT PROFILE & AGENDA");
        System.out.println(DIVIDER);
        System.out.println(" Title        : " + e.getTitle());
        System.out.println(" Category     : " + e.getCategory());
        System.out.println(" Venue        : " + e.getVenue() + " (" + e.getLocation() + ")");
        System.out.println(" Date & Time  : " + e.getEventDate() + " at " + e.getEventTime());
        System.out.println(" Entry Fee    : " + (e.getEntryFee().compareTo(BigDecimal.ZERO) == 0 ? "FREE ENTRY" : "Rs. " + e.getEntryFee()));
        System.out.println(" Capacity     : " + e.getRegisteredCount() + " registered / " + e.getMaxCapacity() + " capacity (" + e.getAvailableSlots() + " spots left)");
        System.out.println(" Description  : " + e.getDescription());
        System.out.println(DIVIDER);
    }

    private static void registerForEvent() throws Exception {
        String category = selectTopic("SELECT EVENT TOPIC", EVENT_TOPIC_LABELS, EVENT_TOPIC_CODES);
        if (category == null) return;

        List<TownTrekEvent> available = eventService.getEventsByCategory(category).stream()
                .filter(e -> e.getAvailableSlots() > 0)
                .toList();

        System.out.println("\nAvailable events under this topic:");
        displayEventList(available);
        if (available.isEmpty()) return;

        int eventId = InputHelper.readInt(scanner, "Enter Event ID from the list above to register: ");
        TownTrekEvent e = available.stream()
                .filter(item -> item.getEventId() == eventId)
                .findFirst()
                .orElse(null);
        if (e == null) {
            System.out.println("That event is not in the selected topic or has no spots left.");
            return;
        }

        System.out.printf("Selected: %s (%s, Available Spots: %d)%n",
                e.getTitle(),
                e.getEntryFee().compareTo(BigDecimal.ZERO) == 0 ? "FREE" : "Rs. " + e.getEntryFee(),
                e.getAvailableSlots());

        int attendees = InputHelper.readInt(scanner, "Number of attendees: ");
        if (attendees <= 0 || attendees > e.getAvailableSlots()) {
            System.out.println("Invalid number of attendees or capacity exceeded.");
            return;
        }

        BigDecimal total = e.getEntryFee().multiply(BigDecimal.valueOf(attendees));
        int regId = eventService.register(currentUserName, currentUserEmail, eventId, attendees);

        System.out.println("\n" + DIVIDER);
        System.out.println("                 EVENT REGISTRATION CONFIRMED");
        System.out.println(DIVIDER);
        System.out.println(" Registration ID: " + regId);
        System.out.println(" Attendee       : " + currentUserName);
        System.out.println(" Event          : " + e.getTitle());
        System.out.println(" Venue          : " + e.getVenue());
        System.out.println(" Date & Time    : " + e.getEventDate() + " at " + e.getEventTime());
        System.out.println(" Group Size     : " + attendees + " attendee(s)");
        System.out.println(" Fee Paid       : " + (total.compareTo(BigDecimal.ZERO) == 0 ? "FREE" : "Rs. " + total));
        System.out.println(" Status         : CONFIRMED");
        System.out.println(DIVIDER);
    }

    private static void cancelEventRegistration() throws Exception {
        if (!displayEventRegistrationIds()) return;
        int regId = InputHelper.readInt(scanner, "Enter Registration ID from the list above to cancel: ");
        boolean ok = eventService.cancelRegistration(regId);
        if (ok) {
            System.out.println("Registration #" + regId + " cancelled successfully. Spot released.");
        } else {
            System.out.println("Cancellation failed. Registration not found or already cancelled.");
        }
    }

    // ====================================================================
    // MODULE 4: TOURIST ATTRACTIONS & LANDMARKS
    // ====================================================================

    private static void touristAttractionsMenu() throws Exception {
        while (true) {
            System.out.println("\n" + DIVIDER);
            System.out.println("                  TOURIST ATTRACTIONS & CITY LANDMARKS");
            System.out.println(DIVIDER);
            System.out.println("  1. Explore All Attractions & Landmarks");
            System.out.println("  2. Filter by Category (Heritage, Nature & Beach, Museum, Park)");
            System.out.println("  3. View Comprehensive Visiting Guide");
            System.out.println("  4. Search Landmarks by Keyword");
            System.out.println("  0. Return to Main Menu");
            System.out.println(DIVIDER);

            int choice = InputHelper.readInt(scanner, "Choose option (0-4): ");
            switch (choice) {
                case 1 -> displayAttractionList(guideService.getAllAttractions());
                case 2 -> {
                    System.out.println("\nSelect Category: 1. Heritage  2. Nature & Beaches  3. Museums  4. Parks");
                    int cat = InputHelper.readInt(scanner, "Enter choice (1-4): ");
                    String category = switch (cat) {
                        case 1 -> "HERITAGE";
                        case 2 -> "NATURE_BEACH";
                        case 3 -> "MUSEUM";
                        case 4 -> "PARK";
                        default -> null;
                    };
                    if (category != null) {
                        displayAttractionList(guideService.getAttractionsByCategory(category));
                    } else {
                        System.out.println("Invalid category.");
                    }
                }
                case 3 -> viewAttractionGuide();
                case 4 -> {
                    System.out.print("Enter search keyword (e.g. beach, fort, museum): ");
                    String q = scanner.nextLine().trim();
                    displayAttractionList(guideService.searchAttractions(q));
                }
                case 0 -> { return; }
                default -> System.out.println("Invalid choice. Select 0-4.");
            }
        }
    }

    private static void displayAttractionList(List<TouristAttraction> list) {
        System.out.println("\n" + DIVIDER);
        if (list.isEmpty()) {
            System.out.println("No attractions matching your search.");
            System.out.println(DIVIDER);
            return;
        }

        String[] headers = {"ID", "LANDMARK", "CATEGORY", "ENTRY FEE", "HOURS"};
        List<String[]> rows = new ArrayList<>();
        for (TouristAttraction a : list) {
            rows.add(new String[]{
                    String.valueOf(a.getAttractionId()),
                    a.getName(),
                    displayLabel(a.getCategory()),
                    formatFee(a.getEntryFee()),
                    a.getOpeningHours()
            });
        }
        printTable(headers, rows, new int[]{2, 22, 14, 9, 20});
    }

    private static void viewAttractionGuide() throws SQLException {
        // Always show every available ID first, so the user knows what they can pick.
        List<TouristAttraction> list = guideService.getAllAttractions();
        displayAttractionList(list);
        if (list.isEmpty()) return;

        int id = InputHelper.readInt(scanner, "\nEnter Attraction ID from the list above for the full guide: ");
        TouristAttraction target = list.stream().filter(a -> a.getAttractionId() == id).findFirst().orElse(null);
        if (target == null) {
            System.out.println("Attraction not found. Please choose an ID from the list above.");
            return;
        }

        System.out.println("\n" + DIVIDER);
        System.out.println("                   TOWNTREK TRAVEL GUIDE & TIPS");
        System.out.println(DIVIDER);
        System.out.println(" Landmark Name: " + target.getName());
        System.out.println(" Category     : " + displayLabel(target.getCategory()));
        System.out.println(" Location     : " + target.getLocation());
        System.out.println(" Timings      : " + target.getOpeningHours());
        System.out.println(" Entry Fee    : " + (target.getEntryFee().compareTo(BigDecimal.ZERO) == 0 ? "FREE ENTRY" : "Rs. " + formatAmount(target.getEntryFee())));
        System.out.println(" Best Time    : " + target.getBestTimeToVisit());
        System.out.println(" Highlights   : " + target.getHighlights());
        System.out.println(DIVIDER);
    }

    // ====================================================================
    // MODULE 5: DINING & SHOPPING CENTRES
    // ====================================================================

    private static void diningAndShoppingMenu() throws Exception {
        while (true) {
            System.out.println("\n" + DIVIDER);
            System.out.println("                   DINING, CAFES & SHOPPING CENTRES");
            System.out.println(DIVIDER);
            System.out.println("  1. View All Dining & Shopping Spots");
            System.out.println("  2. Filter by Type (Restaurants, Cafes, Malls, Street Food, Bazaars)");
            System.out.println("  3. Search by Cuisine, Specialty or Area");
            System.out.println("  4. View Spot Details & Contact Info");
            System.out.println("  0. Return to Main Menu");
            System.out.println(DIVIDER);

            int choice = InputHelper.readInt(scanner, "Choose option (0-4): ");
            switch (choice) {
                case 1 -> displaySpotList(guideService.getAllSpots());
                case 2 -> {
                    System.out.println("\nSelect Type: 1. Fine Dine  2. Cafes  3. Shopping Malls  4. Street Food  5. Bazaars");
                    int t = InputHelper.readInt(scanner, "Enter choice (1-5): ");
                    String type = switch (t) {
                        case 1 -> "RESTAURANT";
                        case 2 -> "CAFE";
                        case 3 -> "SHOPPING_MALL";
                        case 4 -> "STREET_FOOD_HUB";
                        case 5 -> "LOCAL_BAZAAR";
                        default -> null;
                    };
                    if (type != null) {
                        displaySpotList(guideService.getSpotsByType(type));
                    } else {
                        System.out.println("Invalid selection.");
                    }
                }
                case 3 -> {
                    System.out.print("Enter cuisine or keyword (e.g. coffee, pizza, dosa, apparel): ");
                    String q = scanner.nextLine().trim();
                    displaySpotList(guideService.searchSpots(q));
                }
                case 4 -> viewSpotDetails();
                case 0 -> { return; }
                default -> System.out.println("Invalid choice. Select 0-4.");
            }
        }
    }

    private static void displaySpotList(List<CitySpot> list) {
        System.out.println("\n" + DIVIDER);
        if (list.isEmpty()) {
            System.out.println("No matching establishments found.");
            System.out.println(DIVIDER);
            return;
        }

        String[] headers = {"ID", "NAME", "TYPE", "PRICE", "RATING", "CUISINE / SPECIALTY"};
        List<String[]> rows = new ArrayList<>();
        for (CitySpot s : list) {
            rows.add(new String[]{
                    String.valueOf(s.getSpotId()),
                    s.getName(),
                    displayLabel(s.getSpotType()),
                    formatPriceRange(s.getPriceRange()),
                    String.format("%.1f", s.getRating()),
                    s.getCuisineOrSpecialty()
            });
        }
        printTable(headers, rows, new int[]{2, 20, 13, 8, 6, 20});
    }

    private static void viewSpotDetails() throws SQLException {
        // Always show every available ID first, so the user knows what they can pick.
        List<CitySpot> list = guideService.getAllSpots();
        displaySpotList(list);
        if (list.isEmpty()) return;

        int id = InputHelper.readInt(scanner, "\nEnter Spot ID from the list above for details: ");
        CitySpot spot = list.stream().filter(s -> s.getSpotId() == id).findFirst().orElse(null);
        if (spot == null) {
            System.out.println("Spot not found. Please choose an ID from the list above.");
            return;
        }

        System.out.println("\n" + DIVIDER);
        System.out.println("                      VENUE & DIRECTORY PROFILE");
        System.out.println(DIVIDER);
        System.out.println(" Name        : " + spot.getName());
        System.out.println(" Category    : " + displayLabel(spot.getSpotType()));
        System.out.println(" Specialty   : " + spot.getCuisineOrSpecialty());
        System.out.println(" Price Range : " + formatPriceRange(spot.getPriceRange()));
        System.out.println(" Rating      : " + spot.getRating() + " / 5.0");
        System.out.println(" Address     : " + spot.getAddress());
        System.out.println(" Timings     : " + spot.getTimings());
        System.out.println(" Phone       : " + spot.getContactNumber());
        System.out.println(DIVIDER);
    }

    // ====================================================================
    // MODULE 6: ESSENTIAL PUBLIC SERVICES & EMERGENCY CONTACTS
    // ====================================================================

    private static void emergencyServicesMenu() throws Exception {
        while (true) {
            System.out.println("\n" + DIVIDER);
            System.out.println("                ESSENTIAL PUBLIC SERVICES & EMERGENCY CONTACTS");
            System.out.println(DIVIDER);
            System.out.println("  1. Rapid Emergency Helplines (Immediate Dispatch)");
            System.out.println("  2. Filter by Category (Hospitals, Police, Fire, Civic)");
            System.out.println("  3. View Complete City Services Directory");
            System.out.println("  0. Return to Main Menu");
            System.out.println(DIVIDER);

            int choice = InputHelper.readInt(scanner, "Choose option (0-3): ");
            switch (choice) {
                case 1 -> displayEmergencyList(guideService.getRapidHelplines());
                case 2 -> {
                    System.out.println("\nSelect Category: 1. Helplines  2. Hospitals  3. Police  4. Fire Safety  5. Civic/Transit");
                    int c = InputHelper.readInt(scanner, "Enter choice (1-5): ");
                    String category = switch (c) {
                        case 1 -> "EMERGENCY_HELPLINE";
                        case 2 -> "HOSPITAL";
                        case 3 -> "POLICE";
                        case 4 -> "FIRE_SAFETY";
                        case 5 -> "CIVIC_TRANSIT";
                        default -> null;
                    };
                    if (category != null) {
                        displayEmergencyList(guideService.getEmergencyServicesByCategory(category));
                    } else {
                        System.out.println("Invalid category.");
                    }
                }
                case 3 -> displayEmergencyList(guideService.getAllEmergencyServices());
                case 0 -> { return; }
                default -> System.out.println("Invalid choice. Select 0-3.");
            }
        }
    }

    private static void displayEmergencyList(List<EmergencyService> list) {
        int[] widths = {3, 33, 19, 16, 4};
        System.out.println("\n" + DIVIDER);
        printTableRow(widths, "ID", "ORGANIZATION / SERVICE", "CATEGORY", "HELPLINE / TEL", "24x7");
        System.out.println(DIVIDER);
        for (EmergencyService e : list) {
            printTableRow(widths,
                    String.valueOf(e.getServiceId()),
                    e.getServiceName(),
                    e.getCategory(),
                    e.getPhoneNumber(),
                    e.is247() ? "YES" : "NO");
        }
        System.out.println(DIVIDER);
        System.out.println(" Tip: In extreme emergencies, dial 112 (National Unified Helpline) or 108 (Ambulance).");
        System.out.println(DIVIDER);
    }

    // ====================================================================
    // MODULE 7: MY PASSES & UNIFIED BOOKING MANAGEMENT
    // ====================================================================

    private static void myPassesMenu() throws Exception {
        while (true) {
            System.out.println("\n" + DIVIDER);
            System.out.println("                     MY TOWNTREK PASSES & BOOKINGS");
            System.out.println(DIVIDER);
            System.out.println("  1. View All My Bookings (Movies, Concerts & Events)");
            System.out.println("  2. View Movie Ticket Details");
            System.out.println("  3. View Concert / Party Pass Details");
            System.out.println("  4. View Event Registration Details");
            System.out.println("  5. Cancel Any Booking");
            System.out.println("  0. Return to Main Menu");
            System.out.println(DIVIDER);

            int choice = InputHelper.readInt(scanner, "Choose option (0-5): ");
            switch (choice) {
                case 1 -> showAllUserBookings();
                case 2 -> viewYourTicket();
                case 3 -> viewPartyPassDetails();
                case 4 -> viewEventRegistrationDetails();
                case 5 -> unifiedCancellationFlow();
                case 0 -> { return; }
                default -> System.out.println("Invalid choice. Select 0-5.");
            }
        }
    }

    private static void viewPartyPassDetails() throws SQLException {
        if (!displayPartyBookingIds()) return;
        int id = InputHelper.readInt(scanner, "Enter Party Pass ID from the list above: ");
        PartyBooking pb = partyService.getBookingById(id);
        if (pb == null) {
            System.out.println("Party Pass not found.");
            return;
        }
        System.out.println("\n" + SUB_DIVIDER);
        System.out.println(" Pass ID     : " + pb.getBookingId());
        System.out.println(" Event       : " + pb.getEventTitle());
        System.out.println(" Artist      : " + pb.getArtistPerformer());
        System.out.println(" Venue       : " + pb.getVenue());
        System.out.println(" Date & Time : " + pb.getEventDate() + " at " + formatTime(pb.getEventTime()));
        System.out.println(" Tickets     : " + pb.getTicketsCount());
        System.out.println(" Total Paid  : Rs. " + pb.getTotalAmount());
        System.out.println(" Status      : " + pb.getBookingStatus());
        System.out.println(SUB_DIVIDER);
    }

    private static void viewEventRegistrationDetails() throws SQLException {
        if (!displayEventRegistrationIds()) return;
        int id = InputHelper.readInt(scanner, "Enter Event Registration ID from the list above: ");
        EventRegistration er = eventService.getRegistrationById(id);
        if (er == null) {
            System.out.println("Registration not found.");
            return;
        }
        System.out.println("\n" + SUB_DIVIDER);
        System.out.println(" Reg ID      : " + er.getRegId());
        System.out.println(" Event       : " + er.getEventTitle());
        System.out.println(" Venue       : " + er.getVenue());
        System.out.println(" Date & Time : " + er.getEventDate() + " at " + formatTime(er.getEventTime()));
        System.out.println(" Attendees   : " + er.getAttendeeCount());
        System.out.println(" Fee Paid    : Rs. " + er.getTotalFee());
        System.out.println(" Status      : " + er.getStatus());
        System.out.println(SUB_DIVIDER);
    }

    // ====================================================================
    // BOOKING-ID LOOKUPS (always show existing IDs before prompting)
    // ====================================================================

    private static boolean displayMovieBookingIds() throws SQLException {
        List<MovieBookingDetail> list = unifiedBookingService.getMovieBookings(currentUserName);
        int[] widths = {4, 28, 16, 16, 11};
        System.out.println("\n" + DIVIDER);
        System.out.println("                       YOUR MOVIE BOOKINGS");
        System.out.println(DIVIDER);
        printTableRow(widths, "ID", "MOVIE", "DATE & TIME", "SEATS", "STATUS");
        System.out.println(DIVIDER);
        if (list.isEmpty()) {
            System.out.println("  No movie bookings found under " + currentUserName + ".");
            System.out.println(DIVIDER);
            return false;
        }
        for (MovieBookingDetail m : list) {
            printTableRow(widths,
                    "#" + m.getBookingId(),
                    m.getMovieName(),
                    m.getShowDate() + " " + formatTime(m.getShowTime()),
                    m.getSeatCodes(),
                    m.getBookingStatus());
        }
        System.out.println(DIVIDER);
        return true;
    }

    private static boolean displayPartyBookingIds() throws SQLException {
        List<PartyBooking> list = unifiedBookingService.getPartyBookings(currentUserEmail);
        int[] widths = {4, 28, 16, 16, 11};
        System.out.println("\n" + DIVIDER);
        System.out.println("                    YOUR CONCERT & PARTY PASSES");
        System.out.println(DIVIDER);
        printTableRow(widths, "ID", "EVENT", "DATE & TIME", "PASSES", "STATUS");
        System.out.println(DIVIDER);
        if (list.isEmpty()) {
            System.out.println("  No party passes found under " + currentUserEmail + ".");
            System.out.println(DIVIDER);
            return false;
        }
        for (PartyBooking p : list) {
            printTableRow(widths,
                    "#" + p.getBookingId(),
                    p.getEventTitle(),
                    p.getEventDate() + " " + formatTime(p.getEventTime()),
                    String.valueOf(p.getTicketsCount()),
                    p.getBookingStatus());
        }
        System.out.println(DIVIDER);
        return true;
    }

    private static boolean displayEventRegistrationIds() throws SQLException {
        List<EventRegistration> list = unifiedBookingService.getEventRegistrations(currentUserEmail);
        int[] widths = {4, 28, 16, 16, 11};
        System.out.println("\n" + DIVIDER);
        System.out.println("                    YOUR EVENT REGISTRATIONS");
        System.out.println(DIVIDER);
        printTableRow(widths, "ID", "EVENT", "DATE & TIME", "SPOTS", "STATUS");
        System.out.println(DIVIDER);
        if (list.isEmpty()) {
            System.out.println("  No event registrations found under " + currentUserEmail + ".");
            System.out.println(DIVIDER);
            return false;
        }
        for (EventRegistration e : list) {
            printTableRow(widths,
                    "#" + e.getRegId(),
                    e.getEventTitle(),
                    e.getEventDate() + " " + formatTime(e.getEventTime()),
                    String.valueOf(e.getAttendeeCount()),
                    e.getStatus());
        }
        System.out.println(DIVIDER);
        return true;
    }

    private static void showAllUserBookings() throws SQLException {
        int[] widths = {4, 22, 16, 12, 10, 9};

        System.out.println("\n" + DIVIDER);
        System.out.println("                        [A] MOVIE BOOKINGS");
        System.out.println(DIVIDER);
        printTableRow(widths, "ID", "MOVIE", "DATE & TIME", "SEATS", "AMOUNT", "STATUS");
        System.out.println(DIVIDER);
        List<MovieBookingDetail> movies = unifiedBookingService.getMovieBookings(currentUserName);
        if (movies.isEmpty()) {
            System.out.println("  No movie bookings recorded under " + currentUserName);
        } else {
            for (MovieBookingDetail m : movies) {
                printTableRow(widths,
                        "#" + m.getBookingId(),
                        m.getMovieName(),
                        m.getShowDate() + " " + formatTime(m.getShowTime()),
                        m.getSeatCodes(),
                        "Rs." + m.getTotalAmount().intValue(),
                        m.getBookingStatus());
            }
        }

        System.out.println("\n" + DIVIDER);
        System.out.println("                    [B] CONCERTS & PARTY PASSES");
        System.out.println(DIVIDER);
        printTableRow(widths, "ID", "EVENT", "DATE & TIME", "PASSES", "AMOUNT", "STATUS");
        System.out.println(DIVIDER);
        List<PartyBooking> parties = unifiedBookingService.getPartyBookings(currentUserEmail);
        if (parties.isEmpty()) {
            System.out.println("  No party passes recorded under " + currentUserEmail);
        } else {
            for (PartyBooking p : parties) {
                printTableRow(widths,
                        "#" + p.getBookingId(),
                        p.getEventTitle(),
                        p.getEventDate() + " " + formatTime(p.getEventTime()),
                        String.valueOf(p.getTicketsCount()),
                        "Rs." + p.getTotalAmount().intValue(),
                        p.getBookingStatus());
            }
        }

        System.out.println("\n" + DIVIDER);
        System.out.println("                    [C] TOWNTREK EVENT REGISTRATIONS");
        System.out.println(DIVIDER);
        printTableRow(widths, "ID", "EVENT", "DATE & TIME", "SPOTS", "AMOUNT", "STATUS");
        System.out.println(DIVIDER);
        List<EventRegistration> events = unifiedBookingService.getEventRegistrations(currentUserEmail);
        if (events.isEmpty()) {
            System.out.println("  No event registrations recorded under " + currentUserEmail);
        } else {
            for (EventRegistration e : events) {
                printTableRow(widths,
                        "#" + e.getRegId(),
                        e.getEventTitle(),
                        e.getEventDate() + " " + formatTime(e.getEventTime()),
                        String.valueOf(e.getAttendeeCount()),
                        "Rs." + e.getTotalFee().intValue(),
                        e.getStatus());
            }
        }
        System.out.println(DIVIDER);
    }

    private static void unifiedCancellationFlow() throws Exception {
        System.out.println("\nSelect category to cancel:");
        System.out.println("  1. Movie Booking");
        System.out.println("  2. Concert / Party Pass");
        System.out.println("  3. Event Registration");
        int type = InputHelper.readInt(scanner, "Choose (1-3): ");

        boolean hasBookings = switch (type) {
            case 1 -> displayMovieBookingIds();
            case 2 -> displayPartyBookingIds();
            case 3 -> displayEventRegistrationIds();
            default -> {
                System.out.println("Invalid selection.");
                yield false;
            }
        };
        if (!hasBookings) return;

        int id = InputHelper.readInt(scanner, "Enter Booking / Pass ID from the list above: ");

        switch (type) {
            case 1 -> {
                boolean ok = unifiedBookingService.cancelMovieBooking(id);
                System.out.println(ok ? "Movie booking cancelled and seats released." : "Failed to cancel movie booking.");
            }
            case 2 -> {
                boolean ok = unifiedBookingService.cancelPartyBooking(id);
                System.out.println(ok ? "Party pass cancelled and slots restored." : "Failed to cancel party pass.");
            }
            case 3 -> {
                boolean ok = unifiedBookingService.cancelEventRegistration(id);
                System.out.println(ok ? "Event registration cancelled and spots updated." : "Failed to cancel registration.");
            }
        }
    }

    // ====================================================================
    // MODULE 8: CITY QUICK SEARCH
    // ====================================================================

    private static void cityQuickSearch() throws SQLException {
        System.out.println("\n" + DIVIDER);
        System.out.println("                          CITY QUICK SEARCH");
        System.out.println(DIVIDER);
        System.out.print("Enter any keyword (e.g. beach, concert, pizza, mall, science): ");
        String q = scanner.nextLine().trim();

        if (q.isBlank()) {
            System.out.println("Search term cannot be empty.");
            return;
        }

        System.out.println("\n--- [Tourist Spots & Landmarks] ---");
        List<TouristAttraction> attractions = guideService.searchAttractions(q);
        if (attractions.isEmpty()) {
            System.out.println("  No matching landmarks found.");
        } else {
            for (TouristAttraction a : attractions) {
                System.out.printf("  - %s (%s) - %s%n", a.getName(), displayLabel(a.getCategory()), a.getLocation());
            }
        }

        System.out.println("\n--- [Dining & Shopping Spots] ---");
        List<CitySpot> spots = guideService.searchSpots(q);
        if (spots.isEmpty()) {
            System.out.println("  No matching food or shopping spots found.");
        } else {
            for (CitySpot s : spots) {
                System.out.printf("  - %s [%s] - %s | %s (Rating: %.1f)%n",
                        s.getName(), displayLabel(s.getSpotType()), s.getCuisineOrSpecialty(), s.getAddress(), s.getRating());
            }
        }

        System.out.println("\n--- [Concerts & Events] ---");
        List<PartyConcert> parties = partyService.getAllEvents().stream()
                .filter(p -> p.getTitle().toLowerCase().contains(q.toLowerCase())
                        || p.getArtistPerformer().toLowerCase().contains(q.toLowerCase())
                        || p.getDescription().toLowerCase().contains(q.toLowerCase()))
                .toList();
        if (parties.isEmpty()) {
            System.out.println("  No matching concert or party found.");
        } else {
            for (PartyConcert p : parties) {
                System.out.printf("  - %s featuring %s @ %s (Rs. %.0f)%n",
                        p.getTitle(), p.getArtistPerformer(), p.getVenue(), p.getTicketPrice());
            }
        }
        System.out.println(DIVIDER);
    }

    // ====================================================================
    // SHARED SELECTION HELPERS
    // ====================================================================

    private static String selectTopic(String heading, String[] labels, String[] codes) {
        System.out.println("\n" + SUB_DIVIDER);
        System.out.println("                 " + heading);
        System.out.println(SUB_DIVIDER);
        for (int i = 0; i < labels.length; i++) {
            System.out.println("  " + (i + 1) + ". " + labels[i]);
        }
        System.out.println(SUB_DIVIDER);

        int choice = InputHelper.readInt(scanner, "Choose topic (1-" + labels.length + "): ");
        if (choice < 1 || choice > labels.length) {
            System.out.println("Invalid topic selection.");
            return null;
        }
        return codes[choice - 1];
    }

    // ====================================================================
    // STRING HELPERS
    // ====================================================================

    private static String formatTime(LocalTime time) {
        return time == null ? "--:--" : String.format("%02d:%02d", time.getHour(), time.getMinute());
    }

    /**
     * Prints one table row using fixed column widths so every row lines up with
     * the 84-character DIVIDER. Cells are truncated or padded to their column.
     */
    private static void printTableRow(int[] widths, String... cells) {
        StringBuilder line = new StringBuilder(" ");
        for (int i = 0; i < widths.length; i++) {
            if (i > 0) line.append("  ");
            String cell = i < cells.length && cells[i] != null ? cells[i] : "";
            line.append(padRight(truncate(cell, widths[i]), widths[i]));
        }
        System.out.println(line);
    }

    private static String padRight(String text, int width) {
        if (text.length() >= width) return text.substring(0, width);
        return text + " ".repeat(width - text.length());
    }

    private static String truncate(String text, int max) {
        if (text == null) return "";
        if (text.length() <= max) return text;
        return text.substring(0, max - 3) + "...";
    }

    /**
     * Prints a complete table that always fits inside the 84-character DIVIDER.
     * <p>
     * Column widths are derived from the actual data instead of being hard-coded,
     * and long values wrap onto extra lines instead of being cut off. This keeps
     * every row aligned and guarantees that no database value is silently lost.
     *
     * @param minWidths preferred minimum width per column (header length is always respected)
     */
    private static void printTable(String[] headers, List<String[]> rows, int[] minWidths) {
        int columns = headers.length;
        int[] natural = new int[columns];
        for (int i = 0; i < columns; i++) {
            natural[i] = Math.max(headers[i].length(), 1);
        }
        for (String[] row : rows) {
            for (int i = 0; i < columns; i++) {
                String cell = i < row.length && row[i] != null ? row[i] : "";
                natural[i] = Math.max(natural[i], longestLine(cell));
            }
        }

        // Printable width available between the divider margins.
        int budget = DIVIDER.length() - 1 - 2 * (columns - 1);

        int[] widths = new int[columns];
        for (int i = 0; i < columns; i++) {
            widths[i] = Math.min(natural[i], Math.max(minWidths[i], headers[i].length()));
        }

        int remaining = budget - Arrays.stream(widths).sum();
        if (remaining > 0) {
            // Share the spare width between columns that still have content to show.
            int desire = 0;
            for (int i = 0; i < columns; i++) desire += natural[i] - widths[i];
            if (desire > 0) {
                for (int i = 0; i < columns; i++) {
                    int grow = (int) ((long) remaining * (natural[i] - widths[i]) / desire);
                    widths[i] += Math.min(grow, natural[i] - widths[i]);
                }
            }
            remaining = budget - Arrays.stream(widths).sum();
            while (remaining > 0) {
                boolean grew = false;
                for (int i = 0; i < columns && remaining > 0; i++) {
                    if (widths[i] < natural[i]) {
                        widths[i]++;
                        remaining--;
                        grew = true;
                    }
                }
                if (!grew) break;
            }
        } else if (remaining < 0) {
            // Extremely long values: shrink the widest columns until the table fits.
            while (Arrays.stream(widths).sum() > budget) {
                int widest = -1;
                for (int i = 0; i < columns; i++) {
                    if (widths[i] > headers[i].length() && (widest == -1 || widths[i] > widths[widest])) {
                        widest = i;
                    }
                }
                if (widest == -1) break;
                widths[widest]--;
            }
        }

        int totalWidth = 1;
        for (int i = 0; i < columns; i++) {
            totalWidth += widths[i] + (i > 0 ? 2 : 0);
        }
        String rule = "_".repeat(totalWidth);

        System.out.println(rule);
        printTableLine(widths, headers);
        System.out.println(rule);
        for (String[] row : rows) {
            List<List<String>> wrappedCells = new ArrayList<>();
            int height = 1;
            for (int i = 0; i < columns; i++) {
                String cell = i < row.length && row[i] != null ? row[i] : "";
                List<String> lines = wrapCell(cell, widths[i]);
                wrappedCells.add(lines);
                height = Math.max(height, lines.size());
            }
            for (int lineNo = 0; lineNo < height; lineNo++) {
                String[] lineCells = new String[columns];
                for (int i = 0; i < columns; i++) {
                    List<String> lines = wrappedCells.get(i);
                    lineCells[i] = lineNo < lines.size() ? lines.get(lineNo) : "";
                }
                printTableLine(widths, lineCells);
            }
        }
        System.out.println(rule);
    }

    /** Prints one already-wrapped table line, padding every cell to its column width. */
    private static void printTableLine(int[] widths, String... cells) {
        StringBuilder line = new StringBuilder(" ");
        for (int i = 0; i < widths.length; i++) {
            if (i > 0) line.append("  ");
            String cell = i < cells.length && cells[i] != null ? cells[i] : "";
            line.append(padRight(cell, widths[i]));
        }
        System.out.println(line);
    }

    /** Breaks a cell value on word boundaries so it fits the given column width. */
    private static List<String> wrapCell(String text, int width) {
        List<String> lines = new ArrayList<>();
        if (text == null || text.isBlank()) {
            lines.add("");
            return lines;
        }
        for (String paragraph : text.split("\\R")) {
            String remaining = paragraph.trim();
            if (remaining.isEmpty()) {
                lines.add("");
                continue;
            }
            while (remaining.length() > width) {
                int breakAt = remaining.lastIndexOf(' ', width);
                if (breakAt <= 0) breakAt = width;
                lines.add(remaining.substring(0, breakAt).stripTrailing());
                remaining = remaining.substring(breakAt).stripLeading();
            }
            lines.add(remaining);
        }
        return lines;
    }

    /** Longest physical line of a (possibly multi-line) cell value. */
    private static int longestLine(String text) {
        if (text == null) return 0;
        int longest = 0;
        for (String part : text.split("\\R")) {
            longest = Math.max(longest, part.length());
        }
        return longest;
    }

    /** Turns database enum codes such as NATURE_BEACH into readable labels. */
    private static String displayLabel(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) return "-";
        return switch (rawValue.trim().toUpperCase(Locale.ROOT)) {
            case "HERITAGE" -> "Heritage";
            case "NATURE_BEACH" -> "Nature & Beach";
            case "MUSEUM" -> "Museum";
            case "PARK" -> "Park";
            case "RESTAURANT" -> "Fine Dine";
            case "CAFE" -> "Cafe";
            case "SHOPPING_MALL" -> "Shopping Mall";
            case "STREET_FOOD_HUB" -> "Street Food";
            case "LOCAL_BAZAAR" -> "Bazaar";
            default -> titleCaseWords(rawValue);
        };
    }

    private static String titleCaseWords(String value) {
        StringBuilder out = new StringBuilder();
        for (String word : value.trim().split("[_\\s]+")) {
            if (word.isEmpty()) continue;
            if (out.length() > 0) out.append(' ');
            out.append(Character.toUpperCase(word.charAt(0)))
                    .append(word.substring(1).toLowerCase(Locale.ROOT));
        }
        return out.length() == 0 ? "-" : out.toString();
    }

    private static String formatFee(BigDecimal amount) {
        if (amount == null) return "N/A";
        return amount.compareTo(BigDecimal.ZERO) == 0 ? "FREE" : "Rs." + formatAmount(amount);
    }

    /** Prints amounts without floating-point noise or truncated decimals. */
    private static String formatAmount(BigDecimal amount) {
        if (amount == null) return "-";
        BigDecimal stripped = amount.stripTrailingZeros();
        return stripped.scale() <= 0 ? stripped.toBigInteger().toString() : stripped.toPlainString();
    }

    /**
     * Price ranges are stored as repeated rupee symbols (₹, ₹₹, ₹₹₹, ₹₹₹₹).
     * They are shown as readable price bands, because expanding every symbol to
     * "Rs." produced broken values such as "Rs.Rs.R..." in the old tables.
     */
    private static String formatPriceRange(String priceRange) {
        if (priceRange == null || priceRange.isBlank()) return "Not listed";
        String compact = priceRange.replace("?", "₹").replace("Rs.", "₹").replace(" ", "").trim();
        if (!compact.matches("₹+")) return priceRange;
        return switch (compact.length()) {
            case 1 -> "Budget";
            case 2 -> "Moderate";
            case 3 -> "Premium";
            case 4 -> "Luxury";
            default -> priceRange;
        };
    }

    // ====================================================================
    // MODULE 9: EDIT PROFILE & ACCOUNT SETTINGS
    // ====================================================================

    private static void editProfileMenu() throws Exception {
        if ("guest@towntrek.com".equalsIgnoreCase(currentUserEmail)) {
            System.out.println("\nYou are currently in Guest Explorer mode.");
            System.out.println("Please sign out and create an account or sign in to edit profile settings.");
            return;
        }

        while (true) {
            System.out.println("\n" + DIVIDER);
            System.out.println("                   EDIT PROFILE & ACCOUNT SETTINGS");
            System.out.println(DIVIDER);
            System.out.printf(" Active Profile : %s (%s)%n", currentUserName, currentUserEmail);
            System.out.printf(" Active District: %s%n", currentUserCity);
            System.out.println(DIVIDER);
            System.out.println("  1. View Profile Details");
            System.out.println("  2. Update Full Name");
            System.out.println("  3. Update Email Address");
            System.out.println("  4. Switch / Change District City (Chennai, Bangalore, Mumbai, Custom)");
            System.out.println("  5. Change Password");
            System.out.println("  0. Return to Main Menu");
            System.out.println(DIVIDER);

            int choice = InputHelper.readInt(scanner, "Choose profile option (0-5): ");
            switch (choice) {
                case 1 -> {
                    UserAccount acc = authDAO.findByEmail(currentUserEmail);
                    System.out.println("\n" + SUB_DIVIDER);
                    System.out.println("                     USER PROFILE DETAILS");
                    System.out.println(SUB_DIVIDER);
                    System.out.println(" Account ID  : #" + (acc != null ? acc.getUserId() : "N/A"));
                    System.out.println(" Full Name   : " + currentUserName);
                    System.out.println(" Email       : " + currentUserEmail);
                    System.out.println(" City        : " + currentUserCity);
                    System.out.println(SUB_DIVIDER);
                }
                case 2 -> {
                    System.out.print("Enter your new full name: ");
                    String newName = scanner.nextLine().trim();
                    if (newName.isBlank()) {
                        System.out.println("Name cannot be empty.");
                        break;
                    }
                    if (authDAO.updateFullName(currentUserEmail, newName)) {
                        currentUserName = newName;
                        System.out.println("Full name updated successfully to: " + currentUserName);
                    } else {
                        System.out.println("Failed to update full name.");
                    }
                }
                case 3 -> {
                    System.out.print("Enter your new email address: ");
                    String newEmail = scanner.nextLine().trim().toLowerCase(Locale.ROOT);
                    if (!newEmail.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                        System.out.println("Invalid email format.");
                        break;
                    }
                    if (authDAO.updateEmail(currentUserEmail, newEmail)) {
                        currentUserEmail = newEmail;
                        System.out.println("Email updated successfully to: " + currentUserEmail);
                    } else {
                        System.out.println("Failed to update email. Email might already exist in database.");
                    }
                }
                case 4 -> {
                    System.out.println("\nSelect District City to explore:");
                    System.out.println("  1. Chennai");
                    System.out.println("  2. Bangalore");
                    System.out.println("  3. Mumbai");
                    System.out.println("  4. Other (Custom City)");
                    int c = InputHelper.readInt(scanner, "Select city (1-4): ");
                    String newCity = switch (c) {
                        case 2 -> "Bangalore";
                        case 3 -> "Mumbai";
                        case 4 -> {
                            System.out.print("Enter city name: ");
                            String cust = scanner.nextLine().trim();
                            yield cust.isBlank() ? currentUserCity : cust;
                        }
                        default -> "Chennai";
                    };
                    if (authDAO.updateCityByEmail(currentUserEmail, newCity)) {
                        currentUserCity = newCity;
                        System.out.printf("District successfully switched to: %s! All listings will now reflect %s.%n", currentUserCity, currentUserCity);
                    } else {
                        System.out.println("Failed to update district city.");
                    }
                }
                case 5 -> {
                    System.out.print("Enter your current password: ");
                    String oldPass = scanner.nextLine();
                    UserAccount user = authDAO.authenticate(currentUserEmail, oldPass);
                    if (user == null) {
                        System.out.println("Current password verification failed.");
                        break;
                    }
                    System.out.print("Enter new password (min 8 characters): ");
                    String newPass = scanner.nextLine();
                    if (newPass.length() < 8) {
                        System.out.println("New password must be at least 8 characters long.");
                        break;
                    }
                    if (authDAO.changePassword(user.getUserId(), oldPass, newPass)) {
                        System.out.println("Password changed successfully!");
                    } else {
                        System.out.println("Failed to change password.");
                    }
                }
                case 0 -> { return; }
                default -> System.out.println("Invalid choice. Select 0-5.");
            }
        }
    }
}

