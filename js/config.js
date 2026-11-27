// Public Supabase settings. The anon key is meant to be public:
// row-level security on the database means each user can only read and write their own rows.
window.IBZY_CONFIG = {
  supabaseUrl: 'https://lkcukwylsinxmdbncbcd.supabase.co',
  // Map and Stories only appear for these accounts (everyone else never sees the tabs).
  ownerEmails: ['shaynaong@gmail.com'],
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrY3Vrd3lsc2lueG1kYm5jYmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU3MTA4NzUsImV4cCI6MjExMTI4Njg3NX0.soBtPlH08dBOTBBTlOvQgiRlfubR3lPnGMTl1aV3-MY'
};
