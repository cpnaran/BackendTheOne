import Transaction from "../models/Transaction.js";
import License from "../models/License.js";
import { Op, Sequelize } from "sequelize";
import sequelize from "../../database.js";
import {
  startOfMonth,
  endOfMonth,
  getYear,
  startOfYear,
  endOfYear,
  addMinutes,
  addDays,
  addHours,
  getMonth,
  getHours,
  addYears,
} from "date-fns";
import Package from "../models/Package.js";
import LogData from "../models/LogData.js";

export async function getMonthlyRevenue(filter = null) {
  let now_date = new Date();
  const year = getYear(now_date);
  filter
    ? (now_date = new Date(`${year}/${filter + 1}/5`))
    : (now_date = now_date);

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

export const getGraph = async (filter_year = null) => {
  let graph = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0,
  };

  let now_date = new Date();

  filter_year
    ? (now_date = new Date(`${filter_year}/01/5`))
    : (now_date = now_date);

  // start from  yyyy-01-01T00:00:00.000Z (UTC+7)
  const start_of_year = addHours(startOfYear(now_date), 7);

  const end_of_year = endOfYear(now_date);

  const data = await Transaction.findAll({
    where: {
      [Op.and]: [
        { updatedAt: { [Op.gte]: start_of_year } },
        { updatedAt: { [Op.lte]: end_of_year } },
        { paymentState: "SUCCESS" },
      ],
    },
    raw: true,
  });

  // Loop through the data and add the transaction amounts to the corresponding month
  data.forEach((transaction) => {
    // Get month (0-11)
    const month = getMonth(transaction.updatedAt);

    // Switch case for each month
    switch (month) {
      case 0:
        graph.Jan += transaction.amount;
        break;
      case 1:
        graph.Feb += transaction.amount;
        break;
      case 2:
        graph.Mar += transaction.amount;
        break;
      case 3:
        graph.Apr += transaction.amount;
        break;
      case 4:
        graph.May += transaction.amount;
        break;
      case 5:
        graph.Jun += transaction.amount;
        break;
      case 6:
        graph.Jul += transaction.amount;
        break;
      case 7:
        graph.Aug += transaction.amount;
        break;
      case 8:
        graph.Sep += transaction.amount;
        break;
      case 9:
        graph.Oct += transaction.amount;
        break;
      case 10:
        graph.Nov += transaction.amount;
        break;
      case 11:
        graph.Dec += transaction.amount;
        break;
      default:
        console.error("Invalid month:", month);
    }
  });

  return graph; // You probably want to return the graph at the end
};

export const getPackageSummary = async (filter_year = null) => {
  let now_date = new Date();

  filter_year
    ? (now_date = new Date(`${filter_year}/01/5`))
    : (now_date = now_date);
  // start from  yyyy-01-01T00:00:00.000Z (UTC+7)
  const start_of_year = addHours(startOfYear(now_date), 7);

  const end_of_year = endOfYear(now_date);

  const count = await Transaction.findAll({
    //exclude ค่าปรับ
    where: {
      [Op.and]: [
        { updatedAt: { [Op.gte]: start_of_year } },
        { updatedAt: { [Op.lte]: end_of_year } },
        { paymentState: "SUCCESS" },
        { packageId: { [Op.ne]: "30d27f15-0ace-4263-b789-1c851d20ac6c" } },
      ],
    },
    attributes: [
      "packageId",
      [Sequelize.fn("COUNT", Sequelize.col("Transaction.id")), "count"],
    ],
    group: ["packageId"],
    include: [
      {
        model: Package,
        attributes: ["package"],
      },
    ],
    raw: true,
  });
  let resp = [];
  count.forEach((obj) => {
    resp.push({
      packageId: obj.packageId,
      count: obj.count,
      package_name: obj["Package.package"],
    });
  });

  return resp;
};

export const createPackage = async (data = {}) => {
  const transaction = await sequelize.transaction();
  await Package.create(data, { transaction });
  await transaction.commit();
  return "success";
};

export const updatePackage = async (data = {}) => {
  if (!data.id) {
    throw new Error("id is required!");
  }

  const id = data.id;
  delete data.id;

  const transaction = await sequelize.transaction();
  try {
    await Package.update(data, {
      where: { id },
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  return "success";
};

export const deletePackage = async (id) => {
  if (!id) {
    throw new Error("id is required!");
  }
  const transaction = await sequelize.transaction();
  try {
    const db_package = await Package.findOne({
      where: {
        id,
      },
    });

    if (!db_package) {
      throw new Error("no package found.");
    }

    await Package.destroy(
      {
        where: {
          id,
        },
      },
      { transaction }
    );
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error("Error occurred during package deletion:", error);
    throw error;
  }

  return "success";
};

export const getPackageTable = async () => {
  const Packages = await Package.findAll({
    where: {
      id: {
        [Op.ne]: "30d27f15-0ace-4263-b789-1c851d20ac6c",
      },
    },
  });
  return Packages;
};

export const getCarGraph = async (filter_year = null) => {
  let graph = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0,
  };

  let now_date = new Date();

  filter_year
    ? (now_date = new Date(`${filter_year}/01/5`))
    : (now_date = now_date);

  // start from  yyyy-01-01T00:00:00.000Z (UTC+7)
  const start_of_year = addHours(startOfYear(now_date), 7);

  const end_of_year = endOfYear(now_date);

  const data = await LogData.findAll({
    where: {
      [Op.and]: [
        { checkInAt: { [Op.gte]: start_of_year } },
        { checkInAt: { [Op.lte]: end_of_year } },
      ],
    },
    raw: true,
  });

  // Loop through the data and add the transaction amounts to the corresponding month
  data.forEach((log) => {
    // Get month (0-11)
    const month = getMonth(log.checkInAt);

    // Switch case for each month
    switch (month) {
      case 0:
        graph.Jan += 1;
        break;
      case 1:
        graph.Feb += 1;
        break;
      case 2:
        graph.Mar += 1;
        break;
      case 3:
        graph.Apr += 1;
        break;
      case 4:
        graph.May += 1;
        break;
      case 5:
        graph.Jun += 1;
        break;
      case 6:
        graph.Jul += 1;
        break;
      case 7:
        graph.Aug += 1;
        break;
      case 8:
        graph.Sep += 1;
        break;
      case 9:
        graph.Oct += 1;
        break;
      case 10:
        graph.Nov += 1;
        break;
      case 11:
        graph.Dec += 1;
        break;
      default:
        console.error("Invalid month:", month);
    }
  });

  return graph;
};

export const getUsageTime = async () => {
  const data_arr = await LogData.findAll({
    raw: true,
    attributes: ["checkInAt"],
  });

  let graph = {};
  for (let i = 0; i < 24; i++) {
    graph[i.toString().padStart(2, "0")] = 0;
  }

  data_arr.forEach((data) => {
    let hour = getHours(data.checkInAt);
    let hourKey = hour.toString().padStart(2, "0");
    graph[hourKey]++;
  });

  const totalHours = data_arr.length;

  for (let hour in graph) {
    graph[hour] = Math.round((graph[hour] / totalHours) * 100);
  }

  return graph;
};

export const getCarList = async ({ page, per_page, license }) => {
  // Calculate limit and offset
  const limit = per_page ? parseInt(per_page, 10) : undefined;
  const offset =
    page && per_page
      ? (parseInt(page, 10) - 1) * parseInt(per_page, 10)
      : undefined;

  // Define query options
  const queryOptions = {};
  if (limit !== undefined) queryOptions.limit = limit;
  if (offset !== undefined) queryOptions.offset = offset;

  if (license) {
    queryOptions.where = {
      license: {
        [Op.like]: `%${license}%`,
      },
    };
  }

  const list = await License.findAll(queryOptions);

  return list;
};

export const demote = async (id) => {
  if (!id) {
    throw new Error("id is required!");
  }
  const transaction = await sequelize.transaction();
  try {
    if (await checkExistingLicense(id)) {
      await License.update(
        { JsonData: null },
        {
          where: { id },
          transaction,
        }
      );
      await transaction.commit();
    }
    return "success";
  } catch (error) {
    await transaction.rollback();
    console.error("Error occurred during package deletion:", error);
    throw error;
  }
};

export const promote = async (id, package_id) => {
  if (!id) {
    throw new Error("id is required!");
  }
  const transaction = await sequelize.transaction();

  try {
    if (await checkExistingLicense(id)) {
      const startAt = new Date();
      const expireAt = addYears(startAt, 1);

      await License.update(
        {
          JsonData: {
            special_package: [
              {
                id: package_id,
                startAt: startAt,
                expiredAt: expireAt,
              },
            ],
          },
        },
        {
          where: { id },
          transaction,
        }
      );
      await transaction.commit();
    }
    return "success";
  } catch (error) {
    await transaction.rollback();
    console.error("Error occurred", error);
    throw error;
  }
};

export const checkExistingLicense = async (id) => {
  const doc = await License.findOne({ where: { id } });
  if (!doc) {
    throw new Error("License not found.");
  }
  return doc;
};

export const Add15Days = async (id) => {
  const transaction = await sequelize.transaction();
  try {
    const doc = await checkExistingLicense(id);
    if (doc) {
      const added = addDays(doc.expiredAt, 15);

      await License.update(
        {
          expiredAt: added,
        },
        {
          where: { id },
          transaction,
        }
      );
      await transaction.commit();
    }
    return "success";
  } catch (error) {
    await transaction.rollback();
    console.error("Error occurred", error);
    throw error;
  }
};

export const getPremiumoptions = async () => {
  const list = await Package.findAll({ where: { packageType: "PREMIUM" } });

  return list;
};
