/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import uuid4 from 'uuid/v4';
import _get from 'lodash/get';
import _set from 'lodash/set';
import _trim from 'lodash/trim';
import _cloneDeep from 'lodash/cloneDeep';
import { Divider, Modal, Tree, Input, Button, Popconfirm, message } from 'antd';
import { operateTree, checkCascaderOptionIsValid } from '@/utils/common';

const { TreeNode } = Tree;

/**
 * tree组件需要唯一的key，用uuid实现
 * @param {[]object} treeOption
 * @param {string} action 'add' | 'remove'
 */
const operateUuidForTree = (treeOption, action) => {
  if (Array.isArray(treeOption)) {
    for (let i = treeOption.length - 1; i >= 0; i -= 1) {
      if (action === 'add') {
        if (!treeOption[i].uuid) _set(treeOption[i], 'uuid', uuid4());
      } else {
        delete treeOption[i].uuid;
      }
      if (treeOption[i].children) {
        if (treeOption[i].children.length > 0) operateUuidForTree(treeOption[i].children, action);
        // children如果是空数组不保留
        else delete treeOption[i].children;
      }
    }
  }
};

class CascaderOptionTree extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      cascaderOption: [],
      selectedKeys: [],
      editingKey: '', // 正在编辑的节点key
    };
  }

  showModal = e => {
    if (e) e.stopPropagation();
    const { src } = this.props;
    const cascaderOption = [
      {
        value: 'root',
        label: '级联关系',
        uuid: 'root',
        children: src,
      },
    ];
    operateUuidForTree(cascaderOption, 'add');
    this.setState({
      visible: true,
      cascaderOption,
      selectedKeys: [],
      editingKey: '',
    });
  };

  closeModal = () => {
    this.setState({ visible: false, cascaderOption: [], selectedKeys: [], editingKey: '' });
  };

  submitHandle = () => {
    const { onConfirm } = this.props;
    const { cascaderOption } = this.state;
    const optionIsValid = checkCascaderOptionIsValid(
      undefined,
      JSON.stringify(cascaderOption) || '[]',
      msg => {
        if (msg) message.error(msg);
      }
    );
    if (!optionIsValid) return;
    operateUuidForTree(cascaderOption, 'remove');
    if (onConfirm) onConfirm(_get(cascaderOption, '[0].children', []));
    this.closeModal();
  };

  onSelect = selectedKeys => {
    // 不能什么都不选
    if (selectedKeys && selectedKeys.length > 0) {
      this.setState({ selectedKeys, editingKey: '' });
    }
  };

  /**
   * 改变cascaderOption
   * @param {object} node - 节点数据
   * @param {string} action - 操作
   * @param {object} data - 新数据
   */
  changeOption = (node, action, data) => {
    const { cascaderOption } = this.state;
    switch (action) {
      case 'del':
      case 'append':
        operateTree(action, cascaderOption, data, 'uuid', node.uuid, true);
        break;
      case 'addChildren': {
        const children = node.children || [];
        children.push({
          label: `value${children.length + 1}`,
          value: `key${children.length + 1}`,
          uuid: uuid4(),
        });
        operateTree(action, cascaderOption, children, 'uuid', node.uuid, true);
        break;
      }
      default:
    }
    this.setState({ cascaderOption: [...cascaderOption] });
  };

  renderNodeTitle = data => {
    const { selectedKeys, editingKey } = this.state;
    let left;
    if (data.uuid === 'root') {
      left = <b>{data.label}</b>;
    } else {
      left =
        editingKey === data.uuid ? (
          <>
            <Input
              size="small"
              style={{ width: 100 }}
              value={data.value}
              onChange={e => {
                this.changeOption(data, 'append', { value: _trim(e.target.value) });
              }}
            />
            <Divider type="vertical" />
            <Input
              size="small"
              style={{ width: 200 }}
              value={data.label}
              onChange={e => {
                this.changeOption(data, 'append', { label: _trim(e.target.value) });
              }}
            />
          </>
        ) : (
          <>
            {data.value}
            <Divider type="vertical" />
            {data.label}
          </>
        );
    }
    const right = selectedKeys.includes(data.uuid) ? (
      <span style={{ marginLeft: 18 }}>
        <Button
          size="small"
          type="link"
          icon="plus"
          onClick={() => {
            this.changeOption(data, 'addChildren');
          }}
        />
        <Button
          size="small"
          type="link"
          icon="edit"
          onClick={() => this.setState({ editingKey: data.uuid })}
          disabled={data.uuid === 'root'}
        />
        <Popconfirm
          title="确认删除此节点?"
          placement="right"
          onConfirm={() => {
            this.changeOption(data, 'del');
          }}
          disabled={data.uuid === 'root'}
        >
          <Button
            size="small"
            type="link"
            icon="delete"
            style={{ color: data.uuid === 'root' ? 'gray' : 'indianred' }}
            disabled={data.uuid === 'root'}
          />
        </Popconfirm>
      </span>
    ) : null;
    return (
      <>
        {left}
        {right}
      </>
    );
  };

  renderTreeNodes = data =>
    data.map(item => {
      const title = this.renderNodeTitle(item);
      if (item.children && item.children.length) {
        return (
          <TreeNode title={title} key={item.uuid} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.uuid} title={title} dataRef={item} />;
    });

  onDrop = info => {
    const dropData = info.node.props.dataRef;
    const dragData = info.dragNode.props.dataRef;
    const moveData = _cloneDeep(dragData);
    // 原有节点换一个uuid,避免删除时把移动后的节点给删了
    dragData.uuid = uuid4();
    const { cascaderOption } = this.state;
    // 先删再加，否则因为uuid相同会被一起删除
    if (!info.dropToGap) {
      // 放在节点上，做为最后一个child加入
      if (Array.isArray(dropData.children)) {
        dropData.children.push(moveData);
      } else {
        dropData.children = [moveData];
      }
    } else {
      // 放在某个位置上
      const { dropPosition } = info; // 真代表放在节点上方，假在节点下方
      operateTree(
        (tree, i, data) => {
          tree.splice(dropPosition > i ? i + 1 : i, 0, data);
        },
        cascaderOption,
        moveData,
        'uuid',
        dropData.uuid
      );
    }
    operateTree('del', cascaderOption, undefined, 'uuid', dragData.uuid);
    this.setState({ cascaderOption: [...cascaderOption] });
  };

  render() {
    const { visible, cascaderOption, selectedKeys } = this.state;
    return (
      <React.Fragment>
        <a onClick={this.showModal}>级联关系编辑</a>
        <Modal
          visible={visible}
          onCancel={this.closeModal}
          onOk={this.submitHandle}
          style={{ top: 50 }}
          bodyStyle={{ overflow: 'auto', maxHeight: 'calc(100vh - 100px)' }}
          destroyOnClose
          okButtonProps={{ size: 'small' }}
          cancelButtonProps={{ size: 'small' }}
          maskClosable={false}
        >
          <Tree
            showLine
            onSelect={this.onSelect}
            selectedKeys={selectedKeys}
            defaultExpandAll
            draggable
            onDrop={this.onDrop}
          >
            {this.renderTreeNodes(cascaderOption)}
          </Tree>
        </Modal>
      </React.Fragment>
    );
  }
}

CascaderOptionTree.defaultProps = {};

CascaderOptionTree.propTypes = {
  src: PropTypes.arrayOf(PropTypes.object),
  onConfirm: PropTypes.func,
};

export default CascaderOptionTree;
