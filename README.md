# Takashi Miyazaki

Portfolio web page for a photographer

**Link to project:** https://takashi-photos.fly.dev

![alt tag](https://user-images.githubusercontent.com/17731837/264175251-732a9a1f-e474-4b0b-bd15-0ff0bfa80014.jpeg)

## How It's Made:

**Frontend:** Javascript, React, Material UI, Cloudinary, Vite

Material UI for components, styles, theming, and responsiveness. Cloudinary API allows images to be delivered with lazy loading and placeholders. It also handles transformations for different image sizes like the thumbnails on the Edit page. Vite allows larger bundles to be separate so that initial page load time is kept minimal.

**Backend:** Node.js, Express, MonogDB

## How to Run:

1. Clone the repository

2. In the project root directory. Enter these commands:
   `cd client && npm install` to install client side dependencies, and then
   `cd ../server && npm install` to install server side dependencies

3. Open your editor, locate the `.env-example` file at `/server/.env-example` and change to `.env`. Fill in all the appropiate information.

4. Once all env variables are filled except `ADMIN_ID` run `npm run dev` while still in the `/server` directory

5. Once the server is running, send a POST request to `http://localhost:3000/api/user` with your chosen `email` and `password` to initialize the admin. An example is provided at `/server/requests/createAdmin.rest` if you want to use the REST CLIENT VS CODE extension.

<!-- image -->

6. Use the returned response from MongoDB and save the `id` value as your `ADMIN_ID` inside your `.env` file.

<!-- image -->

7. To initialize the image order, send a POST request at `http://localhost:3000/api/imageOrder`. An example is provided at `/server/requests/createAdmin.rest` if you want to use the REST CLIENT VS CODE extension.

8. Turn off the server and run `npm run build:ui`. Make sure you are still in the `/server` directory. This creates the build process for the client side code and moves the finished build folder into your server directory.

9. After the build is done, you are ready to use. Just run `npm run start`.

## Usage

The login is located at the bottom of the Profile page.
After logging in, all CRUD actions are located on the Edit page. `react-beautiful-dnd` allows editing the image order via dragging and dropping.
[![Demonstration](https://user-images.githubusercontent.com/17731837/264174575-c52b57a2-d846-4686-b29c-cefcbf10dec9.mp4)]

Image types can be filtered via the menu on the left or top if on mobile on the home page. Image types can be edited in `client/data/index.js`. This affects the menu bar and the select options on the image upload component.

### Optimazations

As the portfolio grows bigger with time, pagination will be added so that load times and server response times can be kept minimal.
