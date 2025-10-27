import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Add a type declaration for the Deno global object to resolve TypeScript errors.
// This is safe because 'Deno' is provided by the Supabase Edge Function runtime.
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Channel {
    id: string;
    name: string;
    type: number; // 0: GUILD_TEXT, 5: GUILD_ANNOUNCEMENT
}

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const { guildId } = await req.json();

    if (!guildId) {
       return new Response(JSON.stringify({ error: 'guildId is required in the request body.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const BOT_TOKEN = Deno.env.get('BOT_TOKEN');
    if (!BOT_TOKEN) {
      throw new Error('BOT_TOKEN is not set in Supabase Edge Function secrets.');
    }

    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    });

    if (!response.ok) {
      // Specifically handle the case where the bot is not in the guild or lacks permissions.
      if (response.status === 404 || response.status === 403) {
        return new Response(JSON.stringify({ 
            channels: [], 
            error: 'BOT_NOT_IN_GUILD',
            message: 'Flamey is not a member of this server, or it lacks permissions to view channels.' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 OK so the frontend can handle the custom error message gracefully
        });
      }
      const errorText = await response.text();
      console.error("Discord API Error fetching channels:", errorText);
      throw new Error(`Failed to fetch guild channels: ${response.statusText}`);
    }

    const allChannels: Channel[] = await response.json();
    
    // Filter for text channels (type 0) and announcement channels (type 5)
    const textChannels = allChannels
        .filter(channel => channel.type === 0 || channel.type === 5)
        .map(({ id, name }) => ({ id, name }));

    return new Response(JSON.stringify({ channels: textChannels }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in get-guild-channels function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
