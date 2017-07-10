import { Meteor } from 'meteor/meteor'

const _meteor = {}

_meteor.now = Date.now

_meteor.throttle = function (func, wait, options) {
  if (!options) options = {}

  let context, args, result

  let timeout = null
  let previous = 0


  const later = function () {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)

    if (!timeout) context = args = null
  }

  return function () {
    const now = Date.now()

    if (!previous && options.leading === false) previous = now

    const remaining = wait - (now - previous)

    context = this
    args = arguments

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        Meteor.clearTimeout(timeout)
        timeout = null
      }

      previous = now
      result = func.apply(context, args)

      if (!timeout) context = args = null

    } else if (!timeout && options.trailing !== false) {
      timeout = Meteor.setTimeout(later, remaining)
    }

    return result
  }
}

export default _meteor
