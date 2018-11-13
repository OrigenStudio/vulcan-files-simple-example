import { addCallback } from 'meteor/vulcan:core';

import PicsFiles from '../../modules/pics/fsCollection';

addCallback(
  '*.upload.after',
  function picfileUploadAfter(fileRef, { FSCollection }) {
    return fileRef;
  }
);

addCallback(
  `${PicsFiles.typeName}.upload.after`.toLowerCase(),
  function picfileUploadAfter(fileRef, { FSCollection }) {
    return fileRef;
  }
);
