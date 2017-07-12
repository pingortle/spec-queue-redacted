import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { DefaultJobQueue } from '../jobs.js'

const defaultOptions = { fields: { log: 0 } }

Meteor.publish('jobs.default', function () {
  return DefaultJobQueue.find({}, defaultOptions)
})

Meteor.publish('jobs.default.in', function (ids) {
  return DefaultJobQueue.find({ _id: { $in: ids } }, defaultOptions)
})

Meteor.publish('jobs.default.forBuild', function ({ buildId }) {
  check(buildId, String)

  return DefaultJobQueue.find({ "data.buildId": buildId, status: 'running' }, defaultOptions)
})

DefaultJobQueue.allow({
  admin: function (userId, method, params) {
    return true
  }
})
