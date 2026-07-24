import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // TODO: Read from `email_send` pgmq. 
    // In actual implementation, we read N messages from the queue.
    const { data: queueMsgs, error: qError } = await supabaseClient
      .rpc('pop_email_queue', { batch_size: 50 })

    if (qError || !queueMsgs || queueMsgs.length === 0) {
      return new Response(JSON.stringify({ message: "No emails in queue" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    let processedCount = 0;

    // Process each message
    for (const msg of queueMsgs) {
      const { campaign_recipient_id, email, subject, html_content, sender_email, sender_name } = msg;

      try {
        // Send email via External Provider (e.g., Resend, Brevo)
        // Here we simulate the API call
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          },
          body: JSON.stringify({
            from: `${sender_name} <${sender_email}>`,
            to: email,
            subject: subject,
            html: html_content,
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          // Update status in DB
          await supabaseClient
            .from('campaign_recipients')
            .update({ 
              status: 'sent', 
              provider_message_id: resData.id,
              sent_at: new Date().toISOString()
            })
            .eq('id', campaign_recipient_id)
        } else {
          throw new Error('Provider API Error')
        }

      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        // Mark as failed in DB
        await supabaseClient
          .from('campaign_recipients')
          .update({ 
            status: 'failed', 
            error_message: errorMsg
          })
          .eq('id', campaign_recipient_id)
      }
      processedCount++;
    }

    return new Response(JSON.stringify({ success: true, processed: processedCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: unknown) {
    console.error('Email Worker Error:', error)
    const errMessage = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: errMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
