import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

class SupabaseService {
  private client: SupabaseClient<any, 'public'>;

  constructor() {
    this.client = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
    ) as SupabaseClient<any, 'public'>;
  }

  // Upload a Buffer to a bucket
  async uploadBuffer(
    bucket: string,
    path: string,
    file: Buffer,
    contentType = 'application/octet-stream',
  ) {
    if (!bucket || !path) throw new Error('bucket and path are required');

    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      // Check if the bucket is missing
      if (/bucket not found/i.test(error.message)) {
        await this.ensureBucketExists(bucket, true);
        const { data: retryData, error: retryError } = await this.client.storage
          .from(bucket)
          .upload(path, file, { contentType, upsert: true });

        if (retryError) throw retryError;
        return retryData;
      }
      throw error;
    }

    return data;
  }

  // Ensure bucket exists
  async ensureBucketExists(bucket: string, isPublic = true) {
    const { data, error } = await this.client.storage.createBucket(bucket, {
      public: isPublic,
    });

    if (error && !/already exists/i.test(error.message)) {
      throw error;
    }

    return data || null;
  }

  // Upload a file-like object
  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer | Blob | File,
    opts?: { contentType?: string; upsert?: boolean },
  ) {
    if (!bucket || !path) throw new Error('bucket and path are required');

    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, {
        contentType: opts?.contentType,
        upsert: opts?.upsert ?? true,
      });

    if (error) throw error;
    return data;
  }

  // Remove object(s)
  async remove(bucket: string, paths: string | string[]) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .remove(Array.isArray(paths) ? paths : [paths]);

    if (error) throw error;
    return data;
  }

  // Get public URL
  getPublicUrl(bucket: string, path: string) {
    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  }

  // Get signed URL
  async getSignedUrl(bucket: string, path: string, expires = 60) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expires);

    if (error) throw error;
    return data.signedUrl;
  }
}

const supabaseService = new SupabaseService();
export default supabaseService;
