Package.describe({
  name: 'origenstudio:vulcan-files-simple-example',
  version: '0.0.1',
  summary: 'This is a simple example that implements a file system in the Vulcan framework',
  git: 'https://github.com/OrigenStudio/vulcan-files-simple-example',
  documentation: 'README.md'
});

Package.onUse(api => {
  api.versionsFrom('1.6.0.1');

  api.use([
    'ecmascript',

    'promise',

    // vulcan core
    'vulcan:core@1.10.0',

    // vulcan packages
    'vulcan:forms@1.10.0',
    'vulcan:accounts@1.10.0',
    'vulcan:forms-upload@1.10.0',

    // third-party packages
    'fourseven:scss@4.5.0',
    'origenstudio:vulcan-files',
  ]);

  api.addFiles('lib/stylesheets/style.scss');

  api.addAssets([
    'lib/static/vulcanstagram.png'
  ], ['client']);

  api.mainModule('lib/server/main.js', 'server');
  api.mainModule('lib/client/main.js', 'client');
});
