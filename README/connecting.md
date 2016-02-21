# Connecting to the database
Assuming we have required the [Mongoose][1] package and assigned it to a variable named `mongoose`, we'll have a Mongoose instance under this identifier. Using this variable we can use two methods available in the Mongoose instance for connecting to our [MongoDB][2] database:

1. `mongoose.connect`, used for creating a single **default connection**.
2. `mongoose.createConnection`, for creating **multiple connections**.

## Creating a single connection
The easiest and fastest way to connect to mongo is using the `mongoose.connect` method, like this:

```js
mongoose.connect('mongodb://localhost/experiments');
```

This way we are creating a single connection to MongoDB, which we'll always have available in `mongoose.connection`.

### The connection string
In the above method call we are passing just one argument, a **string** containing a special URI. Let's pick it apart:

* It starts with the required `mongodb://` prefix.
* Followed by the **hostname**, in this case `localhost`.
* Finally a **database name**, `/experiments` in our example. Notice that we don't have to create a database, MongoDB will create a database the first time anything is saved to it, and the same for collections. We can of course connect to an existing database, if we already have one.

In other words, the line above will connect our app to a MongoDB database named `experiments`, running at localhost on the default port (`27017`).

The format of the **connection string** is specified in the [MongoDB documentation][3]. That part of the docs describes the URI format for defining connections between applications and MongoDB instances.

The main components of a connection string are:

* The **required** `mongodb://` prefix, to identify that this is a string in the standard connection format.
* An **optional** `username:password@`, right before the hostname. If specified, the client will attempt to log in to a specific database (must also be provided) using these credentials.
* At least one **hostname**, but we can specify as many hosts as necessary.
* A **port** is optional. The default value is `27017` if not specified.
* A **database** (`/database`) is also **optional** and when not specified defaults to the `admin` database.
* We can also use a **query string** at the end of the URI to pass more **connection options**. This query string starts with an `?` followed by pairs of in the `name=value` form. Each pair must be separated by a `&`, like in a common URL query string. The options are quite a lot, so check the docs about [connection string options][4].

>  Connection strings can be quite long so it's a good idea to define them in a separate variable and pass it to the `connect` method:
>
>  ```js
>  var dbUri = 'mongodb://localhost/experiments';
>  mongoose.connect(dbUri);
>  ```


### The options object
The `connect` method also accepts an **options object** as a second argument which will be passed on to the underlying driver. Some of the options overlap the ones we can specify as a query string. In case of conflict, the options included in the object prevail over the options passed in the connection string.

The following option keys are available:

Option  | Meaning
--------|----------------
db      | Options that affect the Db instance returned by the connection.
server  | Options that modify the Server topology connection behavior.
user    | Username for authentication.
pass    | Password for authentication.
auth    | Options for authentication.
replset | Passed to the connection ReplSet instance.
mongos  | Options that modify the Mongos topology connection behavior.

These options will be passed on to the **underlying driver**. Let's see an example:

```js
var dbUri = 'mongodb://localhost/experiments';

var dbOptions = {
  'user': 'username',
  'pass': 'password'
}

mongoose.connect(dbUri, dbOptions);
```

### Naming the single connection
Even though the `connect` method only creates a **single connection** which is always available in `mongoose.connection`, it's a good idea to assign it to a variable. This way we'll have a **named connection** which is easier to manipulate. For example, we can use the name to close the connection:
```js
var defConn = mongoose.connection;

defConn.close(function () {
  console.log('Mongoose admin connection closed!');
});
```

Apart from closing a connection, there are a lot of things we can do with it, such as attach event listeners, and more. In all these cases, referring to the connection as for example `defConn` is less verbose than having to use `mongoose.connection`.

## Creating multiple connections
The default connection is enough if we only need to connect to one database. But for those situations when we're gonna be connecting to several databases, or even one database using different users with different permissions, we need to use the `createConnection` method.

```js
var dbUri = 'mongodb://localhost/experiments';

var dbUserOptions = {
  'user': 'username',
  'pass': 'password'
}

var dbAdminOptions = {
  'user': 'admin',
  'pass': 'password'
}

var adminConn = mongoose.createConnection(dbUri, dbAdminOptions);
var userConn = mongoose.createConnection(dbUri, dbUserOptions);
```

As you can see, the `createConnection` method returns a **connection object**, so we can name the connections as we create them.

### Closing connections
To close a connection we'll use the `close` method on the `connection` object. This method takes an **optional callback** function, useful for logging a message about the closing:

```js
adminConn.close(function () {
  console.log('Mongoose Administrator connection closed!');
});
```

#### Closing when the Node process ends
It's considered a best practice to open the connection when the application starts, and keep it open to be re-used. The connection only needs to be closed when our Node application stops, either intentionally or not.

To do that we can use an event listener on the `'SIGINT'` event, and close our connection in a callback. This is how we would do it for an unnamed default connection:

```js
var conn = mongoose.connection;

process.on('SIGINT', function() {
  conn.close(function () {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});
```

## Connection events
Each connection is an instance of the `Connection` class, and this class inherit from `EventEmitter`. This means that connections emit events, and we can set event listeners to check for them. Check the [mongoose docs][5] for a full list of them.

These are some of the **connection events** we can listen for:

Event          | Emitted when
---------------|--------------
`connecting`   | Starting a connection
`connected`    | Successfully connected to the db
`disconnected` | When losing the connection to the db
`reconnected`  | After connected-disconnected-connected
`error`        | An error occurs on this connection

For example, this is how we would add a listener for the `error` event on a connection named `conn`:

```js
var conn = mongoose.connection;

conn.on('error',function (err) {  
  console.log('Mongoose connection error: ' + err);
});
```

## Organizing the code
Even though this is gonna be a small project, is not a good practice to put all the code our app needs in a single file. So let's create a file named `db.js` at the root of our project and put there the database related stuff. Check its [source code here][6], at this point everything should be perfectly understandable.

Now we have to require this file in the entry point of our app, the `app.js` file:

```js
var db = require('./db');
```

And that's it, if we start our app we should see the following message at the terminal:

```
Successfully connected to mongodb://localhost/experiments
```

> Check the state of the project so far running:

> ```
> $ git checkout connecting
> $ npm run dev
> ```

---
[:arrow_backward:][back] ║ [:house:][home] ║ [:arrow_forward:][next]

<!-- navigation -->
[home]: ../README.md
[back]: setup.md
[next]: schemas_and_models.md

<!-- links -->
[1]: http://mongoosejs.com/
[2]: https://www.mongodb.org/
[3]: https://docs.mongodb.org/manual/reference/connection-string/
[4]: https://docs.mongodb.org/manual/reference/connection-string/#connection-string-options
[5]: http://mongoosejs.com/docs/api.html#connection-js
[6]: https://github.com/lifeBalance/mongoose_experiments/blob/v0.2/db.js
