/* eslint-disable no-unused-vars */
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const { mongoose } = require('./db/mongoose');
const port = 3000;
const cors = require('cors');
const jwt = require('jsonwebtoken');
const config = require('./config');
const configSample = require('./config-sample');
const _ = require('underscore');
const crypto = require('crypto');
const emailService = require('./srvControllers/shared/emailService');
const { ERROR_CODES, ERROR_MESSAGES, STATUS_CODES, STATUS_MESSAGES } = require('./srvControllers/shared/enums');

// Load in the mongoose Models
const { List, Task, User, Session } =  require('./db/models');


/************************************************************
 **********************CONFIG CHECK**************************
************************************************************/

const checkConfigFilesMatch = (configObj, configSampleObj) => {
  // Function that takes in an object and returns an array with its keys.
  const getConfigKeys = (inputObj) => {
    // Declare the stack that holds our object.
    const stack = [inputObj];
    // Declare the arrays that will hold our keys.
    const objKeys = [];
    while (stack?.length > 0) {
    // Store the last element from the array in currentItem and remove it from the stack.
    const currentItem = stack.pop();
    // For each key in the currentItem do.
    _.each(currentItem, (value, key) => {
      // If the current key holds an object, add it to the stack.
      if (typeof currentItem[key] === 'object') {
        stack.push(currentItem[key]);
      }
      // Add the key to the array.
      objKeys.push(key);
    });
    }
    // Return the array with the keys of the provided object.
    return objKeys;
  }

  // Declare two arrays that will hold our keys.
  const configKeys = getConfigKeys(configObj);
  const configSampleKeys = getConfigKeys(configSampleObj);

  // Now compare the two arrays.
  if (!_.isEqual(configKeys, configSampleKeys)) {
    console.log('================================================================================================');
    console.log('================================================================================================');
    throw new Error('Config files do not match!');
  }
}

checkConfigFilesMatch(config, configSample);



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

app.use(require('./srvControllers'));

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

  // Verify the session.
  User.aggregate([
    // Filter the Users collection by the _id to match our passed-in _id.
    { 
      $match: { _id: mongoose.Types.ObjectId(_id) }
    },
    // Join to Sessions collection on Users._id = Sessions._userId and check if the refreshToken matches with the one in the db.
    {
      $lookup: {
        from: 'sessions',
        localField: '_id',
        foreignField: '_userId',
        pipeline: [{
          $match: { token: refreshToken }
        }],
        as: 'userSession'
      }
    }
  ]).then(
    // As the aggregate method ALWAYS returns an array of values, we can destructure the result. Destructuring only available in ES6. This is equivalent to user = user[0].
    ([user]) => {

      // User couldn't be found.
      if (!user) {
        return Promise.reject({
          error: ERROR_MESSAGES.USER_NOT_FOUND,
          errorCode: ERROR_CODES.USER_NOT_FOUND
        });
      } else {
        // As userSessions itself is also an array of objects (containing only one object), pull the object out from the array for ease of use.
        user.userSession = user.userSession[0];
        // User found, but no session found for the refreshToken
        if (!user.userSession) {
          return Promise.reject({
            error: ERROR_MESSAGES.SESSION_NOT_FOUND,
            errorCode: ERROR_CODES.SESSION_NOT_FOUND
          });
        } else { // We've found the session with that refreshKey. Should never return more than one.
          // Session is valid if it is at a later point in time than Date.now();
          const isSessionValid = user.userSession.expiresAt >= Date.now();
          // The session is valid. Call next() to continue with processing this web request.
          if (isSessionValid) {
            // We want to set a userObject in the request to contain an User instance with our user's details. We do this because the return of .aggregate is not an instance of an user, but a cursor of the result.
            req.userObject = new User(user);
            next();
          } else { // Else return an error. We don't want to delete expired sessions automatically from here. MongoDb does that on a different timer.
            return Promise.reject({
              error: ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED,
              errorCode: ERROR_CODES.REFRESH_TOKEN_EXPIRED
            });
          }
        }
      }
  }).catch((err) => {
    console.error(err);
    res.status(STATUS_CODES.UNAUTHORIZED).send(err);
  });
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
  }).then((lists) => {
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
  }, {
    // Tell mongoose to return the updated document.
    new: true
  })
  .then((listDoc) => {
    res.send(listDoc);
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
  }).then((removedListDoc) => {
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
  }).then((tasks) => {
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
  }).then((task) => {
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
      } else {
        res.sendStatus(STATUS_CODES.BAD.NOT_FOUND);
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
        }, {
          // Tell mongoose to return the updated document.
          new: true
        })
          .then((taskDoc) => {
            res.send(taskDoc);
          });
      } else {
        res.sendStatus(STATUS_CODES.BAD.NOT_FOUND);
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
        res.sendStatus(STATUS_CODES.NOT_FOUND);
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
      res.status(STATUS_CODES.BAD_REQUEST).send(err);
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
      res.status(STATUS_CODES.BAD_REQUEST).send(err);
    });
});

/**
 * GET /users/me/access-token
 * Purpose: Generates and returns an access token
 */
app.get('/users/me/access-token', verifySession, (req, res) => {
  // We know that the user/caller is authenticated and we have the user_id and userObject available to us.
  console.log('req.userObject: ', req.userObject);
  req.userObject.generateAccessAuthToken()
    .then((accessToken) =>{
      res.header('x-access-token', accessToken).send({ accessToken });
    })
    .catch((err) => {
      res.status(STATUS_CODES.BAD_REQUEST).send(err);
    })
});

app.post('/users/logout', authenticate, (req, res) => {
  let refreshToken = req.header('x-refresh-token');
  let userId = req.header('_id')
  // Search for the session.
  Session.findOneAndDelete({
    _userId: userId,
    token: refreshToken
  }).then((session) => {
    // Session found, now delete it.
    if (session) {
      return res.send({ status: STATUS_CODES.OK, statusMessage: STATUS_MESSAGES.OK });
    }
    // Otherwise session not found.
    return res.send({ status: STATUS_CODES.NOT_FOUND, statusMessage: ERROR_MESSAGES.NOT_FOUND });
  }).catch((err) => {
    return res.send(err);
  });
})

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
 ****************************ToDo****************************
************************************************************/
// Change all new/edit pages to pop-up modals.                  https://github.com/adriancttnc/task-manager/pull/1
// Implement Logout.                                            https://github.com/adriancttnc/task-manager/pull/2
// Implement an emailing method.                                https://github.com/adriancttnc/task-manager/pull/3
// Implement forgot password.                                   https://github.com/adriancttnc/task-manager/pull/3
// Implement a notification mechanism.                          https://github.com/adriancttnc/task-manager/pull/3
// Implement an external config system.                         https://github.com/adriancttnc/task-manager/pull/3
// Change from using px to using rem.                           https://github.com/adriancttnc/task-manager/pull/4
// Add an user menu.                                            https://github.com/adriancttnc/task-manager/pull/5
// Move sessions to their own collection and set auto-expiry.   https://github.com/adriancttnc/task-manager/pull/6
// ToDo - Ensure you can handle illegal Ids.
// ToDo - Prevent failed calls to the backend. (You get a failed call whenever the access token expires and needs to be renewed)
// ToDo - Implement a form component and use it throughout the app.
// ToDo - Add unitTesting.
// ToDo - Add separate webRequest functions for lists and tasks.
// ToDo - Ensure there is nothing of type 'any'.
// ToDo - Ensure action completion is confirmed visually to the user.
// ToDo - Add ability to logout of all sessions.
// ToDo - Add ability to see all current sessions with some details (device, location, time, remaining lifespan).
// ToDo - Ensure that the accessToken provided matches the sessionId it belongs to. We don't want any valid accessToken to validate any valid session for a given user.
// ToDo - Add ability to use oAuth2 for email sending.
// ToDo - Implement error logging.
// ToDo - Improve the existing items that are using an expiry date. (see how UserPasswordEvent does it).
// ToDo - What happens if a refreshToken expires when user is using the app?
// ToDo - Move each item into it's own more appropriate controller and keep a clean app.js.