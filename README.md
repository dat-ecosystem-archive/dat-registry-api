# Dat Registry API

A web registry API including database and REST endpoints. Example hosted at [http://datproject.org](http://datproject.org).

[![Build Status](https://travis-ci.org/datproject/dat-registry-api.svg?branch=master)](https://travis-ci.org/datproject/dat-registry-api)

## Features

* Create user accounts.
* Create short links for dats with user accounts.
* Search dats and users.

## Usage

#### `var api = API(config)`

The API takes required configuration variables. Here's an example config. See below in the Configuration section for more details about what configuration variables can be changed.

`config.js`

```js
{
  data: 'data',
  admins: [
    'admin', 'pam', 'willywonka'
  ]
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
```


#### api.close()

Destroys the underlying database connection.


## Example

```js
var express = require('express')
var Api = require('dat-registry-api')
var config = require('./config')

var api = Api(config)
var router = express()

router.post('/users', api.users.post)
router.get('/users', api.users.get)
router.put('/users', api.users.put)
router.delete('/users', api.users.delete)

router.get('/dats', api.dats.get)
router.post('/dats', api.dats.post)
router.put('/dats', api.dats.put)
router.delete('/dats', api.dats.delete)

router.post('/register', api.auth.register)
router.post('/login', api.auth.login)
router.post('/password-reset', api.auth.passwordReset)
router.post('/password-reset-confirm', api.auth.passwordResetConfirm)

```

## Configuration

### Admins

Admins can add, modify, and delete dats that they do not own. Admins can also delete and modify other users. You can specify a list of admin users by their usernames in the configuration.

```js
{
  "admins": ["admin", "pam", "willywonka"]
}
```


### Secret key

Each deployment should have a different secret key. You want to set the secret key for generating password hashes and salts.

```js
{
   township: '<SECRET_KEY>'
}
```

### Default location of account and sqlite databases

Specify where you want data for the app (databases and also by default the archiver) to be located. By default, all the data will be stored in `./data`. If you'd like the data to be stored somewhere else, add a `data` key:

```
{
  data: '/path/to/my/data'
}
```

### Closed beta

To create a closed beta, add the `whitelist` key with the path to a newline-delimited list of emails allowed to sign up. Default value `false` allows anyone to register an account.

```
{
  whitelist: '/path/to/my/list/of/folks.txt'
}
```

`folks.txt` should have a list of valid emails, each separated by a new line character. For example:

```
pamlikesdata@gmail.com
robert.singletown@sbcglobal.netw
```

### Location of cached and archived dat data

You can set the location where dat data is cached on the filesystem. By default it is stored in the `data` directory (above), in the `archiver` subdirectory. You can change this by using the `archiver` key:

```
{
  archiver: '/mnt1/bigdisk/archiver-data'
}
```

### Mixpanel account

The site will report basic information to Mixpanel if you have an account. It will by default use the environment variable `MIXPANEL_KEY`.

This can also be set in the configuration file by using the `mixpanel` key:

```
{
  mixpanel: '<my-api-key-here>'
}
```

### Advanced password security

If you want to have advanced security for generating passwords, you can use ES512 keys, for example. Generate the keys using [this tutorial](https://connect2id.com/products/nimbus-jose-jwt/openssl-key-generation) and set their locations in the configuration file.

```
{
  township: {
    db: 'township.db',
    publicKey: path.join('secrets', 'ecdsa-p521-public.pem'),
    privateKey: path.join('secrets', 'ecdsa-p521-private.pem'),
    algorithm: 'ES512'
  }
}
```
