import express from 'express'
import LogData from '../models/LogData.js'
import License from '../models/License.js';
import sequelize from '../../database.js';
import { Op } from 'sequelize';

export async function createLogData(deviceId, params) {
    const vehicleTypeMap = {
        0: '3-wheel vehicle',
        1: 'Large bus',
        2: 'Midsize vehicle',
        3: 'Small vehicle',
        4: 'Large vehicle',
        5: '2-wheel vehicle',
        6: 'Motorcycle',
        7: 'Tractor',
        8: 'Farm Truck',
        9: 'Sedan',
        10: 'SUV',
        11: 'Minibus',
        12: 'Minivan',
        13: 'Midsize bus',
        14: 'Large bus',
        15: 'Large truck',
        16: 'Pickup',
        17: 'MPV',
        18: 'Roadster',
        19: 'Mini car',
        20: 'Two-box sedan',
        21: 'Three-box sedan',
        22: 'Light bus',
        23: 'Medium duty truck',
        24: 'Trailer',
        25: 'Tanker',
        26: 'Street sprinkler',
        998: 'Other',
        999: 'Unknown',
    };

    const vehicleColorMap = {
        0: 'Black',
        1: 'White',
        2: 'Gray',
        3: 'Red',
        4: 'Blue',
        5: 'Yellow',
        6: 'Orange',
        7: 'Brown',
        8: 'Green',
        9: 'Purple',
        10: 'Cyan',
        11: 'Pink',
        12: 'Transparent',
        13: 'Silver',
        14: 'Dark',
        15: 'Light color',
        16: 'No color',
        17: 'Yellow & green',
        18: 'Gradient green',
        99: 'Other',
        100: 'Unknown',
    };
    console.log(params)
    const strLicense = params.plateNo.replace(/\s+/g, '')
    const dateTime = new Date()
    dateTime.setHours(0, 0, 0, 0)
    const checkLicense = await License.findOne({
        where: {
            license: strLicense,
            expiredAt: {
                [Op.gt]: dateTime
            }
        }
    })
    const type = vehicleTypeMap[params.vehicleType]
    const color = vehicleColorMap[params.vehicleColor]
    const transaction = await sequelize.transaction()
    try {
        if (checkLicense) {
            if (deviceId === 'HC121-01') {
                await LogData.create({
                    license: params.plateNo,
                    checkInAt: new Date(params.picTime),
                    vehicleType: type,
                    vehicleColor: color
                }, { transaction })
                await checkLicense.update({
                    status: true
                }, { transaction })

                //TODO: ยิง API เปิดไม้กั้น
            } else {
                await LogData.update({
                    checkOutAt: new Date(params.picTime),
                }, {
                    where: {
                        license: strLicense
                    }, transaction
                })
                await checkLicense.update({
                    status: false
                }, { transaction })

                //TODO: ยิง API เปิดไม้กั้น
            }
        }
        await transaction.commit()
    } catch (e) {
        (await transaction).rollback()
        throw new Error(e.message)
    }


}