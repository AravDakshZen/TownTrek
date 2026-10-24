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
import java.util.*;

public class Main {
    private static final Scanner scanner = new Scanner(System.in);

    // Existing DAOs and Services
    private static final MovieDAO movieDAO = new MovieDAO();
    private static final ShowDAO showDAO = new ShowDAO();
    private static final BookingService bookingService = new BookingService();
    private static final AuthDAO authDAO = new AuthDAO();

    // TownTrek District Services
    private static final PartyConcertService partyService = new PartyConcertService();
    private static final DistrictEventService eventService = new DistrictEventService();
    private static final DistrictGuideService guideService = new DistrictGuideService();
    private static final UnifiedBookingService unifiedBookingService = new UnifiedBookingService();

    // Session State
    private static String currentUserName = "Guest Explorer";
    private static String currentUserEmail = "guest@district.com";

    private static final String DIVIDER = "____________________________________________________________________________________";
    private static final String SUB_DIVIDER = "______________________________________________________";

    public static void main(String[] args) {
        printWelcomeBanner();
        if (!authenticateUser()) {
            return;
        }

        while (true) {
            printMainMenu();
            int choice = InputHelper.readInt(scanner, "Choose an option (0-8): ");
            try {
                switch (choice) {
                    case 1 -> movieSectionMenu();
                    case 2 -> partiesConcertsMenu();
                    case 3 -> districtEventsMenu();
                    case 4 -> touristAttractionsMenu();
                    case 5 -> diningAndShoppingMenu();
                    case 6 -> emergencyServicesMenu();
                    case 7 -> myPassesMenu();
                    case 8 -> cityQuickSearch();
                    case 0 -> {
                        System.out.println("\n" + DIVIDER);
                        System.out.println("  Thank you for using TownTrek. Have a wonderful day in the district!");
                        System.out.println(DIVIDER + "\n");
                        return;
                    }
                    default -> System.out.println("Please choose a valid option (0-8).");
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
        System.out.println("                         TOWNTREK  •  DISTRICT CONSOLE");
        System.out.println("                Your Unified City Exploration & Booking Companion");
        System.out.println(DIVIDER);
    }

    private static void printMainMenu() {
        System.out.println("\n" + DIVIDER);
        System.out.println("                             TOWNTREK DISTRICT HUB");
        System.out.println(DIVIDER);
        System.out.printf(" Active User : %s (%s)%n", currentUserName, currentUserEmail);
        System.out.println(" District    : Metropolitan Central District");
        System.out.println(DIVIDER);
        System.out.println("  1. Movies & Cinema             Browse movies, cinemas, seat maps & book tickets");
        System.out.println("  2. Parties & Live Concerts     Discover DJ nights, music fests & comedy shows");
        System.out.println("  3. Nearby Events & Workshops   Register for workshops, food fests & sports");
        System.out.println("  4. Tourist Attractions         Explore monuments, beaches, museums & nature parks");
        System.out.println("  5. Dining & Shopping Centres   Locate top restaurants, cafes, markets & malls");
        System.out.println("  6. Emergency & Public Services 24/7 Police, trauma care, ambulance & civic helplines");
        System.out.println("  7. My Passes & Bookings        Unified ticket dashboard & cancellations");
        System.out.println("  8. City Quick Search           Find spots, events, or movies by keyword");
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
                        currentUserEmail = "guest@district.com";
                        System.out.println("\nWelcome, Guest Explorer! You are browsing in guest mode.");
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

        if (authDAO.register(name, email, password)) {
            System.out.println("Account created successfully! Please sign in with your credentials.");
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
        System.out.printf("%nSign-in successful! Welcome back, %s!%n", currentUserName);
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
        System.out.println("\n" + DIVIDER);
        System.out.printf(" %-4s  %-26s  %-11s  %-7s  %-24s  %-20s%n",
                "NO.", "MOVIE", "DATE", "TIME", "CINEMA", "LOCATION");
        System.out.println(DIVIDER);

        for (int i = 0; i < shows.size(); i++) {
            Show show = shows.get(i);
            System.out.printf(" %-4d  %-26s  %-11s  %-7s  %-24s  %-20s%n",
                    i + 1,
                    show.getMovieName(),
                    show.getShowDate(),
                    show.getShowTime(),
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
        int bookingId = InputHelper.readInt(scanner, "Enter Movie Booking ID: ");
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
        int bookingId = InputHelper.readInt(scanner, "Enter Movie Booking ID to cancel: ");
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
        System.out.println("\n" + DIVIDER);
        System.out.printf(" %-3s  %-30s  %-12s  %-11s  %-7s  %-10s  %-6s%n",
                "ID", "EVENT TITLE", "CATEGORY", "DATE", "TIME", "PRICE", "SLOTS");
        System.out.println(DIVIDER);
        for (PartyConcert p : list) {
            System.out.printf(" %-3d  %-30s  %-12s  %-11s  %-7s  Rs.%-7.0f  %-6d%n",
                    p.getEventId(),
                    truncate(p.getTitle(), 30),
                    p.getCategory(),
                    p.getEventDate(),
                    p.getEventTime(),
                    p.getTicketPrice(),
                    p.getAvailableSlots());
        }
        System.out.println(DIVIDER);
        if (list.isEmpty()) System.out.println("No events found in this category.");
    }

    private static void viewPartyDetails() throws SQLException {
        int id = InputHelper.readInt(scanner, "Enter Event ID: ");
        PartyConcert p = partyService.getEventById(id);
        if (p == null) {
            System.out.println("Event not found with ID: " + id);
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
        int eventId = InputHelper.readInt(scanner, "Enter Event ID to book: ");
        PartyConcert p = partyService.getEventById(eventId);
        if (p == null) {
            System.out.println("Event not found.");
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
        System.out.printf("Total Payable: Rs. %.2f for %d pass(es). Confirm? (Y/N): ", total, count);
        String confirm = scanner.nextLine().trim();
        if (!confirm.equalsIgnoreCase("y")) {
            System.out.println("Booking cancelled by user.");
            return;
        }

        int bookingId = partyService.bookTickets(currentUserName, currentUserEmail, eventId, count);

        System.out.println("\n" + DIVIDER);
        System.out.println("                    DISTRICT PASS CONFIRMED");
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
        int bookingId = InputHelper.readInt(scanner, "Enter Pass ID to cancel: ");
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

    private static void districtEventsMenu() throws Exception {
        while (true) {
            System.out.println("\n" + DIVIDER);
            System.out.println("                   DISTRICT EVENTS, WORKSHOPS & FESTS");
            System.out.println(DIVIDER);
            System.out.println("  1. Explore All District Events");
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

    private static void displayEventList(List<DistrictEvent> list) {
        System.out.println("\n" + DIVIDER);
        System.out.printf(" %-3s  %-34s  %-11s  %-11s  %-7s  %-9s  %-6s%n",
                "ID", "EVENT TITLE", "CATEGORY", "DATE", "TIME", "FEE", "SPOTS");
        System.out.println(DIVIDER);
        for (DistrictEvent e : list) {
            String fee = e.getEntryFee().compareTo(BigDecimal.ZERO) == 0 ? "FREE" : "Rs." + e.getEntryFee().intValue();
            System.out.printf(" %-3d  %-34s  %-11s  %-11s  %-7s  %-9s  %-6d%n",
                    e.getEventId(),
                    truncate(e.getTitle(), 34),
                    e.getCategory(),
                    e.getEventDate(),
                    e.getEventTime(),
                    fee,
                    e.getAvailableSlots());
        }
        System.out.println(DIVIDER);
        if (list.isEmpty()) System.out.println("No events listed in this category.");
    }

    private static void viewEventDetails() throws SQLException {
        int id = InputHelper.readInt(scanner, "Enter Event ID: ");
        DistrictEvent e = eventService.getEventById(id);
        if (e == null) {
            System.out.println("Event not found with ID: " + id);
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
        int eventId = InputHelper.readInt(scanner, "Enter Event ID to register: ");
        DistrictEvent e = eventService.getEventById(eventId);
        if (e == null) {
            System.out.println("Event not found.");
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
        int regId = InputHelper.readInt(scanner, "Enter Registration ID to cancel: ");
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
        System.out.printf(" %-3s  %-34s  %-13s  %-10s  %-20s%n",
                "ID", "NAME", "CATEGORY", "ENTRY FEE", "HOURS");
        System.out.println(DIVIDER);
        for (TouristAttraction a : list) {
            String fee = a.getEntryFee().compareTo(BigDecimal.ZERO) == 0 ? "FREE" : "Rs. " + a.getEntryFee().intValue();
            System.out.printf(" %-3d  %-34s  %-13s  %-10s  %-20s%n",
                    a.getAttractionId(),
                    truncate(a.getName(), 34),
                    a.getCategory(),
                    fee,
                    truncate(a.getOpeningHours(), 20));
        }
        System.out.println(DIVIDER);
        if (list.isEmpty()) System.out.println("No attractions matching your search.");
    }

    private static void viewAttractionGuide() throws SQLException {
        int id = InputHelper.readInt(scanner, "Enter Attraction ID for Guide: ");
        List<TouristAttraction> list = guideService.getAllAttractions();
        TouristAttraction target = list.stream().filter(a -> a.getAttractionId() == id).findFirst().orElse(null);
        if (target == null) {
            System.out.println("Attraction not found.");
            return;
        }

        System.out.println("\n" + DIVIDER);
        System.out.println("                    DISTRICT TRAVEL GUIDE & TIPS");
        System.out.println(DIVIDER);
        System.out.println(" Landmark Name: " + target.getName());
        System.out.println(" Category     : " + target.getCategory());
        System.out.println(" Location     : " + target.getLocation());
        System.out.println(" Timings      : " + target.getOpeningHours());
        System.out.println(" Entry Fee    : " + (target.getEntryFee().compareTo(BigDecimal.ZERO) == 0 ? "FREE ENTRY" : "Rs. " + target.getEntryFee()));
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
        System.out.printf(" %-3s  %-32s  %-15s  %-6s  %-6s  %-20s%n",
                "ID", "NAME", "TYPE", "PRICE", "RATING", "CUISINE / SPECIALTY");
        System.out.println(DIVIDER);
        for (CitySpot s : list) {
            System.out.printf(" %-3d  %-32s  %-15s  %-6s  ★ %-4.1f  %-20s%n",
                    s.getSpotId(),
                    truncate(s.getName(), 32),
                    s.getSpotType(),
                    s.getPriceRange(),
                    s.getRating(),
                    truncate(s.getCuisineOrSpecialty(), 20));
        }
        System.out.println(DIVIDER);
        if (list.isEmpty()) System.out.println("No matching establishments found.");
    }

    private static void viewSpotDetails() throws SQLException {
        int id = InputHelper.readInt(scanner, "Enter Spot ID for details: ");
        List<CitySpot> list = guideService.getAllSpots();
        CitySpot spot = list.stream().filter(s -> s.getSpotId() == id).findFirst().orElse(null);
        if (spot == null) {
            System.out.println("Spot not found.");
            return;
        }

        System.out.println("\n" + DIVIDER);
        System.out.println("                      VENUE & DIRECTORY PROFILE");
        System.out.println(DIVIDER);
        System.out.println(" Name        : " + spot.getName());
        System.out.println(" Category    : " + spot.getSpotType());
        System.out.println(" Specialty   : " + spot.getCuisineOrSpecialty());
        System.out.println(" Price Range : " + spot.getPriceRange());
        System.out.println(" Rating      : ★ " + spot.getRating() + " / 5.0");
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
        System.out.println("\n" + DIVIDER);
        System.out.printf(" %-3s  %-40s  %-18s  %-15s  %-6s%n",
                "ID", "ORGANIZATION / SERVICE", "CATEGORY", "HELPLINE / TEL", "24x7");
        System.out.println(DIVIDER);
        for (EmergencyService e : list) {
            System.out.printf(" %-3d  %-40s  %-18s  %-15s  %-6s%n",
                    e.getServiceId(),
                    truncate(e.getServiceName(), 40),
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
            System.out.println("                     MY DISTRICT PASSES & BOOKINGS");
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
                case 3 -> {
                    int id = InputHelper.readInt(scanner, "Enter Party Pass ID: ");
                    PartyBooking pb = partyService.getBookingById(id);
                    if (pb != null) {
                        System.out.println("\n" + SUB_DIVIDER);
                        System.out.println(" Pass ID     : " + pb.getBookingId());
                        System.out.println(" Event       : " + pb.getEventTitle());
                        System.out.println(" Artist      : " + pb.getArtistPerformer());
                        System.out.println(" Venue       : " + pb.getVenue());
                        System.out.println(" Date & Time : " + pb.getEventDate() + " at " + pb.getEventTime());
                        System.out.println(" Tickets     : " + pb.getTicketsCount());
                        System.out.println(" Total Paid  : Rs. " + pb.getTotalAmount());
                        System.out.println(" Status      : " + pb.getBookingStatus());
                        System.out.println(SUB_DIVIDER);
                    } else {
                        System.out.println("Party Pass not found.");
                    }
                }
                case 4 -> {
                    int id = InputHelper.readInt(scanner, "Enter Event Registration ID: ");
                    EventRegistration er = eventService.getRegistrationById(id);
                    if (er != null) {
                        System.out.println("\n" + SUB_DIVIDER);
                        System.out.println(" Reg ID      : " + er.getRegId());
                        System.out.println(" Event       : " + er.getEventTitle());
                        System.out.println(" Venue       : " + er.getVenue());
                        System.out.println(" Date & Time : " + er.getEventDate() + " at " + er.getEventTime());
                        System.out.println(" Attendees   : " + er.getAttendeeCount());
                        System.out.println(" Fee Paid    : Rs. " + er.getTotalFee());
                        System.out.println(" Status      : " + er.getStatus());
                        System.out.println(SUB_DIVIDER);
                    } else {
                        System.out.println("Registration not found.");
                    }
                }
                case 5 -> unifiedCancellationFlow();
                case 0 -> { return; }
                default -> System.out.println("Invalid choice. Select 0-5.");
            }
        }
    }

    private static void showAllUserBookings() throws SQLException {
        System.out.println("\n" + DIVIDER);
        System.out.println("                        [A] MOVIE BOOKINGS");
        System.out.println(DIVIDER);
        List<MovieBookingDetail> movies = unifiedBookingService.getMovieBookings(currentUserName);
        if (movies.isEmpty()) {
            System.out.println("  No movie bookings recorded under " + currentUserName);
        } else {
            for (MovieBookingDetail m : movies) {
                System.out.printf("  #%-4d | %-24s | %s %s | Seats: %-8s | Rs.%-6.0f | %s%n",
                        m.getBookingId(), m.getMovieName(), m.getShowDate(), m.getShowTime(),
                        m.getSeatCodes(), m.getTotalAmount(), m.getBookingStatus());
            }
        }

        System.out.println("\n" + DIVIDER);
        System.out.println("                    [B] CONCERTS & PARTY PASSES");
        System.out.println(DIVIDER);
        List<PartyBooking> parties = unifiedBookingService.getPartyBookings(currentUserEmail);
        if (parties.isEmpty()) {
            System.out.println("  No party passes recorded under " + currentUserEmail);
        } else {
            for (PartyBooking p : parties) {
                System.out.printf("  #%-4d | %-24s | %s %s | Passes: %-2d | Rs.%-6.0f | %s%n",
                        p.getBookingId(), p.getEventTitle(), p.getEventDate(), p.getEventTime(),
                        p.getTicketsCount(), p.getTotalAmount(), p.getBookingStatus());
            }
        }

        System.out.println("\n" + DIVIDER);
        System.out.println("                    [C] DISTRICT EVENT REGISTRATIONS");
        System.out.println(DIVIDER);
        List<EventRegistration> events = unifiedBookingService.getEventRegistrations(currentUserEmail);
        if (events.isEmpty()) {
            System.out.println("  No event registrations recorded under " + currentUserEmail);
        } else {
            for (EventRegistration e : events) {
                System.out.printf("  #%-4d | %-24s | %s %s | Spots: %-2d | Rs.%-6.0f | %s%n",
                        e.getRegId(), e.getEventTitle(), e.getEventDate(), e.getEventTime(),
                        e.getAttendeeCount(), e.getTotalFee(), e.getStatus());
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
        int id = InputHelper.readInt(scanner, "Enter Booking / Pass ID: ");

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
            default -> System.out.println("Invalid selection.");
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
                System.out.printf("  • %s (%s) - %s%n", a.getName(), a.getCategory(), a.getLocation());
            }
        }

        System.out.println("\n--- [Dining & Shopping Spots] ---");
        List<CitySpot> spots = guideService.searchSpots(q);
        if (spots.isEmpty()) {
            System.out.println("  No matching food or shopping spots found.");
        } else {
            for (CitySpot s : spots) {
                System.out.printf("  • %s [%s] - %s | %s (Rating: ★ %.1f)%n",
                        s.getName(), s.getSpotType(), s.getCuisineOrSpecialty(), s.getAddress(), s.getRating());
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
                System.out.printf("  • %s featuring %s @ %s (Rs. %.0f)%n",
                        p.getTitle(), p.getArtistPerformer(), p.getVenue(), p.getTicketPrice());
            }
        }
        System.out.println(DIVIDER);
    }

    // ====================================================================
    // STRING HELPER
    // ====================================================================

    private static String truncate(String text, int max) {
        if (text == null) return "";
        if (text.length() <= max) return text;
        return text.substring(0, max - 3) + "...";
    }
}
