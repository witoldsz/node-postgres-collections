'use strict';

const PgCollections = require('./lib/PgCollection');
const pg = require('pg');
const conString = "postgres://postgres:123456@localhost/postgres";

pg.connect(conString, (err, client, done) => {
  if (err) throw err;
  const pgc = new PgCollections(client);
  return Promise.resolve()
    .then(() => pgc.insert('books', {_id: 1, title: 'Shantaram', extra: {a:1, b:2}}, {upsert: true}))
    .then(() => pgc.insert('books', {_id: 2, title: 'Millenium', extra: {a:3, b:4}}, {upsert: true}))
    .then(() => pgc.findToArray('books'))
    .then(console.log)
    .then(() => {
      const x = [];
      for (let i = 0; i < 100; ++i) {
        x[i] = pgc.merge('books', {_id: 2, extra: {i}});
      }
      console.time('x');
      return Promise.all(x);
    })
    .then(() => console.timeEnd('x'))
    .then(() => pgc.findToArray('books'))
    .then(console.log, console.error)
    .then(done);

});
