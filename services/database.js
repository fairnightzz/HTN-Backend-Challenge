const db = require("../database/pgAdaptor").db;
const partialUpdate = (args) => {
    var values = [];
    var columns = [];
    var stringmanip = [];
    var counter = 1;
    for (var i in args) {
        if (args.hasOwnProperty(i) && args[i] != null && i != "skills") {
            values.push(args[i]);
            columns.push(i);
            stringmanip.push("$"+counter.toString());
            counter+=1;
        }
    }
    var columnsplit = columns.toString();
    var stringsplit = stringmanip.toString();
    return [values, columnsplit, stringsplit];
}

const addSkill = async (skill,id) => {
    const createdSkill = await checkSkill(skill.name);
    if (!createdSkill) {
        const query = `INSERT INTO skills (name) VALUES($1)`;
        const values = [skill.name];
        await db.none(query,values)
        .then(async function() {
            const skillID = await getskillID(skill.name);
            const query = `INSERT INTO usertoskill (id, skill_id, rating) VALUES($1,$2,$3)`;
            const values = [id, skillID, skill.rating];
            await db.none(query,values)
                .then(res => res)
                .catch(err => console.log(err));
        })
    }
    else {
            const skillID = await getskillID(skill.name);
                const query = `INSERT INTO usertoskill (id, skill_id, rating) VALUES($1,$2,$3)`;
                const values = [id, skillID, skill.rating];
                await db.none(query,values)
                    .then(res => res)
                    .catch(err => console.log(err));
            
    }

}

const getID = async (email) => {
    const query = `SELECT id FROM users WHERE email=$1`;
    const values = [email];
    return db.one(query,values)
        .then(res => res.id)
        .catch(err => console.log(err));
}

const getskillID = async (skill) => {
    const query = `SELECT skill_id FROM skills WHERE name=$1`;
    const values = [skill];
    return db.one(query,values)
        .then(res => res.skill_id)
        .catch(err => console.log(err));
}

const checkUser = async (email) => {
    const query = `SELECT EXISTS(SELECT email from users where email=$1)`;
    const values = [email];
    return db.one(query,values)
        .then(res=>res.exists)
        .catch(err => console.log(err));
}

const checkSkill = async (name) => {
    const query = `SELECT EXISTS(SELECt name from skills where name=$1)`;
    const values = [name];
    return db.one(query,values)
        .then(res=>res.exists)
        .catch(err => console.log(err));
}

const deleteSkill = async (skill) => {
    const createdSkill = await checkSkill(skill.name);
    if (createdSkill) {
        const id = await getskillID(skill.name);
        const query = `DELETE FROM usertoskill WHERE skill_id=$1`;
        const values = [id];
        await db.none(query,values)
            .then(res =>res)
            .catch(err => console.log(err));
    }
}

const updateSkills = async (updated, id) => {
    currentskills = await getSkills(id);

    // Loop through current skills and if they arent in update skills, then remove them.
    for (var i = 0; i < currentskills.length; i++) {
        await deleteSkill(currentskills[i]);
    }

    for (var i = 0; i < updated.length; i++) {
        await addSkill(currentskills[i],id);
    }
}

const getSkills = async (id) => {
   const query = `SELECT s.name, u.rating FROM usertoskill u JOIN skills s ON u.skill_id = s.skill_id WHERE u.id = $1 ORDER BY s.name`;
   const values = [id];
   return db.manyOrNone(query,values)
        .then(res=>res)
        .catch(err => console.log(err));
}

exports.partialUpdate = partialUpdate;
exports.addSkill = addSkill;
exports.getID = getID;
exports.getskillID = getskillID;
exports.checkUser = checkUser;
exports.updateSkills = updateSkills;
exports.getSkills = getSkills;
