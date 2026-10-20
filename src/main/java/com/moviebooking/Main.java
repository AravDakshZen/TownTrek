package com.moviebooking;

import com.moviebooking.dao.MovieDAO;
import com.moviebooking.dao.ShowDAO;
import com.moviebooking.model.Movie;
import com.moviebooking.model.Show;
import com.moviebooking.model.Seat;
import com.moviebooking.service.BookingService;
import com.moviebooking.util.InputHelper;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.*;

public class Main {
    private static final Scanner scanner = new Scanner(System.in);
    private static final MovieDAO movieDAO = new MovieDAO();
    private static final ShowDAO showDAO = new ShowDAO();
    private static final BookingService bookingService = new BookingService();
    private static final com.moviebooking.dao.AuthDAO authDAO =
        new com.moviebooking.dao.AuthDAO();
    private static String currentUserName;

    public static void main(String[] args) {
        if (!authenticateUser()) {
        return;
    }
        System.out.println("--------------------------------------------------");
        System.out.println("       Welcome to CineBook Movie Booking");
        System.out.println("--------------------------------------------------");
        while (true) {
            System.out.println("\n-------------- CINEBOOK MENU --------------");
            System.out.println("1. View All Movies");
            System.out.println("2. View All Shows");
            System.out.println("3. View Available Seats");
            System.out.println("4. Book Movie Tickets");
            System.out.println("5. Cancel Booking");
            System.out.println("6. View Your Ticket");
            System.out.println("7. Exit");
            System.out.println("--------------------------------------------");
            int choice = InputHelper.readInt(scanner, "Enter your choice: ");
            try {
                switch (choice) {
                    case 1 -> viewMovies();
                    case 2 -> viewShows();
                    case 3 -> viewSeats();
                    case 4 -> bookTickets();
                    case 5 -> cancelBooking();
                    case 6 -> viewYourTicket();
                    case 7 -> {
                        System.out.println("Thank you for using CineBook!");
                        return;
                    }
                    default -> System.out.println("Invalid option. Choose 1-7.");
                }

            } catch (Exception e) {
                System.out.println("Operation failed: " + e.getMessage());
            }
        }
    }

    private static void viewMovies() throws SQLException {
        List<Movie> movies = movieDAO.findAll();
        System.out.println("\nID   | MOVIE NAME             | GENRE        | DURATION | LANGUAGE");
        System.out.println("-------------------------------------------------------------------");
        for (Movie movie : movies) System.out.println(movie);
        if (movies.isEmpty()) System.out.println("No movies found. Add sample movies in MySQL first.");
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

    System.out.printf(
        "%-5s | %-20s | %-12s | %-8s | %-20s | %-25s%n",
        "NO.", "MOVIE", "DATE", "TIME", "CINEMA", "LOCATION"
    );
    System.out.println(
        "---------------------------------------------------------------------------------------------------------------"
    );

    for (int i = 0; i < shows.size(); i++) {
        Show show = shows.get(i);
        System.out.printf(
            "%-5d | %-20s | %-12s | %-8s | %-20s | %-25s%n",
            i + 1,
            show.getMovieName(),
            show.getShowDate(),
            show.getShowTime(),
            show.getTheatreName(),
            show.getTheatreLocation()
        );
    }

    if (shows.isEmpty()) {
        System.out.println("No shows found.");
    }
}


    private static void viewSeats() throws Exception {
        List<Show> shows = getShowsInDisplayOrder();
        if (shows.isEmpty()) {
            System.out.println("No shows found.");
            return;
        }

        System.out.println("\\nSelect a show using its NO. from View All Shows:");
        for (int i = 0; i < shows.size(); i++) {
            Show item = shows.get(i);
            System.out.printf("%d. %s | %s | %s | %s%n",
                    i + 1, item.getMovieName(), item.getShowDate(),
                    item.getShowTime(), item.getTheatreName());
        }

        int displayNo = InputHelper.readInt(scanner, "Enter show number: ");
        if (displayNo < 1 || displayNo > shows.size()) {
            System.out.println("Invalid show number.");
            return;
        }

        Show show = shows.get(displayNo - 1);
        int showId = show.getShowId();
        List<Seat> seats = bookingService.getSeats(showId);
        System.out.println("\n" + show.getMovieName() + " | " + show.getShowDate() + " | " + show.getShowTime());
        printScreenHeader();
        printSeatRows(seats);
        System.out.println("\nO = Available | X = Booked | - = Seat record missing");
        System.out.println("SEAT PRICING: A-B (LOWER) Rs.150 | C-D (MIDDLE) Rs.250 | E (TOP) Rs.400");
    }

   
private static void bookTickets() throws Exception {

    // 1. Select movie in the same movie_id order as "View All Movies".
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
        System.out.println("No movies with available shows.");
        return;
    }

    System.out.println("\n---------- SELECT MOVIE ----------");
    for (int i = 0; i < movies.size(); i++) {
        System.out.println((i + 1) + ". " + movies.get(i));
    }

    int movieChoice = InputHelper.readInt(scanner, "Choose movie: ");
    if (movieChoice < 1 || movieChoice > movies.size()) {
        System.out.println("Invalid movie choice.");
        return;
    }

    String movieName = movies.get(movieChoice - 1);

    // 2. Select date
    List<java.time.LocalDate> dates =
            showDAO.findDatesByMovie(movieName);

    if (dates.isEmpty()) {
        System.out.println("No dates available for this movie.");
        return;
    }

    System.out.println("\n---------- SELECT DATE ----------");
    for (int i = 0; i < dates.size(); i++) {
        System.out.println((i + 1) + ". " + dates.get(i));
    }

    int dateChoice = InputHelper.readInt(scanner, "Choose date: ");
    if (dateChoice < 1 || dateChoice > dates.size()) {
        System.out.println("Invalid date choice.");
        return;
    }

    java.time.LocalDate selectedDate = dates.get(dateChoice - 1);

    // 3. Select theatre
    List<String> theatres =
            showDAO.findTheatresByMovieAndDate(movieName, selectedDate);

    if (theatres.isEmpty()) {
        System.out.println("No theatres available on this date.");
        return;
    }

    System.out.println("\n---------- SELECT THEATRE ----------");
    for (int i = 0; i < theatres.size(); i++) {
        System.out.println((i + 1) + ". " + theatres.get(i));
    }

    int theatreChoice = InputHelper.readInt(scanner, "Choose theatre: ");
    if (theatreChoice < 1 || theatreChoice > theatres.size()) {
        System.out.println("Invalid theatre choice.");
        return;
    }

    String theatreName = theatres.get(theatreChoice - 1);

    // 4. Select show time
    List<Show> shows = showDAO.findShowsByMovieDateAndTheatre(
            movieName, selectedDate, theatreName);

    if (shows.isEmpty()) {
        System.out.println("No showtimes available.");
        return;
    }

    System.out.println("\n---------- SELECT SHOW TIME ----------");
    for (int i = 0; i < shows.size(); i++) {
        System.out.println((i + 1) + ". "
                + shows.get(i).getShowTime());
    }

    int timeChoice = InputHelper.readInt(scanner, "Choose show time: ");
    if (timeChoice < 1 || timeChoice > shows.size()) {
        System.out.println("Invalid showtime choice.");
        return;
    }

    Show show = shows.get(timeChoice - 1);
    int showId = show.getShowId();

    // 5. Select seats
    String name = currentUserName;

    System.out.println("\n---------- BOOKING DETAILS ----------");
    System.out.println("Customer : " + name);
    System.out.println("Movie    : " + show.getMovieName());
    System.out.println("Date     : " + show.getShowDate());
    System.out.println("Theatre  : " + show.getTheatreName());
    System.out.println("Location : " + show.getTheatreLocation());
    System.out.println("Time     : " + show.getShowTime());

    viewSeatsFor(showId, show);

    System.out.print(
            "Enter seat codes separated by commas (e.g. C3,C4): ");
    String seatInput = scanner.nextLine().trim();

    Map<Integer, Integer> selectedAddons = new LinkedHashMap<>();
    BigDecimal addonTotal = BigDecimal.ZERO;

    System.out.println("\n---------- FOOD & DRINKS ----------");
System.out.println("1. Popcorn       - Rs.150");
System.out.println("2. Orange Juice  - Rs.100");
System.out.println("3. Soft Drink    - Rs.80");
System.out.println("4. Nachos        - Rs.180");
System.out.println("5. Skip Add-ons");


while (true) {
    int choice = InputHelper.readInt(
            scanner, "Choose an item (5 to skip/finish): ");

    if (choice == 5) {
        break;
    }

    if (choice < 1 || choice > 4) {
        System.out.println("Invalid choice. Choose 1-5.");
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
    addonTotal = addonTotal.add(
            price.multiply(BigDecimal.valueOf(quantity)));

    System.out.println("Item added. Choose another item or 5 to finish.");
}

int bookingId = bookingService.book(showId, show.getMovieId(), name, seatInput, null);

System.out.println("\n---------- BOOKING CONFIRMED ----------");
System.out.println("Booking ID : " + bookingId);
System.out.println("Customer   : " + name);
System.out.println("Movie      : " + show.getMovieName());
System.out.println("Date       : " + show.getShowDate());
System.out.println("Theatre    : " + show.getTheatreName());
System.out.println("Location   : " + show.getTheatreLocation());
System.out.println("Show time  : " + show.getShowTime());
System.out.println("Seats      : "
        + seatInput.toUpperCase(Locale.ROOT).replace(" ", ""));

if (selectedAddons.isEmpty()) {
    System.out.println("Add-ons    : None");
} else {
    System.out.println("Add-ons:");
    selectedAddons.forEach((item, quantity) -> {
        String itemName = switch (item) {
            case 1 -> "Popcorn";
            case 2 -> "Orange Juice";
            case 3 -> "Soft Drink";
            default -> "Nachos";
        };
        System.out.println("  " + itemName + " x " + quantity);
    });
}
System.out.println("Add-on total: Rs." + addonTotal);


 

}


    

private static void viewSeatsFor(int showId, Show show) throws Exception {
    List<Seat> seats = bookingService.getSeats(showId);

    System.out.println("\nSeat map for " + show.getMovieName());
    printScreenHeader();
    printSeatRows(seats);

    System.out.println("\nSEAT STATUS: O = Available | X = Booked | - = Seat record missing");
    System.out.println("SEAT PRICING");
    System.out.println("  A-B rows - LOWER  : Rs.150 per seat");
    System.out.println("  C-D rows - MIDDLE : Rs.250 per seat");
    System.out.println("  E row   - TOP     : Rs.400 per seat");
    System.out.println("Example: C3 means Row C, Seat 3");
}

private static void printScreenHeader() {
    System.out.println("             ALL EYES THIS WAY");
    System.out.println("        =========================");
    System.out.println("                 SCREEN");
    System.out.println("        =========================");
    System.out.println("          1 2 3 4 5 6 7 8");
    System.out.println("        -------------------");
}

private static void printSeatRows(List<Seat> seats) {
    // Display Row A nearest the screen, followed by B, C, D, and E.
    for (char row = 'A'; row <= 'E'; row++) {
        System.out.printf("%c  |   ", row);

        for (int col = 1; col <= 8; col++) {
            String code = "" + row + col;
            Optional<Seat> seat = seats.stream()
                    .filter(s -> s.getSeatCode().equalsIgnoreCase(code))
                    .findFirst();

            if (seat.isEmpty()) {
                System.out.print("- ");
            } else if ("BOOKED".equalsIgnoreCase(seat.get().getStatus())) {
                System.out.print("X ");
            } else if ("AVAILABLE".equalsIgnoreCase(seat.get().getStatus())) {
                System.out.print("O ");
            } else {
                System.out.print("- ");
            }
        }
        System.out.println();
    }
}


    private static void cancelBooking() throws Exception {
        int id = InputHelper.readInt(scanner, "Enter Booking ID to cancel: ");
        boolean cancelled = bookingService.cancel(id);
        System.out.println(cancelled ? "Booking cancelled and seats released." : "Booking not found or already cancelled.");
    }




private static void viewYourTicket() throws Exception {
    int bookingId = InputHelper.readInt(
            scanner, "Enter Booking ID to search: ");

    String sql = """
        SELECT b.booking_id, b.customer_name, m.movie_name,
               s.show_date, s.show_time, b.seat_codes,
               b.total_amount, b.booking_status
        FROM bookings b
        JOIN movies m ON b.movie_id = m.movie_id
        JOIN shows s ON b.show_id = s.show_id
        WHERE b.booking_id = ?
        """;

    try (java.sql.Connection con =
                 com.moviebooking.config.DBConnection.getConnection();
         java.sql.PreparedStatement ps = con.prepareStatement(sql)) {

        ps.setInt(1, bookingId);

        try (java.sql.ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                System.out.println("\n---------- YOUR TICKET ----------");
                System.out.println("Booking ID : " + rs.getInt("booking_id"));
                System.out.println("Customer   : " + rs.getString("customer_name"));
                System.out.println("Movie      : " + rs.getString("movie_name"));
                System.out.println("Show Date  : " + rs.getDate("show_date"));
                System.out.println("Show Time  : " + rs.getTime("show_time"));
                System.out.println("Seats      : " + rs.getString("seat_codes"));
                System.out.println("Amount     : Rs. " + rs.getBigDecimal("total_amount"));
                System.out.println("Status     : " + rs.getString("booking_status"));
                System.out.println("---------------------------------");
            } else {
                System.out.println("No booking found with ID: " + bookingId);
            }
        }
    }
}


private static boolean authenticateUser() {
    while (true) {
        System.out.println("\n---------- WELCOME TO CINEBOOK ----------");
        System.out.println("1. Create Account");
        System.out.println("2. Sign In");
        System.out.println("0. Exit");

        int choice = InputHelper.readInt(scanner, "Enter your choice: ");

        try {
            switch (choice) {
                case 1 -> createAccount();
                case 2 -> {
                    if (signIn()) {
                        return true;
                    }
                }
                case 0 -> {
                    System.out.println("Thank you for visiting CineBook!");
                    return false;
                }
                default -> System.out.println("Invalid choice.");
            }
        } catch (Exception e) {
            System.out.println("Authentication error: " + e.getMessage());
        }
    }
}

private static void createAccount() throws Exception {
    System.out.print("Enter your full name: ");
    String name = scanner.nextLine().trim();

    System.out.print("Enter your email: ");
    String email = scanner.nextLine().trim().toLowerCase(Locale.ROOT);

    System.out.print("Create a password (minimum 8 characters): ");
    String password = scanner.nextLine();

    if (name.isBlank() || password.length() < 8
            || !email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
        System.out.println("Invalid name, email, or password.");
        return;
    }

    if (authDAO.register(name, email, password)) {
        System.out.println("Account created! Please sign in.");
    } else {
        System.out.println("Email already registered. Please sign in.");
    }
}

private static boolean signIn() throws Exception {
    System.out.print("Enter your email: ");
    String email = scanner.nextLine().trim().toLowerCase(Locale.ROOT);

    System.out.print("Enter your password: ");
    String password = scanner.nextLine();

    String name = authDAO.signIn(email, password);

    if (name == null) {
        System.out.println("Invalid email or password.");
        return false;
    }

    currentUserName = name;
    System.out.println("Sign-in successful! Welcome, " + name + "!");
    return true;
}

}

