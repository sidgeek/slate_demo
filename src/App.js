import './App.css';
// 导入 React 依赖。
import React, { useState } from 'react'
// 导入 Slate 编辑器工厂。
import { createEditor } from 'slate'
// 导入 Slate 组件和 React 插件。
import { Slate, Editable, withReact } from 'slate-react'

const initialValue = [{
  type: 'paragraph',
  children: [{ text: 'A line of text in a paragraph.' }],
},]

function App() {
  // 创建一个不会在渲染中变化的 Slate 编辑器对象。
  const [editor] = useState(() => withReact(createEditor()))
  return <Slate editor={editor} value={initialValue}>
    <Editable />
  </Slate>
}

export default App;
