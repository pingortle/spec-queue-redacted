import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Builds } from './builds.js'
import { DefaultJobQueue } from '../jobs/jobs.js'
import { Examples } from '../examples/examples.js'

Meteor.methods({
  'builds.createJob'({ specOptions }) {
    check(specOptions, String)
    specOptions = specOptions.split(' ')

    const doc = {
      specOptions,
      examples: [],
      jobIds: [],
      createdAt: new Date(),
    }

    const buildId = Builds.insert(doc)

    const job = new Job('default', 'start', { buildId, specOptions })
    const jobId = job.save()

    Builds.update(buildId, { $set: { startJobId: jobId } })

    return buildId
  },
  'builds.destroy'({ buildId }) {
    check(buildId, String)

    const build = Builds.findOne(buildId)
    DefaultJobQueue.cancelJobs(build.jobIds || [])
    Examples.remove({ buildId })

    return Builds.remove(buildId)
  },
  'builds.addTestFile'({ buildId, path }) {
    check(buildId, String)
    check(path, String)

    const build = Builds.findOne(buildId)
    const testJob = new Job('default', 'test', { path, buildId })

    const dependency = new Job('default', DefaultJobQueue.findOne(build.startJobId))
    const testJobId = testJob.depends([dependency]).save()

    return Builds.update(buildId, { $addToSet: { jobIds: testJobId } })
  },
  'builds.addExamples'({ buildId, examples }) {
    check(buildId, String)
    check(examples, [Object])

    return examples.map(example => Examples.insert({ buildId, ...example }))
  }
})
