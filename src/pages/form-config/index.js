/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
import React, { Component } from 'react';
import {
  Card,
  Button,
  Spin,
  Form,
  Upload,
  Select,
  Radio,
  Input,
  InputNumber,
  Icon,
  message,
  Popconfirm,
  DatePicker,
  Tag,
  Checkbox,
  Empty,
  Divider,
  Modal,
  Cascader,
  Switch,
} from 'antd';
import { parse } from 'qs';
import Sortable from 'react-sortablejs';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/index.css';
import { connect } from 'dva';
import uuid4 from 'uuid/v4';
import _get from 'lodash/get';
import _pick from 'lodash/pick';
import _cloneDeep from 'lodash/cloneDeep';
import _uniqWith from 'lodash/uniqWith';
import _uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import {
  treeToFlatData,
  operateTree,
  findDataInTree,
  checkCascaderOptionIsValid,
  JSONparse,
  reorderArray,
} from '@/utils/common';
import { FormIcon } from '@/components/FormIcon';
import { saveAs, handleLoadfile } from '@/utils/file';
import ItemFormConfig from './component/ItemFormConfig';
import PreViewFlowFormModal from './component/PreViewFlowFormModal';
import { addItemToFlow, getFormItemLayout, ellipsisText, getActiveItemStyle } from './fun';
import designConfig from './config';
import style from './index.less';

const { Option } = Select;

@connect(({ loading: { effects } }) => ({
  effects,
}))
class FormDesign extends Component {
  state = {
    data: [], // 表单数据
    loading: false,
    activeItemKey: '', // 选中的表单key
    activeItem: {}, // 选中的表单内容
    imgUrls: [], // 所有图片的url
    record: {}, // 数据库里的记录
  };

  formTags = [
    // 没有children的组件, show表示this.getMethodParam.type显示条件
    {
      icon: 'icondanxuan',
      label: '单选框',
      hasChidren: false,
      type: '表单控件',
      show: '123',
      inputType: 'radio',
    },
    {
      icon: 'iconduoxuan',
      label: '多选框',
      hasChidren: false,
      type: '表单控件',
      show: '123',
      inputType: 'multiple',
    },
    {
      icon: 'iconwenben',
      label: '文本框',
      hasChidren: false,
      type: '表单控件',
      show: '123',
      inputType: 'text',
    },
    {
      icon: 'iconshuzi',
      label: '数字框',
      hasChidren: false,
      type: '表单控件',
      show: '123',
      inputType: 'number',
    },
    {
      icon: 'iconkaiguan',
      label: '开关',
      hasChidren: false,
      type: '表单控件',
      show: '13',
      inputType: 'switch',
    },
    {
      icon: 'iconriqiqishu',
      label: '日期框',
      hasChidren: false,
      type: '表单控件',
      show: '123',
      inputType: 'date',
    },
    {
      icon: 'iconzhaopian',
      label: '照片上传',
      hasChidren: false,
      type: '上传控件',
      show: '12',
      inputType: 'photo',
    },
    {
      icon: 'iconshipin',
      label: '视频上传',
      hasChidren: false,
      type: '上传控件',
      show: '1',
      inputType: 'video',
    },
    {
      icon: 'iconyinpin',
      label: '音频上传',
      hasChidren: false,
      type: '上传控件',
      show: '1',
      inputType: 'audio',
    },
    {
      icon: 'iconwenjian',
      label: '文件上传',
      hasChidren: false,
      type: '上传控件',
      show: '1',
      inputType: 'file',
    },
    {
      icon: 'iconjilian',
      label: '级联选择',
      hasChidren: true,
      type: '高级控件',
      show: '123',
      inputType: 'cascader',
    },
    {
      icon: 'iconfuwenben',
      label: '富文本',
      hasChidren: false,
      type: '高级控件',
      show: '1',
      inputType: 'richText',
    },
    {
      icon: 'iconzidong',
      label: '自动处理',
      hasChidren: false,
      type: '高级控件',
      show: '12',
      inputType: 'auto',
    },
    // 有children的组件
    {
      icon: 'iconqukuailian',
      label: '块区域',
      hasChidren: true,
      type: '布局控件',
      show: '123',
      inputType: 'container',
    },
    {
      icon: 'iconshuzuliebiao',
      label: '数组表单',
      hasChidren: true,
      type: '布局控件',
      show: '123',
      inputType: 'formList',
    },
  ];

  hasMounted = false;

  getMethodParam = {}; // url的get参数

  componentWillMount() {
    this.getMethodParam = parse(window.location.href.split('?')[1]);
  }

  componentDidMount = async () => {
    const { dispatch, qiniuUploadParam } = this.props;
    this.hasMounted = true;
    const { type, id } = this.getMethodParam;
    if (!type || !id) return;
    this.setState({ loading: true });
    const res = await dispatch({
      type: designConfig.formType[type].dispatchTypeForQuery,
      payload: {
        save: false,
        data: {
          id,
        },
      },
    });
    const dataConfig = JSONparse(_get(res, '[0]flow', '[]'));
    if (this.hasMounted) {
      this.setState({ data: [...dataConfig], loading: false, record: res[0] || {} });
    }
  };

  componentWillUnmount() {
    this.hasMounted = false;
  }

  judgeAddIsValid = (data, sourceId, parentPath) => {
    // 当源来自containerRoot时，sourceId是uuid，类型需要去data tree里找
    const sourceType = _get(findDataInTree(data, 'key', sourceId), '[0].inputType') || sourceId;
    if (['块区域', 'container', '数组表单', 'formList', '富文本'].includes(sourceType)) {
      // 数组表单不能容纳块区域或数组表单
      const hit = findDataInTree(data, 'key', parentPath);
      if (_get(hit, '[0].inputType') === 'formList') {
        this.forceUpdate();
        return `${sourceType}不能放进数组表单`;
      }
    }
    // if (!['单选框', 'radio'].includes(sourceType)) {
    //   const hit = findDataInTree(data, 'key', parentPath);
    //   if (_get(hit, '[0].inputType') === 'cascader') {
    //     this.forceUpdate();
    //     return '只有单选框才能放进级联选择';
    //   }
    // }
    return '';
  };

  sortableAdd = (evt, parentPath) => {
    const { data } = this.state;
    // 组件名或路径
    const sourceId = evt.clone.getAttribute('data-id');
    // Sortable父节点路径, 某些浏览器evt没有path属性
    // const parentPath = evt.path[1].getAttribute('data-id');
    const judgeResult = this.judgeAddIsValid(data, sourceId, parentPath);
    if (judgeResult) {
      message.warning(judgeResult);
      return;
    }
    // 拖拽元素的目标索引
    const { newIndex } = evt;
    if (!sourceId) return;
    if (this.formTags.map(f => f.label).includes(sourceId)) {
      // 初始新增
      const item = this.initItemConfig(sourceId);
      if (parentPath === 'containerRoot') {
        data.splice(newIndex, 0, item);
      } else {
        addItemToFlow(data, item, parentPath, newIndex);
      }
      this.setState({ data: [...data] });
    } else {
      // 已有控件移动位置发生的新增
      const hit = findDataInTree(data, 'key', sourceId);
      if (hit.length > 0) {
        const newData = _cloneDeep(hit[0]);
        // 移除老的
        operateTree('del', data, {}, 'key', sourceId, true);
        // 增加新的
        if (parentPath === 'containerRoot') {
          data.splice(newIndex, 0, newData);
        } else {
          addItemToFlow(data, newData, parentPath, newIndex);
        }
      }
      this.setState({ data });
    }
  };

  sortableUpdate = (evt, parentPath) => {
    // 交换数组
    const { newIndex, oldIndex } = evt;
    const { data } = this.state;
    // 父节点路径
    // const parentPath = evt.path[1].getAttribute('data-id');

    if (parentPath === 'containerRoot') {
      this.setState({ data: reorderArray(data, oldIndex, newIndex) });
    } else {
      // 找出对应的子数据
      const hit = findDataInTree(data, 'key', parentPath);
      if (hit.length > 0) {
        const newChildren = reorderArray(hit[0].children || [], oldIndex, newIndex);
        operateTree('addChildren', data, newChildren, 'key', parentPath, true);
        this.setState({ data });
      }
    }
  };

  goBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  // 插入表单控件的模版
  initItemConfig = value => {
    const key = uuid4();
    const code = _uniqueId('item');
    const { label: title, inputType } = this.formTags.find(f => f.label === value) || {};
    switch (title) {
      case '单选框':
      case '多选框':
        return {
          key,
          code,
          inputType,
          title,
          style: '下拉',
          listArray: [],
          json: JSON.stringify({
            fetchListArray: {
              interface: '',
              queryCondition: {},
              dataField: '',
              valueField: '',
              textField: '',
            },
          }),
        };
      case '富文本':
        return {
          key,
          code,
          inputType,
          title,
          span: 24,
          controls: ['bold', 'italic', 'underline', 'font-size', 'list-ul', 'list-ol', 'hr'],
          height: 150,
        };
      case '文本框':
        return { key, code, inputType, title, style: '文本' };
      case '数字框':
        // 数字框的style是提供给移动端使用的，其实没有意义
        return { key, code, inputType, title, style: '文本' };
      case '开关':
        return { key, code, inputType, title };
      case '照片上传':
        return {
          key,
          code,
          inputType,
          title,
          storagePath: `{{currentProjectId}}/${this.getMethodParam.module || ''}`,
        };
      case '视频上传':
        return {
          key,
          code,
          inputType,
          title,
          accept: '.mp4,.mov',
          storagePath: `{{currentProjectId}}/${this.getMethodParam.module || ''}`,
        };
      case '音频上传':
        return {
          key,
          code,
          inputType,
          title,
          storagePath: `{{currentProjectId}}/${this.getMethodParam.module || ''}`,
        };
      case '文件上传':
        return {
          key,
          code,
          inputType,
          title,
          storagePath: `{{currentProjectId}}/${this.getMethodParam.module || ''}`,
        };
      case '日期框':
        return { key, code, inputType, title, style: '日' };
      case '自动处理':
        return {
          key,
          code,
          inputType,
          title,
          method: '自动填充',
          dealRange: [],
          json: JSON.stringify({
            dealFunc: '() => {}',
          }),
        };
      case '块区域':
        return { key, inputType, title, span: 24 };
      case '数组表单':
        return { key, code, inputType, title, span: 24 };
      case '级联选择':
        return { key, code, inputType, title };
      default:
        return {};
    }
  };

  importConfig = async ({ file }) => {
    this.setState({ loading: true });
    const data = await handleLoadfile(file.originFileObj);
    const validError = this.judgeFLow(data);
    if (validError && validError !== '编码必须唯一！') {
      message.error(validError);
      this.setState({ loading: false });
    } else if (validError === '编码必须唯一！') {
      Modal.confirm({
        title: '检测到有编码重复，是否继续导入?',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.setState({ data, loading: false });
        },
        onCancel: () => {
          this.setState({ loading: false });
        },
      });
    } else {
      this.setState({ data, loading: false });
    }
  };

  exportConfig = () => {
    const { data, record } = this.state;
    const { kind, name, version } = record || {};
    saveAs(new Blob([JSON.stringify(data)]), `${kind}-${name}-V${version}.JSON`);
  };

  // 渲染中间的容器内容，实现所见所得
  renderForm = config => {
    const { data } = this.state;
    switch (config.inputType) {
      case 'radio': {
        if (config.style === '按钮') {
          return (
            <Form.Item
              label={ellipsisText(config.title, 18)}
              required={!config.optional}
              {...getFormItemLayout(config.title)}
            >
              <Radio.Group
                defaultValue={config.defaultValue}
                buttonStyle="solid"
                placeholder={config.placeholder}
              >
                {(config.listArray || []).filter(l => l.value && l.text).map(l => (
                  <Radio.Button key={l.value} value={l.value}>
                    {l.text}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          );
        }
        return (
          <Form.Item
            label={ellipsisText(config.title, 18)}
            required={!config.optional}
            {...getFormItemLayout(config.title)}
          >
            <Select
              // 修改配置里的默认内容不会触发这里的defaultValue修改，有时间再考虑
              defaultValue={config.defaultValue}
              placeholder={config.placeholder}
              style={{ width: '60%' }}
            >
              {(config.listArray || []).filter(l => l.value && l.text).map(l => (
                <Option key={l.value} value={l.value}>
                  {l.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
      }
      case 'multiple': {
        if (config.style === '按钮') {
          return (
            <Form.Item
              label={ellipsisText(config.title, 18)}
              required={!config.optional}
              {...getFormItemLayout(config.title)}
            >
              <Checkbox.Group defaultValue={[config.defaultValue]} placeholder={config.placeholder}>
                {(config.listArray || []).filter(l => l.value && l.text).map(l => (
                  <Checkbox key={l.value} value={l.value}>
                    {l.text}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>
          );
        }
        return (
          <Form.Item
            label={ellipsisText(config.title, 18)}
            required={!config.optional}
            {...getFormItemLayout(config.title)}
          >
            <Select
              mode="multiple"
              // 修改配置里的默认内容不会触发这里的defaultValue修改，有时间再考虑
              defaultValue={config.defaultValue}
              placeholder={config.placeholder}
              style={{ width: '60%' }}
            >
              {(config.listArray || []).filter(l => l.value && l.text).map(l => (
                <Option key={l.value} value={l.value}>
                  {l.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
      }
      case 'text': {
        if (config.style) {
          return (
            <Form.Item
              label={ellipsisText(config.title, 18)}
              required={!config.optional}
              {...getFormItemLayout(config.title)}
            >
              <Input
                defaultValue={config.defaultValue}
                placeholder={config.placeholder}
                style={{ width: '60%' }}
              />
              {config.style === '文本数组' && (
                <Button icon="plus" shape="round" style={{ marginLeft: '10px' }} />
              )}
            </Form.Item>
          );
        }
        return <span />;
      }
      case 'number': {
        const min = ![null, undefined, ''].includes(config.min) ? { min: config.min } : null;
        const max = ![null, undefined, ''].includes(config.max) ? { max: config.max } : null;
        const unit = config.unit ? `(${config.unit})` : '';
        return (
          <Form.Item
            label={`${config.title}${unit}`}
            required={!config.optional}
            {...getFormItemLayout(config.title)}
          >
            <InputNumber
              {...min}
              {...max}
              placeholder={config.placeholder}
              style={{ width: '60%' }}
            />
          </Form.Item>
        );
      }
      case 'switch': {
        return (
          <Form.Item
            label={ellipsisText(config.title, 18)}
            required={!config.optional}
            {...getFormItemLayout(config.title)}
          >
            <Switch
              defaultChecked={!!config.defaultValue}
              checkedChildren={config.checkedText}
              unCheckedChildren={config.unCheckedText}
            />
          </Form.Item>
        );
      }
      case 'date': {
        let DateComponent;
        switch (config.style) {
          case '日':
            DateComponent = (
              <DatePicker placeholder={config.placeholder} style={{ width: '60%' }} />
            );
            break;
          case '月':
            DateComponent = (
              <DatePicker.MonthPicker placeholder={config.placeholder} style={{ width: '60%' }} />
            );
            break;
          case '年':
            DateComponent = (
              <DatePicker placeholder={config.placeholder} style={{ width: '60%' }} mode="year" />
            );
            break;
          case '秒':
            DateComponent = (
              <DatePicker showTime placeholder={config.placeholder} style={{ width: '60%' }} />
            );
            break;
          default:
            DateComponent = <DatePicker style={{ width: '60%' }} />;
        }
        return (
          <Form.Item
            label={ellipsisText(config.title, 18)}
            required={!config.optional}
            {...getFormItemLayout(config.title)}
          >
            {DateComponent}
          </Form.Item>
        );
      }
      case 'auto': {
        if (config.method === '自动填充') {
          return (
            <Form.Item
              label={ellipsisText(config.title, 18)}
              required={!config.optional}
              {...getFormItemLayout(config.title)}
            >
              {config.dealRange.map(key => (
                <Tag key={key}>
                  {(treeToFlatData(data, 'key').find(a => a.key === key) || {}).title}
                </Tag>
              ))}
              {`(${config.method})`}
            </Form.Item>
          );
        }
        if (['地图选点', '关联路线', '地图绘制'].includes(config.method)) {
          return (
            <Form.Item
              label={ellipsisText(config.title, 18)}
              required={!config.optional}
              {...getFormItemLayout(config.title)}
            >
              {config.method}
            </Form.Item>
          );
        }
        return <span />;
      }
      case 'photo': {
        const { imgUrls } = this.state;
        return (
          <React.Fragment>
            <Form.Item
              label="图片说明"
              {...getFormItemLayout(config.title)}
              className={style.picInspect}
            >
              {config.placeholder}
            </Form.Item>
            <Form.Item
              label={ellipsisText(config.title, 18)}
              required={!config.optional}
              {...getFormItemLayout(config.title)}
            >
              <div className={style.photoStyle}>
                {(imgUrls || []).filter(i => (config.image || []).includes(i.key)).map(item => (
                  <img src={item.url} alt="加载失败" key={item.key.slice(-10, -5)} />
                ))}
                <div className={style.upload}>
                  <Icon type="plus" style={{ fontSize: '24px' }} />
                  <div>上传</div>
                </div>
              </div>
            </Form.Item>
          </React.Fragment>
        );
      }
      case 'video':
      case 'audio':
      case 'file':
        return (
          <>
            <Form.Item
              label="说明"
              {...getFormItemLayout(config.title)}
              className={style.picInspect}
            >
              {config.placeholder}
            </Form.Item>
            <Form.Item
              label={ellipsisText(config.title, 18)}
              required={!config.optional}
              {...getFormItemLayout(config.title)}
            >
              <Button>
                <Icon type="upload" /> 上传
              </Button>
            </Form.Item>
          </>
        );
      case 'cascader': {
        return (
          <React.Fragment>
            <Form.Item
              label={ellipsisText(config.title, 18)}
              required={!config.optional}
              {...getFormItemLayout(config.title)}
            >
              <Cascader
                options={
                  checkCascaderOptionIsValid(null, config.options || '[]')
                    ? JSONparse(config.options || '[]')
                    : []
                }
                style={{ width: '80%' }}
                placeholder={config.placeholder}
              />
            </Form.Item>
          </React.Fragment>
        );
      }
      case 'formList':
      case 'container': {
        return (
          <div
            data-id={config.key}
            style={{ minHeight: '100px', padding: '5px', border: '1px dashed darkgrey' }}
          >
            <Divider orientation="left" style={{ margin: '5px 0' }}>
              {config.title}
            </Divider>
            <Sortable
              options={{
                ...designConfig.sortableOption,
                onUpdate: evt => {
                  this.sortableUpdate(evt, config.key);
                },
                onAdd: evt => {
                  this.sortableAdd(evt, config.key);
                },
                dragClass: style.dragClass,
                filter: '.emptyTip',
              }}
              key={config.key}
            >
              {this.renderTreeData(config.children || [])}
            </Sortable>
          </div>
        );
      }
      case 'richText': {
        const { controls = [], height = 150 } = config;
        return (
          <Form.Item
            label={ellipsisText(config.title, 18)}
            required={!config.optional}
            {...getFormItemLayout(config.title)}
          >
            <BraftEditor
              style={{ border: '1px solid #d8d8d8', borderRadius: 4 }}
              contentStyle={{ height }}
              placeholder={config.placeholder}
              controls={designConfig.BraftEditorParam.controls.filter(
                i => i === 'separator' || controls.includes(i)
              )}
            />
          </Form.Item>
        );
      }
      default:
        return <span />;
    }
  };

  renderTreeData = data => {
    if (data && data.length > 0) {
      const { activeItemKey } = this.state;
      return data.map((d, index) => (
        <div
          key={d.key}
          data-id={d.key}
          className={style.formItem}
          style={getActiveItemStyle(activeItemKey === d.key)}
          onClick={e => {
            if (e) e.stopPropagation();
            if (activeItemKey !== d.key) this.setActiveItem(d.key, data[index]);
          }}
        >
          <div style={{ flexGrow: '1' }}>{this.renderForm(d)}</div>
          <div
            style={{
              width: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                color: 'firebrick',
                textAlign: 'right',
                lineHeight: '12px',
              }}
            >
              {d.code}
            </div>
            {/* 选中才显示复制和删除按钮，保持界面干净 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                width: '100%',
              }}
            >
              {activeItemKey === d.key && (
                <div className={style.iconStyle}>
                  <Icon
                    type="copy"
                    theme="filled"
                    style={{
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '15px',
                      position: 'relative',
                      bottom: '-2px',
                    }}
                    onClick={() => this.operateFormItem('copy', d.key)}
                  />
                  <Icon
                    type="delete"
                    theme="filled"
                    style={{
                      color: 'orangered',
                      cursor: 'pointer',
                      fontSize: '15px',
                      position: 'relative',
                      bottom: '-2px',
                      marginLeft: '8px',
                    }}
                    onClick={() => this.operateFormItem('delete', d.key)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ));
    }
    return (
      <div className={`${style.tipText} emptyTip`}>
        <Empty
          description={<span style={{ color: 'grey', fontSize: '16px' }}>拖动控件到此处</span>}
        />
      </div>
    );
  };

  operateFormItem = (action, key) => {
    const { data, activeItem = {} } = this.state;
    switch (action) {
      case 'delete':
        Modal.confirm({
          title: `确认删除${activeItem.inputType}控件${activeItem.title}及其子控件?`,
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            operateTree('del', data, {}, 'key', key, true);
            this.setState({ data, activeItem: {}, activeItemKey: '' });
          },
        });
        break;
      case 'copy': {
        let [hit] = findDataInTree(data, 'key', key);
        if (hit && hit.children && hit.children.length) {
          // 自身和children里的key都要重新生成
          const updateKey = tree => {
            for (let i = tree.length - 1; i >= 0; i -= 1) {
              if (tree[i].key) {
                tree[i].key = uuid4();
              }
              if (tree[i].children && tree[i].children.length) {
                updateKey(tree[i].children);
              }
            }
          };
          hit = [_cloneDeep(hit)];
          updateKey(hit);
          operateTree('copy', data, { ...hit[0] }, 'key', key, true);
        } else {
          operateTree('copy', data, { key: uuid4() }, 'key', key, true);
        }
        this.setState({ data });
        break;
      }
      default:
    }
  };

  setActiveItem = (activeItemKey, activeItem) => {
    // 改变选中项时应校验该项的表单配置是否合格
    if (this.itemConfigNode) {
      this.itemConfigNode.validateFields((error, values) => {
        if (!error) {
          // 检查一下listArray是否value和text都填写了
          const listArray = _get(values, 'listArray', []);
          if (listArray.some(l => !l.text || !l.value)) {
            message.warning('选项内容的key和value必填');
          } else {
            this.setState({ activeItemKey, activeItem });
          }
        } else {
          message.warning('表单配置有误，请修正');
        }
      });
    } else {
      this.setState({ activeItemKey, activeItem });
    }
  };

  // 表单配置改变时动态改变state中的data，达到所见即所得的效果
  changeData = (activeItem, change) => {
    // console.log('change', change);
    const { data } = this.state;
    if (activeItem) {
      // 依赖是两层结构，单独处理
      if (change.dependent) {
        activeItem.dependent = {
          ...activeItem.dependent,
          [Object.keys(change.dependent)[0]]: _get(
            change,
            `dependent.${Object.keys(change.dependent)[0]}.value`
          ),
        };
      } else {
        activeItem[Object.keys(change)[0]] = change[Object.keys(change)[0]].value;
      }
      this.setState({ data });
    }
  };

  submitHandle = () => {
    const { type, id } = this.getMethodParam;
    if ([type, id].some(i => !i)) {
      message.error('参数不足！');
      return;
    }
    // 为了让本页面能更独立地复用，表单的提交只负责修改表单内容
    const { dispatch } = this.props;
    const { data, record } = this.state;
    async function pushData() {
      await dispatch({
        type: _get(designConfig.formType[type], 'dispatchTypeForUpdate'),
        payload: {
          flow: data,
          record,
        },
      });
      setTimeout(() => {
        const fatherWindowReload = _get(designConfig.formType[type], 'fatherWindowReload');
        if (!fatherWindowReload) return;
        // 更新父窗口的数据
        const fatherReloadFun = _get(window.opener, fatherWindowReload);
        if (typeof fatherReloadFun === 'function') fatherReloadFun();
      }, 1000);
    }
    const validError = this.judgeFLow(data);
    if (validError && validError !== '编码必须唯一！') {
      message.error(validError);
    } else if (validError === '编码必须唯一！') {
      Modal.confirm({
        title: '检测到有编码重复，是否继续提交?',
        okText: '确认',
        cancelText: '取消',
        onOk: pushData,
      });
    } else {
      pushData();
    }
  };

  // 判断flow是否有效
  judgeFLow = (flows = []) => {
    // 扁平化
    const flatFlow = treeToFlatData(flows, 'key');
    if (flatFlow.length === 0 && this.getMethodParam?.type !== '3') return '至少需要一个表单!';
    const keys = flatFlow.map(f => f.key);
    if (keys.length !== _uniq(keys).length) return 'key值必须存在且唯一!';
    const codes = flatFlow.map(f => f.code).filter(f => f);
    if (codes.length !== _uniq(codes).length) return '编码必须唯一！';
    if (flatFlow.some(f => !f.title)) return '标题必须输入';
    if (flatFlow.some(f => (f.listArray || []).some(a => !a.text || !a.value)))
      return '选项内容的key和value必须都有';
    // 检查显示条件是否有效
    const dependentInvalid = flatFlow.filter((f, index, self) => {
      const dependentKey = _get(f, 'dependent.key');
      if (!dependentKey) return false;
      const dependentIndex = self.findIndex(s => s.key === dependentKey);
      if (dependentIndex < 0) return true;
      return index <= dependentIndex;
    });
    if (dependentInvalid.length > 0) {
      return `${dependentInvalid.map(d => d.title).join('、')}的显示条件不存在或者顺序不对，请检查`;
    }
    return null;
  };

  render() {
    const { loading, activeItemKey, activeItem, imgUrls, record } = this.state;
    const { effects } = this.props;
    const getTitle = _get(designConfig.formType[this.getMethodParam.type], 'getTitle');
    const dispatchTypeForUpdate = _get(
      designConfig.formType[this.getMethodParam.type],
      'dispatchTypeForUpdate'
    );
    let { data } = this.state;
    if (this.getMethodParam.type === '2') {
      // type为2（外业调查）时，不需要全量上传控件
      data = data.filter(
        d =>
          !this.formTags
            .filter(f => !f.show.includes('2'))
            .map(f => f.inputType)
            .includes(d.inputType)
      );
    }
    return (
      <Spin spinning={loading} size="large">
        <Card title={getTitle ? getTitle(record) : '表单设计'} bodyStyle={{ padding: '0' }}>
          <div style={{ display: 'flex ', height: 'calc(100vh - 60px)', overflow: 'auto' }}>
            <div
              data-id="控件"
              style={{ flex: '1', padding: '12px', borderRight: '1px solid #eae2e2' }}
            >
              {['表单控件', '上传控件', '布局控件', '高级控件'].map(i => (
                <div key={i}>
                  <h4>{i}</h4>
                  <Sortable options={designConfig.sortableOption2}>
                    {this.formTags
                      .filter(f => f.type === i && f.show.includes(this.getMethodParam.type))
                      .map(f => (
                        <div key={f.label} data-id={f.label}>
                          <Button
                            block
                            style={{
                              marginBottom: '5px',
                              backgroundColor: 'rgba(56, 99, 218, 0.2)',
                            }}
                          >
                            <FormIcon type={f.icon} /> {f.label}
                          </Button>
                        </div>
                      ))}
                  </Sortable>
                  <p />
                </div>
              ))}
            </div>
            <div style={{ flex: '4', borderRight: '1px solid #eae2e2', overflow: 'auto' }}>
              <div
                style={{ height: '40px', lineHeight: '40px', borderBottom: '1px solid #eae2e2' }}
              >
                <Button
                  type="link"
                  icon="check-circle"
                  onClick={this.submitHandle}
                  loading={!!effects[dispatchTypeForUpdate]}
                >
                  <b> 提交</b>
                </Button>
                <Popconfirm
                  title="确定清空所有设置？"
                  onConfirm={() => {
                    this.setState({ data: [], activeItemKey: '', activeItem: {} });
                  }}
                >
                  <Button type="link" icon="delete">
                    <b> 清空</b>
                  </Button>
                </Popconfirm>
                <PreViewFlowFormModal flows={data} judgeFlow={this.judgeFLow}>
                  <Button type="link" icon="eye">
                    <b> 预览</b>
                  </Button>
                </PreViewFlowFormModal>
                <Button type="link" icon="download" onClick={this.exportConfig}>
                  <b> 导出JSON</b>
                </Button>
                <Upload
                  accept=".json"
                  onChange={e => {
                    this.importConfig(e);
                  }}
                  fileList={[]}
                  useDefaultProjectId
                >
                  <Button type="link" icon="upload">
                    <b> 导入JSON</b>
                  </Button>
                </Upload>
              </div>
              {/* 表单容器 */}

              <div
                data-id="containerRoot"
                style={{ height: 'calc(100% - 40px)', overflow: 'auto', padding: '5px' }}
                className={style.formStyle}
              >
                <Sortable
                  options={{
                    ...designConfig.sortableOption,
                    onUpdate: evt => {
                      this.sortableUpdate(evt, 'containerRoot');
                    },
                    onAdd: evt => {
                      this.sortableAdd(evt, 'containerRoot');
                    },
                    dragClass: style.dragClass,
                    filter: '.emptyTip',
                  }}
                  key={uuid4()}
                  style={{ paddingBottom: 200 }}
                >
                  {this.renderTreeData(data)}
                </Sortable>
              </div>
            </div>
            <div style={{ flex: '2', padding: '12px', overflow: 'auto' }}>
              <h4>
                <span>表单配置</span>
              </h4>
              <ItemFormConfig
                ref={itemConfigNode => {
                  this.itemConfigNode = itemConfigNode;
                }}
                key={activeItemKey}
                {..._pick(this.props, ['codeTotalLength', 'codePartLength'])}
                activeItem={activeItem}
                allFlowData={data}
                changeData={this.changeData}
                imgUrls={imgUrls}
                record={record}
              />
            </div>
          </div>
        </Card>
      </Spin>
    );
  }
}

FormDesign.defaultProps = {
  qiniuUploadParam: true,
  codeTotalLength: 40,
  codePartLength: 20,
};

FormDesign.propTypes = {
  // 七牛上传参数
  qiniuUploadParam: PropTypes.oneOfType([
    PropTypes.bool, // 如果是布尔值表示是否使用默认配置
    PropTypes.shape({
      bucketId: PropTypes.string.isRequired,
      service: PropTypes.string.isRequired,
    }),
  ]),
  // 编码整体长度限制
  codeTotalLength: PropTypes.number,
  // 编码每段长度限制
  codePartLength: PropTypes.number,
};

export default FormDesign;
