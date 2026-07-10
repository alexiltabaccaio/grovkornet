export const grovkornetTheme = {
  name: 'grovkornet',
  type: 'dark',
  colors: {
    'editor.background': '#00000000',
    'editor.foreground': '#f8f9fa',
  },
  tokenColors: [
    {
      scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control', 'keyword.operator.new', 'keyword.operator.expression'],
      settings: { foreground: '#ff5722', fontStyle: 'bold' }
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call', 'meta.function-call.method'],
      settings: { foreground: '#ff8b38' }
    },
    {
      scope: ['string', 'string.quoted', 'punctuation.definition.string'],
      settings: { foreground: '#ffb74d' }
    },
    {
      scope: ['constant.numeric'],
      settings: { foreground: '#ff7043' }
    },
    {
      scope: ['constant.language', 'variable.language'],
      settings: { foreground: '#ff5722' }
    },
    {
      scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'],
      settings: { foreground: '#ffcc80' }
    },
    {
      scope: ['variable', 'parameter', 'entity.name.variable', 'variable.other.property', 'meta.object-literal.key'],
      settings: { foreground: '#f8f9fa' }
    },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#6c757d', fontStyle: 'italic' }
    },
    {
      scope: ['keyword.operator', 'punctuation', 'meta.brace'],
      settings: { foreground: '#adb5bd' }
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
