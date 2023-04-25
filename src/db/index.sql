CREATE TABLE users (
	id SERIAL,
	username TEXT NOT NULL UNIQUE,
	email TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	PRIMARY KEY (id),
	CONSTRAINT username_check CHECK (length(username) < 15 AND length(username) > 4)
);

CREATE TABLE tokens (
	id SERIAL,
	user_id SERIAL NOT NULL UNIQUE,
	refresh_token TEXT NOT NULL,
	created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Widget types
CREATE TABLE WidgetTypes (
	id SERIAL,
	name TEXT NOT NULL,
	PRIMARY KEY (id)
);

INSERT INTO WidgetTypes VALUES ("timer");
INSERT INTO WidgetTypes VALUES ("counter");
-- 

CREATE TABLE CounterWidgets (
	id SERIAL,
	user_id SERIAL NOT NULL,
	widget_type_id SERIAL NOT NULL,
	value INT NOT NULL,
	title TEXT,
	created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES Users(id),
	FOREIGN KEY (widget_type_id) REFERENCES WidgetTypes(id),
	CONSTRAINT title_check CHECK (length(title) < 200 AND length(title) > 4)
);

CREATE TABLE TimerWidgets (
	id SERIAL,
	user_id SERIAL NOT NULL,
	widget_type_id SERIAL NOT NULL,
	value INT NOT NULL,
	title TEXT,
	created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES Users(id),
	FOREIGN KEY (widget_type_id) REFERENCES WidgetTypes(id),
	CONSTRAINT title_check CHECK (length(title) < 200 AND length(title) > 4)
);