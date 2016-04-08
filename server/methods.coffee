
Meteor.methods

  'Memberships/subscribe': (subscription = {}, options = {}) ->
    user = Meteor.users.findOne @userId
    throw new Meteor.Error 403, 'Access denied' unless user

    Memberships.subscribe @userId,
      _.pick(subscription, 'plan', 'source', 'coupon'),
      _.pick(options, 'group', 'paymentGateway')

  'Memberships/update': (subscriptionId, subscription = {}, options = {}) ->
    user = Meteor.users.findOne @userId
    throw new Meteor.Error 403, 'Access denied' unless user

    Memberships.update @userId, subscriptionId,
      _.pick(subscription, 'plan', 'source', 'coupon'),
      _.pick(options, 'group', 'paymentGateway')

  'Memberships/cancel': (subscriptionId, options = {}) ->
    user = Meteor.users.findOne @userId
    throw new Meteor.Error 403, 'Access denied' unless user

    Memberships.cancel @userId, subscriptionId,
      _.pick(options, 'group', 'paymentGateway')
