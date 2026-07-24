import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // TODO: Read from pgmq via RPC or custom Postgres function.
    // In a real pg_cron/pgmq setup, the cron triggers this Edge Function (via HTTP)
    // and this function connects to Postgres, pops a message from `contact_import` queue,
    // and processes it.
    
    // 1. Pop message from queue
    const { data: queueMsg, error: qError } = await supabaseClient
      .rpc('pop_import_queue')

    if (qError || !queueMsg) {
      return new Response(JSON.stringify({ message: "No jobs in queue" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const { job_id, file_path } = queueMsg;

    // 2. Download file from Storage
    const { data: fileData, error: fileError } = await supabaseClient
      .storage
      .from('crm-imports')
      .download(file_path)

    if (fileError || !fileData) {
      throw new Error(`Failed to download file ${file_path}`)
    }

    // 3. Process CSV (simplified logic)
    const text = await fileData.text()
    const lines = text.split('\n')
    // ... parse CSV, sanitize, remove duplicates ...

    // 4. Batch insert into database
    // ...

    // 5. Update job status
    await supabaseClient
      .from('import_jobs')
      .update({ status: 'completed', processed_rows: lines.length })
      .eq('id', job_id)

    return new Response(JSON.stringify({ success: true, processed: lines.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: unknown) {
    console.error('Import Worker Error:', error)
    const errMessage = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: errMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
