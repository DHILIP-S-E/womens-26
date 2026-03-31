import { getDbClient } from '../shared/db';
import { sendPeriodAlert } from '../shared/sns';

export const handler = async (): Promise<void> => {
  try {
    await processPeriodAlerts();
  } catch (err) {
    console.error('Unhandled error in period-alert:', err);
    throw err;
  }
};

async function processPeriodAlerts(): Promise<void> {
  const prisma = getDbClient();

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const cycles = await prisma.cycle.findMany({
    where: { startDate: { gte: today, lt: tomorrow } },
  });

  console.log(`Found ${cycles.length} cycles starting today`);

  for (const cycle of cycles) {
    const user = await prisma.user.findUnique({ where: { id: cycle.userId } });
    if (user?.phoneNumber) {
      await sendPeriodAlert(user.phoneNumber);
      console.log(`Period alert sent to user ${cycle.userId}`);
    }
  }
}
