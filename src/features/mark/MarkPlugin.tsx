'use client'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $getNearestNodeOfType, mergeRegister } from '@payloadcms/richtext-lexical/lexical/utils'
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  LexicalCommand,
  RangeSelection,
  TextNode,
  createCommand,
} from '@payloadcms/richtext-lexical/lexical'
import { useEffect } from 'react'

import { $createMarkNode, $isMarkNode, MarkNode } from './MarkNode'

export const TOGGLE_MARK_COMMAND: LexicalCommand<void> = createCommand(
  'TOGGLE_MARK_COMMAND',
)

export default function MarkPlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([MarkNode])) {
      throw new Error('MarkPlugin: MarkNode not registered on editor')
    }

    return mergeRegister(
      editor.registerCommand(
        TOGGLE_MARK_COMMAND,
        () => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              $toggleMark(selection)
            }
          })
          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor])

  return null
}

function $toggleMark(selection: RangeSelection): void {
  const nodes = selection.getNodes()
  const isBackward = selection.isBackward()
  
  // Check if any node in selection is marked
  const hasMarkNode = nodes.some((node) => {
    if ($isMarkNode(node)) return true
    if ($isTextNode(node)) {
      const parent = node.getParent()
      return $isMarkNode(parent)
    }
    return false
  })

  if (hasMarkNode) {
    // Remove mark from nodes
    nodes.forEach((node) => {
      if ($isMarkNode(node)) {
        const textNode = $createTextNode(node.getTextContent())
        textNode.setFormat(node.getFormat())
        node.replace(textNode)
      }
    })
  } else {
    // Add mark to selection
    if (nodes.length === 1 && $isTextNode(nodes[0])) {
      // Single text node - handle partial selection
      const node = nodes[0]
      const text = node.getTextContent()
      const startOffset = isBackward
        ? selection.focus.offset
        : selection.anchor.offset
      const endOffset = isBackward
        ? selection.anchor.offset
        : selection.focus.offset

      if (startOffset === 0 && endOffset === text.length) {
        // Full node selected
        const markNode = $createMarkNode(text)
        markNode.setFormat(node.getFormat())
        node.replace(markNode)
      } else {
        // Partial selection
        const beforeText = text.slice(0, startOffset)
        const selectedText = text.slice(startOffset, endOffset)
        const afterText = text.slice(endOffset)

        const newNodes: TextNode[] = []
        if (beforeText) {
          newNodes.push($createTextNode(beforeText))
        }
        if (selectedText) {
          const markNode = $createMarkNode(selectedText)
          markNode.setFormat(node.getFormat())
          newNodes.push(markNode)
        }
        if (afterText) {
          newNodes.push($createTextNode(afterText))
        }

        const firstNode = newNodes[0]
        node.replace(firstNode)
        
        let currentNode = firstNode
        for (let i = 1; i < newNodes.length; i++) {
          currentNode.insertAfter(newNodes[i])
          currentNode = newNodes[i]
        }
      }
    } else {
      // Multiple nodes or complex selection
      const textContent = selection.getTextContent()
      const markNode = $createMarkNode(textContent)
      selection.insertNodes([markNode])
    }
  }
}