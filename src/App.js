import './App.css';
// 导入 React 依赖。
import React, { useCallback, useMemo, useState } from 'react'
// 导入 Slate 编辑器工厂。
import { createEditor, Editor, Text, Transforms } from 'slate'
// 导入 Slate 组件和 React 插件。
import { Slate, Editable, withReact } from 'slate-react'
import { ListType, withLists } from '@prezly/slate-lists';

// Define our own custom set of helpers.
const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.bold === true,
      universal: true,
    })

    return !!match
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === 'code',
    })

    return !!match
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor)
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: n => Text.isText(n), split: true }
    )
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor)
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: n => Editor.isBlock(editor, n) }
    )
  },
}

const withListsPlugin = withLists({
  isConvertibleToListTextNode(node) {
    return Element.isElementType(node, 'paragraph');
  },
  isDefaultTextNode(node) {
    return Element.isElementType(node, 'paragraph');
  },
  isListNode(node, type) {
    if (type) {
      return Element.isElementType(node, type);
    }
    return (
      Element.isElementType(node, 'ordered-list') ||
      Element.isElementType(node, 'unordered-list')
    );
  },
  isListItemNode(node) {
    return Element.isElementType(node, 'list-item');
  },
  isListItemTextNode(node) {
    return Element.isElementType(node, 'list-item-text');
  },
  createDefaultTextNode(props = {}) {
    return { children: [{ text: '' }], ...props, type: 'paragraph' };
  },
  createListNode(type = ListType.UNORDERED, props = {}) {
    const nodeType = type === ListType.ORDERED ? 'ordered-list' : 'unordered-list';
    return { children: [{ text: '' }], ...props, type: nodeType };
  },
  createListItemNode(props = {}) {
    return { children: [{ text: '' }], ...props, type: 'list-item' };
  },
  createListItemTextNode(props = {}) {
    return { children: [{ text: '' }], ...props, type: 'list-item-text' };
  },
});

function App() {
  // 创建一个不会在渲染中变化的 Slate 编辑器对象。
  const editor = useMemo(() => withListsPlugin(withReact(createEditor())), [])
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
    {
      type: 'ordered-list',
      children: [
        {
          type: 'list-item',
          children: [{ type: 'list-item-text', children: [{ text: 'One' }] }],
        },
        {
          type: 'list-item',
          children: [{ type: 'list-item-text', children: [{ text: 'Two' }] }],
        },
        {
          type: 'list-item',
          children: [{ type: 'list-item-text', children: [{ text: 'Three' }] }],
        },
      ],
    },
  ])

  const renderElement = useCallback(props => {
    const { element, attributes, children } = props
    switch (element.type) {
      case 'ordered-list':
        return <ol {...attributes}>{children}</ol>;
      case 'unordered-list':
        return <ul {...attributes}>{children}</ul>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'list-item-text':
        return <div {...attributes}>{children}</div>;
      case 'code':
        return <CodeElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  // 定义一个叶子渲染函数，使用 `useCallback` 记住。
  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, [])


  return <Slate editor={editor} value={value} onChange={value => setValue(value)}>
    <div>
      <button
        onMouseDown={event => {
          event.preventDefault()
          CustomEditor.toggleBoldMark(editor)
        }}
      >
        Bold
      </button>
      <button
        onMouseDown={event => {
          event.preventDefault()
          CustomEditor.toggleCodeBlock(editor)
        }}
      >
        Code Block
      </button>
    </div>
    <Editable
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      onKeyDown={event => {
        if (!event.ctrlKey) {
          return
        }

        switch (event.key) {
          // 当按下 "`" 时，保留我们代码块现有的逻辑
          case '`': {
            event.preventDefault()
            CustomEditor.toggleCodeBlock(editor)
            break
          }

          // 当按下 "B" 时，加粗所选择的文本
          case 'b': {
            event.preventDefault()
            CustomEditor.toggleBoldMark(editor)
            break
          }
        }
      }} />
  </Slate>
}


const CodeElement = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}

const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>
}

// 定义 React 组件渲染带有粗体文本的叶子。
const Leaf = props => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
    >
      {props.children}
    </span>
  )
}

export default App;
