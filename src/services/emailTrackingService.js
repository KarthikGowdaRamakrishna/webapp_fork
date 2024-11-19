// import EmailTracking from '../models/EmailTracking.js';

// export const getEmailTrackingByToken = async (token) => {
//   return await EmailTracking.findOne({ where: { token } });
// };

// export const updateEmailTrackingStatus = async (email, status) => {
//   const emailTracking = await EmailTracking.findOne({ where: { email } });
//   if (!emailTracking) {
//     throw new Error(`No email tracking record found for email: ${email}`);
//   }

//   emailTracking.status = status;
//   await emailTracking.save();
// };
import EmailTracking from "../models/EmailTracking.js";
import { getUserByEmail } from "./userService.js";


export const getEmailTrackingByToken = async (token) => {
    const user = await EmailTracking.findOne({ where: { token: token } });
    return await user;
}

export const setVerification = async (email) => {
    const user = await getUserByEmail(email);
    user.is_verified = true;
    await user.save();
    return await user;
}