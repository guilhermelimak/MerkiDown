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
  createDocument(htmlValue, mdValue) {
    const filesRef = database.ref().child('files').push();
    const editKey = hash();
    const hashRef = database.ref().child(`hash/${editKey}`);

    filesRef.set({ htmlValue, mdValue });
    hashRef.set(filesRef.key);

    return {
      editKey,
      id: filesRef.key,
    };
  },
  updateDocument(htmlValue, mdValue, id) {
    const fileRef = database.ref().child(`files/${id}`);
    fileRef.update({ htmlValue, mdValue });
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

          const { htmlValue, mdValue } = contentSnapshot.val();
          const id = contentUrlRef.key;

          return resolve({ htmlValue, mdValue, id, editKey });
        });
      });
    });
  },
  findDocumentById(documentId) {
    const ref = database.ref(`files/${documentId}`);

    return new Promise((resolve, reject) => {
      ref.once('value', (snapshot) => {
        if (!snapshot || !snapshot.val()) return reject('Error');

        return resolve(snapshot.val().htmlValue);
      });
    });
  },
};
