export type ResponsiveMode = 'desktop' | 'tablet' | 'mobile'

export interface EditorNode {
  id: string
  type: string
  tag: string
  className: string
  styles?: Record<string, string>
  props?: Record<string, string>
  content?: string
  children?: EditorNode[]
}

export interface ComponentBlock {
  id: string
  label: string
  category: string
  icon: string
  preview?: string
  template: EditorNode
}

export interface HistoryEntry {
  nodes: EditorNode[]
  timestamp: number
}

export type EditorTool = 'select' | 'hand' | 'text'

export interface DragItem {
  type: 'BLOCK' | 'NODE'
  blockId?: string
  nodeId?: string
  template?: EditorNode
}
