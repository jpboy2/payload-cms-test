import React from 'react'
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, SELECTION_CHANGE_COMMAND } from 'lexical'
import { $isMarkNode } from './node/marknode'
import { TOGGLE_MARK_COMMAND } from './markfeature'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHighlighter } from '@fortawesome/free-solid-svg-icons'
import { mergeRegister } from '@lexical/utils'

export function MarkToolbarButton() {
  const [editor] = useLexicalComposerContext()
  const [isActive, setIsActive] = React.useState(false)

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const nodes = selection.getNodes()
      setIsActive(nodes.some(node => $isMarkNode(node)))
    }
  }, [])

  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor, updateToolbar])

  const handleClick = () => {
    editor.dispatchCommand(TOGGLE_MARK_COMMAND, undefined)
  }

  return (
    <button
      onClick={handleClick}
      className={`toolbar-button ${isActive ? 'active' : ''}`}
      aria-label="Highlight"
      type="button"
    >
      <FontAwesomeIcon icon={faHighlighter} />
    </button>
  )
}