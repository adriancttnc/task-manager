const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
// eslint-disable-next-line no-unused-vars
const { mongoose } = require('./db/mongoose');
const port = 3000;

// Load in the mongoose Models
const { List, Task, User} =  require('./db/models');

const jwt = require('jsonwebtoken');


/************************************************************
 ***********************MIDDLEWARE***************************
************************************************************/

// Load middleware
app.use(morgan('dev'));
app.use(bodyParser.json());

// CORS HEADERS MIDDLEWARE
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, PATCH');
      return res.status(200).json({});
    }
    res.header('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token');
  next();
});

// Check whether the request has a valid JWT token.
let authenticate = (req, res, next) => {
  let token = req.header('x-access-token');

  // Verify the JWT
  jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
    if (err) {
      // JWT is invalid  -  do not authenticate.
      res.status(401).send();
    } else {
      // JWT is valid.
      req.user_id = decoded._id;
      next();
    }
  });
}

// Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
  // Grab the refresh token from the request header.
  let refreshToken = req.header('x-refresh-token');

  // Grab the _id from the request header.
  let _id = req.header('_id');

  User.findByIdAndToken(_id, refreshToken)
    .then((user) => {
      if (!user) {
        // User couldn't be found.
        return Promise.reject({
          'error': 'User not found. Make sure that the refresh token and user id are correct.'
        })
      } else {
        // The user was found, therefore the refreshToken exists in the database but we still have to check if it has expired.
        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
          if (session.token === refreshToken) {
            if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
              // Refresh token has not expired.
              isSessionValid = true;
            }
          }
        });

        if (isSessionValid) {
          // The session is valid. Call next() to continue with processing this web request.
          next();
        } else {
          // The session is not valid.
          return Promise.reject({
            'error': 'Refresh token has expired or the session is invalid.'
          });
        }
      }
    })
    .catch((err) => {
      res.status(401).send(err);
    })
}


/************************************************************
 ***********************ROUTE HANDLERS***********************
************************************************************/


/************************************************************
 ***********************LIST ROUTES**************************
************************************************************/

/**
 * GET /lists
 * Purpose: Get all lists
 */
app.get('/lists', authenticate, (req, res) => {
  // We want to return an array of all the lists in the database that belong to the authenticated user.
  List.find({
    _userId: req.user_id
  })
    .then((lists) => {
      res.send(lists)
    });
});

/**
 * POST /lists
 * Purpose: Create a list
 */
app.post('/lists', (req, res) => {
  // We want to create a new list and create the new list document back to the user (which includes the id).
  // The list information (fields) will be passed in via the JSON request body.
  let title = req.body.title;

  let newList = new List({
    title
  });
  newList.save()
    .then((listDoc) => {
      // The full list document is returned.
      res.send(listDoc);
    });
});

/**
 * PATCH /lists/:id
 * Purpose: Update specified list
 */
app.patch('/lists/:id', (req, res) => {
  // We want to update the specified list with the new values specified in the JSON body of the request.
  List.findOneAndUpdate({ _id: req.params.id }, {
    $set: req.body
  })
  .then(() => {
    res.sendStatus(200);
  });
});

/**
 * DELETE /lists/:id
 * Purpose: Delete specified list
 */
app.delete('/lists/:id', (req, res) => {
  // We want to delete the specified list.
  List.findOneAndRemove({ _id: req.params.id })
    .then((removedListDoc) => {
      res.send(removedListDoc)
    });
});

/************************************************************
 ***********************TASK ROUTES**************************
************************************************************/

/**
 * GET /lists/:listId/tasks
 * Purpose: Get all tasks in a specific list
 */
app.get('/lists/:listId/tasks', (req, res) => {
  // We want to return all tasks that belong to a specific list (specified by listId).
  Task.find({ _listId: req.params.listId })
    .then((tasks) => {
      res.send(tasks);
    })
})

/**
 * GET /lists/:listId/tasks/:taskId
 * Purpose: Get a specific task
 */
app.get('/lists/:listId/tasks/:taskId', (req, res) => {
  // We want to return a specific task.
  Task.findOne({
    _id: req.params.taskId,
    _listId: req.params.listId
  }).then((task) => {
    res.send(task);
  });
});

/**
 * POST /lists/:listId/tasks
 * Purpose: Create a new task in a specific list
 */
app.post('/lists/:listId/tasks', (req, res) => {
  // We want to create a new task in the list specified by listId.
  let newTask = new Task({
    title: req.body.title,
    _listId: req.params.listId
  });
  newTask.save()
    .then((newTaskDoc) => {
      res.send(newTaskDoc);
    });
});

/**
 * PATCH '/lists/:listId/tasks/:taskId'
 * Purpose: Update a specific task
 */
app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
  // We want to update an existing task specified by taskId.
  Task.findOneAndUpdate({
    _id: req.params.taskId,
    _listId: req.params.listId
  }, {
    $set: req.body
  })
    .then(() => {
      res.send({ message: 'Updated Successfully' });
    });
});

/**
 * DELETE /lists/:listId/tasks/:taskId
 * Purpose: Delete a specific task
 */
app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
  // We want to delete an existing task specified by taskId.
  Task.findOneAndRemove({
    _id: req.params.taskId,
    _listId: req.params.listId
  }).then((removedTaskDoc) => {
      res.send(removedTaskDoc);
    });
});

/************************************************************
 ***********************USER ROUTES**************************
************************************************************/

/**
 * POST /users
 * Purpose: Sign up
 */
app.post('/users', (req, res) => {
  // User sign up.
  let body = req.body;
  let newUser = new User(body);

  newUser.save()
    .then(() => {
      return newUser.createSession();
    })
    .then((refreshToken) => {
      // Session has been created successfully and refreshToken returned. Now we generate an access auth token for the user.
      return newUser.generateAccessAuthToken()
        .then((accessToken) => {
          // Access auth token generated successfully. Now we return an object containing the auth tokens.
          return {accessToken, refreshToken};
        });
    })
    .then((authTokens) => {
      // Now we construct and send the response to the user with their auth tokens in the header and the user objects in the body.
      res
        .header('x-refresh-token', authTokens.refreshToken)
        .header('x-access-token', authTokens.accessToken)
        .send(newUser);
    })
    .catch((err) => {
      res.status(400).send(err);
    })
});

/**
 * POST /users/login
 * Purpose: Login
 */
app.post('/users/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findByCredentials(email, password)
    .then((user) => {
      return user.createSession()
        .then((refreshToken) => {
          // Session has been created successfully and refreshToken returned. Now we generate an access auth token for the user.
          return user.generateAccessAuthToken()
            .then((accessToken) => {
              // Access auth token generated successfully. Now we return an object containing the auth tokens.
              return {accessToken, refreshToken};
            });
        })
        .then((authTokens) => {
          // Now we construct and send the response to the user with their auth tokens in the header and the user objects in the body.
          res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(user);
        });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

/** GET /users/me/access-token
 * Purpose: Generates and returns an access token
 */
app.get('/users/me/access-token', verifySession, (req, res) => {
  // We know that the user/caller is authenticated and we have the user_id and userObject available to us.
  req.userObject.generateAccessAuthToken()
    .then((accessToken) =>{
      res.header('x-access-token', accessToken).send({ accessToken });
    })
    .catch((err) => {
      res.status(400).send(err);
    })
});


app.listen(3000, () => {
  console.log(`Running the server on port: ${port}.`);
});


