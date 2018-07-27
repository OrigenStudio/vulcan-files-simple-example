/*

A SimpleSchema-compatible JSON schema

*/
import once from 'lodash/once';
import isString from 'lodash/isString';
import { curryFileCheck } from 'meteor/origenstudio:files-helpers';
import { generateFieldSchema, Image } from 'meteor/origenstudio:vulcan-files';

import PicsFiles from './fsCollection';

const schema = {

  // default properties

  _id: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
  },
  createdAt: {
    type: Date,
    optional: true,
    viewableBy: ['guests'],
    onInsert: (document, currentUser) => {
      return new Date();
    }
  },
  userId: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
    resolveAs: {
      fieldName: 'user',
      type: 'User',
      resolver(pic, args, context) {
        return context.Users.findOne({ _id: pic.userId }, { fields: context.Users.getViewableFields(context.currentUser, context.Users) });
      },
      addOriginalField: true
    }
  },

  // custom properties
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
        FileRender: once(() => Image),
      },
    },
  }),
  body: {
    label: 'Body',
    type: String,
    optional: true,
    control: 'textarea', // use a textarea form component
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members']
  },

  // GraphQL-only field

  commentsCount: {
    type: Number,
    optional: true,
    viewableBy: ['guests'],
    hidden: true,
    resolveAs: {
      fieldName: 'commentsCount',
      type: 'Float',
      resolver(pic, args, context) {
        return context.Comments.find({picId: pic._id}).count();
      }
    }
  }
};

export default schema;
