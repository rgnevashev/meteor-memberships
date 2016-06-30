Package.describe({
  name: 'rgnevashev:memberships',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'Memberships',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use('underscore', ['client', 'server']);
  api.use('underscorestring:underscore.string@3.0.0');
  api.use('coffeescript', ['client', 'server']);
  api.use('templating@1.0.0');
  api.use('blaze@2.0.0');
  api.use('tracker@1.0.0');
  api.use('mongo@1.0.0');
  api.use('check@1.0.0');
  api.use('raix:eventemitter@0.1.3');
  api.use('aldeed:simple-schema@1.0.0');
  api.use('aldeed:collection2@2.0.0');
  api.use('accounts-base@1.0.0');
  api.use('momentjs:moment@2.0.0');
  api.use('rgnevashev:stripe@4.0.0');

  //api.imply('aldeed:simple-schema');
  //api.imply('aldeed:collection2');

  api.export('Memberships');
  api.export('MembershipsClient', 'client');
  api.export('MembershipsServer', 'server');
  api.export('MembershipsSchema');

  api.export([
    'StripePaymentGateway',
  ], {testOnly: true});

  api.addFiles([
    'server/gateways/PaymentGateway.coffee',
    'server/gateways/Stripe.coffee'
  ], 'server');

  api.addFiles('both/MembershipsCommon.coffee', ['client', 'server']);
  api.addFiles('server/MembershipsServer.coffee', 'server');
  api.addFiles('client/MembershipsClient.coffee', 'client');

  api.addFiles('both/init.coffee', ['client', 'server']);
  api.addFiles([
    'server/init.coffee',
    'server/methods.coffee',
    'server/publications.coffee'
  ], 'server');

  api.addFiles([
    'client/init.coffee',
    'client/subscruptions.coffee',
    'client/helpers.coffee'
  ], 'client');

  api.addFiles('server/globals.js', 'server');
  api.addFiles('client/globals.js', 'client');

});

Package.onTest(function(api) {
  api.use('underscore');
  api.use('check');
  api.use('ecmascript');
  api.use('tinytest');
  api.use('test-helpers');
  api.use('accounts-password');
  api.use('rgnevashev:memberships');

  api.addFiles('tests/define.js', 'server');
  api.addFiles('tests/paymentGateways.js', 'server');
  api.addFiles('tests/fixtures.js');
  api.addFiles('tests/common.js');
  api.addFiles('tests/subscribe.js', 'server');

});
