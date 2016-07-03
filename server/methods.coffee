
Meteor.methods

  'Memberships/subscribe': (subscription = {}, options = {}) ->
    user = Meteor.users.findOne @userId
    throw new Meteor.Error 403, 'Access denied' unless user

    Memberships.subscribe @userId, _.pick(subscription, 'plan', 'source', 'coupon'), options


  'Memberships/update': (subscriptionId, subscription = {}, options = {}) ->
    user = Meteor.users.findOne @userId
    throw new Meteor.Error 403, 'Access denied' unless user

    Memberships.update @userId, subscriptionId, _.pick(subscription, 'plan', 'source', 'coupon'), options


  'Memberships/cancel': (subscriptionId, options = {}) ->
    user = Meteor.users.findOne @userId
    throw new Meteor.Error 403, 'Access denied' unless user

    Memberships.cancel @userId, subscriptionId, options
