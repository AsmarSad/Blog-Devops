CREATE DATABASE IF NOT EXISTS project;

use project;
create table users 
(
    user_id VARCHAR(255) PRIMARY KEY ,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email varchar(255) Not null,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT null

);


create table admin(
    admin_id varchar(255) primary key,
    username varchar(255) not null,
    password varchar(255) not null
);
insert into admin(admin_id,username,password) 
values
('00da5d56-3a51-4a07-96fc-12781986bc71','admin','$2a$10$.mKdLxgZ1H9BdQt6pghR/eSrtcYGvfaCQ8ISaEgbra4r7i5X6IALS');
-- admin credentials username=admin, password=admin
-- mysql> select * from admin
--     -> ;
-- +--------------------------------------+----------+--------------------------------------------------------------+
-- | admin_id                             | username | password                                                     |
-- +--------------------------------------+----------+--------------------------------------------------------------+
-- | 00da5d56-3a51-4a07-96fc-12781986bc71 | admin    | $2a$10$.mKdLxgZ1H9BdQt6pghR/eSrtcYGvfaCQ8ISaEgbra4r7i5X6IALS |
-- +--------------------------------------+----------+--------------------------------------------------------------+

CREATE TABLE posts (
    post_id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(255),
    
    user_id VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);




-- INSERT INTO posts (post_id, title, content, category, user_id)
-- VALUES

-- ('ec8e30c1-568b-42ab-ae51-0bf21a52f1c5', 'Travel Tips for Beginners', 'Exploring the world? Here are some essential travel tips for beginners.', 'Travel', '0e46bae2-3089-4e55-8d1d-853a6016938f'),
-- ('3c255e38-8c2a-4a4e-99e1-5a8ab4081a9e', 'Healthy Eating Habits', 'Learn about the importance of healthy eating habits and how to incorporate them into your lifestyle.', 'Health', '3754673e-ad37-4af8-951f-56f4b2ba9f49'),
-- ('fb4c11cc-7682-4dd2-a932-7e968cbdb49e', 'Web Development Trends 2023', 'Stay updated on the latest trends in web development for the year 2023.', 'Technology', 'c65e3956-2683-48e9-9da5-eccf37e988eb'),
-- ('6a48a168-c79b-45f4-9c61-61db6c9241c3', 'Explore Nature: Hiking Guide', 'Discover the beauty of nature with this comprehensive hiking guide.', 'Travel', 'db5ed37b-2dc2-4fe9-ba06-1e267eda82cd'),
-- ('e056d87a-f751-4d52-a0d6-b50f8dfcb3b7', 'The Art of Coding', 'Explore the creative side of coding and how it can be considered an art form.', 'Technology', '0d6ce70a-3e0a-47e3-9aac-fc0509f60e17'),
-- ('5aa57d3d-633d-459f-b86a-4a3447426cf7', 'Mindful Living: Meditation Tips', 'Embrace a mindful lifestyle with these meditation tips for beginners.', 'Personal Development', '0e46bae2-3089-4e55-8d1d-853a6016938f'),
-- ('c5d9b4d5-33fc-4f31-a1b8-e535c663f7d4', 'Tech Gadgets Review', 'Explore the latest and coolest tech gadgets in this comprehensive review.', 'Technology', '3754673e-ad37-4af8-951f-56f4b2ba9f49'),
-- ('bd85528a-7b17-471d-a20f-879a98b0f20e', 'Healthy Recipes: Quick and Delicious', 'Discover quick and delicious healthy recipes to enhance your well-being.', 'Health', 'c65e3956-2683-48e9-9da5-eccf37e988eb'),
-- ('72b90f8f-87b8-428c-8fb1-87ed072a8e22', 'Book Recommendations: Must-Reads', 'Explore a curated list of must-read books across various genres.', 'Books', 'db5ed37b-2dc2-4fe9-ba06-1e267eda82cd');


