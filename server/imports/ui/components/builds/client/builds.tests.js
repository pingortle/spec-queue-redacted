import { _ } from 'meteor/underscore'
import { Meteor } from 'meteor/meteor'
import chai, { assert, expect } from 'chai'
import sinonChai from 'sinon-chai'
import { sinon, stubs, spies } from 'meteor/practicalmeteor:sinon'
import { Template } from 'meteor/templating'
import StubCollections from 'meteor/hwillson:stub-collections'
import { Builds } from '/imports/api/builds/builds.js'
import { withRenderedTemplate } from '/imports/ui/test-helpers.js'

import '/imports/api/builds/factory.tests.js'
import '../builds.js'

chai.use(sinonChai)

describe('Builds', function () {
  let builds = null

  beforeEach(function () {
    StubCollections.stub(Builds)
    builds = _(3).times(() => Factory.create('build'))
  })

  afterEach(function () {
    StubCollections.restore()
    stubs.restoreAll()
    spies.restoreAll()
  })

  describe('ViewModel', function () {
    let subject = null

    beforeEach(function () {
      subject = Template.builds.createViewModel({})
    })

    describe('#destroy', function () {
      let build = null

      beforeEach(function () {
        build = _(builds).first()
        sinon.stub(Meteor, 'call')
      })

      afterEach(function () {
        Meteor.call.restore()
      })

      it('calls builds.destroy on the specified build', function () {
        subject.destroy(build)
        const call = Meteor.call
        expect(call).to.have.been.calledOnce
        expect(call).to.have.been.calledWith('builds.destroy', { buildId: build._id })
      })

      describe('UI', function () {
        it('can destroy a build', function () {
          withRenderedTemplate('builds', {}, (element, template) => {
            const button = $(element).find(`li[data-id=${build._id}] > button`)
            button.click()
            expect(Meteor.call).to.have.been.calledOnce
          })
        })
      })
    })
  })
})
