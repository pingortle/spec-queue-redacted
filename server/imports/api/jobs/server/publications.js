import { Meteor } from 'meteor/meteor'
import { DefaultJobQueue } from '../jobs.js'

Meteor.publish('jobs.default', function () {
  return DefaultJobQueue.find({})
})

Meteor.publish('jobs.default.in', function (ids) {
  return DefaultJobQueue.find({ _id: { $in: ids } })
})

DefaultJobQueue.allow({
  admin: function (userId, method, params) {
    return true
  }
})
