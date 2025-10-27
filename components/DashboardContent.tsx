import React, { useState, useEffect, useRef } from 'react';
import { type Feature, DiscordGuild } from '../types';
import { supabase } from '../lib/supabaseClient';
import { SpinnerIcon, BotIcon, MessageSquareIcon, AtSignIcon, BookOpenIcon, SparklesIcon, ChevronDownIcon } from './icons/Icons';

const baseCardStyles = 'bg-nexus-surface border border-white/5 rounded-xl';
const hoverCardStyles = 'hover:border-nexus-accent-primary/30';
const formInputStyles = "w-full bg-nexus-overlay border border-white/10 rounded-lg px-4 py-2.5 text-sm text-nexus-primary-text placeholder-nexus-secondary-text/50 focus:border-nexus-accent-primary focus:bg-nexus-surface focus:outline-none focus:ring-2 focus:ring-nexus-accent-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

const Card: React.FC<{ children: React.ReactNode; className?: string; interactive?: boolean }> = ({ children, className = '', interactive = false }) => (
  <div className={`${baseCardStyles} ${interactive ? hoverCardStyles : ''} ${className} shadow-[0_0_10px_rgba(0,180,255,0.05)]`}>
    {children}
  </div>
);

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="relative mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-nexus-primary-text">{children}</h2>
        <div className="absolute -bottom-3 left-0 h-px w-full bg-gradient-to-r from-nexus-accent-primary/20 via-nexus-accent-primary/5 to-transparent" />
    </div>
);

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string, disabled?: boolean }> = ({ enabled, onChange, label, disabled = false }) => (
    <div className="flex items-center justify-between">
        <span className={`font-medium text-nexus-primary-text transition-opacity ${disabled ? 'opacity-50' : ''}`}>{label}</span>
        <button
            onClick={() => onChange(!enabled)}
            disabled={disabled}
            className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexus-accent-primary focus:ring-offset-nexus-surface ${enabled ? 'bg-nexus-accent-primary' : 'bg-white/10'} ${disabled ? 'cursor-not-allowed' : ''}`}
        >
            <span
                className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);

const SaveBar: React.FC<{ isVisible: boolean; onSave: () => void; onReset: () => void; isSaving: boolean }> = ({ isVisible, onSave, onReset, isSaving }) => (
    <div className={`sticky bottom-0 left-0 right-0 w-full transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-4xl mx-auto p-2">
             <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-nexus-overlay/80 backdrop-blur-lg border border-white/10 shadow-2xl shadow-black/50">
                 <p className="font-medium text-sm text-nexus-accent-glow">You have unsaved changes!</p>
                 <div className="flex items-center gap-3">
                    <button 
                        onClick={onReset}
                        disabled={isSaving}
                        className="px-5 py-2 text-sm font-medium text-nexus-secondary-text bg-transparent border border-white/10 rounded-lg hover:bg-white/5 hover:text-nexus-primary-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Reset
                    </button>
                    <button 
                        onClick={onSave}
                        disabled={isSaving}
                        className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-nexus-accent-primary to-nexus-accent-glow rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(0,180,255,0.3)]"
                    >
                        {isSaving && <SpinnerIcon className="h-4 w-4"/>}
                        Save Changes
                    </button>
                 </div>
             </div>
        </div>
    </div>
);


const DashboardHome: React.FC<{ server: DiscordGuild }> = ({ server }) => {
    const serverIconUrl = server.icon
    ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.webp?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(server.id.slice(-1)) % 5}.png`;

    return (
        <div className="animate-fade-in-up">
            <Title>Welcome to {server.name}</Title>
            <Card className="p-8 flex flex-col md:flex-row items-center gap-8">
                <img src={serverIconUrl} alt={`${server.name} icon`} className="w-24 h-24 rounded-2xl flex-shrink-0" />
                <div>
                    <h3 className="text-2xl font-bold text-nexus-primary-text">Dashboard Overview</h3>
                    <p className="text-nexus-secondary-text mt-2">
                        You're all set! Use the sidebar navigation on the left to configure modules, manage settings, and unleash the full power of Flamey on your server.
                    </p>
                    <p className="text-nexus-secondary-text mt-4">
                        If you need any help, feel free to join our <a href="#" className="text-nexus-accent-primary hover:underline">support server</a>.
                    </p>
                </div>
            </Card>
        </div>
    );
};


const MessagesContent: React.FC<{server: DiscordGuild}> = ({server}) => {
    const [welcomeEnabled, setWelcomeEnabled] = useState(true);
    const [goodbyeEnabled, setGoodbyeEnabled] = useState(false);

    return (
        <div className="animate-fade-in-up">
            <Title>Welcome & Goodbye Messages</Title>
            <div className="space-y-6">
                <Card className="p-6">
                    <ToggleSwitch enabled={welcomeEnabled} onChange={setWelcomeEnabled} label="Enable Welcome Messages" />
                    {welcomeEnabled && (
                        <div className="mt-6 space-y-4 border-t border-white/5 pt-6">
                            <div>
                                <label className="block text-sm font-medium text-nexus-secondary-text mb-2">Welcome Channel</label>
                                <select className={formInputStyles}>
                                    <option>#general</option>
                                    <option>#welcome</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nexus-secondary-text mb-2">Welcome Message</label>
                                <textarea className={`${formInputStyles} h-32`} defaultValue="Welcome {user.mention} to {server.name}!"></textarea>
                                <p className="text-xs text-gray-500 mt-2">Placeholders: `{'user.mention'}` `{'user.name'}` `{'server.name'}`</p>
                            </div>
                            <button className="px-5 py-2 text-sm font-medium text-nexus-accent-glow bg-nexus-accent-primary/10 border border-nexus-accent-primary/20 rounded-lg hover:bg-nexus-accent-primary/20 hover:text-white transition-colors">
                                Send Test Message
                            </button>
                        </div>
                    )}
                </Card>
                <Card className="p-6">
                     <ToggleSwitch enabled={goodbyeEnabled} onChange={setGoodbyeEnabled} label="Enable Goodbye Messages" />
                </Card>
            </div>
             <SaveBar isVisible={true} onSave={() => {}} onReset={() => {}} isSaving={false} />
        </div>
    );
}

const GeneralSettings: React.FC<{server: DiscordGuild}> = ({ server }) => {
    const [prefix, setPrefix] = useState(',');
    const [initialPrefix, setInitialPrefix] = useState(',');
    const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'success' | 'error'>('loading');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPrefix = async () => {
            setStatus('loading');
            const { data, error } = await supabase
                .from('guild_configs')
                .select('prefix')
                .eq('guild_id', server.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching prefix:', error);
                setError('Failed to load settings.');
                setStatus('error');
            } else {
                const currentPrefix = data?.prefix || ',';
                setPrefix(currentPrefix);
                setInitialPrefix(currentPrefix);
                setStatus('idle');
            }
        };
        fetchPrefix();
    }, [server.id]);

    const handleSave = async () => {
        setStatus('saving');
        setError('');
        const { error } = await supabase
            .from('guild_configs')
            .upsert({ guild_id: server.id, prefix: prefix })
            .select();

        if (error) {
            console.error('Error saving prefix:', error);
            setError('Failed to save settings.');
            setStatus('error');
        } else {
            setInitialPrefix(prefix);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const isUnchanged = prefix === initialPrefix;
    
    if (status === 'loading') {
        return (
            <div className="animate-fade-in-up">
                <Title>General Settings</Title>
                <Card className="flex justify-center items-center h-48">
                    <SpinnerIcon className="h-8 w-8 text-nexus-accent-primary" />
                </Card>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <Title>General Settings</Title>
            <Card className="p-6 md:p-8">
                <h3 className="text-xl font-semibold text-nexus-primary-text">Command Prefix</h3>
                <p className="text-sm text-nexus-secondary-text mt-2 mb-6">Set the prefix used to trigger bot commands in your server.</p>
                <div>
                    <label htmlFor="prefix-input" className="sr-only">Prefix</label>
                    <input
                        id="prefix-input"
                        type="text"
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        maxLength={5}
                        className={`${formInputStyles} w-full sm:w-1/2 lg:w-1/3`}
                    />
                </div>
                 {status === 'success' && <p className="text-nexus-success text-sm mt-4">Settings saved successfully!</p>}
                 {status === 'error' && <p className="text-nexus-danger text-sm mt-4">{error}</p>}
            </Card>
            <SaveBar isVisible={!isUnchanged} onSave={handleSave} onReset={() => setPrefix(initialPrefix)} isSaving={status === 'saving'} />
        </div>
    );
};

const HowItWorksItem: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4 p-4 rounded-lg transition-colors hover:bg-white/5">
        <div className="flex-shrink-0 p-2.5 rounded-lg bg-nexus-surface border border-white/10 mt-1">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-white text-md">{title}</h4>
            <p className="text-sm text-nexus-secondary-text mt-1">{children}</p>
        </div>
    </div>
);

const AIChatbotContent: React.FC<{ server: DiscordGuild }> = ({ server }) => {
    const BOT_INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1430883691944738958&permissions=1101596716286&scope=bot%20applications.commands';
    
    type Config = {
        enabled: boolean;
        autoChannelEnabled: boolean;
        autoChannel: string | null;
        persona: string;
    };
    
    const { id: guildId } = server;

    const [config, setConfig] = useState<Config>({ enabled: false, autoChannelEnabled: false, autoChannel: null, persona: '' });
    const [initialConfig, setInitialConfig] = useState<Config>({ enabled: false, autoChannelEnabled: false, autoChannel: null, persona: '' });
    const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
    const [status, setStatus] = useState<'loading' | 'saving' | 'success' | 'error' | 'idle'>('loading');
    const [error, setError] = useState('');
    const [channelError, setChannelError] = useState<string | null>(null);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [channelSearch, setChannelSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!guildId) return;

        const fetchData = async () => {
            setStatus('loading');
            setError('');
            setChannelError(null);
            setChannels([]);

            try {
                const [channelsResponse, configResponse] = await Promise.all([
                    supabase.functions.invoke('get-guild-channels', { body: { guildId } }),
                    supabase.from('guild_configs').select('ai_chatbot_enabled, ai_chatbot_auto_channel, ai_chatbot_persona').eq('guild_id', guildId).single(),
                ]);

                const { data: channelsData, error: channelsInvokeError } = channelsResponse;
                if (channelsInvokeError) {
                    setChannelError('Failed to fetch channels. Please ensure Flamey has the correct permissions and try again.');
                } else if (channelsData.error === 'BOT_NOT_IN_GUILD') {
                    setChannelError(channelsData.message);
                } else {
                    setChannels(channelsData?.channels || []);
                }
                
                const { data: configData, error: configError } = configResponse;
                if (configError && configError.code !== 'PGRST116') {
                    throw new Error(`Failed to load settings: ${configError.message}`);
                }
                
                const newConfig: Config = {
                    enabled: configData?.ai_chatbot_enabled ?? false,
                    autoChannelEnabled: !!configData?.ai_chatbot_auto_channel,
                    autoChannel: configData?.ai_chatbot_auto_channel ?? null,
                    persona: configData?.ai_chatbot_persona ?? '',
                };
                setConfig(newConfig);
                setInitialConfig(newConfig);
                
                setStatus('idle');
            } catch (e: any) {
                setError(e.message);
                setStatus('error');
            }
        };
        fetchData();
    }, [guildId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleSave = async () => {
        setStatus('saving');
        setError('');
        const { error: saveError } = await supabase
            .from('guild_configs')
            .upsert({ 
                guild_id: guildId, 
                ai_chatbot_enabled: config.enabled,
                ai_chatbot_auto_channel: config.autoChannelEnabled ? config.autoChannel : null,
                ai_chatbot_persona: config.persona,
            })
            .select();

        if (saveError) {
            setError(`Failed to save settings: ${saveError.message}`);
            setStatus('error');
        } else {
            setInitialConfig(config);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const isUnchanged = JSON.stringify(config) === JSON.stringify(initialConfig);
    const selectedChannel = channels.find(c => c.id === config.autoChannel);
    const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(channelSearch.toLowerCase()));

    if (status === 'loading') {
        return (
            <div className="animate-fade-in-up">
                <Title>AI Chatbot</Title>
                <Card className="flex justify-center items-center h-64"><SpinnerIcon className="h-8 w-8 text-nexus-accent-primary" /></Card>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in-up space-y-8">
            <Title>AI Chatbot</Title>
            
            <Card className="p-6 md:p-8">
                <div className="space-y-8">
                    <div>
                         <ToggleSwitch 
                            label="Enable AI Chatbot"
                            enabled={config.enabled}
                            onChange={(enabled) => setConfig(prev => ({ ...prev, enabled }))}
                        />
                         <p className="text-sm text-nexus-secondary-text mt-2">Allow Flamey to chat with users when mentioned or in a dedicated channel.</p>
                    </div>
                    
                    <div className={`space-y-8 transition-opacity duration-500 ${config.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div className="border-t border-white/5 pt-8">
                            <h3 className="text-lg font-semibold text-nexus-primary-text">AI Persona</h3>
                            <p className="text-sm text-nexus-secondary-text mt-1 mb-4">Give Flamey a unique personality. Tell it how to act, what to talk about, and how to respond. (System Instruction)</p>
                            <textarea
                                value={config.persona}
                                onChange={(e) => setConfig(prev => ({...prev, persona: e.target.value}))}
                                placeholder="Example: You are a witty and slightly sarcastic space pirate who loves bad jokes."
                                className={`${formInputStyles} h-28`}
                            />
                        </div>

                         <div className="border-t border-white/5 pt-8">
                            <h3 className="text-lg font-semibold text-nexus-primary-text">Auto-Response Channel</h3>
                            <p className="text-sm text-nexus-secondary-text mt-1 mb-4">Select a channel where Flamey will reply to every message without needing a mention.</p>
                             {channelError ? (
                                <div className="p-3 bg-blue-500/10 border-l-4 border-nexus-accent-primary rounded-lg text-blue-300 text-sm">
                                    <p className="font-semibold mb-1">Could not load channels</p>
                                    <p className="opacity-80">{channelError}</p>
                                    <a href={BOT_INVITE_URL + `&guild_id=${guildId}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 px-3 py-1.5 text-xs font-bold text-black bg-gradient-to-r from-nexus-accent-primary to-nexus-accent-glow rounded-md hover:scale-105 transition-transform">
                                        Re-Invite Flamey
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <ToggleSwitch 
                                        label="Enable Auto-Response"
                                        enabled={config.autoChannelEnabled}
                                        onChange={(enabled) => setConfig(prev => ({ ...prev, autoChannelEnabled: enabled }))}
                                        disabled={!!channelError || channels.length === 0}
                                    />
                                    <div className={`relative transition-opacity duration-300 ${config.autoChannelEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`} ref={dropdownRef}>
                                        <button 
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                                            disabled={!!channelError || channels.length === 0} 
                                            className={`${formInputStyles} flex items-center justify-between text-left`}
                                        >
                                            <span className={selectedChannel ? 'text-nexus-primary-text' : 'text-nexus-secondary-text/70'}>
                                                {selectedChannel ? `# ${selectedChannel.name}` : 'Select a channel'}
                                            </span>
                                            <ChevronDownIcon className={`h-5 w-5 text-nexus-secondary-text transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isDropdownOpen && (
                                            <div className="absolute top-full mt-2 w-full bg-nexus-overlay border border-white/10 rounded-lg shadow-2xl p-2 z-10 animate-fade-in-up">
                                                <input 
                                                    type="text" 
                                                    placeholder="Search channels..." 
                                                    value={channelSearch}
                                                    onChange={(e) => setChannelSearch(e.target.value)}
                                                    className="w-full bg-nexus-surface border-2 border-transparent rounded-md px-3 py-2 text-sm focus:ring-0 focus:border-nexus-accent-primary transition-colors mb-2"
                                                />
                                                <ul className="max-h-48 overflow-y-auto space-y-1 pr-1 server-list">
                                                    <style>{`.server-list::-webkit-scrollbar { width: 6px; } .server-list::-webkit-scrollbar-track { background: transparent; } .server-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }`}</style>
                                                    <li key="none">
                                                        <button 
                                                            onClick={() => { setConfig(prev => ({...prev, autoChannel: null})); setIsDropdownOpen(false); setChannelSearch('') }}
                                                            className="w-full text-left px-3 py-2 rounded-md text-nexus-secondary-text hover:bg-white/5 hover:text-nexus-primary-text transition-colors"
                                                        >
                                                            None
                                                        </button>
                                                    </li>
                                                    {filteredChannels.map(channel => (
                                                        <li key={channel.id}>
                                                            <button 
                                                                onClick={() => { setConfig(prev => ({...prev, autoChannel: channel.id})); setIsDropdownOpen(false); setChannelSearch('') }}
                                                                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${config.autoChannel === channel.id ? 'bg-nexus-accent-primary/10 text-nexus-accent-glow font-medium' : 'hover:bg-white/5 hover:text-nexus-primary-text'}`}
                                                            >
                                                                # {channel.name}
                                                            </button>
                                                        </li>
                                                    ))}
                                                    {filteredChannels.length === 0 && channelSearch && (
                                                        <li className="text-center text-sm text-nexus-secondary-text py-2">No channels found.</li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            <div>
                 <h3 className="text-xl font-semibold text-nexus-primary-text mb-4">How Flamey's AI Works</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <HowItWorksItem icon={<AtSignIcon className="h-5 w-5 text-nexus-accent-glow" />} title="Direct Mentions">
                        In any channel, users can chat with Flamey by directly mentioning it (e.g., <code className="bg-black/30 px-1 py-0.5 rounded text-xs">@Flamey</code>).
                    </HowItWorksItem>
                     <HowItWorksItem icon={<MessageSquareIcon className="h-5 w-5 text-nexus-accent-glow" />} title="Auto-Response Channel">
                        In the selected auto-response channel, Flamey will reply to every single message, creating a continuous chat experience.
                    </HowItWorksItem>
                     <HowItWorksItem icon={<SparklesIcon className="h-5 w-5 text-nexus-accent-glow" />} title="Custom Persona">
                        Flamey will adopt the personality you define in the persona settings, making its responses unique to your server.
                    </HowItWorksItem>
                     <HowItWorksItem icon={<BookOpenIcon className="h-5 w-5 text-nexus-accent-glow" />} title="Conversation Memory">
                        The AI remembers the last few messages in a conversation, allowing for more natural, context-aware follow-up questions and replies.
                    </HowItWorksItem>
                 </div>
            </div>
            
            {status === 'success' && <p className="text-nexus-success text-sm mt-4 text-center">Settings saved successfully!</p>}
            {status === 'error' && <p className="text-nexus-danger text-sm mt-4 text-center">{error}</p>}

            <SaveBar isVisible={!isUnchanged} onSave={handleSave} onReset={() => setConfig(initialConfig)} isSaving={status === 'saving'} />
        </div>
    );
};


const PlaceholderContent: React.FC<{title: string}> = ({title}) => (
     <div className="animate-fade-in-up">
        <Title>{title}</Title>
        <Card className="p-8">
            <p className="text-nexus-secondary-text text-center">Configuration for {title} will be available here soon.</p>
        </Card>
    </div>
)

const componentMap: Record<Feature, React.ComponentType<{server: DiscordGuild}>> = {
    dashboard_home: DashboardHome,
    general_settings: GeneralSettings,
    commands: () => <PlaceholderContent title="Commands" />,
    messages: (props) => <MessagesContent {...props} />,
    custom_branding: () => <PlaceholderContent title="Custom Branding" />,
    ticket_system: () => <PlaceholderContent title="Ticket System" />,
    auto_moderation: () => <PlaceholderContent title="Auto Moderation"/>,
    giveaways: () => <PlaceholderContent title="Giveaways"/>,
    giveaways_claimtime: () => <PlaceholderContent title="Giveaway Claim Time" />,
    logging: () => <PlaceholderContent title="Logging"/>,
    ai_chatbot: AIChatbotContent,
    leveling: () => <PlaceholderContent title="Leveling" />,
};

interface DashboardContentProps {
  feature: Feature;
  server: DiscordGuild;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ feature, server }) => {
  const ContentComponent = componentMap[feature] || DashboardHome;
  return <ContentComponent server={server} />;
};

export default DashboardContent;