/* eslint-disable import/no-extraneous-dependencies */
import React, { PureComponent } from 'react';
import { Modal, Form, Row, message } from 'antd';
import GenerateFormFromFlow from '@/components/GenerateFormFromFlow';

class PreViewFlowFormModal extends PureComponent {
  state = {
    visible: false,
  };

  showModal = () => {
    const { judgeFlow, flows } = this.props;
    const validError = judgeFlow && judgeFlow(flows);
    if (validError && validError !== '编码必须唯一！') {
      message.error(validError);
    } else if (validError === '编码必须唯一！') {
      Modal.confirm({
        title: '检测到有编码重复，是否继续预览?',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.setState({ visible: true });
        },
      });
    } else {
      this.setState({ visible: true });
    }
  };

  closeModal = () => {
    this.setState({ visible: false });
  };

  handleSubmit = () => {
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        message.success('表单验证通过，详情可查看控制台');
        console.log('表单值', values);
      }
    });
  };

  render() {
    const { children, flows, form } = this.props;
    const { visible } = this.state;
    return (
      <React.Fragment>
        <span onClick={this.showModal}>{children}</span>
        <Modal
          width={1000}
          title="表单预览"
          visible={visible}
          onCancel={this.closeModal}
          onOk={this.handleSubmit}
          destroyOnClose
          okText="表单校验"
          cancelText="关闭"
          style={{ top: 50 }}
        >
          <Row gutter={36}>
            <Form layout="horizontal" colon={false}>
              {(flows || []).map(flow => (
                <GenerateFormFromFlow
                  key={flow.key}
                  formFlowArray={flows}
                  flow={flow}
                  form={form}
                  myStyle={{ width: '100%' }}
                />
              ))}
            </Form>
          </Row>
        </Modal>
      </React.Fragment>
    );
  }
}

export default Form.create()(PreViewFlowFormModal);
