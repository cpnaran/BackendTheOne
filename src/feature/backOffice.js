import Transaction from "../models/Transaction.js";
import Package from "../models/Package.js";
import { Op } from "sequelize";
import { startOfMonth, endOfMonth } from "date-fns";

export async function getMonthlyRevenue() {
  //const now_date_tz = formatInTimeZone(new Date(), tz, date_format);
  const now_date = new Date("2024-10-13 00:00:00");
  const start_of_month = startOfMonth(now_date);

  const end_of_month = endOfMonth(now_date);
  //paymentState = success only
  const data = await Transaction.findAll({
    where: {
      [Op.and]: [
        { updatedAt: { [Op.gte]: start_of_month } },
        { updatedAt: { [Op.lte]: end_of_month } },
        { paymentState: "PENDING" },
      ],
    },
  });

  const packages = await Package.findAll();

  let frequencyCounter1 = {};
  let frequencyCounter2 = {};
  let penalty = {};

  for (let val of data) {
    frequencyCounter1[val.packageId] =
      (frequencyCounter1[val.packageId] || 0) + 1;

    // penalty["30d27f15-0ace-4263-b789-1c851d20ac6c"] =
    //   (penalty["30d27f15-0ace-4263-b789-1c851d20ac6c"] || 0) +
    //   val.remark.penalty;
  }

  for (let val of packages) {
    frequencyCounter2[val.id] = val.amount;
  }

  let SummaryRevenue = 0;
  for (let key in frequencyCounter1) {
    // key must not ค่าปรับ
    if (
      frequencyCounter2[key] &&
      key !== "30d27f15-0ace-4263-b789-1c851d20ac6c"
    ) {
      SummaryRevenue += frequencyCounter1[key] * frequencyCounter2[key];
    }
    //to do เพิ่มคำนวณจากค่าปรับด้วย ตอนนี้ db ยังไม่มี
    else if (
      frequencyCounter2[key] &&
      key === "30d27f15-0ace-4263-b789-1c851d20ac6c"
    ) {
    }
  }
  console.log(
    "🚀 ~ file: backOffice.js:51 ~ getMonthlyRevenue ~ SummaryRevenue:",
    SummaryRevenue
  );
  const resp = { income: SummaryRevenue };

  return resp || {};
}
