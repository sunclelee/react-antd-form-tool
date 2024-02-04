/**
 * Blob保存为本地文件
 * @param {Blob} obj
 * @param {String} fileName
 */
export function saveAs(obj, fileName) {
  const tmpa = document.createElement('a');
  tmpa.download = fileName || '下载';
  tmpa.href = URL.createObjectURL(obj);
  tmpa.click();
  setTimeout(() => {
    URL.revokeObjectURL(obj);
  }, 100);
}

/**
 * 获取导入的文本文件信息
 * @param {File} file
 */
export function handleLoadfile(file) {
  const reader = new FileReader();
  reader.readAsText(file); // 以文本格式读取
  return new Promise(resolve => {
    reader.onload = evt => {
      let result;
      try {
        result = JSON.parse(evt.target.result);
      } catch (err) {
        message.error('不正确的JSON格式');
        // 这里不用抛出异常，否则调用handleLoadfile时还需要用try处理一下
        // reject(err);
      }
      resolve(result || []);
    };
  });
}
