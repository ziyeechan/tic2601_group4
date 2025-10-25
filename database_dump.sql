CREATE DATABASE IF NOT EXISTS `Makan_Time`;

CREATE TABLE addresses (
    address_id INTEGER PRIMARY KEY AUTOINCREMENT,
    address_line_1 varchar(255) NOT NULL,
    address_line_2 varchar(255) DEFAULT NULL,
    country varchar(100) NOT NULL,
    state varchar(100),
    city varchar(100) NOT NULL,
    postal_code varchar(20) NOT NULL
);

CREATE TABLE restaurants(
	restaurant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_name varchar(255) NOT NULL,
    description text,
    cuisine varchar(100) NOT NULL,
    fk_address_id INTEGER NOT NULL,
	FOREIGN KEY(fk_address_id) REFERENCES addresses(address_id)
);

CREATE TABLE menus (
    menu_id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_types varchar(50),
    menu_filepath varchar(50),
    fk_restaurant_id INTEGER NOT NULL,
    FOREIGN KEY(fk_restaurant_id) REFERENCES restaurants(restaurant_id)
);

CREATE TABLE seating_plans (
    seating_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pax INTEGER NOT NULL CHECK(pax>0),
    table_type varchar(50) CHECK (table_type IN ('vip', 'indoor', 'outdoor')),
    table_number varchar(50),
    is_available boolean,
    fk_restaurant_id INTEGER NOT NULL,
    FOREIGN KEY(fk_restaurant_id) REFERENCES restaurants(restaurant_id)
);

CREATE TABLE booking (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    confirmation_code varchar(20) UNIQUE NOT NULL,
    customer_name varchar(20) NOT NULL,
    customer_email varchar(20) NOT NULL,
    customer_phone varchar(20) NOT NULL,
    party_size INTEGER NOT NULL CHECK(party_size>0),
    special_requests text,
    booking_date date NOT NULL,
    booking_time time NOT NULL,
    status varchar(50) CHECK ( status IN ('pending', 'confirmed', 'seated', 'completed', 'no_show', 'cancelled')) DEFAULT 'confirmed',
    fk_restaurant_id INTEGER NOT NULL,
    fk_seating_id INTEGER NOT NULL,
    FOREIGN KEY(fk_restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY(fk_seating_id) REFERENCES seating_plans(seating_id),
    UNIQUE (fk_seating_id, booking_date, booking_time)
);

CREATE TABLE reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment text,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fk_booking_id INTEGER NOT NULL,
    FOREIGN KEY(fk_booking_id) REFERENCES booking(booking_id)
);

CREATE TABLE promotions (
    promotion_id INTEGER PRIMARY KEY AUTOINCREMENT,
    terms_and_cond text,
    description text,
    start_at timestamp NOT NULL,
    end_at timestamp NOT NULL CHECK(end_at > start_at),
    discount varchar(100),
    fk_restaurant_id INTEGER NOT NULL,
    FOREIGN KEY(fk_restaurant_id) REFERENCES restaurants(restaurant_id)
);