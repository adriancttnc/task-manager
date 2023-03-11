const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
// eslint-disable-next-line no-unused-vars
const { mongoose } = require('./db/mongoose');
const port = 3000;
const cors = require('cors');

// Load in the mongoose Models
const { List, Task, User} =  require('./db/models');

const jwt = require('jsonwebtoken');


/************************************************************
 ***********************MIDDLEWARE***************************
************************************************************/

// Load middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
const corsOptions ={
  origin:'http://localhost:4200', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
app.use(cors(corsOptions));

// CORS HEADERS MIDDLEWARE
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, PATCH');
      return res.status(200).json({});
    }
    res.header('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token, _id');
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
app.post('/lists', authenticate, (req, res) => {
  // We want to create a new list and create the new list document back to the user (which includes the id).
  // The list information (fields) will be passed in via the JSON request body.
  let title = req.body.title;

  let newList = new List({
    title,
    _userId: req.user_id
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
app.patch('/lists/:id', authenticate, (req, res) => {
  // We want to update the specified list with the new values specified in the JSON body of the request.
  List.findOneAndUpdate({
    _id: req.params.id,
    _userId: req.user_id
  }, {
    $set: req.body
  })
  .then(() => {
    res.send({ message: 'Updated Successfully' });
  });
});

/**
 * DELETE /lists/:id
 * Purpose: Delete specified list
 */
app.delete('/lists/:id', authenticate, (req, res) => {
  // We want to delete the specified list.
  List.findOneAndRemove({
    _id: req.params.id,
    _userId: req.user_id
  })
    .then((removedListDoc) => {
      res.send(removedListDoc)

      // Delete all the tasks that are in the deleted list.
      deleteTasksFromList(removedListDoc._id);
    });
});

/************************************************************
 ***********************TASK ROUTES**************************
************************************************************/

/**
 * GET /lists/:listId/tasks
 * Purpose: Get all tasks in a specific list
 */
app.get('/lists/:listId/tasks', authenticate, (req, res) => {
  // We want to return all tasks that belong to a specific list (specified by listId).
  Task.find({
    _listId: req.params.listId
  })
    .then((tasks) => {
      res.send(tasks);
    })
})

/**
 * GET /lists/:listId/tasks/:taskId
 * Purpose: Get a specific task
 */
app.get('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
  // We want to return a specific task.
  Task.findOne({
    _id: req.params.taskId,
    _listId: req.params.listId
  })
    .then((task) => {
    res.send(task);
  });
});

/**
 * POST /lists/:listId/tasks
 * Purpose: Create a new task in a specific list
 */
app.post('/lists/:listId/tasks', authenticate, (req, res) => {
  // We want to create a new task in the list specified by listId.
  // First make sure that the authenticated user has access to the list we are trying to add a task to.
  List.findOne({
    _id: req.params.listId,
    _userId: req.user_id
  })
    .then((list) => {
      if (list) {
        // List object was found, therefore the currently authenticated user can create new tasks.
        return true;
      }
      // List object is undefined.
      return false;
    })
    .then((canCreateTask) => {
      if (canCreateTask) {
        let newTask = new Task({
          title: req.body.title,
          _listId: req.params.listId
        });
        newTask.save()
          .then((newTaskDoc) => {
            res.send(newTaskDoc);
          });
      } else 
      {
        res.sendStatus(404);
      }
    });
});

/**
 * PATCH '/lists/:listId/tasks/:taskId'
 * Purpose: Update a specific task
 */
app.patch('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
  // We want to update an existing task specified by taskId.
  // First make sure that the authenticated user has access to the list that our task to be updated belongs to.

  List.findOne({
    _id: req.params.listId,
    _userId: req.user_id
  })
    .then((list) => {
      if (list) {
        // List object was found, therefore the currently authenticated user can make updates to tasks in this list.
        return true;
      }
      // List object is undefined.
      return false;
    })
    .then((canUpdateTask) => {
      if (canUpdateTask) {
        Task.findOneAndUpdate({
          _id: req.params.taskId,
          _listId: req.params.listId
        }, {
          $set: req.body
        })
          .then(() => {
            res.send({ message: 'Updated Successfully' });
          });
      } else {
        res.sendStatus(404);
      }
    });
});

/**
 * DELETE /lists/:listId/tasks/:taskId
 * Purpose: Delete a specific task
 */
app.delete('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
  // We want to delete an existing task specified by taskId.
  // First make sure that the authenticated user has access to the list that our task to be deleted belongs to.
  List.findOne({
    _id: req.params.listId,
    _userId: req.user_id
  })
    .then((list) => {
      if (list) {
        // List object was found, therefore the currently authenticated user can make updates to tasks in this list.
        return true;
      }
      // List object is undefined.
      return false;
    })
    .then((canDeleteTask) => {
      if (canDeleteTask) {
        Task.findOneAndRemove({
          _id: req.params.taskId,
          _listId: req.params.listId
        })
          .then((removedTaskDoc) => {
            res.send(removedTaskDoc);
          });
      } else {
        res.sendStatus(404);
      }
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

/************************************************************
 ***********************HELPER METHODS***********************
************************************************************/

let deleteTasksFromList = (_listId) => {
  Task.deleteMany({
    _listId
  })
    .then(() => {
    console.log(`Tasks for the list ${_listId} have been removed.`);
  })
};

app.listen(3000, () => {
  console.log(`Running the server on port: ${port}.`);
});



/************************************************************
 ****************************ToDOs***************************
************************************************************/
// ToDo - Ensure you can handle illegal Ids.
// ToDo - Prevent failed calls to the backend. (You get a failed call whenever the access token expires and needs to be renewed)
// ToDo - Change all new/edit pages to pop-up modals.
// ToDo - Add unitTesting.
// ToDo - Add separate webRequest functions for lists and tasks.
// ToDo - Ensure there is nothing of type 'any'.