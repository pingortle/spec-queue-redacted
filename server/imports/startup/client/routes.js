import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'

// Import needed templates
import '../../ui/layouts/body/body.js'
import '../../ui/pages/builds/builds.js'
import '../../ui/pages/build/build.js'
import '../../ui/pages/logs/logs.js'
import '../../ui/pages/log/log.js'
import '../../ui/pages/home/home.js'
import '../../ui/pages/not-found/not-found.js'

// Set up all routes in the app
FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('App_body', { main: 'App_home' })
  },
})

FlowRouter.route('/builds', {
  name: 'App.builds',
  action() {
    BlazeLayout.render('App_body', { main: 'App_builds' })
  },
})

FlowRouter.route('/builds/:buildId', {
  name: 'App.build',
  action() {
    BlazeLayout.render('App_body', { main: 'App_build' })
  },
})

FlowRouter.route('/builds/:buildId/logs', {
  name: 'App.logs',
  action() {
    BlazeLayout.render('App_body', { main: 'App_logs' })
  },
})

FlowRouter.route('/logs/:jobId', {
  name: 'App.log',
  action() {
    BlazeLayout.render('App_body', { main: 'App_log' })
  },
})

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' })
  },
}
