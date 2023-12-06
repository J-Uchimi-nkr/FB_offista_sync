module.exports = (record_url) => {
  const matchResult = record_url.match(/\/k\/(\d+)\/show#record=(\d+)/);

  if (matchResult) {
    const app_id = matchResult[1];
    const record_id = matchResult[2];
    console.log("app_id:", app_id);
    console.log("record_id:", record_id);
    return { app_id: app_id, record_id: record_id };
  } else {
    console.log("URLからapp_idとrecord_idを取得できませんでした。");
    return {};
  }
};
