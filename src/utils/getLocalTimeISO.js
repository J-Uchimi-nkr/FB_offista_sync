module.exports = () => {
  let now = new Date();
  // JSTのオフセットを計算（UTC+9）
  const offset = 9 * 60; // 分単位でのオフセット
  now.setMinutes(now.getMinutes() + offset);

  // ISO 8601形式で時刻を取得
  const jstISOString = now.toISOString();

  return jstISOString;
};
