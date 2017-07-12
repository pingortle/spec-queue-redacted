import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Examples } from '../examples.js'

Meteor.publish('examples.forBuild', function ({ buildId }) {
  check(buildId, String)

  return Examples.find({ buildId }, { fields: { _id: 1, status: 1, buildId: 1 } })
})

Meteor.publish('examples.withDetails', function ({ buildId, status }) {
  check(buildId, String)
  check(status, String)

  return Examples.find({ buildId, status })
})
