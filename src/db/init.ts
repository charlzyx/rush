export const TABLE = 'History';

export const INIT = `CREATE TABLE IF NOT EXISTS ${TABLE} (
    id          varchar(64)     PRIMARY KEY,
    scope       text            NOT NULL,
    name        text            NOT NULL,
    url         text            NOT NULL,
    md5         text            NOT NULL,
    create_time numeric         DEFAULT 0,
    is_delete   numeric         DEFAULT 0,
    is_exist    numeric         DEFAULT 0
)`;
