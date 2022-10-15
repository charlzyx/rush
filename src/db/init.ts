export const TABLE = 'History';
export const TABLE_STATS = 'Statistics';

export const INIT = `
CREATE TABLE IF NOT EXISTS ${TABLE} (
    id          VARCHAR(64)     PRIMARY KEY,
    scope       TEXT            NOT NULL,
    alias       TEXT            NOT NULL,
    dir         TEXT            NOT NULL,
    name        TEXT            NOT NULL,
    url         TEXT            NOT NULL,
    extra       TEXT            NOT NULL,
    hash        TEXT            UNIQUE,
    create_time BIGINT          DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ${TABLE_STATS} (
    id          VARCHAR(64)     PRIMARY KEY,
    name        TEXT            NOT NULL,
    before      INT             NOT NULL,
    after       INT             NOT NULL,
    create_time BIGINT          DEFAULT 0
);
`;

export const DROP = `DROP TABLE ${TABLE}`;
