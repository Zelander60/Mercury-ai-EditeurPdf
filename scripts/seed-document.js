require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  // Create a workspace first
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .insert({
      workspace_owner: '00000000-0000-0000-0000-000000000000',
      title: 'Test Workspace',
      icon_id: 'test',
    })
    .select()
    .single();

  if (wsError) {
    console.error('Workspace error:', wsError);
    process.exit(1);
  }

  console.log('Created workspace:', workspace.id);

  // Create a test document
  const { data: doc, error } = await supabase
    .from('documents')
    .insert({
      workspace_id: workspace.id,
      title: 'AI for Small Business',
      subtitle: 'A Practical Guide',
      type: 'ebook',
      status: 'draft',
      content_json: {
        title: 'AI for Small Business',
        subtitle: 'A Practical Guide',
        author: 'Peter Lompo',
        publisher: 'Pierre Studio',
        cover: {
          style: 'elegant',
          background: '#1a1a2e',
          accent: '#e94560',
          textColor: '#ffffff',
          subtitleColor: '#cccccc',
          authorColor: '#ffffff',
          border: true
        },
        chapters: [
          {
            title: 'Introduction',
            content: [
              'Artificial Intelligence is no longer just for tech giants. Small businesses around the world are discovering how AI can transform their operations, boost productivity, and unlock new growth opportunities.',
              'This book provides a practical, no-nonsense guide to implementing AI in your small business — without breaking the bank or hiring a team of data scientists.'
            ]
          },
          {
            title: 'Chapter 1: Understanding AI',
            content: [
              'Before diving into implementation, it is essential to understand what AI actually is and what it can do for your business.',
              'At its core, AI refers to computer systems that can perform tasks that typically require human intelligence. This includes recognizing patterns, making decisions, understanding natural language, and learning from experience.'
            ]
          }
        ]
      },
      cover_config: {
        style: 'elegant',
        background: '#1a1a2e',
        accent: '#e94560'
      }
    })
    .select()
    .single();

  if (error) {
    console.error('Document error:', error);
    process.exit(1);
  }

  console.log('Created document:', doc.id);
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
