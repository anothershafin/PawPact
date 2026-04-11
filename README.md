# PawPact 🐾
A MERN-stack pet adoption platform that helps **adoptee parents** publish pets for adoption and helps **adopters** apply in a **safe and structured** way. PawPact supports a **14-day observation period** before an adoption becomes permanent. 

## SRS Document

- **SRS Link:** _[Click Here](https://docs.google.com/document/d/1OFknvW-dQ63AYljDEAt3fJBGf8-ErHil/edit?usp=sharing&ouid=100453048472828081236&rtpof=true&sd=true)_

## Team Members
| **Student ID** | **Name** |
|---|---|
| **22201469** | Shafin Ahmed |
| **22299391** | Nehal Mahfuz |
| **22341008** | Shafayet Amin Zeehan |
| **22301092** | Fardin Saurov |

## Key Features (from SRS)
### Roles
- Adopter
- Adoptee Parent
- Admin

### Core Functional Requirements
- Login and Sign up [Not included in the submitted functional requirements]

> We will be adding the functional requirements after we build them.

## Tech Stack
### Frontend
- **React.js**

### Backend
- **Node.js**
- **Express.js**
- **REST APIs**

### Database
- **MongoDB**
- **Mongoose**

## Architecture (MVC)
We will follow the **Model–View–Controller (MVC)** pattern to keep the codebase organized and easier to maintain.

### MVC Layers
### Model
- Stores the data structures and schemas.
- Handles database logic and CRUD operations.
- Does not handle UI.

### View
- Contains the user interface.
- Responsible for showing data to users and taking user input.

### Controller
- Works as the bridge between View and Model.
- Receives requests from the View, processes them, and updates or reads from the Model.
- Sends responses back to the View.

### Request Flow
1. User interacts with the **View**.
2. The **View** sends a request to the **Controller**.
3. The **Controller** communicates with the **Model** to read or update data.
4. The **Model** returns data to the **Controller**.
5. The **Controller** returns the response to the **View**.

---

## Folder Structure (MVC)
At the root level, the project is organized into **three MVC folders**:

```txt
pawpact/
  model/              # Data layer (schemas, database logic, CRUD)
  view/               # UI layer (pages, components, UI assets)
  controller/         # Request handling and feature controllers
  README.md
```

### What goes where
- **model/**: database connection (if needed), schemas, and data access functions.
- **view/**: UI pages/screens, components, styling, assets, and frontend routing (if used).
- **controller/**: controllers for each feature/module, validation, and response formatting.



## Notes
- Payment processing is **not included** in the first version.- The app is designed for modern browsers and responsive use.
