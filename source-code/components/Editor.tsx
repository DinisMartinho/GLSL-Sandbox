import React, { useRef } from 'react';
import MonacoEditor, { OnMount, BeforeMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

interface EditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  isWordWrapOn: boolean;
}

// This function runs before the editor is mounted.
// We use it to define and register a rich GLSL language configuration.
// This ensures high-quality syntax highlighting is always available.
const handleEditorWillMount: BeforeMount = (monacoInstance) => {
  const langId = 'glsl';

  // Register the GLSL language if it hasn't been already.
  if (monacoInstance.languages.getLanguages().some(lang => lang.id === langId)) {
    return;
  }

  monacoInstance.languages.register({ id: langId });

  // This is a comprehensive GLSL language definition (Monarch tokenizer).
  // It tells the editor how to color keywords, types, comments, etc.
  const glslLanguage = {
    defaultToken: '',
    tokenPostfix: '.glsl',
    keywords: [
      'asm', 'break', 'continue', 'do', 'for', 'while', 'if', 'else', 'switch', 'case', 'default', 'in', 'out', 'inout', 'true', 'false', 'discard', 'return', 'const', 'uniform', 'varying', 'attribute', 'layout', 'centroid', 'flat', 'smooth', 'noperspective', 'patch', 'sample', 'subroutine', 'common', 'partition', 'active', 'filter', 'image1D', 'image2D', 'image3D', 'imageCube', 'image1DArray', 'image2DArray', 'imageCubeArray', 'image2DMS', 'image2DMSArray', 'iimage1D', 'iimage2D', 'iimage3D', 'iimageCube', 'iimage1DArray', 'iimage2DArray', 'iimageCubeArray', 'iimage2DMS', 'iimage2DMSArray', 'uimage1D', 'uimage2D', 'uimage3D', 'uimageCube', 'uimage1DArray', 'uimage2DArray', 'uimageCubeArray', 'uimage2DMS', 'uimage2DMSArray', 'sampler1D', 'sampler2D', 'sampler3D', 'samplerCube', 'sampler1DShadow', 'sampler2DShadow', 'samplerCubeShadow', 'sampler1DArray', 'sampler2DArray', 'sampler1DArrayShadow', 'sampler2DArrayShadow', 'isampler1D', 'isampler2D', 'isampler3D', 'isamplerCube', 'isampler1DArray', 'isampler2DArray', 'usampler1D', 'usampler2D', 'usampler3D', 'usamplerCube', 'usampler1DArray', 'usampler2DArray', 'sampler2DRect', 'sampler2DRectShadow', 'isampler2DRect', 'usampler2DRect', 'samplerBuffer', 'isamplerBuffer', 'usamplerBuffer', 'sampler2DMS', 'isampler2DMS', 'usampler2DMS', 'sampler2DMSArray', 'isampler2DMSArray', 'usampler2DMSArray', 'struct', 'void', 'bool', 'int', 'uint', 'float', 'double', 'vec2', 'vec3', 'vec4', 'ivec2', 'ivec3', 'ivec4', 'bvec2', 'bvec3', 'bvec4', 'uvec2', 'uvec3', 'uvec4', 'dvec2', 'dvec3', 'dvec4', 'mat2', 'mat3', 'mat4', 'mat2x2', 'mat2x3', 'mat2x4', 'mat3x2', 'mat3x3', 'mat3x4', 'mat4x2', 'mat4x3', 'mat4x4', 'dmat2', 'dmat3', 'dmat4', 'dmat2x2', 'dmat2x3', 'dmat2x4', 'dmat3x2', 'dmat3x3', 'dmat3x4', 'dmat4x2', 'dmat4x3', 'dmat4x4', 'atomic_uint'
    ],
    operators: ['=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=', '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%', '<<', '>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=', '%=', '<<=', '>>='],
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    tokenizer: {
      root: [
        [/[a-zA-Z_]\w*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
        // Fix: Inlined content of '@whitespace' to conform to monaco's strict IMonarchLanguage types.
        [/[ \t\r\n]+/, 'white'],
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment'],
        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],
        [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
        [/0[xX][0-9a-fA-F]+/, 'number.hex'],
        [/\d+/, 'number'],
        [/[;,.]/, 'delimiter'],
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
      ],
      comment: [
        [/[^\/*]+/, 'comment'],
        [/\/\*/, 'comment', '@push'],
        // Fix: Changed string literal to a RegExp to satisfy the IMonarchLanguageRule type.
        [/\*\//, 'comment', '@pop'],
        [/[\/*]/, 'comment'],
      ],
      string: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
      ],
      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment'],
      ],
    },
  };
  monacoInstance.languages.setMonarchTokensProvider(langId, glslLanguage as monaco.languages.IMonarchLanguage);
};

const Editor: React.FC<EditorProps> = ({ value, onChange, isWordWrapOn }) => {
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editor.onDidChangeCursorSelection((e) => {
      if (!editor.hasTextFocus()) {
        return;
      }
      
      const model = editor.getModel();
      if (!model) return;

      const selection = e.selection;
      let word: monaco.editor.IWordAtPosition | null = null;
      
      // Highlight only when there's a single cursor or a selection of a single word.
      if (selection.isEmpty() || selection.getStartPosition().equals(selection.getEndPosition())) {
        word = model.getWordAtPosition(selection.getStartPosition());
      } else {
        const selectedText = model.getValueInRange(selection);
        // Only highlight if the selection is a single word without spaces
        if (!/\s/.test(selectedText)) {
          word = { word: selectedText, startColumn: selection.startColumn, endColumn: selection.endColumn };
        }
      }

      if (word && word.word.trim() !== '') {
        const matches = model.findMatches(word.word, true, false, true, null, true);
        const newDecorations = matches.map(match => ({
          range: match.range,
          options: {
            inlineClassName: 'word-highlight'
          }
        }));
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
      } else {
        // If no word is selected, clear existing decorations
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      }
    });

    // Clear highlights when editor loses focus
    editor.onDidBlurEditorText(() => {
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    });
  };

  return (
    <MonacoEditor
      height="100%"
      language="glsl"
      theme="vs-dark"
      value={value}
      onChange={onChange}
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: isWordWrapOn ? 'on' : 'off',
        smoothScrolling: true,
        scrollbar: {
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
        },
        occurrencesHighlight: 'off', // Turn off default
      }}
      loading={<div className="text-white p-4">Loading editor...</div>}
    />
  );
};

export default Editor;