###
[
  new SimpleSchema
    id:
      type: String
    service:
      type: String
    plan:
      type: String
    group:
      type: String
    data:
      type: Object
      optional: true
      blackbox: true
]
###

schema =
  memberships:
    type: new SimpleSchema
      subscriptions:
        type: [Object]
        optional: true
        blackbox: true
      services:
        type: new SimpleSchema
          stripe:
            type: new SimpleSchema
              customerId:
                type: String
            optional: true
        optional: true
    optional: true

@MembershipsSchema = new SimpleSchema schema


#Meteor.users.attachSchema?(schema)

#console.log Meteor.users.simpleSchema().objectKeys()

