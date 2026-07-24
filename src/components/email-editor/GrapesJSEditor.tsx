'use client'

import { useEffect, useRef, useState } from 'react'
import grapesjs, { Editor } from 'grapesjs'
import grapesJSMJML from 'grapesjs-mjml'
import 'grapesjs/dist/css/grapes.min.css'
import { Button } from '../ui/button'

interface GrapesJSEditorProps {
  initialContent?: string
  onSave: (html: string, json: any) => void
}

export default function GrapesJSEditor({ initialContent, onSave }: GrapesJSEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    const editor = grapesjs.init({
      container: editorRef.current,
      fromElement: false,
      height: 'calc(100vh - 140px)',
      width: 'auto',
      storageManager: false,
      plugins: [grapesJSMJML],
      pluginsOpts: {
        [grapesJSMJML as any]: {
          resetCss: false,
        }
      },
      blockManager: {
        appendTo: '#blocks',
      },
      panels: {
        defaults: [
          {
            id: 'panel-top',
            el: '.panel__top',
          },
          {
            id: 'panel-devices',
            el: '.panel__devices',
            buttons: [
              {
                id: 'device-desktop',
                label: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"/></svg>',
                command: 'set-device-desktop',
                active: true,
                togglable: false,
              },
              {
                id: 'device-mobile',
                label: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z"/></svg>',
                command: 'set-device-mobile',
                togglable: false,
              },
            ],
          },
        ],
      },
      deviceManager: {
        devices: [
          { id: 'desktop', name: 'Desktop', width: '' },
          { id: 'mobile', name: 'Mobile', width: '320px', widthMedia: '480px' },
        ],
      },
    })

    editor.Commands.add('set-device-desktop', {
      run: (editor) => editor.setDevice('desktop'),
    })
    editor.Commands.add('set-device-mobile', {
      run: (editor) => editor.setDevice('mobile'),
    })

    if (initialContent) {
      editor.setComponents(initialContent)
    } else {
      editor.setComponents('<mjml><mj-body><mj-section><mj-column><mj-text>Bắt đầu thiết kế email của bạn</mj-text></mj-column></mj-section></mj-body></mjml>')
    }

    setEditorInstance(editor)

    return () => {
      editor.destroy()
    }
  }, [initialContent])

  const handleSave = () => {
    if (editorInstance) {
      // Export HTML using MJML plugin
      const html = editorInstance.runCommand('mjml-get-code')
      const json = editorInstance.getProjectData()
      onSave(html.html, json)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border rounded-lg overflow-hidden">
      <div className="panel__top flex justify-between items-center bg-slate-100 dark:bg-slate-800 border-b p-2">
        <div className="panel__devices flex gap-1"></div>
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm">Lưu thiết kế</Button>
        </div>
      </div>
      <div className="flex flex-1 h-[calc(100vh-200px)]">
        <div id="blocks" className="w-64 border-r bg-slate-50 dark:bg-slate-900 overflow-y-auto"></div>
        <div className="flex-1 overflow-hidden" ref={editorRef}></div>
      </div>
    </div>
  )
}
