'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string

  const { data: userData, error: authError } = await supabase.auth.getUser()
  if (authError || !userData?.user) {
    redirect('/login')
  }

  // Find user's organization (assume they have one for now, or create default)
  let { data: orgs } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userData.user.id)
    .limit(1)
    
  let orgId = orgs?.[0]?.organization_id

  if (!orgId) {
    // Create default organization
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: 'Default Organization', slug: `org-${userData.user.id.substring(0, 8)}` })
      .select()
      .single()
      
    if (orgError) throw new Error(orgError.message)
    orgId = newOrg.id
    
    await supabase.from('organization_members').insert({
      organization_id: orgId,
      user_id: userData.user.id,
      role: 'owner'
    })
  }

  // Create the project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      organization_id: orgId,
      name,
      slug,
      status: 'active'
    })
    .select()
    .single()

  if (projectError) {
    console.error('Error creating project:', projectError)
    throw new Error('Could not create project')
  }

  // Add user as project owner/admin
  await supabase.from('project_members').insert({
    project_id: project.id,
    user_id: userData.user.id,
    role: 'admin'
  })

  revalidatePath('/projects')
  redirect('/projects')
}
