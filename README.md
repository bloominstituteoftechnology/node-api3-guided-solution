# Web API III Guided Project

Guided project for **Web API III** module.

In this project we will learn how to create a very simple Web API using `Node.js` and `Express`, and cover the basics of `server-side routing` and using global `middleware`.

The code for the guided project will be written in a single file for simplicity. We'll see ways to structure an API to make it more maintainable in upcoming lectures.

## Prerequisites

- [Postman](https://www.getpostman.com/downloads/) installed.

## Starter Code

The [starter code](https://github.com/LambdaSchool/webapi-iii-guided) for this project is configured to run the server by typing `yarn server` or `npm run server`. The server will restart automatically on changes.

## How to Use this Repository

- clone the [starter code](https://github.com/LambdaSchool/webapi-iii-guided).
- create a solution branch: `git checkout -b solution`.
- add this repository as a remote: `git remote add solution https://github.com/LambdaSchool/webapi-iii-guided-solution`
- pull from this repository's `master` branch into the `solution` branch in your local folder `git pull solution master:solution --force`.

A this point you should have a `master` branch pointing to the student's repository and a `solution` branch with the latest changes added to the solution repository.

When making changes to the `solution` branch, commit the changes and type `git push solution solution:master` to push them to this repository.

When making changes to the `master` branch, commit the changes and use `git push origin master` to push them to the student's repository.

## Introduce Middleware

Use the content on Training Kit to introduce the `middleware`.

Cover the three types.

- built-in.
- third party.
- custom.

## Use Third Party Middleware

1. Run the server and visit the `/` endpoint using `Postman`.
1. Show the headers. There are 6 headers, one of them is `X-Powered-By: Express`. Explain how this is a security problem.
1. Install `helmet` npm module.
1. Require `helmet` inside `server.js`: `const helmet = require('helmet');`
1. Use the `helmet` middleware: `server.use(helmet())`
1. Send another request using `Postman`. We get security headers added and the `X-Powered-By: Express` is gone.

**wait for students to catch up, use a `yes/no` poll to let students tell you when they are done**

### You Do (estimated time 5 mins)

Ask students to install and use a `morgan`. Hint them to follow a link to `morgan` on Training Kit and read the documentation on how to use it.

Solution.

```js
const morgan = require('morgan');
const server = express();
server.use(morgan('dev')); // one of the options for the display format is 'dev'
```

Make a request to any endpoint on the server and show the log that `morgan` displays on the terminal/console window.

**wait for students to catch up, use a `yes/no` poll to let students tell you when they are done**

Next, we'll learn how to create the other type of middleware: `custom middleware`.

## Write Custom Middleware

1. Explain how _custom middleware_ works.
2. Add this global middleware to `server.js` below the `GET /` endpoint:

```js
// just like that, the homies become the three amigos (courtesy of Joshua Keslar from Web 17)
function methodLogger(req, res, next) {
  console.log(`${req.method} Request`);
  next();
}
```

3. Explain that middleware can be used _globally_ and _locally_, in this example we're using it globally, which means we push add it before all endpoints. All requests will include an extra log statement including the request method. Plug in this middleware below the third-party global middleware:

```js
server.use(methodLogger);
```

4. Visit any endpoint to verify the middleware is working.

**wait for students to catch up, use a `yes/no` poll to let students tell you when they are done**

Let's write a piece of middleware that adds information to the `request` object. Note that the `GET /` enpoint is looking for `req.name`.

## Use Custom Middleware to Modify the Request Object

1. Write the `addName` middleware below the `methodLogger` code:

```js
function methodLogger(req, res, next) {
 ...
}

function addName(req, res, next) {
  req.name = "Cassandra";
  next();
};
```

2. Make a request to the server and show that we are still not seeing the name appear.
3. `Use` the middleware before the route handlers: `server.use(addName)`.
5. Make a new request. The value was set by the _middleware_.

**wait for students to catch up, use a `yes/no` poll to let students tell you when they are done**

Custom middleware can also cancel the request and send back a response using the `res` parameter.

## Use Custom Middleware to Cancel a Request

1. Write the `lockout` middleware below the `addName` code:

```js
function methodLogger(req, res, next) {
 ...
}

function addName(req, res, next) {
 ...
};

function lockout(req, res, next) {
  res.status(403).json({ message: 'API lockout!'});
}
```

3. `Use` the middleware before the route handlers: `server.use(lockout)`.
5. Make requests to various endpoints to show we are locked out. 
6. This middleware disables our entire api, so comment out where it is used:

```js
// server.use(lockout);
```

### You Do (estimated 5 min to complete)

Ask students to write and _use_ custom middleware that returns status code `403` and the message 'you shall not pass!' when the seconds on the clock are multiples of 3 and call `next()` for all other times.

One possible solution:

```js
server.use(moodyGateKeeper);

function moodyGateKeeper(req, res, next) {
  const seconds = new Date().getSeconds();

  if (seconds % 3 === 0) {
    res.status(403).json({ you: 'shall not pass!' });
  } else {
    next();
  }
}
```

**wait for students to catch up, use a `yes/no` poll to let students tell you when they are done**

What if we want to add middleware that affects a set of endpoints, but not others?

## Use Middleware Locally

1. Go to `hubs/hubs-router.js` file.
2. Add the following piece of middleware at the top of the file. Note that `router.use` is also a function. 

```js
router.use((req, res, next) => {
  console.log('Hubs Router!');
  next();
});
```
3. Hit several endpoints on this router to verify that it works.
4. Make a `GET /` request to verify that the middleware does not execute. 

**wait for students to catch up, use a `yes/no` poll to let students tell you when they are done**

Let's write something more useful that will help us send back detailed error messages to the client.

### Hub Id Validation Middleware

1. At the bottom of the `hubs-router` file, write the following middleware:

```js
async function validateId(req, res, next) {
  const { id } = req.params;
  const hub = await Hubs.findById(id);
  if (hub) {
    // if the hub is found, we can store it in the req in case we need it in the request
    req.hub = hub;
    next();
  } else {
    // if the id is invalid and send back a detailed errore message
    res.status(404).json({ message: "Invalid id; hub not found"})
  }
}
```

2. This bit of a middleware should not be applied to the entire router, because not all endpoints have ids. Explain that we can add it to specific route handlers as a second parameter:

```js
router.get('/:id', validateId, (req, res) => {});

router.delete('/:id', validateId, (req, res) => {});

router.put('/:id', validateId, (req, res) => {});

router.get('/:id/messages', validateId, (req, res) => {});

router.post('/:id/messages', validateId, (req, res) => {});
```

3. Hit various endpoints with valid and invalid ids to show the message.

4. We could use this middleware to simplify some of our route handlers, such as `GET api/hubs/:id`:

```js
router.get('/:id', validateId, (req, res) => {
  // we can greatly simplify this logic now 
  const { hub } = req;
  res.status(200).json(hub);
});
```

**wait for students to catch up, use a `yes/no` poll to let students tell you when they are done**

### You Do (estimated 5 minutes to complete)

Ask students to write a middleware function called `requiredBody`. If `req.body` is not defined and is an empty object, it should cancel the request and send back a status `400` with the message `"Please include request body"`. 

Additionally, they should add it to the necessary endpoints within the hubs router.

One possible solution:

```js
function requiredBody(req, res, next) {
  if (req.body && Object.keys(req.body).length > 0) {
    next();
  } else {
    res.status(400).json({ message: "Please include request body" });
  }
}
}
```

It should be added to the `POST` and `PUT` requests:

```js
router.post('/', requiredBody, (req, res) => {});

router.put('/:id', [ validateId, requiredBody], (req, res) => {});

router.post('/:id/messages', [ validateId, requiredBody ], (req, res) => {});
```

Note that we can use more than one local `middleware`, such as on `PUT /api/hubs/:id` and `POST /api/hubs/:id/messages`.

Test with the endpoints with missing bodies.

## Write Error Handling Middleware

Use the content on TK to introduce how error handling middleware works. **Emphasize that order matters**, error handling middleware can catch errors that happen on all route handlers and middleware that precede it.

Right before `module.exports = server;` write a catch-all error handling middleware:

```js
// look, four homies! the first argument is new
function errorHandler(error, req, res, next) {
  // here you could inspect the error and decide how to respond
  res.status(400).json({ message: 'Bad Panda!', error });
}
```

We can route the request to the error handling middleware from any middleware or endpoint by calling `next()` passing **any** argument, doesn't have to be a proper `Error` object.

Change the `restricted` middleware to fire the error handling middleware if there is no _authorization_ header.

```js
function restricted(req, res, next) {
  const password = req.headers.authorization;

  if (req.headers && req.headers.authorization) {
    if (password === 'mellon') {
      next();
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    // fire the next error handling middleware in the chain
    next({ message: 'no authorization header provided' });
  }
}
```

Make a request to `/api/hubs` without attaching the _authorization header_. Confirm that the response comes from the error handling middleware with a status of `400`.

Make a request to `/api/hubs` attaching the _authorization header_ with a wrong password. Confirm that the response comes from the `restricted` middleware with a status of `401`.

Make a request to `/api/hubs` attaching the _authorization header_ with a correct password. Confirm that the request is routed to the endpoint.

**wait for students to catch up, use a `yes/no` poll to let students tell you when they are done**
