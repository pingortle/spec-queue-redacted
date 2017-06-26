import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { assert, expect } from 'chai'
import { DefaultJobQueue } from '../jobs/jobs.js'
import { Examples } from '../examples/examples.js'
import { Builds } from './builds.js'
import './methods.js'

if (Meteor.isServer) {
  describe('builds methods', function () {
    beforeEach(function () {
      Builds.remove({})
      Examples.remove({})
    })

    it('can create a new build', function () {
      const insertBuild = Meteor.server.method_handlers['builds.createJob']
      insertBuild.apply({}, [])

      assert.equal(Builds.find().count(), 1)
    })

    describe('builds.destroy', function () {
      const method = Meteor.server.method_handlers['builds.destroy']
      const addTestFile = Meteor.server.method_handlers['builds.addTestFile']
      const createJob = Meteor.server.method_handlers['builds.createJob']

      let buildId = null

      beforeEach(function () {
        buildId = createJob.apply({}, [}])
        addTestFile.apply({}, [{ buildId, path: 'path/to/file' }])
      })

      it('removes the specified build', function () {
        expect(Builds.findOne(buildId)).to.be.ok
        method.apply({}, [{ buildId }])
        expect(Builds.findOne(buildId)).to.be.not.ok
      })

      it('cancels jobs attached to the build', function () {
        const build = Builds.findOne(buildId)
        const beforeStatuses = DefaultJobQueue.find({ _id: { $in: build.jobIds } })
          .map((job) => job.status )
        expect(beforeStatuses).to.have.members(['waiting'])

        method.apply({}, [{ buildId }])

        const afterStatuses = DefaultJobQueue.find({ _id: { $in: build.jobIds } })
          .map((job) => job.status)
        expect(afterStatuses).to.have.members(['cancelled'])
      })

      it('removes examples attached to the build', function () {
        const exampleId = Examples.insert({ buildId })

        expect(Examples.findOne(exampleId)).to.be.ok
        method.apply({}, [{ buildId }])
        expect(Examples.findOne(exampleId)).to.not.be.ok
      })
    })

    describe('builds.addExamples', function () {
      const subject = Meteor.server.method_handlers['builds.addExamples']
      const examples = [{ example: 1 }, { example: 2 }]

      it('creates examples attached to the build', function () {
        const buildId = Builds.insert({})

        expect(() => subject.apply({}, [{ buildId, examples }])).to
          .increase(() => Examples.find().count()).by(examples.length)

        Examples.find().fetch().forEach(example => {
          expect(example).to.have.property('buildId', buildId)
        })
      })
    })

    describe('builds.begin', function () {
      const subject = Meteor.server.method_handlers['builds.begin']

      it('adds initial information to the build', function () {
        const startJobId = new Job('default', 'start', {}).save()
        const buildId = Builds.insert({ name: 'Joe', startJobId })

        const criteria = {
          Collections: {
            Examples: {
              count: 10
            }
          }
        }

        const metadata = {
          tags: ['cool', 'challenging']
        }

        subject.apply({}, [{ buildId, criteria, metadata, testFilePaths: ['file.test'] }])
        const build = Builds.findOne(buildId)
        expect(build).to.have.deep.property('criteria', criteria)
        expect(build).to.have.deep.property('metadata', metadata)
      })
    })

    describe('builds.satisfied?', function () {
      const subject = Meteor.server.method_handlers['builds.satisfied?']

      it('calculates the completeness based on specified simple criteria', function () {
        const criteria = {
          Collections: {
            Examples: {
              count: 1
            }
          }
        }

        const buildId = Builds.insert({ criteria })

        expect(subject.apply({}, [{ buildId }])).to.be.false
        Examples.insert({ buildId })
        Examples.insert({ buildId: 'bogus' })
        expect(subject.apply({}, [{ buildId }])).to.be.true
      })

      it('calculates the completeness based on specified collection criteria', function () {
        const criteria = {
          name: 'Frank'
        }

        const buildId = Builds.insert({ name: 'Joe', criteria })

        expect(subject.apply({}, [{ buildId }])).to.be.false
        Builds.update(buildId, { $set: { name: 'Frank' } })
        expect(subject.apply({}, [{ buildId }])).to.be.true
      })
    })
  })
}
