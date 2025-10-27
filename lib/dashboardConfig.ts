import React from 'react';
import { GiftIcon, ShieldCheckIcon, StarIcon, LayoutGridIcon, FileTextIcon, CogIcon, CodeIcon, MessageSquareIcon, LifeBuoyIcon, BotIcon, GraduationCapIcon } from '../components/icons/Icons';
import { type Feature } from '../types';

export type NavItem = {
  type: 'link';
  id: Feature;
  name: string;
  icon: React.ReactNode;
} | {
  type: 'heading';
  name: string;
} | {
  type: 'dropdown';
  id: Feature;
  name: string;
  icon: React.ReactNode;
  children: {
    id: Feature;
    name:string;
  }[];
};

export const navItems: NavItem[] = [
  { type: 'link', id: 'general_settings', name: 'General Settings', icon: React.createElement(CogIcon, { className: "h-5 w-5" }) },
  { type: 'link', id: 'commands', name: 'Commands', icon: React.createElement(CodeIcon, { className: "h-5 w-5" }) },
  { type: 'link', id: 'messages', name: 'Messages', icon: React.createElement(MessageSquareIcon, { className: "h-5 w-5" }) },
  { type: 'link', id: 'custom_branding', name: 'Custom Branding', icon: React.createElement(StarIcon, { className: "h-5 w-5" }) },
  
  { type: 'heading', name: 'Modules' },

  { type: 'link', id: 'ticket_system', name: 'Ticket System', icon: React.createElement(LifeBuoyIcon, { className: "h-5 w-5" }) },
  { type: 'link', id: 'auto_moderation', name: 'Auto Moderation', icon: React.createElement(ShieldCheckIcon, { className: "h-5 w-5" }) },
  { 
    type: 'dropdown', 
    id: 'giveaways', 
    name: 'Giveaways', 
    icon: React.createElement(GiftIcon, { className: "h-5 w-5" }),
    children: [
      { id: 'giveaways_claimtime', name: 'Claim Time' }
    ]
  },
  { type: 'link', id: 'logging', name: 'Logging', icon: React.createElement(FileTextIcon, { className: "h-5 w-5" }) },
  { type: 'link', id: 'ai_chatbot', name: 'AI Chatbot', icon: React.createElement(BotIcon, { className: "h-5 w-5" }) },
  { type: 'link', id: 'leveling', name: 'Leveling', icon: React.createElement(GraduationCapIcon, { className: "h-5 w-5" }) },
];

export const defaultCommands = [
  // Moderation
  { name: 'kick', description: 'Kicks a member from the server.', usage: 'kick <@user> [reason]' },
  { name: 'ban', description: 'Bans a member from the server.', usage: 'ban <@user> [reason]' },
  { name: 'mute', description: 'Mutes a member for a specified duration.', usage: 'mute <@user> <time> [reason]' },
  { name: 'unmute', description: 'Unmutes a member.', usage: 'unmute <@user>' },
  { name: 'warn', description: 'Warns a member.', usage: 'warn <@user> [reason]' },
  { name: 'warnings', description: 'Shows the warnings for a member.', usage: 'warnings <@user>' },
  { name: 'clear-warnings', description: 'Clears all warnings for a member.', usage: 'clear-warnings <@user>' },
  { name: 'purge', description: 'Deletes a specified number of messages.', usage: 'purge <amount>' },
  // Utility
  { name: 'ping', description: 'Checks the bot\'s latency.', usage: 'ping' },
  { name: 'help', description: 'Shows a list of all available commands.', usage: 'help [command]' },
  { name: 'serverinfo', description: 'Displays information about the server.', usage: 'serverinfo' },
  { name: 'userinfo', description: 'Displays information about a user.', usage: 'userinfo [@user]' },
  { name: 'avatar', description: 'Displays a user\'s avatar.', usage: 'avatar [@user]' },
  // Fun
  { name: 'meme', description: 'Shows a random meme.', usage: 'meme' },
  { name: '8ball', description: 'Asks the magic 8-ball a question.', usage: '8ball <question>' },
  { name: 'coinflip', description: 'Flips a coin.', usage: 'coinflip' },
  // AI
  { name: 'ask', description: 'Ask the AI chatbot a question.', usage: 'ask <question>' },
];


const generateFeatureNameMap = (): Record<Feature, string> => {
    const map: Partial<Record<Feature, string>> = {};
    navItems.forEach(item => {
        if (item.type === 'link' || item.type === 'dropdown') {
            map[item.id] = item.name;
            if (item.type === 'dropdown') {
                item.children.forEach(child => {
                    map[child.id] = child.name;
                });
            }
        }
    });
    return map as Record<Feature, string>;
};

export const featureNameMap: Record<Feature, string> = generateFeatureNameMap();