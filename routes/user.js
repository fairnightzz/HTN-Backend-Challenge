const express = require('express')
const router = express.Router()
const { db } = require("../database/pgAdaptor")
const { getID, addSkill } = require('../services/database')

router.post('/', async (req, res, next) => {
  const request = require('../database/loader.json')
  for (const data in request) {
    const info = request[data]
    const query = `INSERT INTO users (name,email,phone,company,picture) VALUES($1,$2,$3,$4,$5)`
    const values = [info.name, info.email, info.phone, info.company, info.picture]
    await db
      .none(query, values)
      .then(async function () {
        const skills = info.skills
        const id = await getID(info.email)
        for (let i = 0; i < skills.length; i++) {
          await addSkill(skills[i], id)
        }

        res.status(201).json({
          message: "Users successfully added!"
        })
      })
      .catch(err => console.log(err))
  }
})

module.exports = router
