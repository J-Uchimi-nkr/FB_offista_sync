const MAP_PATH = "../config/kana_map.json";
const CONVERSIONMAP = require(MAP_PATH);

module.exports = class KanaConverter {
  constructor() {
    this.conversionMap = CONVERSIONMAP;
  }

  halfToFull(str) {
    return this.convert(str, "half", "full");
  }

  fullToHalf(str) {
    return this.convert(str, "full", "half");
  }

  convert(str, fromType, toType) {
    const str_array = Array.from(str);
    let result_arr = [];
    str_array.forEach((elem) => {
      if (elem == "ﾞ") {
        let tmp = result_arr.pop();
        result_arr.push(tmp + elem);
      } else {
        result_arr.push(elem);
      }
    });
    const convertedString = result_arr
      .map((char) => {
        const conversion = this.conversionMap.find(
          (entry) => entry[fromType] === char
        );
        return conversion ? conversion[toType] : char;
      })
      .join("");

    return convertedString;
  }
};
