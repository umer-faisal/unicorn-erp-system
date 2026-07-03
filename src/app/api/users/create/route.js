import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { email, password, fullName, role, permissions } = await request.json();

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create the user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: fullName,
    });

    const newUid = userRecord.uid;

    // 2. Create the user profile in Firestore
    const newUserProfile = {
      name: fullName,
      email: email,
      password: password, // Storing plaintext as requested by user
      role: role,
      permissions: permissions || [],
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    await adminDb.collection('users').doc(newUid).set(newUserProfile);

    return NextResponse.json({ success: true, uid: newUid, user: newUserProfile });
  } catch (error) {
    console.error('Error creating user via Admin SDK:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
