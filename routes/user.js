const express = require('express');
const router = express.Router();
const { db } = require("../database/pgAdaptor");
const { getID, addSkill } = require('../services/database');

router.post('/', async (req, res, next) => {

    console.log("hello")
    const request = require('../database/loader.json')
    
    
    for (var data in request){
        const info = request[data]
        const query = `INSERT INTO users (name,email,phone,company,picture) VALUES($1,$2,$3,$4,$5)`;
        values = [info.name,info.email,info.phone,info.company,info.picture];
        await db
            .none(query,values)
            .then(async function() {
                const skills = info.skills;
                const id = await getID(info.email);
                for (var i = 0; i<skills.length;i++) {
                    await addSkill(skills[i],id);
                }
            })
            .catch(err => console.log(err));
    }
   
})

module.exports = router;