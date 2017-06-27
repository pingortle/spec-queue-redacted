import { Meteor } from 'meteor/meteor'
import { Examples } from '../examples.js'

Meteor.publish('examples.forBuild', function ({ buildId }) {
  return Examples.find({ buildId }, { fields: { _id: 1, status: 1, buildId: 1 } })
})

Meteor.publish('examples.withDetails', function (selector) {
  return Examples.find(selector)
})
