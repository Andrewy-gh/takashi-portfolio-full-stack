# Takashi Miyazaki

Portfolio web page for a photographer

**Link to project:** https://takashi-photos.fly.dev

![alt tag]()

## How It's Made:

**Frontend:** Javascript, React, Material UI, Cloudinary, Vite

Material UI for components, styles, theming, and responsiveness. Cloudinary API allows images to be delivered with lazy loading and placeholders. It also handles transformations for different image sizes like the thumbnails on the Edit page. Vite allows larger bundles to be separate so that initial page load time is kept minimal.

**Backend:** Node.js, Express, MonogDB

## How to Run:

1. Fork the repository

2. In the project root directory. Enter these commands:
   `cd client && npm install` to install client side dependencies, and then
   `cd ../server && npm run install` to install server side dependencies

3. Change `.env-example` to `.env` and fill in all the appropiate information.

4. Once all env variables are filled except `ADMIN_ID` run `npm run dev` while still in the `server` directory

5. Once the server is running, send a POST request to `http://localhost:3000/api/user` with your chosen `email` and `password` to initialize the admin. A template is provided at `server/requests/createAdmin.rest` if you want to use the REST extension in VS CODE.

<!-- image -->

6. Use the returned response from your MongoDB and save the id field as your `ADMIN_ID` inside your `.env` file.

<!-- image -->

7. To initialize the image order, send a POST request `http://localhost:3000/api/imageOrder. A template is provided at `server/requests/createAdmin.rest` if you want to use the REST extension in VS CODE.

8. Turn off the server and run `npm run build:ui`. This creates the build process for the client side code.

9. After the build is done processing, you are ready to use. Just run `npm run start` while still inside the `server` directory.

## Usage

The login is located at the bottom of the profile page.
After logging in, all CRUD image actions are located on the edit page. `react-beautiful-dnd` allows editing the image order via dragging and dropping.
Demonstration below:

Image types can be filtered via the menu on the left or top if on mobile on the home page. Image types can be edited in `client/data/index.js`. This affects the select options on the image upload component.

### Optimazations

As the portfolio grows bigger with time, pagination will be added so that load times and server response times can be kept minimal.
