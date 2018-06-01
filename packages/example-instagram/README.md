# Vulcanstagram files example

Usage example for [origenstudio:vulcan-files](https://github.com/OrigenStudio/vulcan-files) using Vulcan's `example-instagram@1.10.1` (you can download it from [Vulcan-Starter](https://github.com/VulcanJS/Vulcan-Starter)) as base.

### Features

- single file
- uses default field's value behavior, so only the file id is stored
- resolves only the file url
- images will be uploaded to `S3` if config is provided

## Installation

In your project's root folder run:
`meteor add origenstudio:vulcan-files-simple-example`

Check the [origenstudio:vulcan-files installation documentation](https://github.com/OrigenStudio/vulcan-files#1-installation) if you encounter any issue.

#### Setup (optional)

In order to use Amazon S3 you will have to add its configuration in your project settings with the following structure:

```json
{
  "amazonAWSS3": {
    "mainBucket": {
      "cfdomain": "https://yourdomain.cloudfront.net",
      "client": {
        "key": "",
        "secret": "",
        "region": "eu-west-1",
        "bucket": "your-bucket-name"
      }
    }
  }
}
```

## Instructions

As an extended explanation, we include here a step by step guide of the changes made to the `example-instagram` package.

#### 1. Create FSCollection: PicsFiles

Create file `packages/example-instagram/lib/modules/pics/fsCollection.js`:

```js
import { getSetting } from 'meteor/vulcan:core';
import { createS3Client, createFSCollection } from 'meteor/origenstudio:vulcan-files';

const s3Client = createS3Client(
  getSetting('amazonAWSS3.mainBucket.client'),
  getSetting('amazonAWSS3.mainBucket.cfdomain'),
);

export default createFSCollection({
  collectionName: 'PicsFiles',
  uploadTo3rdParty: s3Client.upload,
  deleteFrom3rdParty: s3Client.delete,
});

```

#### 2. Generate field schema

Modify `packages/example-instagram/lib/modules/pics/schema.js`:

```js
// add this to the top of the file
import once from 'lodash/once';
import isString from 'lodash/isString';
import { curryFileCheck } from 'meteor/origenstudio:files-helpers';
import { generateFieldSchema, Image } from 'meteor/origenstudio:vulcan-files';

import PicsFiles from './fsCollection';

const schema = {
  // replace the entire `imageUrl` field
  ...generateFieldSchema({
    FSCollection: PicsFiles,
    // only the file id will be stored: this is the default behavior, so we do not
    // need to specify the fieldType
    fieldName: 'imageId',
    fieldSchema: {
      label: 'Image URL',
      form: {
        // perform file validation checks
        fileCheck: once(() => curryFileCheck({
          maxSize: 5 * 1024 * 1024, // 5Mbytes
          fileTypeRegExp:  /png|jpg|jpeg/i,
        })),
        // we want the file to be shown as an image: this package already provides
        // a component for that purpose
        FileRender: once(() => Image),
        // `previewFromValue` function is called before rendering a file, and allow us to tell
        // the FileRender component how it should be previewed. In this case, we want to
        // pass the value of the resolved field as the url
        previewFromValue: once(() => (value, index, props) => {
          if (isString(value)) {
            // is the stored value (id of the file document)
            return {
              // retrieve url from resolved field
              url: props.document.imageUrl,
              // we do not have the name of the file here, so we'll set it
              // from the document's body field
              // this is entirely optional and it is only used as the `alt`
              // attribute of the `img` tag
              name: props.currentValues.body || props.document.body,
            };
          } else {
            // File object as provided by the input, do nothing: preview will be 
            // retrieved automatically by `previewFromFile` prop
          }
        }),
      },
    },
    resolverName: 'imageUrl',
    // we only need to add the resolver on the server, so we check if PicsFiles exist
    resolver: PicsFiles
      ? async ({ imageId }) => {
          if (!imageId) {
            return null;
          }
          const imageFile = await PicsFiles.loader.load(imageId);
          return imageFile ? PicsFiles.link(imageFile) : null;
        }
      : null,
  }),
  // end of the replacement
};

```

#### 3. Update fragment and retrieve data in form

By using the `generateFieldSchema` to create the field we have actually added 2 fields: `imageId` that stores the id of the file in the `PicsFiles` collection and the `imageUrl` resolved field. For the latter we don't have to do anything since it already existed before we changed anything, but the first will have to be added into the corresponding fragments so it is retrieved when querying the document.

We only need this field when updating the document, so we will add it to the `PicsDetailsFragment` registered in `packages/example-instagram/lib/modules/pics/fragments.js` file:

```js
registerFragment(/* GraphQL */`
  fragment PicsDetailsFragment on Pic {
    _id
    createdAt
    userId
    user {
      displayName
    }
    imageId # retrieve id to update document
    imageUrl
    commentsCount
    body
  }
`);
```

Now we will have to use this fragment in the edit form, so we'll have to edit the `packages/example-instagram/lib/components/pics/PicsEditForm.jsx` file and provide the `queryFragment` prop to `Components.SmartForm`:

```jsx
  <Components.SmartForm 
    collection={Pics}
    documentId={documentId}
    queryFragment={getFragment('PicsDetailsFragment')} // add this line
    mutationFragment={getFragment('PicsDetailsFragment')}
    showRemove={true}
    successCallback={document => {
      closeModal();
    }}
  />
```
