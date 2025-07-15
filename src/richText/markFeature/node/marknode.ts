import {
    $applyNodeReplacement,
    $getSelection,
    $isRangeSelection,
    DOMConversionMap,
    DOMConversionOutput,
    EditorConfig,
    ElementFormatType,
    LexicalNode,
    NodeKey,
    RangeSelection,
    SerializedTextNode,
    Spread,
    TextNode,
    DOMExportOutput
} from 'lexical'

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
        element.textContent = this.__text
        return element
    }

    updateDOM(prevNode: MarkNode, dom: HTMLElement, config: EditorConfig): boolean {
        if (prevNode.__text !== this.__text) {
            dom.textContent = this.__text
        }
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
        element.textContent = this.__text
        return { element }
    }

    static importJSON(serializedNode: SerializedMarkNode): MarkNode {
        const { text } = serializedNode
        const node = $createMarkNode(text)
        return node
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

export function $isMarkNode(node: LexicalNode | null | undefined): node is MarkNode {
    return node instanceof MarkNode
}

function $convertMarkElement(): DOMConversionOutput {
    return { node: $createMarkNode('') }
}