import { Meteor } from 'meteor/meteor'
import { Builds } from '../builds.js'

Meteor.publish('builds.all', function () {
  return Builds.find({}, { fields: { examples: 0 } })
})

Meteor.publish('builds.one', function (buildId) {
  return Builds.find(buildId)
})
