import JSONPath from 'JSONPath'
import { Builds } from '../builds.js'
import { DefaultJobQueue } from '../../jobs/jobs.js'
import { Examples } from '../../examples/examples.js'
import _meteor from '/imports/lib/underscore-meteor.js'

const memoizeStatusCount = (collection, countedCollection, foreignIdKey, cacheObjectKey, statusKey = 'status') => {
  const fetchCount = (id, status) => countedCollection.find({ [foreignIdKey]: id, [statusKey]: status }).count()

  const onStatusChange = (foreignId, document, previousDocument) => {
    const status = document[statusKey]
    const oldStatus = previousDocument[statusKey]

    const count = fetchCount(foreignId, status)
    const oldStatusCount = (status === oldStatus) ? count : fetchCount(foreignId, oldStatus)

    collection.update(foreignId, { $set: { [`${cacheObjectKey}.${status}`]: count, [`${cacheObjectKey}.${oldStatus}`]: oldStatusCount } })
    console.log(`updated ${countedCollection._name} ${status} count to ${count}`)
    if (status !== oldStatus) console.log(`updated ${countedCollection._name} ${oldStatus} count to ${oldStatusCount}`)
  }

  const statusChangeHandlers = {}

  const onChange =  function (userId, document, fields) {
    if (fields && !_.contains(fields, statusKey)) return;
    const foreignId = _.first(JSONPath.eval(document, foreignIdKey))
    const previous = this.previous || document

    const handlerKey = `${foreignId}-${document.status}`

    const change = statusChangeHandlers[handlerKey] || _meteor.throttle(onStatusChange, 1000)
    statusChangeHandlers[handlerKey] = change


    change(foreignId, document, previous)
  }

  return onChange
}

const memoizeJobCounts = memoizeStatusCount(Builds, DefaultJobQueue, 'data.buildId', 'jobCounts')
const memoizeExampleCounts = memoizeStatusCount(Builds, Examples, 'buildId', 'exampleCounts')

DefaultJobQueue.after.insert(memoizeJobCounts)
DefaultJobQueue.after.remove(memoizeJobCounts)
DefaultJobQueue.after.update(memoizeJobCounts)

Examples.after.insert(memoizeExampleCounts)
Examples.after.remove(memoizeExampleCounts)
Examples.after.update(memoizeExampleCounts)
