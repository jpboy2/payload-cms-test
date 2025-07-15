'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { $isRangeSelection, $getSelection, COMMAND_PRIORITY_NORMAL } from 'lexical'
import React from 'react'

import { MarkNode, $isMarkNode } from './MarkNode'
import MarkPlugin, { TOGGLE_MARK_COMMAND } from './MarkPlugin'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHighlighter } from '@fortawesome/free-solid-svg-icons'



export const MarkFeatureClient = createClientFeature(
    {
        plugins: [
            {
                Component: MarkPlugin,
                position: 'normal',
            },
        ],
        nodes: [MarkNode],
        toolbarInline: {
            groups: [
                {
                    key: 'mark',
                    order: 20,
                    type: 'buttons',
                    items: [
                        {
                            key: 'mark',
                            label: 'Mark',
                       
                            ChildComponent: () => {
                                return (
                                    <FontAwesomeIcon icon={faHighlighter} />
                                )
                            },
                            isActive: ({ editor }: any) => {
                                const editorState = editor.getEditorState()
                                let isActive = false

                                editorState.read(() => {
                                    const selection = $getSelection()
                                    if ($isRangeSelection(selection)) {
                                        const nodes = selection.getNodes()
                                        isActive = nodes.some((node) => {
                                            if ($isMarkNode(node)) return true
                                            if (node.getParent && $isMarkNode(node.getParent())) return true
                                            return false
                                        })
                                    }
                                })

                                return isActive
                            },
                            isEnabled: ({ selection }: any) => {
                                if (!selection || !$isRangeSelection(selection)) {
                                    return false
                                }
                                return !selection.isCollapsed()
                            },
                        },
                    ],
                },
            ],
        },
    })