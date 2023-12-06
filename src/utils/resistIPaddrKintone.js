const KINTONE_CLASS_PATH = "../class/Kintone";
const Kintone = require(KINTONE_CLASS_PATH);

module.exports = async (app_id, app_name, ip_addr, port, is_active) => {
  const c = new Kintone(app_id);
  await c.build();
  const postData = {
    app_name: app_name,
    ip_addr: ip_addr,
    port: port,
    timestamp: new Date().toLocaleString(),
    is_active: is_active,
  };
  const result = await c.post(postData);
  console.log(result);
};
