export default {
  defaultFlows: [],
  sortableOption: {
    animation: 150,
    fallbackOnBody: true,
    swapThreshold: 0.65,
    group: {
      name: 'formItem',
      pull: true,
      put: true,
    },
  },
  // 左边控件按钮的拖动样式
  sortableOption2: {
    group: {
      name: 'formItem',
      pull: 'clone',
      put: false,
    },
    sort: false,
  },
  // 内置控件
  BraftEditorParam: {
    controls: [
      'undo',
      'redo',
      'clear',
      'separator',
      'bold',
      'italic',
      'underline',
      'font-size',
      'text-color',
      'remove-styles',
      'separator',
      'list-ul',
      'list-ol',
      'hr',
      'separator',
      'media',
      'emoji',
    ],
  },
  // 用户选择控件
  BraftEditorControls: [
    { key: 'undo', value: '撤销' },
    { key: 'redo', value: '重做' },
    { key: 'clear', value: '清除内容' },
    { key: 'bold', value: '加粗' },
    { key: 'italic', value: '斜体' },
    { key: 'underline', value: '下划线' },
    { key: 'font-size', value: '字体大小' },
    { key: 'text-color', value: '颜色' },
    { key: 'remove-styles', value: '清除样式' },
    { key: 'list-ol', value: '有序列表' },
    { key: 'list-ul', value: '无序列表' },
    { key: 'hr', value: '水平线' },
    { key: 'media', value: '多媒体' },
    { key: 'emoji', value: '表情' },
  ],
};
