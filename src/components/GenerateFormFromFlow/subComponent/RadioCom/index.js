import React, { PureComponent } from 'react';
import { Button, Col, Form, Input, Radio, Select, Icon } from 'antd';
import _get from 'lodash/get';
import _uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';
import { renderFormItemLabel } from '../../func';

class RadioCom extends PureComponent {
  state = {
    manualInput: false,
  };

  toggitManualInput = () => {
    const { manualInput } = this.state;
    this.setState({ manualInput: !manualInput });
  };

  /**
   * 如果开启了手动输入，就把手动输入的值也放在list里供选择组件使用
   * @param {Array} list
   * @param {string} code
   * @returns {Array}
   */
  appendList = (list, code) => {
    const { record, flow } = this.props;
    const {
      form: { getFieldValue },
    } = this.props;
    if (flow?.allowManualInput) {
      return _uniqBy(
        [
          ...list,
          { value: _get(record, code), text: _get(record, code) },
          { value: getFieldValue(code), text: getFieldValue(code) },
        ].filter(i => !!i.value),
        'value'
      );
    }
    return list || [];
  };

  clearSelect = () => {
    const {
      form: { setFieldsValue },
      flow,
    } = this.props;
    setFieldsValue({ [flow.code]: '' });
  };

  render() {
    const {
      flow,
      form: { getFieldDecorator },
      myStyle,
      rules,
      record,
      readOnly,
    } = this.props;
    const {
      code,
      key,
      style,
      title,
      defaultValue,
      placeholder,
      hideTitle = false, // 数组表单会用到这个值
      span = 12,
      allowManualInput,
      remark,
      optional,
    } = flow;
    const { manualInput } = this.state;
    const list = _get(flow, 'listArray', []) || [];
    const toggitButton = allowManualInput && (
      <Button
        icon={!manualInput ? 'edit' : 'select'}
        type="link"
        onClick={this.toggitManualInput}
        title={!manualInput ? '切换到文本输入' : '切换到选项选择'}
      />
    );
    // 把切换按钮的位置留出来
    const width = allowManualInput && myStyle?.width ? `calc(${myStyle.width} - 50px)` : undefined;
    if (manualInput) {
      return (
        <Col key={key} span={span}>
          <Form.Item label={renderFormItemLabel(hideTitle, title, remark)}>
            {getFieldDecorator(code, {
              initialValue: '',
              rules,
            })(<Input style={{ ...myStyle, width }} />)}
            {toggitButton}
          </Form.Item>
        </Col>
      );
    }
    if (style === '按钮') {
      return (
        <Col key={key} span={span}>
          <Form.Item label={renderFormItemLabel(hideTitle, title, remark)}>
            {getFieldDecorator(code, {
              initialValue: record ? _get(record, code) : defaultValue,
              rules,
            })(
              <Radio.Group buttonStyle="solid" disabled={readOnly}>
                {this.appendList(list, code).map(l => (
                  <Radio.Button key={l.value} value={l.value}>
                    {l.text}
                  </Radio.Button>
                ))}
              </Radio.Group>
            )}
            {toggitButton}
            {optional && (
              <Icon
                onClick={this.clearSelect}
                type="close-circle"
                theme="filled"
                style={{ color: 'gray', marginLeft: 10 }}
              />
            )}
          </Form.Item>
        </Col>
      );
    }
    const { searchEnable } = flow;
    return (
      <Col key={key} span={span}>
        <Form.Item label={renderFormItemLabel(hideTitle, title, remark)} key={key}>
          {getFieldDecorator(code, {
            initialValue: record ? _get(record, code) : defaultValue,
            rules,
          })(
            <Select
              placeholder={placeholder}
              style={{ ...myStyle, width }}
              disabled={readOnly}
              allowClear
              showSearch={!!searchEnable}
              filterOption={
                searchEnable
                  ? (input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  : undefined
              }
            >
              {this.appendList(list, code).map(l => (
                <Select.Option key={l.value} value={l.value}>
                  {l.text}
                </Select.Option>
              ))}
            </Select>
          )}
          {toggitButton}
        </Form.Item>
      </Col>
    );
  }
}

RadioCom.defaultProps = {
  readOnly: false,
  myStyle: {},
  record: {},
};

RadioCom.propTypes = {
  flow: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  readOnly: PropTypes.bool,
  myStyle: PropTypes.shape({
    width: PropTypes.string, // 如果width是数字那么当allowManualInput为真时无法计算正确宽度
  }),
  record: PropTypes.object,
};

export default RadioCom;
