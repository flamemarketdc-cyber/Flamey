// supabase/functions/get-guilds/index.ts

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Helper to get user ID from the request's JWT
async function getUserIdFromRequest(req: Request, supabaseClient: SupabaseClient): Promise<string> {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) {
        throw new Error(`Authentication error: Could not get user from Authorization header. ${error?.message || ''}`);
    }
    return user.id;
}

declare const Deno: any;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceKey) {
        throw new Error('Server configuration error: Missing Supabase environment variables.');
    }

    // Create a standard client to securely verify the user's JWT from the request
    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    const userId = await getUserIdFromRequest(req, supabaseClient);

    // Create a service role client to securely access the auth schema
    const serviceClient = createClient(supabaseUrl, serviceKey);
    
    // Directly query the auth.identities table for the user's Discord provider_token.
    // This is more reliable than relying on the session object.
    const { data: identity, error: identityError } = await serviceClient
      .from('identities')
      .select('provider_token')
      .schema('auth') // ✅ FIX: Specify the 'auth' schema
      .eq('user_id', userId)
      .eq('provider', 'discord')
      .single();

    if (identityError || !identity?.provider_token) {
        console.error('Identity lookup error:', identityError);
        // This is the most likely failure point. Give a very specific and helpful error.
        throw new Error('Authentication error: Could not find a stored Discord token for your user. This is likely because the "guilds" permission was not granted. Please log out, log back in, and ensure you approve all requested Discord permissions.');
    }

    const providerToken = identity.provider_token;
    
    // Use the retrieved token to fetch guilds from the Discord API
    const discordResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${providerToken}`,
      },
    });

    if (!discordResponse.ok) {
        const errorText = await discordResponse.text();
        if (discordResponse.status === 401) {
            // The token we found is invalid or has expired.
             throw new Error('Authentication error: The stored Discord token is invalid or has expired. Please log out and back in to refresh it.');
        }
        throw new Error(`Discord API Error: ${errorText}`);
    }

    const guilds = await discordResponse.json();
    
    // Filter for guilds where the user has Admin permissions or is the owner
    const manageableGuilds = guilds.filter((guild: any) => {
        try {
            if (guild.owner === true) return true;
            if (typeof guild.permissions === 'string') {
                const permissions = BigInt(guild.permissions);
                return (permissions & 0x8n) === 0x8n;
            }
            return false;
        } catch(e) {
            console.error(`Failed to parse permissions for guild ${guild.id}:`, guild.permissions, e);
            return false;
        }
    });

    return new Response(JSON.stringify({ guilds: manageableGuilds }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const status = error.message.startsWith('Authentication error') ? 401 : 400;
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: status,
    });
  }
});