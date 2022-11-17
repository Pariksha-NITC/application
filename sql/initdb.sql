DROP TABLE IF EXISTS login CASCADE;
DROP TABLE IF EXISTS question CASCADE;
DROP TABLE IF EXISTS quiz CASCADE;
DROP TABLE IF EXISTS response CASCADE;
DROP TABLE IF EXISTS studentQuiz CASCADE;
DROP TABLE IF EXISTS userDetails CASCADE;



CREATE TABLE IF NOT EXISTS login (
    UserId VARCHAR PRIMARY KEY UNIQUE,
    Password VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS userDetails (
    UserId VARCHAR PRIMARY KEY,
    Name VARCHAR,
    Email VARCHAR,
	Role VARCHAR,
    Id VARCHAR UNIQUE,
    Approved BOOLEAN DEFAULT false,
    CONSTRAINT fk_login
        FOREIGN KEY(UserId) 
            REFERENCES login(UserId)
            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz (
    QuizId SERIAL PRIMARY KEY UNIQUE,
    QuizName VARCHAR,
    Duration NUMERIC,
    TotalMarks NUMERIC,
    Passkey VARCHAR,
    TeacherId VARCHAR,
    Instructions VARCHAR,
    CONSTRAINT fk_userDetails
        FOREIGN KEY(TeacherId) 
            REFERENCES userDetails(UserId)
            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS question (
    QnId SERIAL PRIMARY KEY UNIQUE,
    QuizId SERIAL,
    Question VARCHAR,
    Duration VARCHAR,
    Type VARCHAR,
    Marks VARCHAR,
    Options VARCHAR[],
    Feedback VARCHAR,
    Answers VARCHAR[],
    Fromprecision VARCHAR,
    ToPrecision VARCHAR,
    CONSTRAINT fk_quiz
        FOREIGN KEY(QuizId) 
            REFERENCES quiz(QuizId)
            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS response (
    ResponseId SERIAL PRIMARY KEY,
    QnId SERIAL,
    StudentId VARCHAR,
    Response VARCHAR[],
    MarksAwarded NUMERIC,
    Feedback VARCHAR,
    Comment VARCHAR,
    Flag BOOLEAN,
    StartTime TIME,
    EndTime TIME,
    Duration NUMERIC,
    CONSTRAINT fk_question
        FOREIGN KEY(QnId) 
            REFERENCES question(QnId)
            ON DELETE CASCADE,
    CONSTRAINT fk_userDetails
        FOREIGN KEY(StudentId) 
            REFERENCES userDetails(UserId)
            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS studentQuiz (
    StudentId VARCHAR,
    QuizId SERIAL,
    Status VARCHAR,
    CONSTRAINT fk_userDetails
        FOREIGN KEY(StudentId) 
            REFERENCES userDetails(UserId)
            ON DELETE CASCADE,
    CONSTRAINT fk_quiz
        FOREIGN KEY(QuizId) 
            REFERENCES quiz(QuizId)
            ON DELETE CASCADE
);
