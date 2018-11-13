import { getSetting } from 'meteor/vulcan:core';
import { createFSCollection } from 'meteor/origenstudio:vulcan-files';
import createS3StorageProvider from 'meteor/origenstudio:vulcan-files-s3';

let storageProvider;

if (getSetting('amazonAWSS3.mainBucket.client')) {
  storageProvider = createS3StorageProvider(
    getSetting('amazonAWSS3.mainBucket.client'),
    getSetting('amazonAWSS3.mainBucket.cfdomain'),
  );
}

export default createFSCollection({
  typeName: 'PicFile',
  collectionName: 'PicsFiles',
  storageProvider,
});
