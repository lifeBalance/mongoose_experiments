# CRUD II: Updating and Deleting
We have implemented the necessary logic for performing two [CRUD][1] operations:

* One route for **Creating** users.
* And two more, one for **Reading** a list of users, and another one for **Reading** each individual profile.

In this section we're going to deal with the next two letters of the acronym: **Updating** and **Deleting**.

## CRUD: Update
In our tour of the CRUD actions it's time for **Updating** records. In our example that means updating user profiles and in order to do so we're going to take care of 4 things:

1. Add a **Edit Profile** link in the User profile view.
2. A **form** for editing the profile.
3. A couple of **routes**.
4. And a couple of **route handlers**.

### Link to the edit form
Let's start with the link. From your `views/users` folder open the `user.jade` file and add the following link after the `Delete User` button:

```
a(href="/users/#{user.id}/edit") Modify Profile
```

Clicking this link should take us to the edit form, which we'll be creating next.

### The edit form
Since we are not here for practicing our design skills, let's do a simple form. Problem is that is gonna be very similar to the one for creating users. To keep our templates [DRY][5] we are going to use a [Jade][6] feature called [mixins][7] which are like partials but can take arguments.

First let's create a folder in `views/mixins` and inside it we're going to place a mixin named `form.jade`:

```jade
mixin form(name, email)
  form(method="POST")&attributes(attributes)
    label(for="Name") Name
    input(name="Name", type="text", value="#{name}")
    br
    label(for="Email") Email
    input(name="Email", type="text", value="#{email}")
    br
    button(type="submit")= btnMsg
```

As you can see the mixin `form` includes input fields for modifying just the `name` and `email` fields, the `modifiedOn` field it's updated automatically as we'll see in the route handler.

To use the mixin is our `users/edit.jade` template we are going to include it, and call it with the `+` operator:

```jade
extends ../layout

block content
  h1= title

  include ../mixins/form
  + form(user.name, user.email, btnMsg)(action='/users/#{user.id}?_method=PUT')
```

Notice that we are passing several arguments:

* `user.name`, which we'll receive from the handler.
* `user.email`, idem.
* `btnMsg`, idem.
* And then a special argument in separate parens with the **action** attribute of the form, and the `user.id` interpolated. But if you look carefully, we are passing a strange query string at the end of the action (`?_method=PUT`), in the next section we explain its meaning.

> When calling the same mixing from the `users/new.jade` we're gonna be passing different arguments, so check the source code of [new.jade][8] to compare.

#### Most browsers only support GET and POST
The problem with the route defined for deleting users is that it uses the HTTP `DELETE` method, and most of the browsers today only have solid support for `GET` and `POST`. A workaround for this is to tunnel other methods through `POST` by using a **hidden form field** which is read by the server and the request dispatched accordingly. To do that we're going to use the [method-override][3] middleware. Install the package running:

```
$ npm i method-override -S
```

Then we'll require it in our main file and mount it:

```js
var methodOverride = require('method-override')
// ...

app.use(methodOverride('_method'));
```

We have mounted the middleware passing the name of the hidden form field (`_method`) that will be sent as a **query string**, so the server will dispatch the request according to the value received. Our mixin will generate the following HTML:

```html
<form method="POST" action="/resource?_method=PUT">
  <button type="submit">Update</button>
</form>
```
Even though we send this form as a `POST` request, the server will dispatch it as a `PUT` request thanks to the hidden form field.

### The routes
This is gonna be easy, just add the following lines to your `app.js`:

```js
app.get('/users/:id/edit', users.edit);
app.put('/users/:id', users.update);
```

The first one is for rendering the form, and the second one is for actually updating the user record when we submit the form. Notice in the second one the use of `put` for defining the route.

### The route handlers
And finally the route handlers, so inside `routes/users.js` let's add one for rendering the **Edit User** form:

```js
exports.edit = function(req, res, next) {
  var user = User.findById(req.params.id, function (err, user) {
    if (user === null) {
      console.log("> User with Id: '%s' does not exist. User: %s - Error: %s", req.params.id, user, err);
      return next(err);
    } else {
      res.render('users/edit', {
        title: 'Edit User Profile',
        user: user,
        btnMsg: 'Update'
      });
    }
  });
};
```

This handler renders the `users/edit` template with the User's information, and pass also a string with the text(`'Update'`) for the submit button.

We need another one for **updating the user record** in the database:

```js
exports.update = function(req, res, next) {
  User.findByIdAndUpdate(req.params.id, {
    modifiedOn: Date.now(),
    name: req.body.name,
    email: req.body.email
  }, function (err, user) {
    if (user === null) {
      console.log("> User with Id: '%s' does not exist. User: %s - Error: %s", req.params.id, user, err);
      return next(err);
    } else if(err) {
      console.log('Error updating %s: %s', user.name, err);
      return next(err);
    } else {
      console.log("> User '%s' has been updated", user.name);
      res.redirect('/users'); // Back to User Profile
    }
  });
};
```

## CRUD: Delete
Deleting is the final CRUD operation. Let's start with the router:

```js
app.delete('/users/:id', users.destroy);
```

Now let's add a button at the bottom of the `views/users/user` template:

```
form(method="POST", action="/users/#{user.id}?_method=DELETE")
  button(type="submit") Delete User
```

Again we are making use of the functionality added by the [method-override][3] package, that allows us to send the form as a `POST` even though it will be processed in the server as a `DELETE` request, thanks to the hidden field sent as query string at the end of the action (`?_method=DELETE`).

### Route handler for deleting users
Ok, we have a route and a template, let's take care of the route handler:

```js
exports.destroy = function(req, res, next) {
  User.findByIdAndRemove(req.params.id, function (err, user) {
    if(user === null) {
      console.log("> User with Id: '%s' does not exist. User: %s - Error: %s", req.params.id, user, err);
      return next(err);
    } else if(err) {
      console.log('Error deleting %s: %s', user.name, err);
      return next(err);
    } else {
      console.log("User '%s' has been removed", user.name);
      res.redirect('/users');
    }
  });
};
```
We have used another Mongoose's **model methods** named `User.findByIdAndRemove`. This handler shouldn't need any explanation. Check the [Mongoose API docs][4] to learn more about this method.

And that's it. So far we have a web app that can perform all of the CRUD operations.

* **Create** new users in the database.
* **Read** from the database, when we list users and visit user profiles.
* **Update** users.
* And also **Delete** users.

> Check the state of the project so far running:

> ```
> $ git checkout crud2
> $ npm run dev
> ```

---
[:arrow_backward:][back] ║ [:house:][home] ║ [:arrow_forward:][next]

<!-- navigation -->
[home]: ../README.md
[back]: crud_1.md
[next]: #

<!-- links -->
[1]: https://en.wikipedia.org/wiki/Create,_read,_update_and_delete
[2]: http://mongoosejs.com/docs/api.html#model_Model.findById
[3]: https://www.npmjs.com/package/method-override
[4]: http://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
[5]: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
[6]: http://jade-lang.com/
[7]: http://jade-lang.com/reference/mixins/
[8]: https://github.com/lifeBalance/mongoose_experiments/blob/v0.6/views/users/new.jade
