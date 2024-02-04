export default {
  BraftEditorParams: {
    // 禁传音频、视频
    media: {
      accepts: {
        video: false,
        audio: false,
      },
      externals: {
        image: false,
        vidio: false,
        audio: false,
      },
    },
    style: {
      border: '1px solid #d8d8d8',
      borderRadius: 4,
    },
    // 工具栏布局
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
    // 图片编辑器工具栏
    imageControls: [
      'float-left', // 设置图片左浮动
      'float-right', // 设置图片右浮动
      'align-left', // 设置图片居左
      'align-center', // 设置图片居中
      'align-right', // 设置图片居右
      // 'link', // 设置图片超链接
      'size', // 设置图片尺寸
      'remove', // 删除图片
    ],
  },
};
