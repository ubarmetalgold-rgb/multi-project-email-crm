import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1'

// This function receives webhooks from email providers (e.g. Resend, Brevo)
serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // 1. Verify webhook signature (Implementation depends on provider)
    // const signature = req.headers.get('svix-signature');
    // if (!verifySignature(signature)) throw new Error('Unauthorized');

    const payload = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Example payload mapping for Resend:
    // { type: 'email.opened', data: { email_id: '123' } }
    
    let eventType = '';
    let providerMessageId = '';

    // Mock parsing
    if (payload.type === 'email.opened') {
      eventType = 'open';
      providerMessageId = payload.data.email_id;
    } else if (payload.type === 'email.bounced') {
      eventType = 'bounce';
      providerMessageId = payload.data.email_id;
    } else if (payload.type === 'email.complained') {
      eventType = 'spam_complaint';
      providerMessageId = payload.data.email_id;
    } else {
      // Ignore unsupported events
      return new Response('OK', { status: 200 })
    }

    // 2. Find the campaign_recipient_id from provider_message_id
    const { data: recipient, error: findError } = await supabaseClient
      .from('campaign_recipients')
      .select('id, contact_id')
      .eq('provider_message_id', providerMessageId)
      .single()

    if (findError || !recipient) {
      console.warn(`Recipient not found for message_id: ${providerMessageId}`)
      return new Response('OK', { status: 200 })
    }

    // 3. Insert email event
    await supabaseClient
      .from('email_events')
      .insert({
        campaign_recipient_id: recipient.id,
        event_type: eventType,
        ip_address: payload.data?.ip_address,
        user_agent: payload.data?.user_agent,
      })

    // 4. Update contact status if it's a bounce or complaint
    if (eventType === 'bounce') {
      await supabaseClient
        .from('campaign_recipients')
        .update({ status: 'bounced' })
        .eq('id', recipient.id)
        
      await supabaseClient
        .from('contacts')
        .update({ global_status: 'hard_bounced' })
        .eq('id', recipient.contact_id)
    }

    if (eventType === 'spam_complaint') {
      await supabaseClient
        .from('campaign_recipients')
        .update({ status: 'complained' })
        .eq('id', recipient.id)
        
      await supabaseClient
        .from('contacts')
        .update({ global_status: 'complained' })
        .eq('id', recipient.contact_id)
    }

    return new Response('OK', { status: 200 })

  } catch (error: unknown) {
    console.error('Webhook Error:', error)
    const errMessage = error instanceof Error ? error.message : String(error)
    return new Response(errMessage, { status: 500 })
  }
})
