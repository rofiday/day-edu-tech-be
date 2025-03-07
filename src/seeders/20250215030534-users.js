import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const users = [];
    const count = 20;
    for (let i = 0; i < count; i++) {
      users.push({
        id: uuidv4(),
        fullname: faker.person.fullName(),
        username: faker.internet.username(),
        phoneNumber: faker.phone.number(),
        email: faker.internet.email(),
        password: bcrypt.hashSync(faker.internet.password(), 10),
        isActive: true,
      });
    }

    users.push({
      id: uuidv4(),
      fullname: "admin",
      username: "Admin",
      phoneNumber: "081234567890",
      email: "admin@dayedutech.com",
      password: bcrypt.hashSync("12345", 10),
      isActive: true,
    });

    users.push({
      id: uuidv4(),
      fullname: "mentor",
      username: "Mentor",
      phoneNumber: "081234567891",
      email: "mentor@dayedutech.com",
      password: bcrypt.hashSync("12345", 10),
      isActive: true,
    });

    users.push({
      id: uuidv4(),
      fullname: "student",
      username: "Student",
      phoneNumber: "081234567892",
      email: "student@dayedutech.com",
      password: bcrypt.hashSync("12345", 10),
      isActive: true,
    });

    await queryInterface.bulkInsert("users", users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
