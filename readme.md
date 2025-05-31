ALTER TABLE `qr_code` ADD `business_type` VARCHAR(255) NOT NULL AFTER `headline`;

CREATE TABLE review_survey (
    id INT PRIMARY KEY AUTO_INCREMENT,
    survey_review TEXT,
    review_id INT,
    user_id INT,
    qr_code_id INT
);

show google review servay form each compnay (front and backend)
templete / flyers for create buisness front
sign in with google (front and backend)
profile page daynamic front



