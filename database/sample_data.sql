USE movie_booking_db;

INSERT INTO movies (movie_name, genre, duration_minutes, language) VALUES
('Interstellar', 'Sci-Fi', 169, 'English'),
('Inception', 'Sci-Fi', 148, 'English'),
('The Dark Knight', 'Action', 152, 'English'),
('Avatar', 'Sci-Fi', 162, 'English'),
('Jawan', 'Action', 169, 'Hindi'),
('Leo', 'Action', 164, 'Tamil'),
('Vikram', 'Action', 175, 'Tamil'),
('Interstellar 2', 'Sci-Fi', 150, 'English');

INSERT INTO shows (movie_id, show_date, show_time) VALUES
(1, '2026-10-20', '19:30:00'),
(2, '2026-10-20', '16:00:00'),
(3, '2026-10-20', '21:00:00'),
(4, '2026-10-21', '10:00:00'),
(5, '2026-10-21', '13:30:00'),
(6, '2026-10-21', '16:00:00'),
(7, '2026-10-21', '19:00:00'),
(8, '2026-10-21', '21:30:00');

-- Creates a full A1-E8 seat map for each show.
INSERT INTO seats (show_id, seat_code, seat_type, price)
SELECT sh.show_id,
       CONCAT(r.row_letter, n.seat_number),
       CASE
           WHEN r.row_letter IN ('A','B') THEN 'REGULAR'
           WHEN r.row_letter IN ('C','D') THEN 'PREMIUM'
           ELSE 'VIP'
       END,
       CASE
           WHEN r.row_letter IN ('A','B') THEN 150.00
           WHEN r.row_letter IN ('C','D') THEN 250.00
           ELSE 400.00
       END
FROM shows sh
CROSS JOIN (
    SELECT 'A' AS row_letter UNION ALL SELECT 'B'
    UNION ALL SELECT 'C' UNION ALL SELECT 'D' UNION ALL SELECT 'E'
) r
CROSS JOIN (
    SELECT 1 AS seat_number UNION ALL SELECT 2 UNION ALL SELECT 3
    UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
    UNION ALL SELECT 7 UNION ALL SELECT 8
) n;
