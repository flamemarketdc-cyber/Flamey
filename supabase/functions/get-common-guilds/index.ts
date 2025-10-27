import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// FIX: Add a type declaration for the Deno global object to resolve TypeScript errors.
// This is safe because 'Deno' is provided by the Supabase Edge Function runtime.
declare const Deno: any;

// Helper for CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or your specific Vercel deployment URL
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Guild {
  id: string;
  name: string;
}

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // 1. Get the secret bot token from environment variables
    const BOT_TOKEN = Deno.env.get('BOT_TOKEN');
    if (!BOT_TOKEN) {
      throw new Error('BOT_TOKEN is not set in Supabase Edge Function secrets.');
    }

    // 2. Get the user's guild IDs from the request body
    const { userGuildIds } = await req.json();
    if (!userGuildIds || !Array.isArray(userGuildIds)) {
      return new Response(JSON.stringify({ error: 'userGuildIds is required and must be an array.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Fetch the guilds the BOT is in from the Discord API
    const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Discord API Error:", errorText);
        throw new Error(`Failed to fetch bot guilds: ${response.statusText}`);
    }

    const botGuilds: Guild[] = await response.json();
    const botGuildIds = new Set(botGuilds.map(g => g.id));

    // 4. Find the common guilds
    const commonGuildIds = userGuildIds.filter(id => botGuildIds.has(id));

    // 5. Return the list of common IDs
    return new Response(JSON.stringify({ commonGuildIds }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in get-common-guilds function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
