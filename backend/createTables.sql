CREATE TABLE users (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profile_picture VARCHAR(255),
    ADD COLUMN flat_id INT,
    ADD FOREIGN KEY (flat_id) REFERENCES flat(id) ON DELETE SET NULL;
);

CREATE TABLE flat (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    flat_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    room_number VARCHAR(20),
    FOREIGN KEY (flat_id) REFERENCES flat(id) ON DELETE CASCADE
);

CREATE TABLE user_rooms (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    repeat_frequency VARCHAR(20) CHECK (repeat_frequency IN ('daily', 'weekly', 'monthly', 'none')),
    area VARCHAR(50),
    creator_id INTEGER NOT NULL,
    assigned_to_id INTEGER,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL
    ADD COLUMN flat_id INT,
    ADD FOREIGN KEY (flat_id) REFERENCES flat(id) ON DELETE CASCADE;
);

CREATE TABLE status (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) CHECK (name IN ('not completed', 'completed')) NOT NULL
);

CREATE TABLE progress_tasks (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status_id INTEGER NOT NULL,
    completion_date TIMESTAMP NULL DEFAULT NULL,
    completion_time TIME NULL DEFAULT NULL,
    comment TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES status(id) ON DELETE CASCADE
);

CREATE TABLE task_photos (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    progress_task_id INTEGER NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (progress_task_id) REFERENCES progress_tasks(id) ON DELETE CASCADE
);

CREATE TABLE ratings (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    progress_task_id INTEGER NOT NULL,
    rater_id INTEGER NOT NULL,
    rated_user_id INTEGER NOT NULL,
    score INTEGER CHECK (score BETWEEN 1 AND 5),
    comment TEXT,
    rating_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (progress_task_id) REFERENCES progress_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rated_user_id) REFERENCES users(id) ON DELETE CASCADE
);
