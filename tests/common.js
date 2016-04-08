
if (Meteor.isServer) {
  Tinytest.add('memberships - server - common', (test) => {
    Meteor.call('test.before');

    test.isTrue(Memberships.plansByRoles('pro').length === 3);

    test.isTrue(Memberships.plansByGroup('default').length === 5);

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
    test.isTrue(Match.test(Memberships.plan('pro-p3m'), Object));
    test.isTrue(Memberships.plan('pro-p3m').id === 'pro-p3m');
    test.isTrue(Match.test(Memberships.plan('pro-p1y'), Object));
    test.isTrue(Memberships.plan('pro-p1y').id === 'pro-p1y');
    test.isTrue(Match.test(Memberships.plan('basic-p1m'), Object));
    test.isTrue(Memberships.plan('basic-p1m').id === 'basic-p1m');
    test.isTrue(Match.test(Memberships.plan('basic-p3m'), Object));
    test.isTrue(Memberships.plan('basic-p3m').id === 'basic-p3m');

    test.isTrue(_.difference(Memberships.rolesByGroup('default'),["free", "pro", "basic"]).length === 0);

    test.isTrue(_.difference(Memberships.groups(),["default"]).length === 0)

    Meteor.call('test.after');
  });
}

if (Meteor.isClient) {
  Tinytest.addAsync('memberships - client - common', (test, done) => {
    Meteor.call('test.before', () => {
      test.isTrue(Memberships.plansByRoles('pro').length === 3);

      test.isTrue(Memberships.plansByGroup('default').length === 5);

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
      test.isTrue(Match.test(Memberships.plan('pro-p3m'), Object));
      test.isTrue(Memberships.plan('pro-p3m').id === 'pro-p3m');
      test.isTrue(Match.test(Memberships.plan('pro-p1y'), Object));
      test.isTrue(Memberships.plan('pro-p1y').id === 'pro-p1y');
      test.isTrue(Match.test(Memberships.plan('basic-p1m'), Object));
      test.isTrue(Memberships.plan('basic-p1m').id === 'basic-p1m');
      test.isTrue(Match.test(Memberships.plan('basic-p3m'), Object));
      test.isTrue(Memberships.plan('basic-p3m').id === 'basic-p3m');

      test.isTrue(_.difference(Memberships.rolesByGroup('default'),["free", "pro", "basic"]).length === 0);

      test.isTrue(_.difference(Memberships.groups(),["default"]).length === 0)
      Meteor.call('test.after', () => done());
    });
  });
}
