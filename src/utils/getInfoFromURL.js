module.exports = (record_url) => {
  const matchResult = record_url.match(/\/k\/(\d+)\/show#record=(\d+)/);

  if (matchResult) {
    const app_id = matchResult[1];
    const record_id = matchResult[2];
    return { app_id: app_id, record_id: record_id };
  } else {
    console.log("failed to get app_id and record_num from record_url");
    return {};
  }
};
