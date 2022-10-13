export const TABLE = 'History';

export const INIT = `CREATE TABLE IF NOT EXISTS ${TABLE} (
    id          VARCHAR(64)     PRIMARY KEY,
    scope       TEXT            NOT NULL,
    alias       TEXT            NOT NULL,
    name        TEXT            NOT NULL,
    url         TEXT            NOT NULL,
    extra       TEXT            NOT NULL,
    hash        TEXT            UNIQUE,
    create_time BIGINT          DEFAULT 0
)`;

export const DROP = `DROP TABLE ${TABLE}`;
