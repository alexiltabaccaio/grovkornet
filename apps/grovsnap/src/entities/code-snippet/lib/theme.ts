export const grovkornetTheme = {
  name: 'grovkornet',
  type: 'dark',
  colors: {
    'editor.background': '#00000000',
    'editor.foreground': '#ffffff',
  },
  tokenColors: [
    {
      scope: ['keyword', 'modifier', 'storage.type', 'storage.modifier', 'keyword.control'],
      settings: { foreground: '#ff5722', fontStyle: 'bold' }
    },
    {
      scope: ['string', 'string.quoted'],
      settings: { foreground: '#d1d5db' }
    },
    {
      scope: ['entity.name.function', 'support.function', 'entity.name.class'],
      settings: { foreground: '#ff8b38' }
    },
    {
      scope: ['variable', 'parameter', 'entity.name.variable'],
      settings: { foreground: '#f3f4f6' }
    },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#9ca3af', fontStyle: 'italic' }
    },
    {
      scope: ['constant', 'entity.name.type', 'support.type', 'entity.name.namespace'],
      settings: { foreground: '#ffffff', fontStyle: 'bold' }
    },
    {
      scope: ['punctuation', 'meta.brace'],
      settings: { foreground: '#9ca3af' }
    },
    {
      scope: ['entity.name.tag'],
      settings: { foreground: '#ff5722' }
    },
    {
      scope: ['entity.other.attribute-name'],
      settings: { foreground: '#ff8b38' }
    }
  ]
};
