import firebase from 'firebase';
import hash from '@/services/hash';

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyAC1s5PGqbb5E7MMlM-Z5_axPoQU5pEpbg',
  authDomain: 'merkidown.firebaseapp.com',
  databaseURL: 'https://merkidown.firebaseio.com/',
  projectId: 'merkidown',
};

firebase.initializeApp(config);

const database = firebase.database();

export default {
  publish(contentHtml, contentMd) {
    const filesRef = database.ref().child('files').push();
    const hashGenerated = hash();
    const hashRef = database.ref().child(`hash/${hashGenerated}`);

    filesRef.set({ contentHtml, contentMd });
    hashRef.set(filesRef.key);
    return {
      publishUrlKey: filesRef.key,
      editUrlHash: hashGenerated,
    };
  },
  save(contentHtml, contentMd, saveId) {
    const filesRef = database.ref().child(`files/${saveId}`);
    filesRef.update({ contentHtml, contentMd });
  },
  getEditContent(editUrl) {
    let contentKey = '';
    const refHashUrl = database.ref(`hash/${editUrl}`);
    return new Promise((resolve) => {
      refHashUrl.once('value', (hashSnapshot) => {
        contentKey = hashSnapshot.val();
        const refContentUrl = database.ref(`files/${contentKey}`);
        refContentUrl.once('value', (contentSnapshot) => {
          resolve({
            htmlValue: contentSnapshot.val().contentHtml,
            mdValue: contentSnapshot.val().contentMd,
            publishUrl: refContentUrl.key,
            saveId: refContentUrl.key,
            editUrl,
          });
        });
      });
    });
  },
};
