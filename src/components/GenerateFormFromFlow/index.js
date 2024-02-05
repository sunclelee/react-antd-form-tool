/* eslint-disable react/require-default-props */
/* eslint-disable import/extensions */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-eval */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
import React, { PureComponent } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Divider,
  Button,
  Tooltip,
  Col,
  Checkbox,
  Cascader,
  DatePicker,
  Switch,
} from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import _intersection from 'lodash/intersection';
import _range from 'lodash/range';
import { treeToFlatData, JSONparse, checkCascaderOptionIsValid } from '@/utils/common';
import { renderFormItemLabel } from './func';
import YearPicker from './subComponent/YearPicker';
import RichTextEditer from './subComponent/RichTextEditor';
import RadioCom from './subComponent/RadioCom';

/* ------ 根据通用配置里的flow 一条object生成表单 ------ */

class GenerateFormFromFlow extends PureComponent {
  state = {
    formListRowNum: 1,
  };

  flatAllFlows = []; // 摊平的配置表

  show = true; // 本条表单是否显示

  componentWillMount() {
    const { formFlowArray = [] } = this.props;
    this.flatAllFlows = treeToFlatData(formFlowArray, 'key');
  }

  componentDidMount() {
    const { flow, record = {} } = this.props;
    if (flow && flow.inputType === 'formList') {
      if (record[flow.code]) {
        // 如果有record，以record的formList条数为准
        this.setState({
          formListRowNum: _get(record, flow.code, []).length,
        });
      }
    }
  }

  componentDidUpdate() {
    const {
      flow = {},
      form: { setFieldsValue, getFieldValue },
    } = this.props;
    if (
      _get(flow, 'dependent.key') &&
      _get(flow, 'dependent.option') &&
      ['radio'].includes(_get(flow, 'inputType'))
    ) {
      // 针对有code相同的两个单选项，并且有显示条件，很可能出现切换显示条件后，该字段值不在单选列表里，这种时候需要设置单选值为空
      if (
        getFieldValue(flow.code) &&
        this.show &&
        !(flow.listArray || []).find(l => l.value === getFieldValue(flow.code))
      ) {
        setFieldsValue({ [flow.code]: undefined });
      }
    }
  }

  addFormListRow = () => {
    const { formListRowNum } = this.state;
    this.setState({ formListRowNum: formListRowNum + 1 });
  };

  deleteFormListRow = (index, code, flow) => {
    const {
      form: { getFieldValue, setFieldsValue },
    } = this.props;
    const newList = (getFieldValue(code) || []).filter((_, i) => i !== index);
    const { formListRowNum } = this.state;
    this.setState({ formListRowNum: formListRowNum - 1 }, () => {
      // 删除一条数据后，需要对存在的数据重新排序
      const newValue = {};
      newList.forEach((l, i) => {
        _get(flow, 'children', []).forEach(f => {
          newValue[`${code}[${i}]${f.code}`] = _get(l, f.code);
        });
      });
      setFieldsValue({ ...newValue });
    });
  };

  cascaderChange = (cascaderArray, flow) => {
    const {
      form: { setFieldsValue },
    } = this.props;
    const { from, code } = flow;
    const splitField = _get(flow, 'splitField', '')
      .split(',')
      .filter(i => !!i);
    const newValue = splitField.reduce((acc, item, index) => {
      acc[from === 'formList' ? `${code.split(']')[0]}]${item}` : item] = cascaderArray[index];
      return acc;
    }, {});
    setFieldsValue({ ...newValue });
  };

  inFormList = (key, allFlowData) => {
    const flat = treeToFlatData(allFlowData, 'key');
    const hitChild = flat.find(f => f.key === key);
    if (hitChild) {
      const hitFather = flat.find(f => f.key === hitChild.parent);
      return _get(hitFather, 'inputType') === 'formList';
    }
    return false;
  };

  getAutoFillContent = (flow, allFlowData) => {
    const {
      form: { getFieldValue },
    } = this.props;
    const { dealRange, json } = flow;
    const flat = treeToFlatData(allFlowData, 'key');
    const dealFuncStr = _get(JSONparse(json || '{}', {}), 'dealFunc');
    if (!Array.isArray(dealRange)) return '';
    const array = dealRange.map(key => {
      const hit = flat.find(f => f.key === key);
      if (hit) {
        const rangeInFormList = this.inFormList(key, allFlowData);
        if (rangeInFormList) {
          // 如果处理范围是在数组表单，那自动填充和其处理范围应该在同一个数组表单里才是有意义的
          const split = flow.code.split(']');
          split[split.length - 1] = hit.code;
          return getFieldValue(split.join(']'));
        }
        return getFieldValue(_get(hit, 'code', ''));
      }
      return '';
    });
    try {
      const dealFunc = eval(dealFuncStr);
      return dealFunc(array);
    } catch (err) {
      console.error(err);
      return '';
    }
  };

  checkFileIsEmpty = (_, value, callback) => {
    if (JSONparse(value).length === 0) {
      callback('请上传文件');
    } else {
      callback();
    }
  };

  // 重置自定义组件
  resetCustomCom = fieldName => {
    const {
      flow,
      form: { resetFields },
    } = this.props;
    switch (flow?.inputType) {
      case 'photo': {
        resetFields(fieldName);
        if (this.uploadPicWithDirectionIns?.clearPic) this.uploadPicWithDirectionIns.clearPic();
        break;
      }
      default:
    }
  };

  renderItem = flow => {
    const {
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      record,
      readOnly = false,
      myStyle = {},
      formFlowArray,
    } = this.props;
    const {
      code,
      key,
      inputType,
      style,
      title,
      defaultValue,
      optional = false,
      placeholder,
      precision = 2,
      hideTitle = false, // 数组表单会用到这个值
      dependent,
      remark,
    } = flow;
    const span = _get(flow, 'span', 12) || 12; // span可能会有null的情况
    const rules = [];
    // 先看依赖是否成立
    this.show = true;
    if (dependent && dependent.key && dependent.option) {
      const hit = this.flatAllFlows.find(i => i.key === dependent.key);
      if (hit) {
        if (flow.from === 'formList' && this.inFormList(hit.key, formFlowArray)) {
          // 如果显示条件是formList的字段，则需要特殊处理
          this.show = dependent.option.includes(getFieldValue(`${code.split(']')[0]}]${hit.code}`));
          if (!this.show) {
            return (
              <Col key={key} span={span}>
                <Form.Item label={renderFormItemLabel(hideTitle, title, remark)} />
              </Col>
            );
          }
        } else {
          this.show = Array.isArray(dependent.option)
            ? // 依赖的条件有可能是一个单选也可能是一个多选，所以两种情况都考虑，但本身dependent.option是一个数组
              !!(
                _intersection(dependent.option, getFieldValue(hit.code)).length ||
                _intersection(dependent.option, [getFieldValue(hit.code)]).length
              )
            : getFieldValue(hit.code) === dependent.option;
        }
      }
    }
    if (!this.show) return null;
    try {
      if (!optional) rules.push({ required: true, message: `请输入${title}` });
      if (inputType === 'text') {
        if (_get(flow, 'textType') === '多行文本') {
          return (
            <Col key={key} span={span}>
              <Form.Item label={renderFormItemLabel(hideTitle, title, remark)}>
                {getFieldDecorator(code, {
                  initialValue: record ? _get(record, code, '') : defaultValue,
                  rules,
                })(
                  <Input.TextArea
                    disabled={readOnly}
                    placeholder={placeholder}
                    rows={2}
                    allowclear="true"
                    style={myStyle}
                  />
                )}
              </Form.Item>
            </Col>
          );
        }
        return (
          <Col key={key} span={span}>
            <Form.Item label={renderFormItemLabel(hideTitle, title, remark)} key={key}>
              {getFieldDecorator(code, {
                initialValue: record ? _get(record, code, '') : defaultValue,
                rules,
              })(<Input readOnly={readOnly} style={myStyle} placeholder={placeholder} />)}
            </Form.Item>
          </Col>
        );
      }
      if (inputType === 'richText') {
        return <RichTextEditer key={key} {...this.props} />;
      }
      if (inputType === 'number') {
        const { unit = '' } = flow;
        const unitDesc = unit && `（${unit}）`;
        return (
          <Col key={key} span={span}>
            <Form.Item
              label={renderFormItemLabel(hideTitle, `${title}${unitDesc}`, remark)}
              key={key}
            >
              {getFieldDecorator(code, {
                initialValue: record ? _get(record, code, null) : defaultValue,
                rules,
              })(
                <InputNumber
                  readOnly={readOnly}
                  precision={precision}
                  placeholder={placeholder}
                  min={flow.min === null ? undefined : flow.min}
                  max={flow.max === null ? undefined : flow.max}
                  style={myStyle}
                />
              )}
            </Form.Item>
          </Col>
        );
      }
      if (inputType === 'switch') {
        const { checkedText, unCheckedText } = flow;
        return (
          <Col key={key} span={span}>
            <Form.Item label={renderFormItemLabel(hideTitle, title, remark)} key={key}>
              {getFieldDecorator(code, {
                initialValue: record ? !!_get(record, code) : !!defaultValue,
                rules,
                valuePropName: 'checked',
              })(
                <Switch
                  disabled={readOnly}
                  checkedChildren={checkedText}
                  unCheckedChildren={unCheckedText}
                />
              )}
            </Form.Item>
          </Col>
        );
      }
      if (inputType === 'multiple') {
        const list = _get(flow, 'listArray', []) || [];
        let initialValue;
        if (record) {
          initialValue = _get(record, code);
        } else if (Array.isArray(defaultValue)) {
          initialValue = defaultValue;
        } else {
          initialValue = defaultValue ? [defaultValue] : [];
        }
        if (style === '按钮') {
          return (
            <Col key={key} span={span}>
              <Form.Item label={renderFormItemLabel(hideTitle, title, remark)}>
                {getFieldDecorator(code, {
                  initialValue,
                  rules,
                })(
                  <Checkbox.Group disabled={readOnly}>
                    {(list || []).map(l => (
                      <Checkbox key={l.value} value={l.value}>
                        {l.text}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                )}
              </Form.Item>
            </Col>
          );
        }
        const { searchEnable } = flow;
        return (
          <Col key={key} span={span}>
            <Form.Item label={renderFormItemLabel(hideTitle, title, remark)}>
              {getFieldDecorator(code, {
                initialValue,
                rules,
              })(
                <Select
                  mode="multiple"
                  placeholder={placeholder}
                  style={myStyle}
                  disabled={readOnly}
                  allowClear
                  showSearch={!!searchEnable}
                  filterOption={
                    searchEnable
                      ? (input, option) => {
                          const children = _get(option, 'props.children', '');
                          if (!Array.isArray(children)) {
                            return children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                          }
                          return false;
                        }
                      : undefined
                  }
                >
                  {(list || []).map(l => (
                    <Select.Option key={l.value} value={l.value}>
                      {l.text}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        );
      }
      if (inputType === 'date') {
        let DateComponent;
        const dateParam = {
          disabled: readOnly,
          placeholder,
          style: myStyle,
        };
        switch (style) {
          case '月':
            DateComponent = (
              <DatePicker.MonthPicker
                {...dateParam}
                onChange={v => setFieldsValue({ [code]: v ? v.format('YYYY-MM') : '' })}
              />
            );
            break;
          case '年':
            // 年组件无法选中，需要自定义处理
            DateComponent = (
              <YearPicker
                {...dateParam}
                onChange={v =>
                  setFieldsValue({
                    [code]: v ? v.format('YYYY') : '',
                    [`tempField.${code}`]: v,
                  })
                }
              />
            );
            break;
          case '秒':
            DateComponent = (
              <DatePicker
                {...dateParam}
                showTime
                onChange={v => setFieldsValue({ [code]: v ? v.format('YYYY-MM-DD HH:mm:ss') : '' })}
              />
            );
            break;
          case '日':
          default:
            DateComponent = (
              <DatePicker
                {...dateParam}
                onChange={v => setFieldsValue({ [code]: v ? v.format('YYYY-MM-DD') : '' })}
              />
            );
        }
        return (
          <Col key={key} span={span}>
            <Form.Item label={renderFormItemLabel(hideTitle, title, remark)}>
              {getFieldDecorator(`tempField.${code}`, {
                initialValue: _get(record, code) ? moment(_get(record, code)) : null,
                rules,
              })(DateComponent)}
            </Form.Item>
            {/* 日期框要自动转成字符串，加一个隐藏的文本框来实现 */}
            {getFieldDecorator(code, {
              initialValue: record ? _get(record, code) : '',
            })(<Input style={{ display: 'none' }} />)}
          </Col>
        );
      }
      if (inputType === 'radio') {
        return <RadioCom key={key} {...this.props} flow={flow} rules={rules} />;
      }
      if (inputType === 'container') {
        const { showTitle } = flow;
        return (
          <Col key={key} span={span}>
            {showTitle && (
              <Divider type="horizontal" orientation="left">
                {flow.title}
              </Divider>
            )}
            {_get(flow, 'children', []).map(f => this.renderItem(f))}
          </Col>
        );
      }
      if (inputType === 'formList') {
        const { formListRowNum } = this.state;
        return (
          <>
            <Divider type="horizontal" orientation="left">
              {flow.title}
            </Divider>
            <Col span={24} style={{ overflow: 'auto' }}>
              {_range(0, formListRowNum).map((row, i) => {
                const deleteButton = (
                  <Tooltip title="删除此行">
                    <Button
                      type="link"
                      icon="delete"
                      onClick={() => this.deleteFormListRow(row, code, flow)}
                    />
                  </Tooltip>
                );
                return (
                  <Col key={row} span={24} style={{ display: 'flex' }}>
                    {_get(flow, 'children', []).map(f =>
                      this.renderItem({
                        ...f,
                        code: `${code}[${row}]${f.code}`,
                        span: (f.span || 12) - 1, // 留点位置给按钮
                        hideTitle: !(i === 0), // 数组表单只有第一行显示标题
                        from: 'formList',
                      })
                    )}
                    <Col span={1}>
                      {i === 0 ? (
                        <Form.Item label="操作" style={{ marginBottom: 0 }}>
                          {deleteButton}
                        </Form.Item>
                      ) : (
                        deleteButton
                      )}
                    </Col>
                  </Col>
                );
              })}
            </Col>
            <Col span={24}>
              <Button
                type="dashed"
                block
                onClick={this.addFormListRow}
                style={{ width: '30%', marginBottom: 12 }}
              >
                增加一行
              </Button>
            </Col>
          </>
        );
      }
      if (inputType === 'cascader') {
        const { options = '[]', from } = flow;
        const splitField = _get(flow, 'splitField', '')
          .split(',')
          .filter(i => !!i);
        let initialValue = defaultValue || [];
        if (record) {
          if (splitField.length) {
            initialValue = splitField.map(s => _get(record, s, ''));
          } else {
            initialValue = _get(record, code, []);
          }
        }
        return (
          <Col key={key} span={span}>
            <Form.Item label={renderFormItemLabel(hideTitle, title, remark)} key={key}>
              {/* tempField是不需要给服务器的，用于校验 */}
              {getFieldDecorator(code, {
                initialValue,
                rules,
              })(
                <Cascader
                  disabled={readOnly}
                  options={
                    checkCascaderOptionIsValid(null, options) ? JSONparse(options || '[]') : []
                  }
                  placeholder={placeholder}
                  style={myStyle}
                  onChange={array => {
                    if (splitField.length > 0) this.cascaderChange(array, flow);
                  }}
                  allowClear
                />
              )}
            </Form.Item>
            {/* form获取表单内容时必须要有实例，所以加上隐藏的Select */}
            {splitField.map((c, index) => {
              const splitCode = from === 'formList' ? `${code.split(']')[0]}]${c}` : c;
              return getFieldDecorator(splitCode, {
                initialValue: record ? _get(record, splitCode) : _get(defaultValue, index),
              })(<Select key={c} style={{ display: 'none' }} />);
            })}
          </Col>
        );
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  render() {
    const { flow = {} } = this.props;
    return this.renderItem(flow);
  }
}

GenerateFormFromFlow.propTypes = {
  record: PropTypes.object, // record有值代表修改，无值代表新增
  form: PropTypes.object,
  flow: PropTypes.object,
  myStyle: PropTypes.object,
  readOnly: PropTypes.bool,
  formFlowArray: PropTypes.array, // 所有的flows
};

export default GenerateFormFromFlow;
