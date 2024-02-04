import React, { Component } from 'react';
import { Modal } from 'antd';
import ReactJson from 'react-json-view';
import PropTypes from 'prop-types';

class JsonModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      src: {},
    };
  }

  showModal = e => {
    if (e) e.stopPropagation();
    const { src } = this.props;
    this.setState({
      visible: true,
      src,
    });
  };

  closeModal = () => {
    this.setState({ visible: false, src: {} });
  };

  submitHandle = () => {
    const { onConfirm } = this.props;
    const { src } = this.state;
    if (onConfirm) onConfirm(src);
    this.closeModal();
  };

  render() {
    const { title, children, onlyView, reactJsonApi } = this.props;
    const { visible, src } = this.state;
    return (
      <React.Fragment>
        <span onClick={this.showModal}>{children}</span>
        <Modal
          title={title}
          width={1000}
          visible={visible}
          onCancel={this.closeModal}
          onOk={this.submitHandle}
          style={{ top: 50 }}
          bodyStyle={{ overflow: 'auto', maxHeight: 'calc(100vh - 100px)' }}
          destroyOnClose
          okButtonProps={{ size: 'small' }}
          cancelButtonProps={{ size: 'small' }}
          maskClosable={false}
          footer={onlyView ? null : undefined}
        >
          <ReactJson
            src={src}
            name={false}
            iconStyle="circle"
            enableClipboard={false}
            displayDataTypes={false}
            displayObjectSize={false}
            collapseStringsAfterLength={60}
            onEdit={
              onlyView
                ? false
                : e => {
                    this.setState({ src: e.updated_src });
                  }
            }
            onDelete={
              onlyView
                ? false
                : e => {
                    this.setState({ src: e.updated_src });
                  }
            }
            onAdd={
              onlyView
                ? false
                : e => {
                    this.setState({ src: e.updated_src });
                  }
            }
            {...reactJsonApi}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

JsonModal.defaultProps = {
  src: [],
  onlyView: true,
};

JsonModal.propTypes = {
  /**
   * 数据源
   */
  src: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  /**
   * 标题，可传字符串或者React组件
   */
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  /**
   * 是否只读
   */
  onlyView: PropTypes.bool,
  /**
   * 点击确认的回调: src => {}
   */
  onConfirm: PropTypes.func,
  /**
   * react-json-view原库的API参数
   */
  reactJsonApi: PropTypes.object,
};

export default JsonModal;
