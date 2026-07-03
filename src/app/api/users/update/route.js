import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function PUT(request) {
  try {
    const { id, fullName, email, role, permissions } = await request.json();

    if (!id || !email || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Update the user in Firebase Auth (handles email change)
    await adminAuth.updateUser(id, {
      email,
      displayName: fullName,
    });

    // 2. Update the user profile in Firestore
    await adminDb.collection('users').doc(id).update({
      name: fullName,
      email: email,
      role: role,
      permissions: permissions || []
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user via Admin SDK:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
