const OFFISTA_CLASS_PATH = "../class/Offista";
const MONDETORY_EMPLOYEE_PATH = "../templates/json/mandetory_employee.json";
const Offista = require(OFFISTA_CLASS_PATH);

module.exports = async (record) => {
  let return_obj = { is_successed: true, error_message: "" };
  try {
    const company_name = record["会社名"].value;
    const offista_instance = new Offista({ is_dumpLog: true });
    let result = await offista_instance.get_consignment_customer();

    let station_id = "";
    result.forEach((element) => {
      if (element.customer_name === company_name)
        station_id = element.identifier;
    });
    if (station_id === "") {
      console.error(
        `"${company_name}" is not defined on the office station server.`
      );
      return {
        is_successed: false,
        error_message: `"${company_name}" is not defined on the office station server.`,
      };
    }

    const mondetory_employee_obj = require(MONDETORY_EMPLOYEE_PATH);
    mondetory_employee_obj.customer_employee_id = record["社員No"].value;
    mondetory_employee_obj.shi_name = record["姓"].value;
    mondetory_employee_obj.mei_name = record["名"].value;
    mondetory_employee_obj.birthday = record["生年月日"].value;

    const resist_result = await offista_instance.entry_employee(
      api_key,
      station_id,
      [mondetory_employee_obj]
    );
    if (resist_result.is_successed == false) {
      console.error("failed to entry employee data.");
      return {
        is_successed: false,
        error_message: resist_result.error_message,
      };
    }
    return { is_successed: true, error_message: "" };
  } catch (e) {
    console.error(e);
    return { is_successed: false, error_message: e };
  }
};
