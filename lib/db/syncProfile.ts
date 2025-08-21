import { createClerkSupabaseClient } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
}

export async function syncProfile(user: UserProfile): Promise<void> {
  try {
    const supabase = await createClerkSupabaseClient();
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.fullName || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Failed to sync profile:', error);
      throw error;
    }

    console.log('Profile synced successfully for user:', user.id);
  } catch (error) {
    console.error('Profile sync error:', error);
    throw error;
  }
}
