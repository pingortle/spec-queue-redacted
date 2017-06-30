import { Meteor } from 'meteor/meteor'
import { DefaultJobQueue } from '../../api/jobs/jobs.js'
import { Examples } from '../../api/examples/examples.js'

Meteor.startup(() => {
  DefaultJobQueue._ensureIndex({ 'data.buildId': 1 })
  DefaultJobQueue._ensureIndex({ 'data.buildId': 1, status: 1 })
  Examples._ensureIndex({ buildId: 1 })
  Examples._ensureIndex({ buildId: 1, status: 1 })

  DefaultJobQueue.startJobServer()
  DefaultJobQueue.setLogStream(process.stdout)
})
