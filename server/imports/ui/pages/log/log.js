import { Meteor } from 'meteor/meteor'
import { DefaultJobQueue } from '../../../api/jobs/jobs.js'

import './log.html'
import '../../components/log/log.js'

Template.App_log.viewmodel({
  params() { return FlowRouter.current().params },
  resource() { return DefaultJobQueue.findOne(this.params().jobId) || {} },
  onRendered() { Meteor.BuildSubscriber.subscribe('jobs.default.in', [this.params().jobId]) }
})
