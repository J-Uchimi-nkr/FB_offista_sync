const path = require("path");
const config = require(path.join(process.cwd(), "config.json"));
const KINTONE_CLASS_PATH = path.join(process.cwd(), config["path"]["kintone"]);
const Kintone = require(KINTONE_CLASS_PATH);

module.exports = async (app_id, record_id) => {
  const c = new Kintone(app_id);
  await c.build();
  const query_str = `レコード番号=${record_id}`;
  const result = await c.get(query_str);
  try {
    const records = result.records;
    if (records.length == 0) {
      console.log("result not have any record.\n");
      return [];
    } else if (records.length > 1) {
      console.log("result have too much records.\n");
      return [];
    } else {
      return records[0];
    }
  } catch (e) {
    console.log(e);
    return [];
  }
};
