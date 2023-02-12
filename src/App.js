import './App.css';
// 导入 React 依赖。
import React, { useCallback, useMemo } from 'react'
// 导入 Slate 编辑器工厂。
import { createEditor, Editor, Text, Transforms } from 'slate'
// 导入 Slate 组件和 React 插件。
import { Slate, Editable, withReact } from 'slate-react'

const initialValue = [{
  type: 'paragraph',
  children: [{ text: 'A line of text in a paragraph.' }],
},]

function App() {
  // 创建一个不会在渲染中变化的 Slate 编辑器对象。
  const editor = useMemo(() => withReact(createEditor()), [])

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

  return <Slate editor={editor} value={initialValue}>
    <Editable
      renderElement={renderElement}
      // renderLeaf={renderLeaf}
      onKeyDown={event => {
        if (!event.ctrlKey) {
          return
        }

        switch (event.key) {
          // 当按下 "`" 时，保留我们代码块现有的逻辑
          case '`': {
            event.preventDefault()
            const [match] = Editor.nodes(editor, {
              match: n => n.type === 'code',
            })
            Transforms.setNodes(
              editor,
              { type: match ? 'paragraph' : 'code' },
              { match: n => Editor.isBlock(editor, n) }
            )
            break
          }

          // 当按下 "B" 时，加粗所选择的文本
          case 'b': {
            event.preventDefault()
            Transforms.setNodes(
              editor,
              { bold: true },
              // 应用到文本节点上，
              // 如果所选内容仅为文本节点的一部分，则将其拆分。
              { match: n => Text.isText(n), split: true }
            )
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
