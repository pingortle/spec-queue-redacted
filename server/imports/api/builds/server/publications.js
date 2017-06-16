import { Meteor } from 'meteor/meteor'
import { Builds } from '../builds.js'

Meteor.publish('builds.all', function () {
  return Builds.find({})
})

Meteor.publish('builds.one', function (buildId) {
  return Builds.find(buildId)
})
