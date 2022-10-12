export const TABLE = 'History';

export const INIT = `CREATE TABLE IF NOT EXISTS ${TABLE} (
    id          VARCHAR(64)     PRIMARY KEY,
    scope       TEXT            NOT NULL,
    name        TEXT            NOT NULL,
    url         TEXT            NOT NULL,
    create_time BIGINT          DEFAULT 0
)`;

export const DROP = `DROP TABLE ${TABLE}`;
