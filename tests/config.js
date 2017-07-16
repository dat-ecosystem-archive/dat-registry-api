module.exports = {
  data: 'data',
  admins: [
    'admin'
  ],
  township: {
    secret: 'very very not secret',
    db: 'township.db'
  },
  email: {
    fromEmail: 'hi@example.com'
  },
  db: {
    dialect: 'sqlite3',
    connection: {
      filename: 'sqlite.db'
    },
    useNullAsDefault: true
  },
  whitelist: false,
  archiver: 'archiver'
}
