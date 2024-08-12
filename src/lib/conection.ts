import mongoose from "mongoose";

const { MONGODB_URL } = process.env;

if (!MONGODB_URL) {
  throw new Error('MONGODB_URL deberia estar definido')
}

export const ConnectMD = async () => {
  try {
    const { connection } = await mongoose.connect(MONGODB_URL,)
    if (connection.readyState == 1) {
      console.log('MongoDB conectado');
      return Promise.resolve(true)
    }
  } catch (error) {
    console.log(error);
    return Promise.resolve(false)
  }
}