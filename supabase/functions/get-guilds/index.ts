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
        
        // 1. Fetch the user's Discord tokens from our custom table
        const { data: tokens, error: tokensError } = await serviceClient
            .from('user_discord_tokens')
            .select('*')
            .eq('id', userId)
            .single();

        if (tokensError || !tokens) {
            console.error('Tokens lookup error:', tokensError);
            throw new Error('Authentication error: Could not find your Discord tokens. Please log in again.');
        }

        let accessToken = tokens.access_token;
        let refreshToken = tokens.refresh_token;

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

                // 4. Update our tokens table with the new tokens
                const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();
                
                await serviceClient.from('user_discord_tokens').upsert({
                    id: userId,
                    access_token: newTokens.access_token,
                    refresh_token: newTokens.refresh_token,
                    expires_at: newExpiresAt,
                    updated_at: new Date().toISOString()
                });
                
                accessToken = newTokens.access_token;
                guilds = await fetchDiscordGuilds(accessToken);
                
            } else {
                throw new Error(`Discord API Error: ${error.text || 'An unknown error occurred.'}`);
            }
        }

        // DEBUG: Log all guilds and their permissions
        console.log('All user guilds:', guilds.map(g => ({
            name: g.name,
            owner: g.owner,
            permissions: g.permissions,
            permissions_decimal: g.permissions
        })));
        
        // 5. Filter for guilds where the user has Admin permissions OR is the owner
        const manageableGuilds = guilds.filter((guild: any) => {
            try {
                // If user is owner, include
                if (guild.owner === true) {
                    console.log(`✅ Including guild "${guild.name}" - User is owner`);
                    return true;
                }
                
                // Check for Administrator permissions
                if (typeof guild.permissions === 'string') {
                    const permissions = BigInt(guild.permissions);
                    const hasAdmin = (permissions & 0x8n) === 0x8n; // ADMINISTRATOR permission
                    
                    if (hasAdmin) {
                        console.log(`✅ Including guild "${guild.name}" - User has Administrator permissions`);
                        return true;
                    } else {
                        console.log(`❌ Excluding guild "${guild.name}" - No Administrator permissions (permissions: ${guild.permissions})`);
                        return false;
                    }
                }
                
                console.log(`❌ Excluding guild "${guild.name}" - No valid permissions data`);
                return false;
            } catch(e) {
                console.error(`❌ Failed to parse permissions for guild ${guild.id}:`, guild.permissions, e);
                return false;
            }
        });

        console.log(`Final result: ${manageableGuilds.length} manageable guilds out of ${guilds.length} total guilds`);

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