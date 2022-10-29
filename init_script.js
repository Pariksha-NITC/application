const {executeQuery} = require('./helpers');
const query = `CREATE TABLE IF NOT EXISTS login (
							UserId VARCHAR PRIMARY KEY UNIQUE,
							Password VARCHAR NOT NULL,
							LoggedIn BOOLEAN
						);
						CREATE TABLE IF NOT EXISTS userDetails (
							UserId VARCHAR PRIMARY KEY,
							Name VARCHAR,
							Email VARCHAR,
							Id VARCHAR UNIQUE,
							CONSTRAINT fk_login
								FOREIGN KEY(UserId) 
									REFERENCES login(UserId)
						);
						CREATE TABLE IF NOT EXISTS quiz (
							QuizId VARCHAR PRIMARY KEY UNIQUE,
							QuizName VARCHAR,
							Duration NUMERIC,
							TotalMarks NUMERIC,
							Passkey VARCHAR,
							TeacherId VARCHAR,
							CONSTRAINT fk_userDetails
								FOREIGN KEY(TeacherId) 
									REFERENCES userDetails(Id)
						);
						CREATE TABLE IF NOT EXISTS question (
							QnId VARCHAR PRIMARY KEY UNIQUE,
							QuizId VARCHAR,
							Duration NUMERIC,
							Difficulty VARCHAR,
							Type VARCHAR,
							CorrectAnswer VARCHAR,
							Marks NUMERIC,
							Penalty NUMERIC,
							CONSTRAINT fk_quiz
								FOREIGN KEY(QuizId) 
									REFERENCES quiz(QuizId)
						);
						CREATE TABLE IF NOT EXISTS response (
							ResponseId VARCHAR PRIMARY KEY,
							QnId VARCHAR,
							StudentId VARCHAR,
							Response VARCHAR,
							MarksAwarded NUMERIC,
							Feedback VARCHAR,
							Comment VARCHAR,
							Flag BOOLEAN,
							StartTime TIME,
							EndTime TIME,
							CONSTRAINT fk_question
								FOREIGN KEY(QnId) 
									REFERENCES question(QnId),
							CONSTRAINT fk_userDetails
								FOREIGN KEY(StudentId) 
									REFERENCES userDetails(Id)
						);
						CREATE TABLE IF NOT EXISTS studentQuiz (
							StudentId VARCHAR,
							QuizId VARCHAR,
							Status VARCHAR,
							CONSTRAINT fk_userDetails
								FOREIGN KEY(StudentId) 
									REFERENCES userDetails(Id),
							CONSTRAINT fk_quiz
								FOREIGN KEY(QuizId) 
									REFERENCES quiz(QuizId)
						);
						`;
const logMessage = 'Tables are successfully created';
executeQuery(query,logMessage)