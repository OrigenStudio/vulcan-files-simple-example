# Vulcanstagram files example

Usage example for [origenstudio:vulcan-files](https://github.com/OrigenStudio/vulcan-files) using Vulcan's `example-instagram@1.11.0` (you can download it from [Vulcan-Starter](https://github.com/VulcanJS/Vulcan-Starter)) as base.

### Features

- single file
- uses default field's value behavior, so only the file id is stored
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
import { createFSCollection } from 'meteor/origenstudio:vulcan-files';
import createS3StorageProvider from 'meteor/origenstudio:vulcan-files-s3';

const storageProvider = createS3StorageProvider(
  getSetting('amazonAWSS3.mainBucket.client'),
  getSetting('amazonAWSS3.mainBucket.cfdomain'),
);

export default createFSCollection({
  collectionName: 'PicsFiles',
  storageProvider,
});

```

#### 2. Generate field schema

Modify `packages/example-instagram/lib/modules/pics/schema.js`:

```js
// add this to the top of the file
import once from 'lodash/once';
import { curryFileCheck } from 'meteor/origenstudio:files-helpers';
import { generateFieldSchema, Image } from 'meteor/origenstudio:vulcan-files';

import PicsFiles from './fsCollection';

const schema = {
  // replace the entire `imageUrl` field
  ...generateFieldSchema({
    FSCollection: PicsFiles,
    fieldName: 'imageId',
    resolverName: 'image',
    fieldSchema: {
      label: 'Image',
      viewableBy: ['guests'],
      insertableBy: ['members'],
      editableBy: ['members'],
      form: {
        fileCheck: once(() => curryFileCheck({
          maxSize: 5 * 1024 * 1024, // 5Mbytes
          fileTypeRegExp:  /png|jpg|jpeg/i,
        })),
        FileRender: () => Image,
      },
    },
  }),
  // end of the replacement
};

```

#### 3. Update fragment and retrieve data in form

By using the `generateFieldSchema` to create the field we have actually added 2 fields: `imageId` that stores the id of the file in the `PicsFiles` collection and the `image` resolved field. We wil have to update the fragments registered in `packages/example-instagram/lib/modules/pics/fragments.js` to reflect this changes.

We will update the `image` field in both fragments. Since it is now a `FSFile` field, we will retrieve the name and url from it. On the other hand, we only need the `imageId` field when updating the document, so we will only add it to the `PicsDetailsFragment`

```js
registerFragment(/* GraphQL */`
  fragment PicsItemFragment on Pic {
    _id
    createdAt
    userId
    user {
      displayName
    }
    image {
      name
      url
    }
    commentsCount
  }
`);
registerFragment(/* GraphQL */`
  fragment PicsDetailsFragment on Pic {
    _id
    createdAt
    userId
    user {
      displayName
    }
    imageId # retrieve id to update document
    image {
      name
      url
    }
    commentsCount
    body
  }
`);
```

We have to specify to the edit form to use the `PicsDetailsFragment` fragment, so we'll have to edit the `packages/example-instagram/lib/components/pics/PicsEditForm.jsx` file and provide the `queryFragment` prop to `Components.SmartForm`:

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
