import { createServerFeature } from '@payloadcms/richtext-lexical'
import type { SerializedMarkNode } from './MarkNode'

export const MarkFeature = createServerFeature({
    key: 'mark',
    feature: {
        ClientFeature: './index.tsx#MarkFeatureClient',
    },

}
)