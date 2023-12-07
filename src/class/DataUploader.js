const KANACONVERTER_PATH = "./KanaConverter";
const TRANSFER_LIST_PATH = "../templates/json/transfer_field_list.json";
const OFFISTA_CLASS_PATH = "./Offista";
const KanaConverter_class = require(KANACONVERTER_PATH);
const TRANSFER_LIST = require(TRANSFER_LIST_PATH);
const KanaConverter = new KanaConverter_class();
const Offista = require(OFFISTA_CLASS_PATH);

module.exports = class DataUploader {
  constructor() {
    this.offistaInstance = new Offista({ is_dumpLog: true });
  }

  convertKintoneToOffista(kintoneRecord, transferFields) {
    let returnObj = { relationship: 0 };
    transferFields.forEach((element) => {
      const from = element.from;
      const dest = element.dest;
      const type = element.type;
      const recordObj = kintoneRecord[from];

      if (recordObj === undefined) {
        const error_message = `key "${from}" is not defined.\nPlease change the file "${TRANSFER_LIST_PATH}"`;
        console.error(error_message);
        return;
      }

      let value = recordObj.value;

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
              console.error(
                `"${type}/${dest}" is not defined in this program.`
              );
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
              break;
            case "dispatch_contract_working_classification":
              if (value === "該当する") value = 1;
              else if (value === "該当しない") value = 2;
              break;
            case "sex":
              if (value === "男") value = 1;
              else if (value === "女") value = 2;
              break;
            default:
              console.error(
                `"${type}/${dest}" is not defined in this program.`
              );
              console.log(value);
              return;
          }
          break;
        case "divide by 1000":
          value = String(Number(value) / 1000);
          break;
        case "remove hyphen":
          value = value.replaceAll("-", "");
          break;
        case "insert tel hyphen":
          if (!value.includes("-")) {
            let formattedNumber =
              value.substring(0, 3) +
              "-" +
              value.substring(3, 7) +
              "-" +
              value.substring(7);
          }
          break;
        default:
          console.error(`the type "${type}/${dest}" is not defined in program`);
          return;
      }

      if (dest === "memo") returnObj[dest] = `${from}=${value}\n`;
      else returnObj[dest] = value;
    });

    return returnObj;
  }

  getEnrollOffistaData(record) {
    const essential = TRANSFER_LIST.essential.fields;
    const enrollResidency = TRANSFER_LIST.enroll_residency.fields;
    const enrollSocialInsurance = TRANSFER_LIST.enroll_social_insurance.fields;
    const enrollEmploymentInsurance =
      TRANSFER_LIST.enroll_employment_insurance.fields;

    const transferFields = essential.concat(
      enrollResidency,
      enrollSocialInsurance,
      enrollEmploymentInsurance
    );
    return this.convertKintoneToOffista(record, transferFields);
  }

  async checkCompanyResist(companyName) {
    if (this.apiKey == undefined)
      this.apiKey = await this.offistaInstance.get_api_key();
    let result = await this.offistaInstance.get_consignment_customer(
      this.apiKey
    );

    let stationId = "";
    result.forEach((element) => {
      if (element.customer_name === companyName) stationId = element.identifier;
    });

    if (stationId === "")
      console.error(
        `"${companyName}" is not defined on the office station server.`
      );
    return stationId;
  }

  async upload(companyName, dataObj) {
    if (this.apiKey == undefined)
      this.apiKey = await this.offistaInstance.get_api_key();
    this.stationId = await this.checkCompanyResist(companyName);
    if (this.stationId === "")
      return {
        is_successed: false,
        error_message: `"${companyName}" is not defined on the office station server.`,
      };
    try {
      const resistResult = await this.offistaInstance.entry_employee(
        this.apiKey,
        this.stationId,
        [dataObj]
      );

      if (!resistResult.is_successed) {
        console.error(
          `Failed to entry employee data.\n${resistResult.error_message}`
        );
        if (
          resistResult.error_message.includes(
            "既に登録されている従業員が存在します"
          )
        ) {
          return this.update(companyName, dataObj);
        } else
          return {
            is_successed: false,
            error_message: resistResult.error_message,
          };
      }

      return { is_successed: true, error_message: "" };
    } catch (e) {
      console.error(e);
      return { is_successed: false, error_message: e.message || e };
    }
  }

  async update(companyName, dataObj) {
    if (this.apiKey == undefined)
      this.apiKey = await this.offistaInstance.get_api_key();
    this.stationId = await this.checkCompanyResist(companyName);
    if (this.stationId === "")
      return {
        is_successed: false,
        error_message: `"${companyName}" is not defined on the office station server.`,
      };
    try {
      const resistResult = await this.offistaInstance.modify_employee(
        this.apiKey,
        this.stationId,
        [dataObj]
      );

      if (!resistResult.is_successed) {
        console.error(
          `Failed to modefy employee data.\n${resistResult.error_message}`
        );
        return {
          is_successed: false,
          error_message: resistResult.error_message,
        };
      } else return { is_successed: true, error_message: "" };
    } catch (e) {
      console.error(e);
      return { is_successed: false, error_message: e.message || e };
    }
  }

  async resistEnroll(kintoneRecord) {
    const companyName = kintoneRecord["会社名"].value;
    const enrollOffistaData = await this.getEnrollOffistaData(kintoneRecord);
    return await this.upload(companyName, enrollOffistaData);
  }
};