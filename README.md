# HTN-Backend-Challenge
This is my backend challenge.
Test it out [here](https://htn.zhehaizhang.com/graphql)

This is my __first time__ making a graphQL server, so I will try to document my process,
the challenges I encountered, and how I fixed them.


## Setup

Node Server Dependencies:

1. cors - this is for https connections
2. dotenv - this is for environment variables such as postgres credentials
3. eslint - detect bugs and things I'm not doing properly
4. express - for node server
5. express-graphql, graphql - for query and mutation api
6. morgan - for debugging (this is more for REST apis, but including it would not be so bad for seeing the requests.)
7. nodemon - for debugging and testing
8. pg-promise - for connecting to the postgres database!

## Postgres Database Setup:

I set up my database in consideration of the large amount of data. 
I created 3 tables:
1. users - this is to store all of the user information __EXCLUDING__ skills, since there are 
multiple skills to store.

```
Table "public.users"
Column  |          Type          | Collation | Nullable |                         Default
---------+------------------------+-----------+----------+----------------------------------------------------------
id      | integer                |           | not null | nextval('users_id_seq'::regclass)
email   | character varying(100) |           | not null |
name    | character varying(100) |           | not null |
picture | character varying(255) |           |          | 'https://api.zhehaizhang.com/default'::character varying
company | character varying(100) |           | not null |
phone   | character varying(100) |           | not null |
Indexes:
   "pk_id" PRIMARY KEY, btree (id)
   "uk_email" UNIQUE CONSTRAINT, btree (email)
Referenced by:
   TABLE "usertoskill" CONSTRAINT "fk_id" FOREIGN KEY (id) REFERENCES users(id)
```
Note that I make ID a primary key and email a unique contraint. This way, it's
possible for a user to change their email, while keeping the same unique ID for fast and efficient queries.
Also notice that picture is the only column that isn't not null, because users don't usually upload their picture immediately after they create an account.
Hence, if it's null, then there will be a default picture in its place instead. 

2. skills - this table is mainly for store the skill name.

```
                                         Table "public.skills"
   Column    |          Type          | Collation | Nullable |                 Default
-------------+------------------------+-----------+----------+------------------------------------------
 skill_id    | integer                |           | not null | nextval('skills_skill_id_seq'::regclass)
 name        | character varying(50)  |           | not null |
 description | character varying(255) |           |          |
Indexes:
    "pk_skills" PRIMARY KEY, btree (skill_id)
    "uk_skillname" UNIQUE CONSTRAINT, btree (name)
Referenced by:
    TABLE "usertoskill" CONSTRAINT "fk_skillid" FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
```

Notice that I made skill_id a primary key and skill name a unique constraint. This is for the same concept as the users table. 
I also added a nullable description for skills just in case for the frontend.

3. usertoskill - this table is to link user's skills

```
             Table "public.usertoskill"
  Column  |  Type   | Collation | Nullable | Default
----------+---------+-----------+----------+---------
 id       | integer |           | not null |
 skill_id | integer |           | not null |
 rating   | integer |           |          |
Foreign-key constraints:
    "fk_id" FOREIGN KEY (id) REFERENCES users(id)
    "fk_skillid" FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
```

Notice that id and skill_id are both foreign keys in order to connect the primary keys in both skills and users.
In here, I relate the user id to a skill, and added an additional column for rating. I left it null because a user may not rate a skill.

### Allowing for easy setup:

I created two files, ``template.sql`` and ``templatewithdata.sql`` to allow for people to import this database into any Postgresql database.


## Endpoints

- User Endpoints:
  - All Users

  ```
  query {
    users {
      name
      email
      company
      picture
      phone
      skills {
        name
        rating
      }
    }
  }
  ```
  This endpoint returns a list of all user data from the database in JSON format.

  - Single User Endpoint

  ```
  query {
    user(email: String) {
      name
      email
      company
      picture
      phone
      skills {
        name
        rating
      }  
    }
  }
  ```

  By passing in an email, this endpoint returns the user data for a specific user in JSON format.

  - Updating User Data

  ```
  mutation {
    updateUser(email: String (Required), name: String, company: String, picture: String, phone: String, skills: List({name: String, rating: Int })) {
      name
      email
      company
      picture
      phone
      skills {
        name
        rating
      }
    }
  }
  ```

  By passing in a required email, this endpoint mutates the user data for that specific email and returns the updated user data in JSON format.

  EXTRA FEATURES:

  - Add User

  ```
  mutation {
    addUser(email: String (Required), name: String (Required), company: String (Required), picture: String, phone: String (Required), skills: List({name: String (Required if added), rating: Int })) {
      name
      email
      company
      pciture
      phone
      skills {
        name
        rating
      }
    }
  }
  ```

  By passing in the required parameters, this endpoint adds a new user. If the skill has not been made before, it will add a new skill as well.

  - Add Users

  ```
  mutation {
    addUsers(List(email: String (Required), name: String (Required), company: String (Required), picture: String, phone: String (Required), skills: List({name: String (Required if added), rating: Int }))) {
      name
      email
      company
      pciture
      phone
      skills {
        name
        rating
      }
    }
  }
  ```

  By passing in a list of users, this endpoint adds multiple users. If the skill has not been made before, it will add a new skill as well.


- Skills

```
query {
  skills (min_frequency: Int, max_frequency: Int ){
    name
    frequency
  }
}
```

Returns a list of skills along with their name and frequency. If a parameter is passed in, 
it will return only those skills that satisfy these requirements. You are allowed to pass in one, both, or none.


- REST: /user Endpoint (Post Request)
There are no parameters, but calling this will insert all the template data in the sql file. This is only used for development.

## Docker
For Docker, I set my config files so that I would be able to access port 5000.
I was planning to dockerize my postgresql server as well, but I still managed to set up the server.

# Conclusion

Over these past few days, I learnt a lot about GraphQL - I think I like it _way_ more thank REST now! Thank you so
much for creating this challenge, I really enjoyed it!

Sincerely,

Zhehai Zhang