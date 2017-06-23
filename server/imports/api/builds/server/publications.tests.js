import { assert, expect } from 'chai'
import { Builds } from '../builds.js'
import { PublicationCollector } from 'meteor/johanbrook:publication-collector'
import './publications.js'

describe('builds publications', function () {
  beforeEach(function () {
    Builds.remove({})
    Builds.insert({
      archiveUrl: 'https://www.meteor.com',
      examples: [{ example: 1 }]
    })
  })

  describe('builds.all', function () {
    it('sends all builds', function (done) {
      const collector = new PublicationCollector()
      collector.collect('builds.all', (collections) => {
        assert.equal(collections.builds.length, 1)
        done()
      })
    })

    it('excludes examples', function (done) {
      const collector = new PublicationCollector()
      collector.collect('builds.all', (collections) => {
        expect(collections.builds[0]).to.not.have.property('examples')
        done()
      })
    })
  })

  describe('builds.one', function () {
    it('sends the specified build', function (done) {
      const buildId = Builds.insert({
        archiveUrl: 'https://www.meteor.com/another-one',
      })

      const collector = new PublicationCollector()
      collector.collect('builds.one', buildId, (collections) => {
        assert.equal(collections.builds.length, 1)
        assert.equal(collections.builds[0]._id, buildId)
        done()
      })
    })
  })
})
