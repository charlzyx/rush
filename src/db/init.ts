export const TABLE = 'History';

export const INIT = `CREATE TABLE IF NOT EXISTS ${TABLE} (
    id          VARCHAR(64)     PRIMARY KEY,
    scope       TEXT            NOT NULL,
    name        TEXT            NOT NULL,
    url         TEXT            NOT NULL,
    create_time BIGINT          DEFAULT 0
)`;

export const DROP = `DROP TABLE ${TABLE}`;

export const INSERT = (data: {
  id: string;
  scope: string;
  name: string;
  url: string;
  create_time: number;
}) => {
  const values = [
    data.id,
    data.scope,
    data.name,
    data.url,
    data.create_time,
    0,
  ];
  return [
    `INSERT INTO ${TABLE} (id, scope, name, url, create_time) VALUES($1, $2, $3, $4, $5)`,
    values,
  ] as const;
};
