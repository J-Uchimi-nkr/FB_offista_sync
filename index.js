const Offista = require("./Offista");

async function main() {
  const instance = new Offista({ is_dumpLog: true });
  debug(instance);
}

async function debug(instance) {
  //   await instance.create_api_key();
  const api_key = await instance.get_api_key();
  //   await instance.get_pid_key();
  //   await instance.get_ac_method();
  let result = await instance.get_consignment_customer(api_key);
  const customer_num = 0;
  let target_station_id = result[customer_num].identifier;

  // result = await instance.get_office(api_key, target_station_id);
  // console.log(result);

  // get_demo(instance, api_key, target_station_id);
  controll_demo(instance, api_key, target_station_id);
  return;
}

async function get_demo(instance, api_key, target_station_id) {
  const result = await instance.get_employee(api_key, target_station_id, {});
  const data = result[-1];
  console.log(result);
}

async function controll_demo(instance, api_key, target_station_id) {
  let employee = require("./template/mondetory_employee.json");
  employee.mei_name = "健斗";
  employee.shi_name = "田中";
  employee.customer_employee_id = "0010";
  employee.birthday = new Date().toISOString().split("T")[0];
  employee.sex = 2;
  result = await instance.modify_employee(api_key, target_station_id, [
    employee,
  ]);
  console.log(result);
}

main();
