/**
 * 把嵌套children的树结构摊平
 * @name treeToFlatData
 * @param {Array<{id: string, children: []}>} tree 嵌套的树结构
 * @param {string} keyField key的字段名
 * @returns {Array}
 */
export const treeToFlatData = (tree, keyField = 'id') => {
  const flatList = [];
  function flatTree(data, parent = '') {
    data.forEach(i => {
      const { children } = i;
      if (children && children.length) {
        flatTree(children, i[keyField]);
      }
      const push = {
        ...i,
        parent,
      };
      delete push.children;
      flatList.push(push);
    });
  }
  flatTree(tree);
  return flatList;
};

/**
 * 在嵌套children的树结构中查找指定节点，假设keyField的值不可重复
 * @name findDataInTree
 * @param {Array<{id: string, children: []}>} tree - 嵌套的树结构
 * @returns {Array<{id: string, children: []}>} - 返回该节点和该节点的chiledren
 */
export const findDataInTree = (tree, keyField = 'id', value) => {
  let result = [];
  function findTree(data) {
    for (let i = 0; i < data.length; i += 1) {
      if (data[i][keyField] === value) {
        result = [{ ...data[i] }];
        break;
      } else if (data[i].children && data[i].children.length) {
        findTree(data[i].children);
      }
    }
  }
  findTree(tree);
  return result;
};

/**
 * 操作嵌套children的树结构，会改变传入的tree
 * @name operateTree
 * @param {string | func} action - 操作: 'addChildren'|'del'|'replace'|'copy'|'append'
 * @param {Array<{id: string, children: []}>} tree - tree
 * @param {object|Array} data - 待操作的数据
 * @param {string} keyField - 需要查找的字段名
 * @param {string} value - 需要查找的值
 * @param {boolean} onlyOne - 是否只查找一次
 */
export const operateTree = (action, tree, data, keyField = 'id', value, onlyOne = true) => {
  for (let i = tree.length - 1; i >= 0; i -= 1) {
    if (lodash.get(tree[i], keyField) === value) {
      switch (action) {
        case 'del':
          tree.splice(i, 1);
          break;
        case 'replace':
          tree[i] = data;
          break;
        case 'append':
          tree[i] = {
            ...tree[i],
            ...data,
          };
          break;
        case 'addChildren':
          tree[i].children = data;
          break;
        case 'copy':
          tree.splice(i + 1, 0, { ...tree[i], ...data });
          break;
        default:
          if (typeof action === 'function') {
            action(tree, i, data);
          }
      }
      if (onlyOne) break;
    } else if (tree[i].children && tree[i].children.length) {
      operateTree(action, tree[i].children, data, keyField, value, onlyOne);
    }
  }
};

/**
 * JSON.parse容易造成程序崩溃，需要try包裹
 * @name JSONparse
 * @param {string} str - json字符串
 * @param {any} r - 报错后返回值
 * @returns {any}
 */
export function JSONparse(str, r = []) {
  try {
    return JSON.parse(str);
  } catch (err) {
    console.warn(err);
    return r;
  }
}

/**
 * 判断是否是JSON字符串
 * @name isJSON
 * @param {string} str - 字符串
 * @returns {boolean}
 */
export const isJSON = str => {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  return false;
};

/**
 * 检查级联组件的option是否合规
 * @name checkCascaderOptionIsValid
 * @param {*} _
 * @param {string} value - 级联组件option的json字符串
 * @param {func} callback - 回调函数
 * @returns {boolean}
 */
export const checkCascaderOptionIsValid = (_, value, callback) => {
  function fieldIsComplete(array) {
    return treeToFlatData(array).every(v => v.value && v.label);
  }
  // eslint-disable-next-line no-param-reassign
  if (!callback) callback = () => {};
  if (value) {
    if (!isJSON(value)) {
      callback('不是正确的json格式字符串');
      return false;
    }
    const t = JSONparse(value);
    if (!Array.isArray(t)) {
      callback('应为数组类型');
      return false;
    }
    if (!fieldIsComplete(t)) {
      callback('缺少value或label字段');
      return false;
    }
    callback();
    return true;
  }
  callback();
  return false;
};

/**
 * 数组中的元素从原有index移到新index，可用于拖拽组件
 * @param {array} list
 * @param {number} oldIndex
 * @param {number} newIndex
 * @returns {array} newList
 */
export const reorderArray = (list, oldIndex, newIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(oldIndex, 1);
  result.splice(newIndex, 0, removed);
  return result;
};
