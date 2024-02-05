export default {
  defaultFlows: [
    {
      key: 'a730c960-58ac-43ae-8b62-672a6624a1f6',
      code: 'name',
      inputType: 'text',
      title: '姓名',
      style: '文本',
      span: 24,
    },
    {
      key: '4d605955-7cca-4dcb-92f2-da545d09823e',
      code: 'sex',
      inputType: 'radio',
      title: '性别',
      style: '按钮',
      listArray: [
        { text: '男', value: 'man', tempId: '10' },
        { text: '女', value: 'woman', tempId: '19' },
        { text: '娚', value: 'both', tempId: '42' },
      ],
      json:
        '{"fetchListArray":{"interface":"","queryCondition":{},"dataField":"","valueField":"","textField":""}}',
      defaultValue: 'man',
      span: 12,
    },
    {
      key: '7cfd9ea8-06ad-4cce-8228-2c1cb6c5e65f',
      code: 'birthday',
      inputType: 'date',
      title: '生日',
      style: '日',
      span: 12,
    },
    {
      key: '8d3b3b67-2f3d-471f-8ba2-f70ce01220a4',
      code: 'native',
      inputType: 'cascader',
      title: '籍贯',
      options:
        '[{"label":"重庆市","value":"重庆市","children":[{"label":"重庆市区","value":"重庆市区","children":[{"label":"沙坪坝","value":"沙坪坝"},{"label":"九龙坡","value":"九龙坡"},{"label":"杨家坪","value":"杨家坪"}]}]}]',
      dependent: { key: '4d605955-7cca-4dcb-92f2-da545d09823e', option: ['man'] },
      span: 24,
    },
    {
      key: 'c2865ba7-34b1-409a-8fda-4b8b514bd884',
      code: 'studying',
      inputType: 'formList',
      title: '求学经历',
      span: 24,
      children: [
        {
          key: '0fce84e7-b4a3-42b9-8438-42155b8a9619',
          code: 'education',
          inputType: 'radio',
          title: '学历',
          style: '下拉',
          listArray: [
            { text: '小学', value: '小学', tempId: '5' },
            { text: '中学', value: '中学', tempId: '23' },
            { text: '中专', value: '中专', tempId: '102' },
            { text: '大学', value: '大学', tempId: '62' },
            { text: '大专', value: '大专', tempId: '163' },
          ],
          json:
            '{"fetchListArray":{"interface":"","queryCondition":{},"dataField":"","valueField":"","textField":""}}',
          span: 6,
        },
        {
          key: '6655f56b-14e6-4537-a4d6-e73d6923f716',
          code: 'school',
          inputType: 'text',
          title: '学校名称',
          style: '文本',
          span: 6,
        },
        {
          key: '0f838e1a-1d86-402f-965a-5c918295e7e8',
          code: 'start',
          inputType: 'date',
          title: '开始日期',
          style: '日',
          span: 6,
        },
        {
          key: '6e8babd1-c6a7-4b2e-8bef-cdb341c4a6f0',
          code: 'end',
          inputType: 'date',
          title: '结束日期',
          style: '日',
          span: 6,
        },
      ],
    },
  ],
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

// 控件按钮配置
export const formTags = [
  {
    icon: 'icondanxuan',
    label: '单选框',
    hasChidren: false,
    type: '表单控件',
    inputType: 'radio',
  },
  {
    icon: 'iconduoxuan',
    label: '多选框',
    hasChidren: false,
    type: '表单控件',
    inputType: 'multiple',
  },
  {
    icon: 'iconwenben',
    label: '文本框',
    hasChidren: false,
    type: '表单控件',
    inputType: 'text',
  },
  {
    icon: 'iconshuzi',
    label: '数字框',
    hasChidren: false,
    type: '表单控件',
    inputType: 'number',
  },
  {
    icon: 'iconkaiguan',
    label: '开关',
    hasChidren: false,
    type: '表单控件',
    inputType: 'switch',
  },
  {
    icon: 'iconriqiqishu',
    label: '日期框',
    hasChidren: false,
    type: '表单控件',
    inputType: 'date',
  },
  {
    icon: 'iconjilian',
    label: '级联选择',
    hasChidren: true,
    type: '高级控件',
    inputType: 'cascader',
  },
  {
    icon: 'iconfuwenben',
    label: '富文本',
    hasChidren: false,
    type: '高级控件',
    inputType: 'richText',
  },
  // 有children的组件
  {
    icon: 'iconqukuailian',
    label: '块区域',
    hasChidren: true,
    type: '布局控件',
    inputType: 'container',
  },
  {
    icon: 'iconshuzuliebiao',
    label: '数组表单',
    hasChidren: true,
    type: '布局控件',
    inputType: 'formList',
  },
];

// 编码整体长度限制
export const CODE_TOTAL_LENGTH_LIMIT = 40;

// 编码部分长度限制
export const CODE_PART_LENGTH_LIMIT = 20;
