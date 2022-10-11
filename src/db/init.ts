export const TABLE = 'History';

export const INIT = `CREATE TABLE IF NOT EXISTS ${TABLE} (
    id          VARCHAR(64)     PRIMARY KEY,
    scope       TEXT            NOT NULL,
    name        TEXT            NOT NULL,
    url         TEXT            NOT NULL,
    md5         TEXT            NOT NULL,
    create_time BIGINT          DEFAULT 0
)`;

export const DROP = `DROP TABLE ${TABLE}`;

export const INSERT = (data: {
  id: string;
  scope: string;
  name: string;
  url: string;
  md5: string;
  create_time: number;
}) => {
  const values = [
    data.id,
    data.scope,
    data.name,
    data.url,
    data.md5,
    data.create_time,
    0,
  ];
  return [
    `INSERT INTO ${TABLE} (id, scope, name, url, md5, create_time) VALUES($1, $2, $3, $4, $5, $6)`,
    values,
  ] as const;
};

export const QUERY = `SELECT * from ${TABLE}`;
