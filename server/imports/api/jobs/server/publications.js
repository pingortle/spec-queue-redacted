import { Meteor } from 'meteor/meteor'
import { DefaultJobQueue } from '../jobs.js'

Meteor.publish('jobs.default', function () {
  return DefaultJobQueue.find({})
})

DefaultJobQueue.allow({
  admin: function (userId, method, params) {
    return true
  }
})
