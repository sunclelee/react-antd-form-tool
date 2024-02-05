/* eslint-disable react/require-default-props */
import React, { PureComponent } from 'react';
import { DatePicker } from 'antd';
import PropTypes from 'prop-types';

/* antd3 的DatePicker当mode="year"时无法选择，自定义一个受控的YearPicker */

class YearPicker extends PureComponent {
  state = {
    isopen: false,
  };

  handlePanelChange = value => {
    // console.log(">>>>>", value)
    this.setState({
      isopen: false,
    });
    const { onChange } = this.props;
    if (typeof onChange === 'function') onChange(value);
  };

  handleOpenChange = status => {
    // console.log(status)
    if (status) {
      this.setState({ isopen: true });
    } else {
      this.setState({ isopen: false });
    }
  };

  // 针对allowClear
  handleOnChange = v => {
    const { onChange } = this.props;
    if (!v && typeof onChange === 'function') {
      onChange(null);
    }
  };

  render() {
    const { isopen } = this.state;
    const { value, antdApi } = this.props;
    return (
      <div>
        <DatePicker
          value={value}
          open={isopen}
          mode="year"
          placeholder="请选择年份"
          format="YYYY"
          onOpenChange={this.handleOpenChange}
          onPanelChange={this.handlePanelChange}
          onChange={this.handleOnChange}
          allowClear
          {...antdApi}
        />
      </div>
    );
  }
}

YearPicker.propTypes = {
  // moment对象
  value: PropTypes.object,
  /**
   * 改变事件的回调
   * @param {Object} value - 新的moment对象
   */
  onChange: PropTypes.func,
  // antd的api
  antdApi: PropTypes.object,
};

export default YearPicker;
