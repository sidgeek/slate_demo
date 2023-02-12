import './App.css';
// 导入 React 依赖。
import React, { useCallback, useMemo, useState } from 'react'
// 导入 Slate 编辑器工厂。
import { createEditor, Editor, Text, Transforms } from 'slate'
// 导入 Slate 组件和 React 插件。
import { Slate, Editable, withReact } from 'slate-react'

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

function App() {
  // 创建一个不会在渲染中变化的 Slate 编辑器对象。
  const editor = useMemo(() => withReact(createEditor()), [])
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ])

  const renderElement = useCallback(props => {
    switch (props.element.type) {
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
