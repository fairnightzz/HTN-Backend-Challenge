import json
import requests
from python_graphql_client import GraphqlClient

client = GraphqlClient(endpoint="http://localhost:4000/graphql")

mutation = """
    mutation{
        addUser ($name: String, $picture: String, $company: String, $email: String, $phone: String, $skills: List) {
            
        }
    }
"""

with open('loader.json') as f:
    data = json.load(f)

for i in data:
    variables = {"name":i['name'], "picture":i['picture'], "company":i['company'],"email":i['email'],"phone":i['phone'],"skills":i['skills']}
    data = client.execute(query=mutation,variables=variables)
