import { Meteor } from 'meteor/meteor'
import { Examples } from '../examples.js'

Meteor.publish('examples.forBuild', function ({ buildId }) {
  return Examples.find({ buildId })
})
