import { Meteor } from 'meteor/meteor'
import { Builds } from '../../../api/builds/builds.js'

import '../../components/build/build.js'
import './build.html'

Template.App_build.viewmodel({
  params() { return FlowRouter.current().params },
  resource() { return Builds.findOne(this.params().buildId) || { jobIds: [], jobCounts: {}, exampleCounts: {} } }
})
