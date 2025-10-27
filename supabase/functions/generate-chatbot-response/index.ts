import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// Use the ESM version of the SDK for Deno compatibility
import { GoogleGenAI } from "https://esm.sh/@google/genai@0.24.0";

// Add a type declaration for the Deno global object to resolve TypeScript errors.
// This is safe because 'Deno' is provided by the Supabase Edge Function runtime.
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const { prompt, systemInstruction } = await req.json();
    if (!prompt) {
      throw new Error('Prompt is required in the request body.');
    }

    // Retrieve the Gemini API key from Supabase environment secrets
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in Supabase Edge Function secrets. Please add it in your project settings.');
    }

    // Initialize the GoogleGenAI client
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Generate content using the gemini-2.5-flash model for better persona adherence
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are a friendly and helpful Discord bot.", // Fallback if not provided
        }
    });
    
    const reply = response.text;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in generate-chatbot-response function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
