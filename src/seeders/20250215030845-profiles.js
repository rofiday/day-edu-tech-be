"use strict";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const { default: db } = await import("../models/index.js");
    const users = await db.User.findAll({
      attributes: ["id"],
    });

    if (users.length === 0) {
      console.log(
        "Tidak ada user yang ditemukan. Pastikan telah menjalankan seeder Users."
      );
      return;
    }
    const count = users.length;
    const userIds = users.map((user) => user.id);
    const getRandomGender = () => {
      return ["male", "female"][Math.floor(Math.random() * 2)];
    };
    const profiles = [];
    for (let i = 0; i < count; i++) {
      profiles.push({
        id: uuidv4(),
        userId: userIds[i],
        bio: faker.lorem.paragraph(),
        profileImage: faker.image.avatar(),
        address: faker.location.streetAddress(),
        gender: getRandomGender(),
        birthDate: faker.date.birthdate(),
        socialLinks: JSON.stringify({
          instagram: faker.internet.url(),
          facebook: faker.internet.url(),
          twitter: faker.internet.url(),
        }),
      });
    }

    await queryInterface.bulkInsert("profiles", profiles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("profiles", null, {});
  },
};
