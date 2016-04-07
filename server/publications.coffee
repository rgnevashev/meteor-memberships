
Meteor.publish 'Memberships.currentUser', ->
  Meteor.users.find @userId,
    fields:
      memberships: 1
