import cron from 'node-cron'
import { Op, where } from 'sequelize';
import Package from '../models/Package.js';
import { deleteFile, listFiles } from '../middleware/drive.js';
import { addDays, addHours, subDays } from 'date-fns';

// สร้าง Cron Job ที่รันทุกนาที
const scheduleDriveTask = () => {
    cron.schedule('*/10 * * * * *', async () => {
        console.log('Running Drive job every day at midnight:', new Date());
        try {
            const timeNow = new Date()
            const yesterday = subDays(addHours(timeNow, 7), 1)
            const file = await listFiles(100)
            console.log('yesterday in drive.job.js :', yesterday)
            file.forEach(async item => {
                if (item.createdTime <= yesterday) {
                    console.log('im in')
                    await deleteFile(item.id)
                }
            });
        } catch (error) {
            console.error('Error delete packages:', error);
        }
    });


    console.log('Drive job started.');
}


export default scheduleDriveTask