import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // 1. Delete the user from Firebase Auth
    await adminAuth.deleteUser(id);

    // 2. Delete the user profile from Firestore
    await adminDb.collection('users').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user via Admin SDK:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
