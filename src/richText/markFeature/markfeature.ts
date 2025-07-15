import React, { useCallback } from 'react'
import { $createMarkNode, $isMarkNode, MarkNode } from './node/marknode'
import {
    $getSelection,
    $isRangeSelection,
    $isTextNode,
    COMMAND_PRIORITY_LOW,
    FORMAT_TEXT_COMMAND,
    LexicalCommand,
    createCommand,
    $createTextNode,
    RangeSelection,
} from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $patchStyleText } from '@lexical/selection'
import { mergeRegister } from '@lexical/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHighlighter } from '@fortawesome/free-solid-svg-icons'

export const TOGGLE_MARK_COMMAND: LexicalCommand<void> = createCommand('TOGGLE_MARK_COMMAND')

export function MarkFeature() {
    const [editor] = useLexicalComposerContext()

    React.useEffect(() => {
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
    const isMarked = nodes.some(node => $isMarkNode(node))

    if (isMarked) {
        // Unwrap marked nodes
        nodes.forEach(node => {
            if ($isMarkNode(node)) {
                const textNode = $createTextNode(node.getTextContent())
                textNode.setFormat(node.getFormat())
                textNode.setDetail(node.getDetail())
                textNode.setMode(node.getMode())
                textNode.setStyle(node.getStyle())
                node.replace(textNode)
            }
        })
    } else {
        // Wrap text nodes in mark nodes
        if (selection.isCollapsed()) {
            return
        }

        const selectedText = selection.getTextContent()
        const markNode = $createMarkNode(selectedText)

        selection.insertNodes([markNode])
    }
}