/* eslint-disable no-param-reassign */

/**
 * 向表单flow中插入新控件
 * @param {object[]} flow 表单全局flow
 * @param {object} item 待插入的控件
 * @param {string} parentKey 插入的目标container key
 * @param {number} index 插入的目标索引
 */
export const addItemToFlow = (flow, item, parentKey, index) => {
  function addInTree(data) {
    for (let i = 0; i < data.length; i += 1) {
      if (data[i].key === parentKey) {
        if (data[i].children) {
          data[i].children.splice(index, 0, item);
        } else {
          data[i].children = [item];
        }
        break;
      } else if (data[i].children && data[i].children.length) {
        addInTree(data[i].children);
      }
    }
  }
  addInTree(flow);
};

/**
 * 根据标题长度获取Form Label的布局
 * @param {string} title - 标题
 * @returns {Object}
 */
export const getFormItemLayout = title => {
  if (title && title.length >= 12) {
    return {
      labelCol: { span: 10 },
      wrapperCol: { span: 12 },
    };
  }
  return {
    labelCol: { span: 7 },
    wrapperCol: { span: 17 },
  };
};

/**
 * 对长字符串截取
 * @param {string} text
 * @param {number} number
 */
export const ellipsisText = (text, number) =>
  text.length >= number ? `${text.slice(0, number)}...` : text;

/**
 * 获取激活状态的样式
 * @param {boolean} value
 * @returns
 */
export const getActiveItemStyle = value => {
  if (value) {
    return {
      display: 'flex',
      backgroundColor: 'snow',
      border: '2px solid rebeccapurple',
    };
  }
  return { display: 'flex' };
};

/**
 * 根据控件配置生成常用JSON配置模版
 * @param {Object} flow
 * @returns {Object}
 */
export const getJsonConfigTemplate = flow => {
  const r = {};
  switch (flow?.inputType) {
    case 'radio':
    case 'multiple': {
      r.fetchListArray = {
        interface: '',
        queryCondition: {},
        dataField: '',
        valueField: '',
        textField: '',
      };
      break;
    }
    default:
  }
  switch (flow?.inputType) {
    case 'text':
    case 'number':
    case 'radio':
    case 'multiple': {
      r.relateMapGraphic = {
        enable: true,
        extraFlow: [],
      };
      break;
    }
    default:
  }
  return r;
};
