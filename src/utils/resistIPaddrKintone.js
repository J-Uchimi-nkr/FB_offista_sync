const KINTONE_CLASS_PATH = "../class/Kintone";
const Kintone = require(KINTONE_CLASS_PATH);

module.exports = async (arg_obj) => {
  let postData = {};
  let dump_info = true;
  let app_id;
  try {
    app_id = arg_obj.app_id;
    dump_info = arg_obj.dump_info;
    postData = {
      uuid: arg_obj.uuid,
      app_name: arg_obj.app_name,
      ip_addr: arg_obj.ip_addr,
      port: arg_obj.port,
      timestamp: new Date().toLocaleString(),
      is_active: arg_obj.is_active,
    };
  } catch (e) {
    if (dump_info) console.error(e);
    return false;
  }
  const c = new Kintone(app_id);
  await c.build();
  const result = await c.post(postData);
  if (dump_info) console.error(result);
  return true;
};
