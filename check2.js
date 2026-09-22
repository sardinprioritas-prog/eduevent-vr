import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bmogvtzofoyqivtdnqwi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtb2d2dHpvZm95cWl2dGRucXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3ODQzMTcsImV4cCI6MjEwMDM2MDMxN30.-BeFmKabh8mYeRzFVDkWownpF_N4XaCU6SOh1n9I11E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugCityMatching() {
  const { data: users } = await supabase.from('users').select('name, city, role');
  const { data: events } = await supabase.from('events').select('school_name, city_name, operator_name, payout_id');
  const { data: payouts } = await supabase.from('payouts').select('*');

  console.log('--- USERS ---');
  users.filter(u => ['operator', 'pioneer'].includes(u.role)).forEach(u => {
    console.log(`User: ${u.name}, City: "${u.city}"`);
  });

  console.log('\n--- EVENTS ---');
  events.forEach(e => {
    console.log(`Event: ${e.school_name}, CityName: "${e.city_name}", Operator: ${e.operator_name}, payoutId: ${e.payout_id}`);
  });
}

debugCityMatching();
