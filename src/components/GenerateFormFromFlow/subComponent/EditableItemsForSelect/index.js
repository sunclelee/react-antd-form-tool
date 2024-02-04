/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from 'antd';
import lodash from 'lodash';
import sortable from 'sortablejs';
import { reorderArray } from '@/utils/common';
import style from './index.less';

/* 可拖拽的选项内容 */

class EditableItemsForSelect extends React.PureComponent {
  state = {};

  componentDidMount() {
    const div = document.querySelector('#sortableForCellSelect');
    if (div) {
      sortable.create(div, {
        handle: '.tragHandleForEditableItemsForSelect',
        onUpdate: this.updateSort,
        chosenClass: style.sortableChosen,
      });
    }
  }

  updateSort = e => {
    const { setFieldsValue, fieldName = 'list', list } = this.props;
    const { oldIndex, newIndex } = e;
    if (oldIndex === newIndex) return;
    setFieldsValue({
      [fieldName]: reorderArray(list, oldIndex, newIndex),
    });
  };

  addItem = () => {
    const { setFieldsValue, fieldName = 'list', list } = this.props;
    setFieldsValue({
      [fieldName]: [...list, { text: '', value: '', tempId: lodash.uniqueId() }],
    });
  };

  deleteItem = index => {
    const { setFieldsValue, fieldName = 'list', list } = this.props;
    setFieldsValue({
      [fieldName]: list.filter((l, n) => n !== index),
    });
  };

  inputChange = (e, index, key) => {
    const { setFieldsValue, fieldName = 'list', list } = this.props;
    setFieldsValue({
      [fieldName]: list.map((l, num) => {
        if (num === index) {
          return { ...l, [key]: lodash.trim(e.target.value) };
        }
        return l;
      }),
    });
  };

  render() {
    // const { inputVisible, inputValue, inputCode } = this.state;
    const { list, showTitle } = this.props;
    return (
      <React.Fragment>
        <div>
          {showTitle && <span>选项内容</span>}
          <Button
            size="small"
            icon="plus"
            onClick={this.addItem}
            type="dashed"
            style={{ marginLeft: 12 }}
          >
            增加选项
          </Button>
        </div>
        <div id="sortableForCellSelect">
          {list.map((item, index) => (
            <div
              key={item.tempId || lodash.uniqueId()} // 最好还是固定key，否则每次渲染都会失去input焦点
              style={{
                width: showTitle ? '125%' : undefined,
                display: 'flex',
                position: 'relative',
                padding: '4px 4px 4px 0',
              }}
            >
              <Input
                size="small"
                placeholder={`key${index + 1}`}
                style={{ width: 80, marginRight: 8 }}
                value={item.value}
                onChange={e => this.inputChange(e, index, 'value')}
              />
              <Input
                size="small"
                placeholder={`value${index + 1}`}
                style={{ width: 180 }}
                value={item.text}
                onChange={e => this.inputChange(e, index, 'text')}
              />
              <Button
                icon="menu"
                size="small"
                type="link"
                className="tragHandleForEditableItemsForSelect"
                style={{ color: 'slateblue', cursor: 'move', margin: '0 5px 0 15px' }}
              />
              <Button
                icon="close"
                size="small"
                onClick={() => this.deleteItem(index)}
                type="link"
                style={{ color: 'red' }}
              />
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

EditableItemsForSelect.defaultProps = {
  showTitle: true,
  list: [],
};

EditableItemsForSelect.propTypes = {
  /**
   * form的setFieldsValue方法
   */
  setFieldsValue: PropTypes.func.isRequired,
  /**
   * 字段名
   */
  fieldName: PropTypes.string.isRequired,
  /**
   * 源数据
   */
  list: PropTypes.array,
  /**
   * 是否显示标题
   */
  showTitle: PropTypes.bool,
};

export default EditableItemsForSelect;
