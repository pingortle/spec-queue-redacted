import { Meteor } from 'meteor/meteor'
import { assert } from 'meteor/practicalmeteor:chai'
import { Builds } from './builds.js'
import './methods.js'

if (Meteor.isServer) {
  describe('builds methods', function () {
    beforeEach(function () {
      Builds.remove({})
    })

    it('can create a new build', function () {
      const insertBuild = Meteor.server.method_handlers['builds.createJob']

      insertBuild.apply({}, [{ specOptions: 'spec/models' }])

      assert.equal(Builds.find().count(), 1)
    })
  })
}
