require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

async function run() {
  const db = admin.firestore();
  const snapshot = await db.collection('users').get();
  let count = 0;
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data().email, '| Role:', doc.data().role);
    count++;
  });
  console.log("Total users:", count);
  process.exit(0);
}
run();
