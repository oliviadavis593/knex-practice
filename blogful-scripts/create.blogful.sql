CREATE TABLE blogful_articles (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY, 
    title TEXT NOT NULL, 
    date_published TIMESTAMPTZ DEFAULT now() NOT NULL, 
    content TEXT
)

-- id => as the primary key (contains unique value to identify each row of a table uniquely)
-- title => as text (NOT NULL => column can't contain any null value or it'll be rejected)
-- date_published => as the date with a default 
-- NOTE: TIMESTAMPTZ => forces all timestamp entries to be recorded in UTC time
-- content => as text 