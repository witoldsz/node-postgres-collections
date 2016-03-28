"use strict";

const deepMerge = require('./deepMerge');

const _mustHaveId = (item) => {
  return item.hasOwnProperty('_id')
    ? Promise.resolve(item._id)
    : Promise.reject(new Error('item must have _id property'));
};

const _whenCollectionNotExists = (action) => (err) => {
  return err && err.code === '42P01'
    ? Promise.resolve(action())
    : Promise.reject(err);
};

const _intoPromise = (mapper) => (emitter) => new Promise((resolve, reject) => {
  emitter.on('row', (row, result) => result.addRow(row));
  emitter.on('error', err => reject(err));
  emitter.on('end', result => resolve(mapper(result)));
});

const _intoPromiseRawResult = _intoPromise(r => r);
const _intoPromiseSimpleResult = _intoPromise(r => ({command: r.command, rowCount: r.rowCount}));
const _intoPromiseRowsResult = _intoPromise(r => r.rows.map(row => row.item));

function PgCollections(conn) {

  this.createCollection = (collection) => {
    const query = `
      CREATE TABLE ${collection} (
        id    VARCHAR PRIMARY KEY,
        item  JSONB NOT NULL);
      CREATE INDEX ON ${collection} USING GIN (item);`;
    return _intoPromiseRawResult(conn.query(query));
  };

  this.insert = (collection, item, opts) => {
    opts = opts || {};
    const conflictAction = opts.upsert ? 'ON CONFLICT (id) DO UPDATE SET item = EXCLUDED.item' : '';
    return _intoPromiseSimpleResult(conn.query({
      text: `INSERT INTO ${collection} (id, item) VALUES ($1, $2) ${conflictAction};`,
      values: [item._id, item]
    }))
      .catch(_whenCollectionNotExists(() => Promise.resolve()
        .then(() => this.createCollection(collection))
        .then(() => this.insert(collection, item, opts))
      ));
  };

  this.merge = (collection, item) => {
    return _mustHaveId(item)
      .then(_id => this.findOne(collection, {_id}))
      .then(dbItem => this.insert(collection, deepMerge(dbItem, item), {upsert: true}))
    ;
  };

  this.findToArrayRaw = (query) => {
    return _intoPromiseRowsResult(conn.query(query)).catch(_whenCollectionNotExists(() => []));
  };

  this.findToArray = (collection, query, opts) => {
    query = query || {};
    opts = opts || {};
    opts.limit = opts.limit || 1000;
    opts.offset = opts.offset || 0;
    return query.hasOwnProperty('_id')
      ?
      this.findToArrayRaw({
        text: `SELECT item FROM ${collection} WHERE id = $1 LIMIT 1`,
        values: [query._id]
      })
      :
      this.findToArrayRaw({
        text: `SELECT item FROM ${collection} WHERE item @> $1 LIMIT $2 OFFSET $3`,
        values: [query, opts.limit, opts.offset]
      });
  };

  this.findOne = (collection, query) => {
    return this.findToArray(collection, query, {limit: 1}).then(result => result[0]);
  };
}

module.exports = PgCollections;
