const KANACONVERTER_PATH = "../class/KanaConverter";
const TRANSFER_LIST_PATH = "../templates/json/transfer_field_list.json";
const KanaConverter_class = require(KANACONVERTER_PATH);
const TRANSFER_LIST = require(TRANSFER_LIST_PATH);
const KanaConverter = new KanaConverter_class();

const GETKINTONERECORD_PATH = "./getKintoneRecord";
const getKintoneRecord = require(GETKINTONERECORD_PATH);

function get_enroll_offista_data(record) {
  let return_obj = { relationship: 0 };
  const essential = TRANSFER_LIST.essential.fields;
  const enroll_residency = TRANSFER_LIST.enroll_residency.fields;
  const enroll_social_insurance = TRANSFER_LIST.enroll_social_insurance.fields;
  const enroll_employment_insurance =
    TRANSFER_LIST.enroll_employment_insurance.fields;
  //   const retire = TRANSFER_LIST.retire.fields;
  const transfer_fields = essential.concat(
    enroll_residency,
    enroll_social_insurance,
    enroll_employment_insurance
    // retire
  );

  transfer_fields.forEach((element) => {
    const from = element.from;
    const dest = element.dest;
    const type = element.type;
    const record_obj = record[from];
    if (record_obj == undefined) {
      const error_message = `key "${from}" is not defined.\nPlease change the file "${TRANSFER_LIST_PATH}"`;
      console.error(error_message);
      return;
    }
    let value = record_obj.value;
    switch (type) {
      case undefined:
        break;
      case "full":
        value = KanaConverter.halfToFull(value);
        break;
      case "half":
        value = KanaConverter.fullToHalf(value);
        break;
      case "boolean":
        switch (dest) {
          case "is_foreigner":
            if (value.includes("日本")) value = 0;
            else value = 1;
            break;
          case "health_division":
            if (value === "加入する") value = 1;
            else value = 0;
            break;
          case "welfare_annuity_division":
            if (value === "加入する") value = 1;
            else value = 0;
            break;
          case "employment_insurance_division":
            if (value === "加入する") value = 1;
            else value = 0;
            break;
          default:
            console.error(`"${type}/${dest}" is not defined in this program.`);
            return;
        }
        break;
      case "int":
        switch (dest) {
          case "contract_period_determined":
            if (value === "期間の定めあり") value = 1;
            else if (value === "期間の定めなし") value = 2;
            else value = 0;
            break;
          case "activity_out_qualification":
            if (value === "有") value = 1;
            else if (value === "無") value = 2;
            else value = 0;
            break;
          case "dispatch_contract_working_classification":
            if (value === "該当する") value = 1;
            else if (value === "該当しない") value = 2;
            else value = 0;
            break;
          default:
            console.error(`"${type}/${dest}" is not defined in this program.`);
            console.log(value);
            return;
        }
        break;
      case "divide by 1000":
        value = String(Number(value) / 1000);
        break;
      default:
        console.error(`the type "${type}/${dest}" is not defined in program`);
        return;
    }
    return_obj[dest] = value;
  });
  return return_obj;
}

async function demo() {
  const record = await getKintoneRecord(1240, 8779);
  const enroll_offista_data = get_enroll_offista_data(record);
  console.log(enroll_offista_data);
}

demo();
