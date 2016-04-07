
/*
Meteor.users.attachSchema(
  new SimpleSchema({
    username: {
      type: String,
      optional: true
    },
    emails:{
      type: [Object],
      optional: true
    },
    "emails.$.address": {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
      type: Boolean,
      optional: true,
      defaultValue: false
    },
    services:{
      type: Object,
      optional: true,
      blackbox: true
    },
    roles:{
      type: [String],
      optional: true
    }
  })
)*/

Tinytest.add('memberships - MembershipsCommon', function (test) {

  test.isTrue(Memberships.plansByRoles('pro').length === 5);

  test.isTrue(Memberships.plansByGroup('default').length === 7);

  test.isTrue(Memberships.groupByPlan('pro-p1m') == 'default');
  test.isTrue(Memberships.groupByPlan('pro-p3m') == 'default');
  test.isTrue(Memberships.groupByPlan('pro-p1y') == 'default');
  test.isTrue(Memberships.groupByPlan('basic-p1m') == 'default');
  test.isTrue(Memberships.groupByPlan('basic-p3m') == 'default');

  test.isTrue(Memberships.roleByPlan('pro-p1m') == 'pro');
  test.isTrue(Memberships.roleByPlan('pro-p3m') == 'pro');
  test.isTrue(Memberships.roleByPlan('pro-p1y') == 'pro');
  test.isTrue(Memberships.roleByPlan('basic-p1m') == 'basic');
  test.isTrue(Memberships.roleByPlan('basic-p3m') == 'basic');

  test.isTrue(Match.test(Memberships.plan('pro-p1m'), Object));
  test.isTrue(Memberships.plan('pro-p1m').id === 'pro-p1m');
  test.isTrue(Match.test(Memberships.plan('test'), Object));
  test.isTrue(Memberships.plan('test').id === 'test');
  test.isTrue(Match.test(Memberships.plan('basic-p1m'), Object));
  test.isTrue(Memberships.plan('basic-p1m').id === 'basic-p1m');

  test.isTrue(_.difference(Memberships.rolesByGroup('default'),["free", "pro", "basic"]).length === 0);

  test.isTrue(_.difference(Memberships.groups(),["default"]).length === 0)
});