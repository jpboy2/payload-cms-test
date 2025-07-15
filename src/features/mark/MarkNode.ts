

import {
    $applyNodeReplacement,
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedTextNode,
    Spread,
    TextNode,
} from '@payloadcms/richtext-lexical/lexical'

export type SerializedMarkNode = Spread<
    {
        type: 'mark'
        version: 1
    },
    SerializedTextNode
>

export class MarkNode extends TextNode {
    static getType(): string {
        return 'mark'
    }

    static clone(node: MarkNode): MarkNode {
        return new MarkNode(node.__text, node.__key)
    }

    constructor(text: string, key?: NodeKey) {
        super(text, key)
    }

    createDOM(config: EditorConfig): HTMLElement {
        const element = document.createElement('mark')
        element.className = 'payload-mark'
        return element
    }

    updateDOM(
        prevNode: MarkNode,
        dom: HTMLElement,
        config: EditorConfig,
    ): boolean {
        // Return false to indicate that Lexical should handle the update
        return false
    }

    static importDOM(): DOMConversionMap | null {
        return {
            mark: () => ({
                conversion: $convertMarkElement,
                priority: 0,
            }),
        }
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('mark')
        return { element }
    }

    static importJSON(serializedNode: SerializedMarkNode): MarkNode {
        const { text } = serializedNode
        return $createMarkNode(text)
    }

    exportJSON(): SerializedMarkNode {
        return {
            ...super.exportJSON(),
            type: 'mark',
            version: 1,
        }
    }
}

export function $createMarkNode(text: string): MarkNode {
    return $applyNodeReplacement(new MarkNode(text))
}

export function $isMarkNode(
    node: LexicalNode | null | undefined,
): node is MarkNode {
    return node instanceof MarkNode
}

function $convertMarkElement(): DOMConversionOutput {
    return { node: $createMarkNode('') }
}