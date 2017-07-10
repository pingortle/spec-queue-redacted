import { Meteor } from 'meteor/meteor'
import { DefaultJobQueue } from '../../api/jobs/jobs.js'
import { Examples } from '../../api/examples/examples.js'
import { Builds } from '../../api/builds/builds.js'

Meteor.startup(() => {
  DefaultJobQueue._ensureIndex({ 'data.buildId': 1 })
  DefaultJobQueue._ensureIndex({ 'data.buildId': 1, status: 1 })
  Examples._ensureIndex({ buildId: 1 })
  Examples._ensureIndex({ buildId: 1, status: 1 })

  DefaultJobQueue.startJobServer()
  // DefaultJobQueue.setLogStream(process.stdout)

  Builds.find().forEach(build => {
    const jobCounts = _.reduce(DefaultJobQueue.jobStatuses, (object, status) => {
      object[status] = DefaultJobQueue.find({ 'data.buildId': build._id, status }).count()
      return object
    }, {})

    const exampleCounts = _.reduce(['passed', 'failed', 'pending'], (object, status) => {
      object[status] = Examples.find({ buildId: build._id, status }).count()
      return object
    }, {})

    Builds.update(build._id, { $set: { jobCounts, exampleCounts } })
  })
})
