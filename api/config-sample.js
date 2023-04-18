/* eslint-disable spellcheck/spell-checker */
/**
 * File in which configuration settings are placed for the task-manager app.
 */

module.exports = {
  smtp: {                             // Authentication details for the email server.
    username: '',
    password: '',
    server:   '',
    port:     '',
    ssl:      ''
  },
  email: {                            // Settings that apply when sending emails.
    receiverOverwrite: ''             // Sends all emails to this email if populated. (for testing)
  },
  mongoDB: {                          // Authentication details for mongoDB.
    database: 'TaskManager',
    URL:      '127.0.0.1',
    port:     '27017',
    username: '',
    password: ''
  }
}