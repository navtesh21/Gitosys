import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpwoucearslbgdmojprm.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwd291Y2VhcnNsYmdkbW9qcHJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MzkzNDgsImV4cCI6MjA1ODExNTM0OH0.dbclmCeBdiv8Mmwheed0-pzA6hbaYOG6hAXDHSF6rpg";
const supabase = createClient(supabaseUrl, supabaseKey);

interface UploadResponse {
  path: string;
  url: string;
}

async function uploadMP3(file: File, setProgress: (progress: number) => void): Promise<UploadResponse> {
  console.log(file);
  if (!file || file.type !== 'audio/mpeg') {
    throw new Error('Invalid file type. Please upload an MP3 file.');
  }

  const filePath = `uploads/${Date.now()}-${file.name}`;
  const bucketName = 'gitosys';

  // Convert file to a readable stream
  const fileStream = file.stream();
  const reader = fileStream.getReader();
  const totalSize = file.size;
  let uploadedSize = 0;

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  // Get public URL
  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  if (!publicUrlData) throw new Error("Failed to get public URL");

  return new Promise((resolve, reject) => {
    function readChunk() {
      reader.read().then(({ done, value }) => {
        if (done) {
          resolve({ path: filePath, url: publicUrlData.publicUrl }); // ✅ Returning both path and URL
          return;
        }
        uploadedSize += value.length;
        setProgress(Math.round((uploadedSize / totalSize) * 100));
        readChunk(); 
      }).catch(reject);
    }
    readChunk();
  });
}

export { uploadMP3 };
