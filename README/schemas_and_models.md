# Schemas and models
In [relational databases][1] we must define a table's **schema** before we can start inserting data into the table. That means that every row we insert in the table, will have to adapt to the structure defined by the schema, otherwise it will be rejected as invalid data.

In [MongoDB][2] data has a **flexible schema**, in other words we don't have to define a schema to start inserting documents in the database. But if we want to model our data using schemas, [Mongoose][3] is the way to go.

## Defining a schema
Everything in Mongoose starts with a **schema**, which is compiled into a **model**. For example:

> The following example assumes that we have included mongoose in our project and open a connection to a database on our locally running instance of MongoDB, something like this:

> ```js
> var mongoose = require('mongoose');
> mongoose.connect('mongodb://localhost/test');
> ```

And now the example:

```js
var kittenSchema = mongoose.Schema({
    name: String,
    lives: Number
});
```

In the code snippet above we have used the `mongoose.Schema` constructor to create a very simple schema. We are passing as an argument a common JavaScript object with a couple of **properties** (`name` and `lives`). The **keys** will be used as such when creating new documents, and the **values** represent `SchemaTypes`, which define the type of data a document can store in a property. In this case we are using `String` and `Number`, but Mongoose allows the following `SchemaTypes`:

* String
* Number
* Date
* Buffer
* Boolean
* Mixed
* ObjectId
* Array

Read more about them [here][4].

## Compiling a model
Once we have a **schema** we have to compile it in a **model** to start using it. Following with the previous example:

```js
var Kitten = mongoose.model('Kitten', kittenSchema);
```

In just one line we have compiled a model and stored it, for further use, in the variable `Kitten`. The `mongoose.model` method takes 2 arguments:

1. The **name of the model**, in this case `Kitten`. (The variable to handle the model is also named `Kitten`)
2. The second one is the **name of the schema** we are compiling into a model.

With the model ready we can start creating documents, which are instances of a model.

## Creating documents
**Models** are just **constructors** compiled from our schema definitions. Every time we  create a document, we are instantiating a model. For example:

```js
var grumpy = new Kitten({ name: 'Grumpy Cat' });
```

Here we are creating a new document using the `Kitten` model. This document will be created with the properties and behaviors defined in our schema. To persist the document to the database we would do:

```js
grumpy.save(function (err) {
  if (err) return handleError(err);
})
```

If there's no error, this document will be saved into a **collection** named `kittens`, which is the pluralized form of the model name, `Kitten`. All document creation and retrieval from the database is handled by models.

> We could also create the instance and persist it in a single step using the `create` method:

> ```js
> Kitten.create({ name: 'Grumpy Cat' },  function (err, small) {
>   if (err) return handleError(err);
> });
> ```

Every document is created as an instance of a model and inserted into a MongoDB **collection** which name is the pluralized form of the model name.

## Back to our project: Creating a models folder
In order to keep a clean and well structured project we are going to create a folder named `models/` at the root of our project. Inside this directory we'll create a file for each of our schemas. We are going to create two schemas/models, one for storing users and another one for projects.

### A user schema
Let's create a file for a user schema in `models/user.js`, it looks like this:

```js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Defining a user schema
var userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  createdOn: { type: Date, default: Date.now },
  modifiedOn: Date,
  lastLogin: Date
});
```

* In the first two lines we require the `mongoose` package and assign the `mongoose.Schema` constructor method to a variable named `Schema`.
* Then we use the `new` statement to create a schema instance called `userSchema`. Note that we can pass **options** to our `SchemaTypes`, such as `unique`, which is a quick validation to ensure that an email address only appears once in the database.

### A user model
Once we have a schema the next step is compiling it into a **Model**, we do that using the `model` method. For example:

```js
module.exports = mongoose.model('User', userSchema);
```

In this case, since we are keeping our model in a separate file instead of assigning the model to a variable we are exporting it.

### The project schema and model
We have done something similar for the **project resource** so just taking a look to the [source code][5] of `project.js` should be self-explanatory.

## Importing the models
Since we have chosen to keep our schemas/models in separate files, they need to be imported into our application. Remember that we put the database stuff also in a separate file, so let's bring the models in this file. So inside `db.js` we'll put:

```js
var User = require('./models/user');
var Project = require('./models/project');
```

Mongoose models rely on the connection being defined, so we'll put this code at the bottom of the file. Note that no documents will be created/removed until the connection our model uses is open.

That's it, we're ready to start creating entries in our database.

> Check the state of the project so far running:

> ```
> $ git checkout schemas
> $ npm run dev
> ```

---
[:arrow_backward:][back] ║ [:house:][home] ║ [:arrow_forward:][next]

<!-- navigation -->
[home]: ../README.md
[back]: connecting.md
[next]: #

<!-- links -->
[1]: https://en.wikipedia.org/wiki/Relational_database
[2]: https://www.mongodb.org/
[3]: http://mongoosejs.com/
[4]: http://mongoosejs.com/docs/schematypes.html
[5]: https://github.com/lifeBalance/mongoose_experiments/blob/schemas/models/project.js
