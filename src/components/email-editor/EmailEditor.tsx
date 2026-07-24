'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '../ui/skeleton'

// Dynamically import GrapesJS component with no SSR to avoid window is not defined error
const GrapesJSEditor = dynamic(
  () => import('./GrapesJSEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] flex flex-col gap-4 p-4 border rounded-lg">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex flex-1 gap-4">
          <Skeleton className="w-64 h-full" />
          <Skeleton className="flex-1 h-full" />
        </div>
      </div>
    )
  }
)

interface EmailEditorProps {
  initialContent?: string
  onSave: (html: string, json: any) => void
}

export default function EmailEditor({ initialContent, onSave }: EmailEditorProps) {
  return <GrapesJSEditor initialContent={initialContent} onSave={onSave} />
}
