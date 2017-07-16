module.exports = {
  data: 'data',
  admins: ['admins'],
  township: {
    secret: 'very very not secret',
    db: 'township.db'
  },
  email: {
    from: 'hi@example.com',
    smtpConfig: undefined
  },
  db: {
    dialect: 'sqlite3',
    connection: {
      filename: 'sqlite.db'
    },
    useNullAsDefault: true
  },
  whitelist: false,
  archiver: {
    dir: 'archiver',
    verifyConnection: false,
    timeout: 3000
  }
}
