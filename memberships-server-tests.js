

Tinytest.add('memberships - services - StripeService', function (test) {

  test.include(Meteor.settings.Stripe, 'secretKey');

  Meteor.call('test.before');

  var userId = Accounts.createUser({
    email: 'rgnevashev+test@gmail.com',
    password: '12345'
  });
  var user = Meteor.users.findOne(userId);
  test.instanceOf(user, Object);

  var service = new StripeService(Meteor.settings.Stripe);

  var customerId = service.createCustomer({
    email: user.emails[0].address
  });
  test.isTrue(!!customerId);

  subscriptionId = service.subscribe(customerId, {
    plan: 'test',
    source: {
      object: 'card',
      number: '4242424242424242',
      exp_month: '11',
      exp_year: '17'
    }
  });
  test.isTrue(!!subscriptionId);

  subscriptionId = service.update(customerId, subscriptionId, {
    plan: 'test',
    quantity: 2
  });
  test.isTrue(!!subscriptionId);

  subscriptionId = service.cancel(customerId, subscriptionId);
  test.isTrue(!!subscriptionId);

  Meteor.call('test.after');
});


Tinytest.add('memberships - MembershipsServer', function (test) {

  test.include(Meteor.settings.Stripe, 'secretKey');

  Meteor.call('test.before');

  var userId = Accounts.createUser({
    email: 'rgnevashev+tinytest@gmail.com',
    password: '12345'
  });
  var user = Meteor.users.findOne(userId);
  test.instanceOf(user, Object);

  test.throws(function () {
    Memberships.has(userId,'foo');
  })
  test.throws(function () {
    Memberships.hasAccess(userId,'foo');
  })
  test.isTrue(Memberships.has(userId,'free'));
  test.isFalse(Memberships.has(userId,'pro'));
  test.isFalse(Memberships.has(userId,'basic'));
  test.isTrue(Memberships.hasAccess(userId,'free'));
  test.isFalse(Memberships.hasAccess(userId,'pro'));
  test.isFalse(Memberships.hasAccess(userId,'basic'));

  subscriptionId = Memberships.subscribe(user._id, {
    plan: 'test',
    source: {
      object: 'card',
      number: '4242424242424242',
      exp_month: '11',
      exp_year: '17',
      cvc: '123'
    }
  });
  test.isTrue(Match.test(subscriptionId, String));
  user = Meteor.users.findOne(user._id);
  test.isTrue(Match.test(user.memberships.services.stripe, Object));
  test.isTrue(Match.test(user.memberships.services.stripe.customerId, String));
  //test.isTrue(_.contains(user.roles, 'pro') && user.roles.length == 1);
  test.isTrue(user.memberships.subscriptions.length == 1);
  _.each(user.memberships.subscriptions, function (sub) {
    test.isTrue(sub.group === 'default');
    test.isTrue(sub.service === 'stripe');
    test.isTrue(sub.plan === 'test');
  });

  test.isFalse(Memberships.has(userId,'free'));
  test.isTrue(Memberships.has(userId,'pro'));
  test.isFalse(Memberships.has(userId,'basic'));

  test.isTrue(Memberships.hasAccess(userId,'free'));
  test.isTrue(Memberships.hasAccess(userId,'pro'));
  test.isTrue(Memberships.hasAccess(userId,'basic'));

  subscriptionId = Memberships.update(user._id, subscriptionId, {
    source: {
      object: 'card',
      number: '4012888888881881',
      exp_month: '11',
      exp_year: '17',
      cvc: '123'
    }
  });
  test.isTrue(!!subscriptionId, String);
  test.isTrue(Match.test(subscriptionId, String));
  user = Meteor.users.findOne(user._id);
  test.isTrue(Match.test(user.memberships.services.stripe, Object));
  test.isTrue(Match.test(user.memberships.services.stripe.customerId, String));
  //test.isTrue(_.contains(user.roles, 'pro') && user.roles.length == 1);
  test.isTrue(user.memberships.subscriptions.length == 1);
  _.each(user.memberships.subscriptions, function (sub) {
    test.isTrue(sub.group === 'default');
    test.isTrue(sub.service === 'stripe');
    test.isTrue(sub.plan === 'test');
  });

  test.isFalse(Memberships.has(userId,'free'));
  test.isTrue(Memberships.has(userId,'pro'));
  test.isFalse(Memberships.has(userId,'basic'));

  test.isTrue(Memberships.hasAccess(userId,'free'));
  test.isTrue(Memberships.hasAccess(userId,'pro'));
  test.isTrue(Memberships.hasAccess(userId,'basic'));


  subscriptionId = Memberships.subscribe(user._id, {
    plan: 'test2',
  });
  test.isTrue(!!subscriptionId, String);
  test.isTrue(Match.test(subscriptionId, String));
  user = Meteor.users.findOne(user._id);
  test.isTrue(Match.test(user.memberships.services.stripe, Object));
  test.isTrue(Match.test(user.memberships.services.stripe.customerId, String));
  //test.isTrue(_.contains(user.roles, 'pro') && user.roles.length == 1);
  test.isTrue(user.memberships.subscriptions.length == 1);
  _.each(user.memberships.subscriptions, function (sub) {
    test.isTrue(sub.group === 'default');
    test.isTrue(sub.service === 'stripe');
    test.isTrue(sub.plan === 'test2');
  });

  test.isFalse(Memberships.has(userId,'free'));
  test.isTrue(Memberships.has(userId,'pro'));
  test.isFalse(Memberships.has(userId,'basic'));

  test.isTrue(Memberships.hasAccess(userId,'free'));
  test.isTrue(Memberships.hasAccess(userId,'pro'));
  test.isTrue(Memberships.hasAccess(userId,'basic'));

  subscriptionId = Memberships.cancel(user._id, subscriptionId);
  test.isTrue(Match.test(subscriptionId, String));
  user = Meteor.users.findOne(user._id);
  test.isTrue(Match.test(user.memberships.services.stripe, Object));
  test.isTrue(Match.test(user.memberships.services.stripe.customerId, String));
  //test.isTrue(user.roles.length == 0);
  test.isTrue(user.memberships.subscriptions.length == 0);


  user = Meteor.users.findOne(user._id);
  test.isTrue(Match.test(user.memberships.services.stripe.customerId, String));

  Meteor.call('test.after');

});
