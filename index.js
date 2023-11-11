const Offista = require("./Offista");

async function main() {
  const instance = new Offista({ is_dumpLog: true });
  //   await instance.create_api_key();
  const api_key = await instance.get_api_key();
  //   await instance.get_pid_key();
  //   await instance.get_ac_method();
  await instance.get_employee(api_key, {});
}

main();
