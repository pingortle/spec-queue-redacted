import { Meteor } from 'meteor/meteor'
import './body.html'

Template.App_body.viewmodel({
  onCreated() {
    Meteor.subscribe('builds.all')
    Meteor.BuildSubscriber = new SubsManager({ cacheLimit: 10, expireIn: 5 })
  }
})
