/* eslint-disable react/require-default-props */
/* eslint-disable import/no-extraneous-dependencies */
import React, { PureComponent } from 'react';
import { Col, Form, Input, message } from 'antd';
import _get from 'lodash/get';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/index.css';
import PropTypes from 'prop-types';
import config from './config';
import { renderFormItemLabel } from '../../func';

class RichTextEditer extends PureComponent {
  state = {};

  editorInstance = null; // 编辑器实例

  editorChange = editerState => {
    const {
      form: { setFieldsValue },
      flow: { code },
    } = this.props;
    setFieldsValue({
      [code]: editerState.toHTML(),
    });
  };

  validateFn = file => {
    const { flow } = this.props;
    const mediaMaxSize = _get(flow, 'mediaMaxSize', 5);
    const valid = file.size <= 1024 * 1024 * mediaMaxSize;
    if (!valid) message.warn(`文件大小不能超过${mediaMaxSize}MB`);
    return valid;
  };

  render() {
    const {
      form: { getFieldDecorator },
      flow = {},
      record,
      readOnly,
      braftEditorApi,
    } = this.props;
    const {
      code,
      title,
      controls = [],
      placeholder,
      optional,
      height = 168,
      span = 24,
      remark,
    } = flow;
    const html = record ? _get(record, code, '') : '';
    const rules = [];
    if (!optional) {
      rules.push({
        required: true,
        validator: (_, value, callback) => {
          if (value.isEmpty()) {
            callback(`请输入${title}内容`);
          } else {
            callback();
          }
        },
      });
    }
    return (
      <React.Fragment>
        <Col span={span}>
          <Form.Item label={renderFormItemLabel(false, title, remark)}>
            {getFieldDecorator(`tempField.${code}`, {
              initialValue: BraftEditor.createEditorState(html),
              rules,
            })(
              <BraftEditor
                {...config.BraftEditorParams}
                contentStyle={{ height }}
                placeholder={placeholder}
                readOnly={readOnly}
                onChange={this.editorChange}
                controls={config.BraftEditorParams.controls.filter(
                  i => i === 'separator' || controls.includes(i)
                )}
                media={{
                  ...config.BraftEditorParams.media,
                  validateFn: this.validateFn,
                }}
                ref={instance => {
                  this.editorInstance = instance;
                }}
                {...braftEditorApi}
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator(code, {
              initialValue: record ? _get(record, code, '') : '',
            })(<Input style={{ display: 'none' }} />)}
          </Form.Item>
        </Col>
      </React.Fragment>
    );
  }
}

RichTextEditer.defaultProps = {
  readOnly: false,
};

RichTextEditer.propTypes = {
  // flow配置
  flow: PropTypes.object.isRequired,
  // 数据
  record: PropTypes.object,
  // 是否只读
  readOnly: PropTypes.bool,
  // antd的form对象
  form: PropTypes.object,
  // BraftEditor组件的api
  braftEditorApi: PropTypes.object,
};

export default RichTextEditer;
