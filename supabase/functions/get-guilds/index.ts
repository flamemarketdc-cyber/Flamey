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

interface DiscordTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Function to refresh the Discord token
async function refreshDiscordToken(refreshToken: string): Promise<DiscordTokenResponse> {
    const DISCORD_CLIENT_ID = Deno.env.get('DISCORD_CLIENT_ID');
    const DISCORD_CLIENT_SECRET = Deno.env.get('DISCORD_CLIENT_SECRET');

    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
        throw new Error('Server configuration error: Missing Discord client credentials.');
    }

    const response = await fetch('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Discord token refresh failed:', errorData);
        throw new Error('Discord connection expired. Please log in again to select a server.');
    }

    return await response.json();
}

async function fetchDiscordGuilds(accessToken: string): Promise<any[]> {
    const discordResponse = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!discordResponse.ok) {
        const errorResponse = { status: discordResponse.status, text: await discordResponse.text() };
        throw errorResponse;
    }
    return await discordResponse.json();
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

        const supabaseClient = createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: req.headers.get('Authorization')! } },
        });
        const userId = await getUserIdFromRequest(req, supabaseClient);
        const serviceClient = createClient(supabaseUrl, serviceKey);
        
        // 1. Fetch the user's Discord identity directly from auth.identities as the source of truth
        const { data: identity, error: identityError } = await serviceClient
            .from('identities')
            .select('identity_data')
            .eq('user_id', userId)
            .eq('provider', 'discord')
            .single();

        if (identityError || !identity) {
            console.error('Identity lookup error:', identityError);
            throw new Error('Authentication error: Could not find your Discord identity. Please try logging out and back in.');
        }

        const identityData = identity.identity_data as any;
        let accessToken = identityData?.access_token;
        let refreshToken = identityData?.refresh_token;

        if (!accessToken || !refreshToken) {
            throw new Error('Authentication error: Discord tokens are missing. Please re-authenticate.');
        }
        
        let guilds;
        try {
            // 2. Try fetching guilds with the current access token
            guilds = await fetchDiscordGuilds(accessToken);
        } catch (error: any) {
            // 3. If it fails with a 401, the token is expired. Refresh it.
            if (error.status === 401) {
                console.log('Access token expired for user. Refreshing...');
                const newTokens = await refreshDiscordToken(refreshToken);

                // 4. Update both auth.identities and our public table with the new tokens
                const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();
                
                // Update public table for resilience
                await serviceClient.from('user_discord_tokens').upsert({
                    id: userId,
                    access_token: newTokens.access_token,
                    refresh_token: newTokens.refresh_token,
                    expires_at: newExpiresAt,
                    updated_at: new Date().toISOString()
                });

                // Update auth.identities so it doesn't become stale
                const newIdentityData = { ...identityData, ...newTokens, expires_in: newTokens.expires_in };
                await serviceClient.from('identities').update({
                    identity_data: newIdentityData
                }).eq('user_id', userId).eq('provider', 'discord');
                
                accessToken = newTokens.access_token;
                guilds = await fetchDiscordGuilds(accessToken);
                
            } else {
                throw new Error(`Discord API Error: ${error.text || 'An unknown error occurred.'}`);
            }
        }
        
        // 5. Filter for guilds where the user has Admin permissions or is the owner
        const manageableGuilds = guilds.filter((guild: any) => {
            try {
                if (guild.owner === true) return true;
                if (typeof guild.permissions === 'string') {
                    const permissions = BigInt(guild.permissions);
                    return (permissions & 0x8n) === 0x8n; // ADMINISTRATOR permission
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
        const isAuthError = error.message.startsWith('Authentication error') || error.message.includes('Discord connection expired');
        const status = isAuthError ? 401 : 500;
        console.error(`Error in get-guilds function (status ${status}):`, error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: status,
        });
    }
});