import Transaction from "../models/Transaction.js";
import License from "../models/License.js";
import { Op } from "sequelize";
import { startOfMonth, endOfMonth, getYear } from "date-fns";

export async function getMonthlyRevenue(filter = null) {
  let now_date = new Date();
  const year = getYear(now_date);
  filter ? (now_date = new Date(`${year}/${filter}/5`)) : (now_date = now_date);

  const start_of_month = startOfMonth(now_date);

  const end_of_month = endOfMonth(now_date);
  //paymentState = success only
  const data = await Transaction.findAll({
    where: {
      [Op.and]: [
        { updatedAt: { [Op.gte]: start_of_month } },
        { updatedAt: { [Op.lte]: end_of_month } },
        { paymentState: "SUCCESS" },
      ],
    },
  });

  let SummaryRevenue = 0;

  for (let val of data) {
    SummaryRevenue += val.amount;
  }

  const resp = { income: SummaryRevenue };

  return resp || {};
}

export async function getTotalCar() {
  let now_date = new Date();

  const license = await License.findAll({
    where: {
      expiredAt: { [Op.gt]: now_date },
    },
  });

  return { car_amount: license.length };
}
