const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const { mongoose } = require('./db/mongoose');
const port = process.env.PORT || 3000;


/* MIDDLEWARE */

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
  next();
});


// Load in the mongoose Models
const { List, Task} =  require('./db/models');


/* ROUTE HANDLERS */

/* LIST ROUTES */

/************************************************************
 ***********************LIST ROUTES**************************
************************************************************/

/**
 * GET /lists
 * Purpose: Get all lists
 */
app.get('/lists', (req, res) => {
  // We want to return an array of all the lists in the database.
  List.find({})
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
  .then((_) => {
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
  // We want to update an existing task speficied by taskId.
  Task.findOneAndUpdate({
    _id: req.params.taskId,
    _listId: req.params.listId
  }, {
    $set: req.body
  })
    .then((_) => {
      res.sendStatus(200);
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

app.listen(3000, () => {
  console.log(`Running the server on port: ${port}.`);
});


