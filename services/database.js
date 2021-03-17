const db = require('../database/pgAdaptor').db

// Partial Updating the arguments
const partialUpdate = (args) => {
  const values = []
  const columns = []
  const stringmanip = []
  let counter = 1
  // Takes all the arguments and formats it for the query
  for (const i in args) {
    if (args[i] != null && i !== 'skills') {
      values.push(args[i])
      columns.push(i)
      // For passing in variables to the pg promise
      stringmanip.push('$' + counter.toString())
      counter += 1
    }
  }
  const columnsplit = columns.toString()
  const stringsplit = stringmanip.toString()
  // Values is the actual variable values, column split is the name of columns in the query, and stringsplit is the variables syntax
  // e.g values = ['Zhehai', 'zhehai@zhehaizhang.com', 'Fairnight']
  // columnsplit = 'name, email, company'
  // stringsplit = '$1,$2,$3'
  return [values, columnsplit, stringsplit]
}

// Assigns skill to user based on id
const addSkill = async (skill, id) => {
  const createdSkill = await checkSkill(skill.name)
  // Checks if skill has been created
  // If not, then create the skill
  if (!createdSkill) {
    const query = `INSERT INTO skills (name) VALUES($1)`
    const values = [skill.name]
    await db.none(query, values)
      .then(async function () {
        // Connect the skill to user in the userstoskill table
        const skillID = await getskillID(skill.name)
        const query = `INSERT INTO usertoskill (id, skill_id, rating) VALUES($1,$2,$3)`
        const values = [id, skillID, skill.rating]
        await db.none(query, values)
          .then(res => res)
          .catch(err => console.log(err))
      })
  } else {
    // Connects the skill to user in the usertoskill table
    // Next time, turn this portion into its own function
    const skillID = await getskillID(skill.name)
    const query = `INSERT INTO usertoskill (id, skill_id, rating) VALUES($1,$2,$3)`
    const values = [id, skillID, skill.rating]
    await db.none(query, values)
      .then(res => res)
      .catch(err => console.log(err))
  }
}

// Gets the id of the user based on email
const getID = async (email) => {
  const query = `SELECT id FROM users WHERE email=$1`
  const values = [email]
  return db.one(query, values)
    .then(res => res.id)
    .catch(err => console.log(err))
}

// Gets the skill_id of the skill name
const getskillID = async (name) => {
  const query = `SELECT skill_id FROM skills WHERE name=$1`
  const values = [name]
  return db.one(query, values)
    .then(res => res.skill_id)
    .catch(err => console.log(err))
}

// Returns true or false based on whether user is in database
const checkUser = async (email) => {
  const query = `SELECT EXISTS(SELECT email from users where email=$1)`
  const values = [email]
  return db.one(query, values)
    .then(res => res.exists)
    .catch(err => console.log(err))
}

// Returns true or false based on whether the skill is in the database
const checkSkill = async (name) => {
  const query = `SELECT EXISTS(SELECt name from skills where name=$1)`
  const values = [name]
  return db.one(query, values)
    .then(res => res.exists)
    .catch(err => console.log(err))
}

// Deletes the skill
const deleteSkill = async (skill, id) => {
  const createdSkill = await checkSkill(skill.name)
  if (createdSkill) {
    const skillId = await getskillID(skill.name)
    const query = `DELETE FROM usertoskill WHERE skill_id=$1 AND id=$2`
    const values = [skillId, id]
    await db.none(query, values)
      .then(res => res)
      .catch(err => console.log(err))
  }
}

// Update skills of user
const updateSkills = async (updated, id) => {
  const currentskills = await getSkills(id)

  // Remove all the users skills
  for (let i = 0; i < currentskills.length; i++) {
    await deleteSkill(currentskills[i], id)
  }

  // Readd all the users skills with updated values
  for (let i = 0; i < updated.length; i++) {
    await addSkill(updated[i], id)
  }
}

// Get the skills based on id
const getSkills = async (id) => {
  const query = `SELECT s.name, u.rating FROM usertoskill u JOIN skills s ON u.skill_id = s.skill_id WHERE u.id = $1 ORDER BY s.name`
  const values = [id]
  return db.manyOrNone(query, values)
    .then(res => res)
    .catch(err => console.log(err))
}

// Update the user's info EXCEPT skills
const updateUser = async (args) => {
  const value = partialUpdate(args)
  if (value[0].length > 1) {
    const query = `UPDATE users SET(${value[1]}) = (${value[2]}) WHERE email='${args.email}'`
    const values = value[0]
    await db
      .none(query, values)
      .then(res => res)
      .catch(err => console.log(err))
  }
}

exports.partialUpdate = partialUpdate
exports.addSkill = addSkill
exports.getID = getID
exports.getskillID = getskillID
exports.checkUser = checkUser
exports.updateSkills = updateSkills
exports.getSkills = getSkills
exports.updateUser = updateUser
