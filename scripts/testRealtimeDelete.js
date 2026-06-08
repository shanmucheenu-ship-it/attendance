import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const loadEnv = () => {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let key = match[1];
        let value = match[2] || '';
        process.env[key] = value.trim();
      }
    });
  }
};

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("Subscribing to realtime changes...");
  
  const sub = supabase.channel('test-delete-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_sessions' }, payload => {
      console.log("RECEIVED REALTIME EVENT:");
      console.log(JSON.stringify(payload, null, 2));
    })
    .subscribe(async (status) => {
      console.log("Subscription status:", status);
      if (status === 'SUBSCRIBED') {
        console.log("Creating temporary record to delete...");
        const { data, error } = await supabase.from('attendance_sessions').insert([{
          date: '2099-12-31',
          department: 'Civil',
          year: '3rd Year',
          section: 'Single',
          absentees_count: 99
        }]).select();
        
        if (error) {
          console.error("Error inserting temp record:", error);
          process.exit(1);
        }
        
        const tempId = data[0].id;
        console.log("Temp record created with ID:", tempId);
        
        // Wait 2 seconds, then delete it
        setTimeout(async () => {
          console.log("Deleting temp record...");
          const { error: deleteError } = await supabase.from('attendance_sessions').delete().eq('id', tempId);
          if (deleteError) {
            console.error("Error deleting temp record:", deleteError);
          } else {
            console.log("Temp record deleted successfully from database.");
          }
        }, 2000);
      }
    });
    
  // Keep script alive for 6 seconds
  setTimeout(() => {
    console.log("Exiting test...");
    process.exit(0);
  }, 6000);
}

runTest();
