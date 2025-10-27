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
  scope: string;
  token_type: string;
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
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
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
        // If refresh fails, the user must re-authenticate.
        throw new Error('Discord connection expired. Please log in again to select a server.');
    }

    return await response.json();
}

async function fetchDiscordGuilds(accessToken: string): Promise<any[]> {
    const discordResponse = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!discordResponse.ok) {
        // We'll let the caller handle the error, especially the 401 case
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
    
    let supabaseClient: SupabaseClient | null = null;
    let serviceClient: SupabaseClient | null = null;
    let userId: string | null = null;

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !anonKey || !serviceKey) {
            throw new Error('Server configuration error: Missing Supabase environment variables.');
        }

        supabaseClient = createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: req.headers.get('Authorization')! } },
        });

        userId = await getUserIdFromRequest(req, supabaseClient);

        serviceClient = createClient(supabaseUrl, serviceKey, {
            db: { schema: 'auth' }
        });
        
        // 1. Fetch user's Discord identity from the database
        const { data: identity, error: identityError } = await serviceClient
            .from('identities')
            .select('provider_token, provider_refresh_token, id')
            .eq('user_id', userId)
            .eq('provider', 'discord')
            .single();
        
        // 2. Perform granular checks on the retrieved identity
        if (identityError) {
            console.error('Identity lookup database error:', identityError);
            throw new Error('Authentication error: A database error occurred while retrieving your Discord credentials. Please try logging in again.');
        }
        if (!identity) {
            throw new Error('Authentication error: No Discord identity was found for your user account. Please log out and log back in using Discord.');
        }
        if (!identity.provider_token) {
            throw new Error('Authentication error: Your Discord connection is missing required permissions. This can happen if the "guilds" scope was not approved. Please log out and try logging in again. When prompted by Discord, ensure you grant all requested permissions to Flamey.');
        }
        if (!identity.provider_refresh_token) {
            throw new Error('Authentication error: A refresh token is missing. Please log out and log back in, ensuring you grant "offline access" to Flamey to maintain your session.');
        }


        let { provider_token: accessToken, provider_refresh_token: refreshToken, id: identityId } = identity;

        let guilds;
        try {
            // 3. Try fetching guilds with the current access token
            guilds = await fetchDiscordGuilds(accessToken);
        } catch (error: any) {
            // 4. If it fails with a 401, the token is expired. Refresh it.
            if (error.status === 401) {
                console.log('Access token expired. Refreshing...');
                const newTokens = await refreshDiscordToken(refreshToken);

                // 5. Update the tokens in the database
                const { error: updateError } = await serviceClient
                    .from('identities')
                    .update({
                        provider_token: newTokens.access_token,
                        provider_refresh_token: newTokens.refresh_token,
                    })
                    .eq('id', identityId);

                if (updateError) {
                    console.error('Failed to update new tokens in database:', updateError);
                } else {
                    console.log('Successfully updated tokens in database.');
                }
                
                // 6. Retry fetching guilds with the new access token
                accessToken = newTokens.access_token;
                guilds = await fetchDiscordGuilds(accessToken);
                
            } else {
                // For other errors (e.g., 500 from Discord), just re-throw
                throw new Error(`Discord API Error: ${error.text || 'An unknown error occurred.'}`);
            }
        }
        
        // 7. Filter for guilds where the user has Admin permissions or is the owner
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
        const isAuthError = error.message.startsWith('Authentication error');
        const status = isAuthError ? 401 : 500;
        console.error(`Error in get-guilds function (status ${status}):`, error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: status,
        });
    }
});