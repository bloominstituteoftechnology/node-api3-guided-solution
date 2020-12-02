# Node API 3 Guided Project

## Introduce Middleware

Use the content on Canvas to introduce the `middleware`.

Cover the three types.

- built-in.
- third party.
- custom.

## Use Third Party Middleware

1. Run the server and visit the `/` endpoint using a REST client or the browser.
1. Show the headers. There are 6 headers, one of them is `X-Powered-By: Express`. Explain how this is a security problem.
1. Install `helmet` npm module.
1. Require `helmet` inside `server.js`: `const helmet = require('helmet');`
1. Use the `helmet` middleware: `server.use(helmet())`
1. Send another request using a REST client. We get security headers added and the `X-Powered-By: Express` is gone.

**wait for students to catch up, use a `yes/no` poll to let students tell you when they are done**

### You Do (estimated time 5 mins)

Ask students to install and use a `morgan`. Hint them to follow a link to `morgan` on Canvas and read the documentation on how to use it.

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
4. Make a new request. The value was set by the _middleware_.

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
4. Make requests to various endpoints to show we are locked out.
5. This middleware disables our entire api, so comment out where it is used:

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
function validateId(req, res, next) {
  const { id } = req.params;
  Hubs.findById(id)
    .then(hub => {
      if (hub) {
        // if the hub is found, we can store it in the req in case we need it in the request
        req.hub = hub;
        next();
      } else {
        // if the id is invalid and send back a detailed errore message
        res.status(404).json({ message: 'Invalid id; hub not found' });
      }
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error processing request',
      });
    });
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
  // we can greatly simplify this logic
  res.status(200).json(req.hub);
});
```

5. Note that we could also simplify the logic in some of the other endpoints if we so choose

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
    res.status(400).json({ message: 'Please include request body' });
  }
}
```

It should be added to the `POST` and `PUT` requests:

```js
router.post('/', requiredBody, (req, res) => {});

router.put('/:id', [validateId, requiredBody], (req, res) => {});

router.post('/:id/messages', [validateId, requiredBody], (req, res) => {});
```

Note that we can use more than one local `middleware`, such as on `PUT /api/hubs/:id` and `POST /api/hubs/:id/messages`.

Test with the endpoints with missing bodies.

## Write Error Handling Middleware (Optional - 10 minutes remaining)

Use the content on TK to introduce how error handling middleware works. **Emphasize that order matters**, error handling middleware can catch errors that happen on all route handlers and middleware that precede it.

Right before `module.exports = server;` on `server.js` write a catch-all error handling middleware:

```js
// look, four homies! the first argument is new
server.use((error, req, res, next) {
  // here you could inspect the error and decide how to respond
  res.status(400).json({ message: 'Bad Panda!', error });
});
```

We can route the request to the error handling middleware from any middleware or endpoint by calling `next()` passing **any** argument, doesn't have to be a proper `Error` object.

Change the `requiredBody` and `validateId` middleware to fire the error handling middleware.

```js
function validateId(req, res, next) {
  const { id } = req.params;
  Hubs.findById(id)
  .then(hub => {
    if (hub) {
      // if the hub is found, we can store it in the req in case we need it in the request
      req.hub = hub;
      next();
    } else {
      // CHANGE CODE HERE
      next({ message: "Invalid id; hub not found"});
    }
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error processing request',
    });
  });
}

function requiredBody(req, res, next) {
  if (req.body && Object.keys(req.body).length > 0) {
    next();
  } else {
    // CHANGE CODE HERE
    next({ message: "Please include request body" }));
  }
}
```

Make a request with an invalid id and with a missing body to confirm that the error handler is firing.

**wait for students to catch up, use a `yes/no` poll to let students tell you when they are done**
