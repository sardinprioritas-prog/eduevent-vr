import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bmogvtzofoyqivtdnqwi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtb2d2dHpvZm95cWl2dGRucXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3ODQzMTcsImV4cCI6MjEwMDM2MDMxN30.-BeFmKabh8mYeRzFVDkWownpF_N4XaCU6SOh1n9I11E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugPayouts() {
  const { data: users } = await supabase.from('users').select('*');
  const { data: payouts } = await supabase.from('payouts').select('*');
  
  const nunukanUsers = users.filter(u => u.city === 'Nunukan');
  const nunukanIds = nunukanUsers.map(u => u.id);
  
  console.log('Nunukan Users:');
  nunukanUsers.forEach(u => console.log(u.id, u.name, u.role));
  
  console.log('\nPayouts for Nunukan users:');
  payouts.filter(p => nunukanIds.includes(p.user_id)).forEach(p => {
    const user = nunukanUsers.find(u => u.id === p.user_id);
    console.log(`User: ${user.name} | PayoutID: ${p.id} | Details:`, JSON.stringify(p.details));
  });
}

debugPayouts();
