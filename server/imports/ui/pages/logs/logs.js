import { Meteor } from 'meteor/meteor'
import { DefaultJobQueue } from '../../../api/jobs/jobs.js'

import './logs.html'
import '../../components/logs/logs.js'


Template.App_logs.viewmodel({
  params() { return FlowRouter.current().params },
  resources() { return DefaultJobQueue.find({ 'data.buildId': this.buildId() }) || [] },
  buildId() { return this.params().buildId }
})
