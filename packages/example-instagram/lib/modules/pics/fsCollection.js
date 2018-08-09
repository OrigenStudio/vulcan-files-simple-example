import { getSetting } from 'meteor/vulcan:core';
import { createS3Client, createFSCollection } from 'meteor/origenstudio:vulcan-files';

let thirdParty = {};

if (getSetting('amazonAWSS3.mainBucket.client')) {
  thirdParty = createS3Client(
    getSetting('amazonAWSS3.mainBucket.client'),
    getSetting('amazonAWSS3.mainBucket.cfdomain'),
  );
}

export default createFSCollection({
  typeName: 'PicFile',
  collectionName: 'PicsFiles',
  uploadTo3rdParty: thirdParty.upload,
  deleteFrom3rdParty: thirdParty.delete,
});
