ALTER TABLE Events
ADD COLUMN teamName2 VARCHAR(255),
ADD COLUMN teamCode2 VARCHAR(10);

SELECT * FROM Events;

TRUNCATE TABLE Events;

ALTER TABLE Players
ADD COLUMN teamName VARCHAR(255),
ADD COLUMN teamCode VARCHAR(10),
ADD COLUMN teamId VARCHAR(20);

ALTER TABLE Players
ADD COLUMN role VARCHAR(20);

ALTER TABLE Players
ADD COLUMN region VARCHAR(20);

SELECT * FROM Events as e WHERE e.teamCode = 'KSV' OR e.teamCode2 = 'KSV';
SELECT * FROM Players;

TRUNCATE TABLE Players;
ALTER TABLE Players CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
SELECT * FROM Events as e WHERE e.teamCode = 'FBA' OR e.teamCode2 = 'FBA';
SELECT * FROM Players as p WHERE p.playerId = '99566406025035944';



TRUNCATE TABLE EventPoints;
SELECT * FROM EventPoints;
ALTER TABLE EventPoints
ADD COLUMN participantId int,
ADD COLUMN teamId VARCHAR(20);

SELECT * FROM Events WHERE Events.name = 'LCS' and Events.teamCode = '100' and Events.startTime = '2020-02-22 22:00:00';
SELECT * FROM Players WHERE Players.region = 'LCS' and Players.teamcode = '100';
SELECT * FROM Events WHERE Events.eventId = '103462422157300679';

SELECT * FROM LeagueStats;

SELECT * FROM Events WHERE Events.currentState = 3 and Events.name != 'LPL';

TRUNCATE TABLE Events;
TRUNCATE TABLE EventPoints;
TRUNCATE TABLE LeagueStats;
TRUNCATE TABLE Players;