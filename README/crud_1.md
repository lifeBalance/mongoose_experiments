# CRUD I: Creating and Reading
Now that we have defined a data structure using schemas, we're ready to start interacting with documents from our database. Mongoose includes methods to cover all of the standard [CRUD][1] operations. These methods are either:

* **Model methods**, meaning methods that we call in the model itself such as `User.create`.
* **Document methods**, which are available through the instances, for example, `grumpy.save`.

> All interaction with data is handled by models, either through the class or the instances. As we'll see in a later section, Mongoose even allows us to define our own model methods.

Since we are making a web app, the goal here is to trigger these CRUD operations using HTTP requests, in other words, we need to tie up our models to our routes. Let's do that next.

## Defining routes
Our Express project already includes a `routes/` folder, inside it we are going to create a route file for each of our models. As our application grows, these files will increase in size and complexity, so it's a good idea having one per model. In this case we are going to create a `routes/users.js` and a `routes/projects.js` files.

* Inside each of these files we have to make sure that we are requiring `mongoose` as well as the respective model. So for example, at the top of `routes/users.js` we'll add:

  ```js
  var mongoose = require('mongoose');
  var User = require('../models/user');
  ```

* In `routes/projects.js` we'll do something similar but obviously, instead of the user model we'll require the `models/project` model.

* Finally, we just have to require these routes in the main file, so make sure that in `app.js` has:

  ```js
  var users = require('./routes/users');
  var projects = require('./routes/projects');
  ```

### Route planning
This is the complete list of routes we are going to use for managing users:

HTTP Verb   | Path            | Action          | Used for
------------|-----------------|-----------------|---------------
GET         | /users/         | users.index     | Show list of users
GET         | /users/:id      | users.show      | Show Profile page
GET         | /users/new      | users.new       | Form for creating new user
POST        | /users/         | users.create    | Create new user in the db
GET         | /users/:id/edit | users.edit      | Form for updating user
PUT         | /users/:id      | users.update    | Update the user in the db
DELETE      | /users/:id      | users.destroy   | Deleting user

Note that some of these routes have an `:id` segment in the path, this is a **parameter** that will be extracted from the URL when the request is handled. That's why these routes are known as **parameterized routes**.

### Separating routes from route handlers
In order to keep our main file as clean and uncluttered as possible, we're going to add in `app.js` the **routes** with just a reference to the request handlers. All of the logic for handling the requests will be moved into the route files. This way we just have to take a look at our main file to see the routes our app has available, without having all the code logic cluttering the space.

For example, consider the following route:

```js
app.get('/users/new', users.new);
```

Notice how the handler in this route (`users.new`) doesn't contain any code, it's just a reference to the `new` action which is available through the `users` variable. This variable has been declared at the top of the file and it stores all the logic contained in the `users.js` route file.

## 1. The New User Form
First of all let's define the route in `app.js`:

```js
app.get('/users/new', users.new);
```

And now the route handler in `routes/users.js`:

```js
exports.new =  function(req, res) {
  res.render('users/new', {
    title: 'New User'
  });
};
```

In the code above we are exporting an anonymous function as `new`. This function is pretty simple, it just calls the `res.render` method to render an HTML form that allows us to enter the necessary information to create a new user.

Now we have to create a template for the form. It's worth noticing that for structure's sake, we have created a folder for placing **users templates** in `views/users`. Inside it we are going to place the `new.jade` template, which contains a pretty simple form. Check its source code [here][4].

Now, if we start our app and point our browser to http://localhost:3000/users/new, we should be able of seeing the form. Filling it out and submitting it would be pointless at this stage since we haven't implemented the logic to handle such request.

## 2. Create User
Here we are gonna be performing our first CRUD operation, **Create**, and we are going to do that using our web-app. First of all, let's add our second route to our main file, `app.js`:

```js
app.post('/users/', users.create);
```

For every `POST` request that hits the `/users` path, the `users.create` action is called.  So inside `routes/users.js` let's add such action:

```js
exports.create =  function(req, res, next) {
  User.create({
    name: req.body.name,
    email: req.body.email,
    modifiedOn: Date.now(),
    lastLogin: Date.now()
  }, function (err, user) {
    if (err) {
      console.log('Error creating new user: ', err);
      return next(err);
    } else {
      console.log("User '%s' created", user.name);
      res.redirect('/users');
    }
  });
};
```

This action is a bit more complex. First of all notice that we are using one of the Mongoose's **model methods**, `User.create`, which is called with 2 arguments:

1. An **object** containing all the fields we want to write.
2. An **anonymous function**, useful to handle with possible **errors**. In there's no error we print a success message to the terminal and redirect to `/users` (which is not implemented yet). In case of error we print another message and call the `next(error)` method. Let's explain this last part in more deep next.

#### Handling errors in Express
There are several ways to handle errors in Express.js. One is to throw the error, which inevitably will crash the app, for example:

```js
app.get("/users", function(req, res){
  User.find(function(err, users){
    if (err) { throw err; }
    // No error? Do some stuff here
    // res.render...
  });
});
```

But we don't have to throw errors and exit the app. The **Express generator** includes a couple of **error handler middlewares** that work out of the box, check the one for **development**:

```js
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
```

To make use of this middleware, we just have to include in our **route handlers** a third parameter, `next` that allows us to call `next(err)` and let the middleware handle the error without crashing the app. In this case, the middleware will render the `error.jade` template (also a goodie from the generator) printing the error message and its stacktrace.

## 3. Listing Users
Now that we have implemented the logic necessary for creating users, let's crack on with another CRUD operation, **Reading**. In this case we are going to be reading all the documents in the `users` collection, meaning we are gonna be listing users. Let's start adding the route in our `app.js` file:

```js
app.get('/users/', users.index);
```

This route is listening for `GET` requests at the `/users` path, and calling the `index` action for each of them. Next order of business is gonna be implementing this action, so inside `routes/users.js` let's add:

```js
exports.index =  function(req, res, next) {
  User.find(function(err, users) {
    if (err) {
      console.log('Error finding %s: %s', user.name, err);
      return next(err);
    } else {
      res.render( 'users/index', {
        title : 'Users List',
        users : users
      });
    }
  });
};
```
First of all we are exporting the anonymous function as `index`.
Inside the first anonymous function we are calling the method `User.find` (note that is a **model method**, called on `User`). If there are no errors, we use the `res.render` method to render a template named `index`, and we are passing as the data context an object with 2 properties:

* The `title` of the page.
* An array of users returned by the `User.find` method.

Don't forget to check [here][5] the source code for the `index.jade` template.

At this point, if we start the app we should be able of creating and listing users.

## 4. Showing a User Profile
It's time for another CRUD operation, again we are gonna be **Reading** from the database but this time one user at a time. One more time let's start with the router, so in `app.js` let's add:

```js
app.get('/users/:id', users.show);
```

Let's see how the route handler deals with this request:

```js
exports.show =  function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (user === null) {
      console.log("> User with Id: '%s' does not exist. User: %s - Error: %s", req.params.id, user, err);
      return next(err);
    } else {
      console.log("> Showing user '%s'", user.name);

      res.render( 'users/user', {
        title: 'User Profile',
        user: user
      });
    }
  });
};
```

First of all we are exporting the `show` action, which contains a simple anonymous function. Inside this function we are making a **single query operation** using the model method `User.findById`. We are passing two arguments:

* The `id` we extract from the `req.params` object.
* A **callback function**, inside which we deal with the error. Notice the condition that we are passing into the **if statement**: We are checking if the `user === null`, this is because if for some reason we're trying to retrieve a user that doesn't exist, the `User.findById` method will return `null` as the value both for `user` and for `err`.

  If there's no error call the `res.render` method passing in the usual suspects: name of the **template** (see next section) and a **data context** object.

> Check the [Mongoose docs][2] to see a complete description of this `Model.findById`.

Before creating the **User profile template** we have to make a minor change to our `user/index` one, namely we have to add a link to each user's profile page:

```jade
td: a(href="/users/#{user.id}") #{user.name}
```

And now, inside the `views/users` folder let's create a simple template named `user.jade`:

```jade
extends ../layout

block content
  h1= title
  h2= user.name
  p #[strong Email:] #{user.email}
  p #[strong Created on:] #{user.createdOn}
  p #[strong Modified on:] #{user.modifiedOn}
```

We're almost done.

#### Adding moment.js to the app.locals object
One last thing we're going to do is install the [moment.js][3] library for formatting our dates:

```
$ npm i moment -S
```

Then we can use a nice trick to have the library available everywhere: add it to the `locals` object. So in our main file, and obviously after we instantiate `Express` we'll add:

```js
var app = express(); // <= Add after this
app.locals.moment = require('moment');
```

Now we can use moment.js in any of our views, since the `app.locals` object and its properties are available as local variables anywhere within the application.

> Check the state of the project so far running:

> ```
> $ git checkout crud
> $ npm run dev
> ```

---
[:arrow_backward:][back] ║ [:house:][home] ║ [:arrow_forward:][next]

<!-- navigation -->
[home]: ../README.md
[back]: schemas_and_models.md
[next]: crud_2.md

<!-- links -->
[1]: https://en.wikipedia.org/wiki/Create,_read,_update_and_delete
[2]: https://www.npmjs.com/package/method-override
[3]: http://momentjs.com/
[4]: https://github.com/lifeBalance/mongoose_experiments/blob/crud/views/users/new.jade
[5]: https://github.com/lifeBalance/mongoose_experiments/blob/crud/views/users/index.jade
