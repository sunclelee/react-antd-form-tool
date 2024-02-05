/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Tooltip, Icon } from 'antd';

/**
 * 渲染表单标题
 * @param {boolean} hideTitle - 是否隐藏标题
 * @param {string} title - 标题文字
 * @param {string} remark - 说明文字
 * @returns {string|ReactDOM}
 */
export const renderFormItemLabel = (hideTitle, title, remark) => {
  if (hideTitle) return null;
  if (!remark) return title;
  return (
    <>
      <span>{title}</span>
      <Tooltip title={remark}>
        <Icon
          type="info-circle"
          theme="filled"
          style={{ color: 'cornflowerblue', position: 'relative', top: 12, marginLeft: 5 }}
        />
      </Tooltip>
    </>
  );
};
