# Dex Technical Assessment - Contact List Page

### 1. Technical Stack Used for the project ->
 - ReactJS for frontend.
 - Tailwind CSS and React-Bootstrap.
 - AWS API Gateway for REST APIs.
 - AWS lambda functions for CRUD operations.
 - S3 bucket to store uploaded images.
 - DynamoDB to store data objects.
 
 
 ### 2. Introduction and Functionality
 - This is a simple web application which basically have a functionality of storing contacts and each contact must have 3 required fields - Name, Image,    LastContactedAt Date.
 - Users have the functionality to search for contacts with the help of a search box present.
 - Clicking on the ContactCard opens up a Modal displaying the information of each contact. Modal has the functionality to update/delete any contact.
 - Toast notifications are shown on operations such as SAVE/UPDATE/DELETE any contact and on errors while performing CRUD operations.
 
 ### 3. Want to run the project locally ?
 To run the project locally you just need to clone the repository on your local using 
 `git clone https://github.com/jai2201/dex-assessment-project.git` and then `npm install` inside the root directory of the project to install all the   
 required `node_modules` for the project, this followed by `npm start` would start the application on your local on by default port `3000`.
   
### 4. Project Technical Details -> 
  - This project is build on ReactJS for Frontend, the pages are served using CLient-side rendering.
  - For Backend, I have used serverless AWS lambda functions for writing REST API functions, API gateway to provide APIs and DynamoDB to store key-value pairs, which eventually helps us to get rid of the paid of deploying backend service separately on server.
  - For styling the project, I have used Tailwind CSS which helps in styling the project quickly with responsivenss without taking the pain of deciding classNames for externalCSS.
  - To show notifications for operations like SAVE/UPDATE/DELETE and errors, I have used `React-toastify`.

### 5. API Documentation ->

The APIs are RESTful and arranged around resources. All requests can be made directly, there's no Authentication as of now. All requests must be made using https.

#### 5.1 Fetch List of Contacts

Typically, the first request you make is to fetch list of all the contacts.

```
  GET https://14jpf5t9kc.execute-api.ap-south-1.amazonaws.com/prod/contacts
```

Example Request:

```
curl --location --request GET 'https://14jpf5t9kc.execute-api.ap-south-1.amazonaws.com/prod/contacts' \
--data-raw ''
```

Example Response:

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "data": [
    {
        "last_contacted_at": "2022-12-29",
        "id": "5cgkc",
        "image": "https://dex-assessment-contact-images.s3.amazonaws.com/starbucks.jpeg",
        "name": "Jai soni",
        "phone": "9660077249"
    },
    {
        "last_contacted_at": "2022-12-28",
        "id": "sp1ca",
        "image": "https://dex-assessment-contact-images.s3.amazonaws.com/myntra.jpeg",
        "name": "Rashika",
        "phone": "8209064979"
    }
  ]
}
```

Where a Contact object is:

| Field        | Type           | Description  |
| ------------- |:-------------:| -----:|
| id      | String | A random generated ID for every contact to act as a primary key. |
| name      | String      |   Name of the contact person. |
| phone      | String      |  Phone number. |
| image      | String      |  URL of the image stored in S3 bucket.  |
| last_contacted_at | String      |    Date at which user was last contacted on. |


#### 5.2 Creating Contact

```
  POST https://14jpf5t9kc.execute-api.ap-south-1.amazonaws.com/prod/contacts
```

Example request : 

```
curl --location --request POST 'https://14jpf5t9kc.execute-api.ap-south-1.amazonaws.com/prod/contacts' \
--header 'Content-Type: application/json' \
--data-raw '    {
        "last_contacted_at": "2023-01-05",
        "name": "Jai soni",
        "image": "https://dex-assessment-contact-images.s3.amazonaws.com/pantaloons.jpeg",
        "phone": "9660077249"
    }'
```

Example Response:

status - 200 OK

#### 5.3 Updating Contact

```
  PUT https://14jpf5t9kc.execute-api.ap-south-1.amazonaws.com/prod/contacts/{{id}}
```

Here `id` is the id of contact object which is stored in DynamoDB. This ID can be acquired the using the above written GET API.

This API will re-write the complete object with this ID, hence we're required to send these fields in the body -


| Field        | Type           |
| ------------- |:-------------:|
| name      | String      |   
| phone      | String      |  
| image      | String      |  
| last_contacted_at | String |


#### 5.4 Deleting Contact
```
  DELETE https://14jpf5t9kc.execute-api.ap-south-1.amazonaws.com/prod/contacts/{{id}}
```

Here also the `id` is the id of contact object which is stored in DynamoDB. This ID can be acquired the using the above written GET API.

### 6. Assumptions ->
- I did not implement any API to fetch details of an individual contact object given the ID, since the size of contact object is very small and just contains 5 fields including the PRIMARY KEY, so we can fetch the complete contact object details in the request of fetching ALL CONTACTS.

- The order in which the contact objects are returned is random currently, as was not able to figure out the thing needed to be done for this in DynamoDB, will try to see if can fix this up in future.
