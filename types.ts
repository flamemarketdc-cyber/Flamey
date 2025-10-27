export type Feature = 
  | 'dashboard_home' 
  | 'general_settings'
  | 'commands'
  | 'messages'
  | 'custom_branding'
  | 'ticket_system'
  | 'auto_moderation'
  | 'giveaways'
  | 'giveaways_claimtime'
  | 'logging'
  | 'ai_chatbot'
  | 'leveling';

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}
