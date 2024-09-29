
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

--create your tables with SQL commands here (watch out for slight syntactical differences with SQLite)

CREATE TABLE IF NOT EXISTS User (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    pw TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS authorSettings (
    blogTitle TEXT NOT NULL,
    blogSubtitle TEXT NOT NULL,
    authors_name TEXT NOT NULL,
    authors_user_id INTEGER PRIMARY KEY AUTOINCREMENT
);

CREATE TABLE IF NOT EXISTS Articles (
    articleID INTEGER PRIMARY KEY AUTOINCREMENT,
    articleTitle TEXT NOT NULL,
    articleSubtitle TEXT NOT NULL,
    articleText TEXT NOT NULL,
    articleLikes INTEGER DEFAULT 0,
    articleCreationDate DATE,
    articleLastModDate DATE,
    articlePublishedDate DATE,
    articleState INTEGER CHECK(articleState =0 OR articleState =1) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Comments (
    commentID INTEGER PRIMARY KEY AUTOINCREMENT,
    commentCreationDate DATE NOT NULL,
    commentContent TEXT NOT NULL,
    articleID INTEGER,
    FOREIGN KEY(articleID) REFERENCES Articles(articleID)
);

CREATE TABLE IF NOT EXISTS League {
  cal_year INTEGER NOT NULL
  leagues TEXT NOT NULL
  position INTEGER
  Indexes {
    (cal_year, leagues, position) [PK]
  }
}

CREATE TABLE IF NOT EXISTS teams {
  cal_year INTEGER [ref: > League.year, not null]
  leagues varchar [ref: > League.leagues]
  team_name varchar
  Indexes {
    (cal_year, leagues, team_name) [PK]
  }
  
}

CREATE TABLE IF NOT EXISTS basic_stats {
  cal_year INTEGER [ref: > teams.year, not null]
  leagues varchar [ref: > teams.leagues]
  team_name varchar [ref: > teams.team_name, not null]
  matches INTEGER
  wins INTEGER
  draws INTEGER
  loses INTEGER
  pts INTEGER

  Indexes {
    (cal_year, leagues, team_name) [PK]
  }

}

CREATE TABLE IF NOT EXISTS adv_stats{
  year INTEGER  [ref: > basic_stats.year, not null]
  leagues varchar [ref: > basic_stats.leagues]
  team_name varchar [ref: > basic_stats.team_name, not null]
  xG decimal(3, 2)
  xG_diff decimal(2, 2)
  npxG decimal(2, 2)
  xGA decimal(2, 2)
  xGA_diff decimal(2, 2)
  npxGA decimal(2, 2)
  npxGD decimal(2, 2)
  ppda_coef decimal(2, 2)
  oppda_coef decimal(2, 2)
  deep INTEGER 
  deep_allowed INTEGER
  xpts decimal(2, 2)
  xpts_diff decimal(2, 2)

  Indexes {
    (year, leagues, team_name) [PK]
  }

}


--insert default data (if necessary here)

INSERT INTO User ("user_id","user_name", "pw") VALUES(1,"MarcusMui", "password123");
INSERT INTO authorSettings ("blogTitle", "blogSubtitle", "authors_name", "authors_user_id") VALUES("BlogTitle", "BlogSubtitle", "Author Name", 1);

COMMIT;

