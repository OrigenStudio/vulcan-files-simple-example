Package.describe({
  name: 'origenstudio:vulcan-files-example-instagram',
  version: '0.0.2',
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
    'vulcan:core@1.11.0',

    // vulcan packages
    'vulcan:forms@1.11.0',
    'vulcan:accounts@1.11.0',
    'vulcan:forms-upload@1.11.0',

    // third-party packages
    'fourseven:scss@4.5.0',
    'origenstudio:vulcan-files@0.0.2',
  ]);

  api.addFiles('lib/stylesheets/style.scss');

  api.addAssets([
    'lib/static/vulcanstagram.png'
  ], ['client']);

  api.addAssets([
    'lib/static/pics/cherry_blossoms.jpg',
    'lib/static/pics/koyo.jpg',
    'lib/static/pics/cat.jpg',
    'lib/static/pics/osaka_tram.jpg',
    'lib/static/pics/matsuri.jpg',
    'lib/static/pics/flowers.jpg',
    'lib/static/pics/kyoto-night.jpg',
    'lib/static/pics/kaisendon.jpg',
    'lib/static/pics/forest.jpg',
  ], 'server');

  api.mainModule('lib/server/main.js', 'server');
  api.mainModule('lib/client/main.js', 'client');
});
