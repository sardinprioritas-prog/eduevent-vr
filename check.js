import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bmogvtzofoyqivtdnqwi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtb2d2dHpvZm95cWl2dGRucXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3ODQzMTcsImV4cCI6MjEwMDM2MDMxN30.-BeFmKabh8mYeRzFVDkWownpF_N4XaCU6SOh1n9I11E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: users } = await supabase.from('users').select('*');
  const { data: events } = await supabase.from('events').select('*');
  const { data: payouts } = await supabase.from('payouts').select('*');
  
  console.log('--- USERS ---');
  users.filter(u => u.name.includes('Syukur') || u.name.includes('Rifki')).forEach(u => {
    console.log(u.id, u.name, u.city);
  });
  
  console.log('\n--- EVENTS ---');
  events.forEach(e => {
    if (e.operator_name?.includes('Syukur') || e.operator_name?.includes('Rifki') || 
        e.co_operator_ids?.some(id => users.find(u => u.id === id && (u.name.includes('Syukur') || u.name.includes('Rifki'))))) {
      console.log(`Event ID: ${e.id}, Main: ${e.operator_name}, CoOps: ${e.co_operator_ids}`);
    }
  });

  console.log('\n--- PAYOUTS ---');
  payouts.forEach(p => {
    const user = users.find(u => u.id === p.user_id);
    if (user && (user.name.includes('Syukur') || user.name.includes('Rifki'))) {
      console.log(`Payout: ${p.id}, User: ${user.name}, Details: ${JSON.stringify(p.details)}`);
    }
  });
}

check();
