import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { Builds } from './builds.js'
import { DefaultJobQueue } from '../jobs/jobs.js'
import { Examples } from '../examples/examples.js'

Meteor.methods({
  'builds.createJob'(options) {
    const gitCommitId = options && options.gitCommitId
    check(gitCommitId, Match.Optional(String))

    const startQueueName = gitCommitId ? `start-${gitCommitId}` : 'start'

    const doc = {
      jobIds: [],
      createdAt: new Date(),
      gitCommitId
    }

    const buildId = Builds.insert(doc)

    const job = new Job('default', startQueueName, { buildId })
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
  'builds.cancel'({ buildId }) {
    check(buildId, String)

    const build = Builds.findOne(buildId)
    const jobs = _.compact([build.jobId].concat(build.jobIds))
    DefaultJobQueue.cancelJobs(jobs)

    return Builds.update(buildId, { $set: { status: 'cancelled' } })
  },
  'builds.addTestFile'({ buildId, path }) {
    check(buildId, String)
    check(path, Match.OneOf(String, [String]))

    paths = _.flatten([path])

    const build = Builds.findOne(buildId)
    const testQueueName = build.gitCommitId ? `test-${build.gitCommitId}` : 'test'

    const dependency = DefaultJobQueue.getJob(build.startJobId)
    const jobIds = paths.map(path => {
      const testJob = new Job('default', testQueueName, { path, buildId })
      return testJob.depends([dependency])
        .retry({ retries: 5, wait: 5 * 1000 /* ms */ })
        .save()
    })

    return Builds.update(buildId, { $addToSet: { jobIds: { $each: jobIds } } })
  },
  'builds.addExamples'({ buildId, examples, hostInfo, jobId }) {
    check(buildId, String)
    check(examples, [Object])

    const exampleResults = examples.map(example => Examples.insert({ jobId, buildId, ...example, hostInfo }))

    const build = Builds.findOne(buildId)
    if (!build.status) {
      if (_(examples).any(example => example.status === 'failed')) {
        Builds.update(buildId, { $set: { status: 'failed' } })
      } else if (Examples.find({ buildId }).count() === build.totalExamples) {
        Builds.update(buildId, { $set: { status: 'passed' } })
      }
    }

    return exampleResults
  },
  'builds.begin'({ buildId, totalExamples, criteria, metadata, testFilePaths }) {
    check(buildId, String)
    check(totalExamples, Number)
    check(criteria, Object)
    check(metadata, Object)
    check(testFilePaths, [String])

    Meteor.call('builds.addTestFile', { buildId, path: testFilePaths })

    return Builds.update(buildId, { $set: { criteria, metadata, totalExamples } })
  },
  'builds.satisfied?'({ buildId }) {
    check(buildId, String)
    const build = Builds.findOne(buildId)

    return _.chain(build.criteria).map((value, key) => {
      return evaluateCriterion(build, key, value)
    })
    .flatten()
    .every()
    .value()
  }
})

const criteriaCollections = {
  Examples: Examples
}

const collectionCriteriaActions = {
  count(collection, build) {
    return collection.find({ buildId: build._id }).count()
  }
}

function evaluateCriterion(build, key, value) {
  if (key === 'Collections') return evaluateCollectionsCriteria(build, value)
  return build[key] === value
}

function evaluateCollectionsCriteria(build, criteria) {
  return _.chain(criteria).map((value, key) => {
    return evaluateCollectionsCriterion(build, key, value)
  })
  .every()
  .value()
}

function evaluateCollectionsCriterion(build, collectionName, criteria) {
  if (!criteriaCollections[collectionName]) return false

  return _.chain(criteria).map((value, key) => {
    const collection = criteriaCollections[collectionName]
    return evaluateCollectionCriteriaAction(build, collection, key, value)
  })
  .every()
  .value()
}

function evaluateCollectionCriteriaAction(build, collection, action, value) {
  if (!collectionCriteriaActions[action]) return false

  return collectionCriteriaActions[action](collection, build) === value
}
