/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from 'react';
import {
  Form,
  Input,
  Select,
  Checkbox,
  InputNumber,
  Empty,
  Icon,
  Tabs,
  Cascader,
  Tooltip,
  Popover,
  Tag,
} from 'antd';
import lodash from 'lodash';
import {
  treeToFlatData,
  operateTree,
  isJSON,
  JSONparse,
  checkCascaderOptionIsValid,
} from '@/utils/common';
import JsonModal from '@/components/JsonEditModal';
import EditableItemsForSelect from '@/components/GenerateFormFromFlow/subComponent/EditableItemsForSelect';
import CascaderOptionTree from './CascaderOptionTree';
import config from '../config';
import { getJsonConfigTemplate } from '../fun';
import style from '../index.less';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

// 字段改变时改变父data
const onFieldsChange = (props, changedFields, allFields) => {
  const { changeData, activeItem } = props;
  // 当表单值发生改变后重置表单，会触发onFieldsChange事件，但changeFields里没有value内容，这种情况不需要改变data
  if (
    (Object.keys(changedFields)[0] && 'value' in changedFields[Object.keys(changedFields)[0]]) ||
    changedFields.dependent
  ) {
    changeData(activeItem, changedFields);
  }
};

class ItemFormConfig extends Component {
  state = {};

  infoIconParam = {
    type: 'info-circle',
    theme: 'twoTone',
    style: { position: 'relative', top: 13, left: -10 },
  };

  renderItemFormConfig = flow => {
    const {
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      allFlowData,
      imgUrls,
    } = this.props;
    switch (flow?.inputType) {
      case 'radio':
      case 'multiple': {
        const defaultValue = flow.inputType === 'raido' ? '' : [];
        return (
          <React.Fragment>
            <Form.Item label="样式" required>
              {getFieldDecorator('style', {
                initialValue: (flow && flow.style) || '',
                rules: [
                  {
                    required: true,
                    message: '请输入样式',
                  },
                ],
              })(
                <Select style={{ width: '100%' }}>
                  {['按钮', '下拉', '滑出'].map(item => (
                    <Option key={item}>{item}</Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="默认内容">
              {getFieldDecorator('defaultValue', {
                initialValue: (flow && flow.defaultValue) || defaultValue,
              })(
                <Select
                  {...(flow.inputType === 'radio' ? null : { mode: 'multiple' })}
                  style={{ width: '100%' }}
                  allowClear
                >
                  {(flow.listArray || []).filter(l => l.value && l.text).map(item => (
                    <Option key={item.value}>{item.text}</Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="选项内容">
              {getFieldDecorator('listArray', {
                initialValue:
                  (flow &&
                    flow.listArray &&
                    flow.listArray.map(f => ({ ...f, tempId: lodash.uniqueId() }))) ||
                  [],
                valuePropName: 'list',
              })(
                <EditableItemsForSelect
                  showTitle={false}
                  setFieldsValue={setFieldsValue}
                  fieldName="listArray"
                  from="formConfig"
                />
              )}
            </Form.Item>
            {['下拉', '滑出'].includes(getFieldValue('style')) && (
              <Form.Item label="开启选项搜索">
                {getFieldDecorator('searchEnable', {
                  initialValue: !!lodash.get(flow, 'searchEnable'),
                  valuePropName: 'checked',
                })(<Checkbox />)}
              </Form.Item>
            )}
            {flow?.inputType === 'radio' && (
              <Form.Item label="允许手动输入">
                {getFieldDecorator('allowManualInput', {
                  initialValue: !!lodash.get(flow, 'allowManualInput'),
                  valuePropName: 'checked',
                })(<Checkbox />)}
              </Form.Item>
            )}
          </React.Fragment>
        );
      }
      case 'date':
        return (
          <Form.Item label="样式" required>
            {getFieldDecorator('style', {
              initialValue: (flow && flow.style) || '',
              rules: [
                {
                  required: true,
                  message: '请输入样式',
                },
              ],
            })(
              <Select style={{ width: '100%' }}>
                {['秒', '日', '月', '年'].map(item => (
                  <Option key={item}>{item}</Option>
                ))}
              </Select>
            )}
          </Form.Item>
        );
      case 'auto':
        return (
          <React.Fragment>
            <Form.Item label="处理方式" required>
              {getFieldDecorator('method', {
                initialValue: (flow && flow.method) || '',
                rules: [{ required: true, message: '请输入处理方式' }],
              })(
                <Select style={{ width: '100%' }}>
                  {['自动填充', '地图选点', '地图绘制', '关联路线'].map(i => (
                    <Option key={i}>{i}</Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            {getFieldValue('method') === '自动填充' && (
              <Form.Item label="处理范围" required>
                {getFieldDecorator('dealRange', {
                  initialValue: (flow && flow.dealRange) || [],
                  rules: [{ required: true, message: '请输入处理范围' }],
                })(
                  <Select style={{ width: '100%' }} mode="multiple" allowClear>
                    {treeToFlatData(allFlowData, 'key')
                      .filter(a =>
                        ['radio', 'multiple', 'text', 'number', 'cascader', 'date'].includes(
                          a.inputType
                        )
                      )
                      .map(item => (
                        <Option key={item.key}>{item.title}</Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            )}
            {getFieldValue('method') === '地图选点' && (
              <>
                <Form.Item label="显示经纬度">
                  {getFieldDecorator('isShowLatAndLng', {
                    initialValue: !!lodash.get(flow, 'isShowLatAndLng'),
                    valuePropName: 'checked',
                  })(<Checkbox />)}
                </Form.Item>
                <Form.Item label="自动计算桩号">
                  {getFieldDecorator('calcStation', {
                    initialValue: !!lodash.get(flow, 'calcStation'),
                    valuePropName: 'checked',
                  })(<Checkbox />)}
                </Form.Item>
                <Form.Item
                  label={
                    <>
                      <Tooltip title="桩号、左右侧、距离的表单直接生成无需另行配置">
                        <Icon {...this.infoIconParam} />
                      </Tooltip>
                      桩号表单绑定
                    </>
                  }
                >
                  {getFieldDecorator('isBindingStationForm', {
                    initialValue: !!lodash.get(flow, 'isBindingStationForm'),
                    valuePropName: 'checked',
                  })(<Checkbox />)}
                </Form.Item>
                <Form.Item label="允许修改省市县">
                  {getFieldDecorator('allowModifySSX', {
                    initialValue: !!lodash.get(flow, 'allowModifySSX'),
                    valuePropName: 'checked',
                  })(<Checkbox />)}
                </Form.Item>
              </>
            )}
          </React.Fragment>
        );
      case 'text':
        return (
          <React.Fragment>
            <Form.Item label="文本类型" required>
              {getFieldDecorator('textType', {
                initialValue: lodash.get(flow, 'textType', '单行文本'),
                rules: [{ required: true, message: '请输入文本类型' }],
              })(
                <Select style={{ width: '100%' }}>
                  {['单行文本', '多行文本'].map(item => (
                    <Option key={item}>{item}</Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="样式" required>
              {getFieldDecorator('style', {
                initialValue: (flow && flow.style) || '',
                rules: [{ required: true, message: '请输入样式' }],
              })(
                <Select style={{ width: '100%' }}>
                  {['文本', '语音', '文本数组'].map(item => (
                    <Option key={item}>{item}</Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </React.Fragment>
        );
      case 'number':
        return (
          <React.Fragment>
            <Form.Item label="单位">
              {getFieldDecorator('unit', {
                initialValue: lodash.get(flow, 'unit'),
              })(<Input style={{ width: 204, marginRight: 12 }} />)}
              <Popover
                trigger="click"
                content={['m²', 'm³', '°C', '°'].map(i => (
                  <Tag
                    key={i}
                    onClick={() => {
                      setFieldsValue({ unit: i });
                    }}
                  >
                    <a>{i}</a>
                  </Tag>
                ))}
              >
                <Tag color="geekblue">
                  <a>常用单位符号</a>
                </Tag>
              </Popover>
            </Form.Item>
            <Form.Item label="范围">
              {getFieldDecorator('min', {
                initialValue: lodash.get(flow, 'min'),
              })(<InputNumber placeholder="最小" />)}
              <span style={{ margin: '0 5px ' }}>～</span>
              {getFieldDecorator('max', {
                initialValue: lodash.get(flow, 'max'),
              })(<InputNumber placeholder="最大" />)}
            </Form.Item>
            <Form.Item label="数字精度">
              {getFieldDecorator('precision', {
                initialValue: lodash.get(flow, 'precision'),
              })(
                <InputNumber
                  placeholder="小数点保留位数"
                  min={0}
                  precision={0}
                  style={{ width: 204 }}
                />
              )}
            </Form.Item>
          </React.Fragment>
        );
      case 'switch': {
        return (
          <React.Fragment>
            <Form.Item label="默认选中">
              {getFieldDecorator('defaultValue', {
                initialValue: !!lodash.get(flow, 'defaultValue'),
                valuePropName: 'checked',
              })(<Checkbox />)}
            </Form.Item>
            <Form.Item label="选中的文字">
              {getFieldDecorator('checkedText', {
                initialValue: lodash.get(flow, 'checkedText'),
              })(<Input />)}
            </Form.Item>
            <Form.Item label="未选中的文字">
              {getFieldDecorator('unCheckedText', {
                initialValue: lodash.get(flow, 'unCheckedText'),
              })(<Input />)}
            </Form.Item>
          </React.Fragment>
        );
      }
      case 'cascader': {
        const optionIsValid = checkCascaderOptionIsValid(null, flow.options || '[]', () => {});
        return (
          <>
            <Form.Item label="级联数据关系">
              {getFieldDecorator('options', {
                initialValue: lodash.get(flow, 'options'),
                rules: [
                  {
                    required: true,
                    message: '请填写数据关系',
                  },
                  {
                    validator: checkCascaderOptionIsValid,
                  },
                ],
                normalize: v => (v || '').replace(/[ \r\n]/g, ''),
              })(
                <TextArea
                  placeholder={`格式: [{"value":"sc", "label":"四川", "children": [{"value": "cd", "label":"成都"}]}, ...]`}
                  rows={4}
                />
              )}
              {optionIsValid && (
                <div style={{ lineHeight: '15px', transitionDuration: '0.3s' }}>
                  <CascaderOptionTree
                    src={JSONparse(getFieldValue('options'))}
                    onConfirm={src => {
                      setFieldsValue({ options: JSON.stringify(src) });
                    }}
                  />
                </div>
              )}
            </Form.Item>
            <Form.Item label="默认内容">
              {getFieldDecorator('defaultValue', {
                initialValue: (flow && flow.defaultValue) || [],
              })(
                <Cascader
                  options={optionIsValid ? JSONparse(flow.options || '[]') : []}
                  style={{ width: '100%' }}
                  allowClear
                />
              )}
            </Form.Item>
            <Form.Item
              label={
                <>
                  <Tooltip title="将级联的数据分解成多个字段，例如省、市、县分别存">
                    <Icon {...this.infoIconParam} />
                  </Tooltip>
                  分解字段
                </>
              }
            >
              {getFieldDecorator('splitField', {
                initialValue: flow && flow.splitField,
              })(<Input placeholder=",号分隔" allowClear />)}
            </Form.Item>
            <Form.Item label="只显示最后一级">
              {getFieldDecorator('onlyShowLastLevel', {
                initialValue: !!lodash.get(flow, 'onlyShowLastLevel'),
                valuePropName: 'checked',
              })(<Checkbox />)}
            </Form.Item>
          </>
        );
      }
      case 'richText': {
        return (
          <>
            <Form.Item label="工具栏">
              {getFieldDecorator('controls', {
                initialValue: lodash.get(flow, 'controls', []),
              })(
                <Select mode="multiple" style={{ width: '100%' }} allowClear>
                  {config.BraftEditorControls.map(i => (
                    <Option key={i.key}>{i.value}</Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="编辑框高度(px)">
              {getFieldDecorator('height', {
                initialValue: lodash.get(flow, 'height'),
              })(<InputNumber min={0} precision={0} style={{ width: '100%' }} />)}
            </Form.Item>
            <Form.Item label="单个文件大小(MB)">
              {getFieldDecorator(`mediaMaxSize`, {
                initialValue: lodash.get(flow, 'mediaMaxSize'),
              })(
                <InputNumber
                  min={0}
                  max={100}
                  precision={1}
                  placeholder="默认5"
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          </>
        );
      }
      default:
        return <span />;
    }
  };

  renderDependentOption = key => {
    const { allFlowData } = this.props;
    const hit = treeToFlatData(allFlowData, 'key').find(a => a.key === key);
    if (hit && hit.listArray) {
      return hit.listArray
        .filter(l => l.value && l.text)
        .map(h => <Option key={h.value}>{h.text}</Option>);
    }
    return <Option key={null}>无</Option>;
  };

  getTreeWithoutFormlist = allFlowData => {
    const t = lodash.cloneDeep(allFlowData);
    operateTree('del', t, {}, 'inputType', 'formList', false);
    return t;
  };

  // 获取非formList以及自身formList的treeData
  getTreeWinthSelfFormList = (allFlowData, key) => {
    const flat = treeToFlatData(allFlowData, 'key');
    const hitChild = flat.find(f => f.key === key);
    if (hitChild && hitChild.parent) {
      const hit = flat.filter(f => f.inputType === 'formList' && f.key !== hitChild.parent);
      const t = lodash.cloneDeep(allFlowData);
      hit.forEach(h => {
        operateTree('del', t, {}, 'key', h.key, true);
      });
      return t;
    }
    return [];
  };

  inFormList = (key, allFlowData) => {
    const flat = treeToFlatData(allFlowData, 'key');
    const hitChild = flat.find(f => f.key === key);
    if (hitChild && hitChild.parent) {
      const hitFather = flat.find(f => f.key === hitChild.parent);
      return lodash.get(hitFather, 'inputType') === 'formList';
    }
    return false;
  };

  checkCodeIsVaild = (rule, value, callback) => {
    const { codeTotalLength, codePartLength } = this.props;
    if (value) {
      if (value.length > codeTotalLength) {
        callback(`编码整体位数应不大于${codeTotalLength}位`);
        return;
      }
      const ele = value.split('.');
      if (ele.some(e => e.length < 2)) {
        callback('每段编码位数应不低于2位');
      } else if (ele.some(e => e.length > codePartLength)) {
        callback(`每段编码位数应不大于${codePartLength}位`);
      } else if (ele.some(e => !/^[a-zA-Z][a-zA-Z0-9]+$/.test(e))) {
        callback('每段编码应为字母开头，仅包含字母或数字');
      } else callback();
    } else callback();
  };

  render() {
    const {
      activeItem,
      allFlowData,
      form: { getFieldDecorator },
    } = this.props;
    const flow = activeItem;
    if (flow && flow.key) {
      return (
        <Tabs
          animated={false}
          type="card"
          tabBarExtraContent={<b>{lodash.get(activeItem, 'inputType')}</b>}
        >
          <TabPane key="常规" tab="常规" forceRender>
            <Form {...formItemLayout}>
              <div className={style.formStyle}>
                <Form.Item label="标题">
                  {getFieldDecorator('title', {
                    initialValue: lodash.get(flow, 'title'),
                    rules: [
                      {
                        required: true,
                        message: '请输入标题',
                      },
                    ],
                  })(<Input.TextArea allowclear="true" autosize={{ minRows: 1, maxRows: 3 }} />)}
                </Form.Item>
                {['container'].includes(flow.inputType) ? (
                  <Form.Item label="显示标题">
                    {getFieldDecorator('showTitle', {
                      initialValue: lodash.get(flow, 'showTitle'),
                      valuePropName: 'checked',
                    })(<Checkbox />)}
                  </Form.Item>
                ) : (
                  <Form.Item label="字段编码">
                    {getFieldDecorator('code', {
                      initialValue: lodash.get(flow, 'code'),
                      rules: [
                        { required: !['photo'].includes(flow.inputType), message: '请输入编码' },
                        {
                          validator: this.checkCodeIsVaild,
                        },
                      ],
                    })(<Input placeholder="字母开头，仅包含字母或数字" />)}
                  </Form.Item>
                )}
                <Form.Item label="占宽">
                  {getFieldDecorator('span', {
                    initialValue: lodash.get(flow, 'span'),
                  })(
                    <InputNumber
                      min={0}
                      max={24}
                      precision={0}
                      placeholder="0-24，默认12"
                      style={{ width: 204 }}
                    />
                  )}
                </Form.Item>
                {/* <Form.Item label="所属组名">
              {getFieldDecorator('groupName', {
                initialValue: lodash.get(flow, 'groupName'),
              })(<Input />)}
            </Form.Item> */}
                {this.renderItemFormConfig(flow)}
                <Form.Item label="可以不填">
                  {getFieldDecorator('optional', {
                    initialValue: lodash.get(flow, 'optional'),
                    valuePropName: 'checked',
                  })(<Checkbox />)}
                </Form.Item>
                <Form.Item label="提示说明">
                  {getFieldDecorator('placeholder', {
                    initialValue: lodash.get(flow, 'placeholder'),
                  })(<Input.TextArea allowclear="true" autosize={{ minRows: 2, maxRows: 4 }} />)}
                </Form.Item>
                <Form.Item label="备注">
                  {getFieldDecorator('remark', {
                    initialValue: lodash.get(flow, 'remark'),
                  })(<Input.TextArea autosize={{ minRows: 2, maxRows: 4 }} />)}
                </Form.Item>
                <Form.Item label="显示条件">
                  {getFieldDecorator('dependent.key', {
                    initialValue: lodash.get(flow, 'dependent.key'),
                  })(
                    <Select style={{ width: '100%' }} placeholder="条件标题" allowClear>
                      {/* 依赖条件不显示自己和排在后面的选项，如果不是formList里的表单，也不会显示formList里的条件 */}
                      {treeToFlatData(
                        this.inFormList(flow.key, allFlowData)
                          ? this.getTreeWinthSelfFormList(allFlowData, flow.key)
                          : this.getTreeWithoutFormlist(allFlowData),
                        'key'
                      )
                        .filter((a, index, self) => {
                          let findIndex = self.findIndex(b => b.key === flow.key);
                          if (findIndex === -1) findIndex = Infinity;
                          return ['radio', 'multiple'].includes(a.inputType) && index < findIndex;
                        })
                        .map(item => (
                          <Option key={item.key}>{item.title}</Option>
                        ))}
                    </Select>
                  )}
                  {getFieldDecorator('dependent.option', {
                    initialValue: lodash.get(flow, 'dependent.option'),
                  })(
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="条件选项"
                      allowClear
                    >
                      {this.renderDependentOption(lodash.get(flow, 'dependent.key'))}
                    </Select>
                  )}
                </Form.Item>
              </div>
            </Form>
          </TabPane>
          <TabPane key="高级" tab="高级" forceRender>
            <Form {...formItemLayout}>
              <Form.Item
                label={
                  <>
                    <div>JSON配置&nbsp;&nbsp;</div>
                    <JsonModal
                      src={getJsonConfigTemplate(flow)}
                      onlyView
                      reactJsonApi={{
                        enableClipboard: true,
                      }}
                    >
                      <a>常用模版&nbsp;&nbsp;</a>
                    </JsonModal>
                  </>
                }
                colon={false}
              >
                {getFieldDecorator('json', {
                  initialValue: lodash.get(flow, 'json'),
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        if (value && !isJSON(value)) {
                          callback('不是正确的json格式字符串');
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                  normalize: v => (v || '').replace(/[ \r\n]/g, ''),
                })(
                  <Input.TextArea
                    placeholder="开发人员使用"
                    autosize={{ minRows: 4, maxRows: 8 }}
                  />
                )}
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      );
    }
    return (
      <div className={style.tipText}>
        <Empty description={<span style={{ color: 'grey', fontSize: '16px' }}>请选择表单</span>} />
      </div>
    );
  }
}

export default Form.create({ onFieldsChange })(ItemFormConfig);
