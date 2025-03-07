import db from "../models/index.js";
export const test = async (req, res) => {
  console.log(db);
  const users = await db.User.findAll();
  console.log(users);
  res.send("Hello World!");
};
