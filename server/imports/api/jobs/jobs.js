const DefaultJobQueue = JobCollection('default')

DefaultJobQueue.allow({
   admin: function (userId, method, params) {
     return true
   }
 })

export { DefaultJobQueue }
