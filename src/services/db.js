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
  publishDocument(htmlValue, msValue) {
    const filesRef = database.ref().child('files').push();
    const editKey = hash();
    const hashRef = database.ref().child(`hash/${editKey}`);

    filesRef.set({ htmlValue, msValue });
    hashRef.set(filesRef.key);

    return {
      editKey,
      publishKey: filesRef.key,
    };
  },
  saveDocument(htmlValue, msValue, publishedId) {
    const filesRef = database.ref().child(`files/${publishedId}`);
    filesRef.update({ htmlValue, msValue });
  },
  findDocumentByEditKey(editKey) {
    let contentKey = '';
    const hashUrlRef = database.ref(`hash/${editKey}`);

    return new Promise((resolve, reject) => {
      hashUrlRef.once('value', (hashSnapshot) => {
        contentKey = hashSnapshot.val();
        const contentUrlRef = database.ref(`files/${contentKey}`);

        contentUrlRef.once('value', (contentSnapshot) => {
          if (!contentSnapshot || !contentSnapshot.val()) return reject('Error');

          const { htmlValue, msValue } = contentSnapshot.val();
          const publishKey = contentUrlRef.key

          resolve({ htmlValue, mdValue, publishKey, editKey });
        });
      });
    });
  },
  findDocumentById(documentId) {
    const ref = database.ref(`files/${documentId}`);

    return new Promise((resolve, reject) => {

      ref.once('value', (snapshot) => {
        if (!snapshot || !snapshot.val()) {
          reject('Error');
          return;
        }
        resolve(snapshot.val().htmlValue);
      });
    });
  },
};
