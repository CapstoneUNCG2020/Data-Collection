ALTER TABLE Events
ADD COLUMN teamName2 VARCHAR(255),
ADD COLUMN teamCode2 VARCHAR(10);

SELECT * FROM Events;

CREATE TABLE IF NOT EXISTS EventsModified (
    eventId VARCHAR(255),
    name VARCHAR(255),
    startTime VARCHAR(255),
    currentState VARCHAR(255),
    teamName VARCHAR(255),
    teamCode VARCHAR(255),
    teamName2 VARCHAR(255),
    teamCode2 VARCHAR(255)
);

INSERT INTO EventsModified (eventId) VALUES ('103462440145685237');

SELECT * FROM EventsModified;

TRUNCATE TABLE EventsModified;

TRUNCATE TABLE Events;

ALTER TABLE Players
ADD COLUMN teamName VARCHAR(255),
ADD COLUMN teamCode VARCHAR(10),
ADD COLUMN teamId VARCHAR(20);

ALTER TABLE Players
ADD COLUMN role VARCHAR(20);

ALTER TABLE Players
ADD COLUMN region VARCHAR(20);

CREATE TABLE IF NOT EXISTS PlayersModified (
    playerId VARCHAR(20),
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    displayName VARCHAR(255),
    image VARCHAR(255),
    salary VARCHAR(255),
    teamName VARCHAR(255),
    teamCode VARCHAR(255),
    teamId VARCHAR(20),
    role VARCHAR(255),
    region VARCHAR(255)
);

SELECT * FROM PlayersModified;
TRUNCATE TABLE PlayersModified;

SELECT * FROM PlayersModified as p WHERE p.region = 'LCS';
SELECT * FROM Events as e WHERE e.teamCode = 'KSV' OR e.teamCode2 = 'KSV';
SELECT * FROM Players;

TRUNCATE TABLE Players;
ALTER TABLE Players CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
SELECT * FROM Events as e WHERE e.teamCode = 'FBA' OR e.teamCode2 = 'FBA';
SELECT * FROM Players as p WHERE p.playerId = '99566406025035944';







SELECT * FROM EventPoints;
ALTER TABLE EventPoints
ADD COLUMN participantId int,
ADD COLUMN teamId VARCHAR(20);

SELECT * FROM Events WHERE Events.name = 'LCS' and Events.teamCode = '100' and Events.startTime = '2020-02-22 22:00:00';
SELECT * FROM Players WHERE Players.region = 'LCS' and Players.teamcode = '100';