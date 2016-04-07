Package.describe({
  name: 'rgnevashev:memberships',
  version: '0.0.1',
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

  api.export('StripeService', {testOnly: true});
  //api.export('MembershipsCommon', ['client', 'server']);

  api.addFiles('server/services/StripeService.coffee', 'server');
  api.addFiles('both/memberships.coffee', ['client', 'server']);
  api.addFiles('server/memberships.coffee', 'server');
  api.addFiles('client/memberships.coffee', 'client');
  api.addFiles('both/init.coffee', ['client', 'server']);
  api.addFiles('server/init.coffee', 'server');
  api.addFiles('client/init.coffee', 'client');
  api.addFiles('server/methods.coffee', 'server');
  api.addFiles('client/helpers.coffee', 'client');
  api.addFiles('server/publications.coffee', 'server');
  api.addFiles('client/subscruptions.coffee', 'client');

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
  api.addFiles('memberships-fixtures.js');
  api.addFiles('memberships-both-tests.js');
  api.addFiles('memberships-server-tests.js', 'server');
  api.addFiles('memberships-client-tests.js', 'client');
});
