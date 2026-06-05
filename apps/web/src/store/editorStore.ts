import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { WritableDraft } from 'immer'
import type { EditorNode, ResponsiveMode, EditorTool } from '@/types/editor'
import { nanoid } from 'nanoid'

const MAX_HISTORY = 50

interface EditorState {
  nodes: EditorNode[]
  selectedId: string | null
  hoveredId: string | null
  responsiveMode: ResponsiveMode
  activeTool: EditorTool
  clipboard: EditorNode | null
  showGrid: boolean
  showOutlines: boolean
  history: EditorNode[][]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean

  // Node operations
  addNode: (node: EditorNode, parentId?: string, index?: number) => void
  removeNode: (id: string) => void
  updateNode: (id: string, patch: Partial<EditorNode>) => void
  duplicateNode: (id: string) => void
  reorderNodes: (activeId: string, overId: string) => void

  // Selection
  selectNode: (id: string | null) => void
  hoverNode: (id: string | null) => void

  // UI state
  setResponsiveMode: (mode: ResponsiveMode) => void
  setActiveTool: (tool: EditorTool) => void
  setShowGrid: (v: boolean) => void
  setShowOutlines: (v: boolean) => void

  // Clipboard
  copyNode: (id: string) => void
  pasteNode: (parentId?: string) => void

  // Class helpers
  addClassName: (id: string, cls: string) => void
  removeClassName: (id: string, cls: string) => void
  setClassName: (id: string, cls: string) => void

  // History
  undo: () => void
  redo: () => void
  saveHistory: () => void

  // Canvas ops
  clearCanvas: () => void
  wrapInRow: (existingId: string, newNode: EditorNode, position: 'before' | 'after') => void

  // Helpers
  findNode: (id: string) => EditorNode | null

  // Block picker
  blockPickerOpen: boolean
  setBlockPickerOpen: (open: boolean) => void

  // Template picker
  showTemplatePicker: boolean
  setShowTemplatePicker: (v: boolean) => void

  // Pending nodes to load on next editor mount (set from Themes Hub)
  pendingNodes: EditorNode[] | null
  setPendingNodes: (nodes: EditorNode[] | null) => void
}

function findNodeById(nodes: EditorNode[], id: string): EditorNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

function findParentNode(nodes: EditorNode[], id: string): EditorNode | null {
  for (const node of nodes) {
    if (node.children?.some((c) => c.id === id)) return node
    if (node.children) {
      const found = findParentNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

function removeNodeById(nodes: EditorNode[], id: string): EditorNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({
      ...n,
      children: n.children ? removeNodeById(n.children, id) : undefined,
    }))
}

function deepCloneWithNewIds(node: EditorNode): EditorNode {
  return {
    ...node,
    id: nanoid(8),
    children: node.children?.map(deepCloneWithNewIds),
  }
}

// Called INSIDE a set() callback AFTER nodes have been mutated.
// Pushes a snapshot of the new nodes onto the history stack.
function pushHistory(state: WritableDraft<EditorState>) {
  const snapshot = JSON.parse(JSON.stringify(state.nodes)) as EditorNode[]
  const trimmed = (state.history as EditorNode[][]).slice(0, state.historyIndex + 1)
  trimmed.push(snapshot)
  if (trimmed.length > MAX_HISTORY) trimmed.shift()
  state.history = trimmed as typeof state.history
  state.historyIndex = trimmed.length - 1
  state.canUndo = state.historyIndex > 0
  state.canRedo = false
}

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    nodes: [],
    selectedId: null,
    hoveredId: null,
    responsiveMode: 'desktop',
    activeTool: 'select',
    clipboard: null,
    showGrid: false,
    showOutlines: true,
    blockPickerOpen: false,
    showTemplatePicker: false,
    pendingNodes: null,
    // history[historyIndex] always reflects the current canvas state
    history: [[]],
    historyIndex: 0,
    canUndo: false,
    canRedo: false,

    // Public saveHistory kept for interface compatibility — saves current state
    saveHistory: () => {
      set((state) => { pushHistory(state) })
    },

    undo: () => {
      set((state) => {
        if (state.historyIndex <= 0) return
        state.historyIndex -= 1
        state.nodes = JSON.parse(JSON.stringify(state.history[state.historyIndex]))
        state.canUndo = state.historyIndex > 0
        state.canRedo = true
        state.selectedId = null
      })
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex >= state.history.length - 1) return
        state.historyIndex += 1
        state.nodes = JSON.parse(JSON.stringify(state.history[state.historyIndex]))
        state.canUndo = true
        state.canRedo = state.historyIndex < state.history.length - 1
        state.selectedId = null
      })
    },

    addNode: (node, parentId, index) => {
      set((state) => {
        if (!parentId) {
          if (index !== undefined) {
            state.nodes.splice(index, 0, node)
          } else {
            state.nodes.push(node)
          }
        } else {
          const parent = findNodeById(state.nodes as EditorNode[], parentId)
          if (parent) {
            if (!parent.children) parent.children = []
            if (index !== undefined) {
              parent.children.splice(index, 0, node)
            } else {
              parent.children.push(node)
            }
          }
        }
        state.selectedId = node.id
        pushHistory(state)
      })
    },

    removeNode: (id) => {
      set((state) => {
        state.nodes = removeNodeById(state.nodes as EditorNode[], id) as typeof state.nodes
        if (state.selectedId === id) state.selectedId = null
        if (state.hoveredId === id) state.hoveredId = null
        pushHistory(state)
      })
    },

    updateNode: (id, patch) => {
      set((state) => {
        const node = findNodeById(state.nodes as EditorNode[], id)
        if (node) Object.assign(node, patch)
      })
    },

    duplicateNode: (id) => {
      set((state) => {
        const node = findNodeById(state.nodes as EditorNode[], id)
        if (!node) return
        const clone = deepCloneWithNewIds(node)
        const parent = findParentNode(state.nodes as EditorNode[], id)
        if (parent && parent.children) {
          const idx = parent.children.findIndex((c) => c.id === id)
          parent.children.splice(idx + 1, 0, clone)
        } else {
          const idx = state.nodes.findIndex((n) => n.id === id)
          state.nodes.splice(idx + 1, 0, clone)
        }
        state.selectedId = clone.id
        pushHistory(state)
      })
    },

    reorderNodes: (activeId, overId) => {
      set((state) => {
        const activeIdx = state.nodes.findIndex((n) => n.id === activeId)
        const overIdx = state.nodes.findIndex((n) => n.id === overId)
        if (activeIdx === -1 || overIdx === -1) return
        const [removed] = state.nodes.splice(activeIdx, 1)
        state.nodes.splice(overIdx, 0, removed)
        pushHistory(state)
      })
    },

    selectNode: (id) => set((state) => { state.selectedId = id }),
    hoverNode: (id) => set((state) => { state.hoveredId = id }),

    setResponsiveMode: (mode) => set((state) => { state.responsiveMode = mode }),
    setActiveTool: (tool) => set((state) => { state.activeTool = tool }),
    setShowGrid: (v) => set((state) => { state.showGrid = v }),
    setShowOutlines: (v) => set((state) => { state.showOutlines = v }),

    copyNode: (id) => {
      const node = get().findNode(id)
      if (node) set((state) => { state.clipboard = JSON.parse(JSON.stringify(node)) })
    },

    pasteNode: (parentId) => {
      const { clipboard } = get()
      if (!clipboard) return
      const clone = deepCloneWithNewIds(clipboard)
      get().addNode(clone, parentId)
    },

    addClassName: (id, cls) => {
      set((state) => {
        const node = findNodeById(state.nodes as EditorNode[], id)
        if (!node) return
        const classes = node.className.split(' ').filter(Boolean)
        if (!classes.includes(cls)) {
          node.className = [...classes, cls].join(' ')
        }
      })
    },

    removeClassName: (id, cls) => {
      set((state) => {
        const node = findNodeById(state.nodes as EditorNode[], id)
        if (!node) return
        node.className = node.className.split(' ').filter((c) => c !== cls).join(' ')
      })
    },

    setClassName: (id, cls) => {
      set((state) => {
        const node = findNodeById(state.nodes as EditorNode[], id)
        if (node) node.className = cls
      })
    },

    clearCanvas: () => {
      set((state) => {
        state.nodes = []
        state.selectedId = null
        state.hoveredId = null
        pushHistory(state)
      })
    },

    wrapInRow: (existingId, newNode, position) => {
      set((state) => {
        const idx = state.nodes.findIndex((n) => n.id === existingId)
        if (idx === -1) return
        const existingNode = JSON.parse(JSON.stringify(state.nodes[idx])) as EditorNode
        const rowNode: EditorNode = {
          id: nanoid(8),
          type: 'Row',
          tag: 'div',
          className: 'flex flex-row gap-4 items-start w-full',
          children: position === 'before'
            ? [newNode, existingNode]
            : [existingNode, newNode],
        }
        state.nodes[idx] = rowNode as typeof state.nodes[0]
        state.selectedId = newNode.id
        pushHistory(state)
      })
    },

    findNode: (id) => findNodeById(get().nodes, id),

    setBlockPickerOpen: (open) => set((state) => { state.blockPickerOpen = open }),
    setShowTemplatePicker: (v) => set((state) => { state.showTemplatePicker = v }),
    setPendingNodes: (nodes) => set((state) => { state.pendingNodes = nodes }),
  }))
)
