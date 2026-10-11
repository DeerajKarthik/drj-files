// Shiki setup: two hand-tuned themes (all token colours meet WCAG AA on the code
// cell background) plus a transformer that reads `title="..."` from the fence meta.

/** @param {string} name @param {'light'|'dark'} type @param {Record<string,string>} c */
const theme = (name, type, c) => ({
  name,
  type,
  colors: { 'editor.foreground': c.fg, 'editor.background': c.bg },
  tokenColors: [
    { settings: { foreground: c.fg } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.comment, fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'keyword.control', 'keyword.operator.new', 'keyword.operator.expression'], settings: { foreground: c.keyword } },
    { scope: ['string', 'string.quoted', 'punctuation.definition.string'], settings: { foreground: c.string } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character'], settings: { foreground: c.number } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: c.fn } },
    { scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'], settings: { foreground: c.type } },
    { scope: ['variable.parameter', 'variable.other.property'], settings: { foreground: c.fg } },
    { scope: ['keyword.operator', 'punctuation'], settings: { foreground: c.punct } },
  ],
});

export const shikiThemes = {
  light: theme('notebook-paper', 'light', {
    fg: '#1a1613', bg: '#e6d9b0', comment: '#5a4f44', keyword: '#7a2e0e', string: '#2c5a27',
    number: '#5b2f80', fn: '#1b3d6b', type: '#6a3b00', punct: '#3a322b',
  }),
  dark: theme('notebook-night', 'dark', {
    fg: '#e8dfcc', bg: '#242424', comment: '#a39a8c', keyword: '#f0a860', string: '#a5cf90',
    number: '#d9aae6', fn: '#93b8ea', type: '#e6c27a', punct: '#c9bfae',
  }),
};

/** @type {import('shiki').ShikiTransformer} */
export const titleTransformer = {
  name: 'notebook-title',
  pre(node) {
    const raw = this.options.meta?.__raw ?? '';
    const match = /title=(?:"([^"]*)"|'([^']*)')/.exec(raw);
    if (match) node.properties['data-title'] = match[1] ?? match[2];
    node.properties['data-lang'] = this.options.lang;
  },
};
