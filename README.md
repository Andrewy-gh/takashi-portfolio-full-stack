# Takashi Miyazaki

Portfolio web page for an international photographer.

**Link to live site:** https://takashi-photos.fly.dev

![alt tag](https://user-images.githubusercontent.com/17731837/264175251-732a9a1f-e474-4b0b-bd15-0ff0bfa80014.jpeg)

## How It's Made:

**Frontend:** Javascript, React, Material UI, Cloudinary, Vite

Material UI for components, styles, theming, and responsiveness. Cloudinary API allows images to be delivered with lazy loading and placeholders. It also handles transformations for different image sizes like the thumbnails on the Edit page. Vite allows larger bundles to be separated so that initial page load time is kept minimal.

**Backend:** Node.js, Express, MonogDB

## Requirements:

1. Cloudinary account: Used for uploading your images. You'll need a cloudinary cloudname, API key, and API secret.
2. Mongo DB account: A connection string to save your cloudinary image urls into your database.

## How to Run:

1. Clone the repository

2. In the project root directory: Enter these commands:
   `cd client && npm install` to install client side dependencies, and then
   `cd ../server && npm install` to install server side dependencies.

3. Open your editor, locate the `.env.example` file at `/server/.env.example` and change to `.env`. Fill in all the appropiate information from the requirements.

4. Run `npm run build:ui`. Make sure you are still in the `/server` directory. This creates the build process for the client side code and moves the finished build folder into your server directory.

5. After the build is done, you are ready to use. Just run `npm run start`.

## Usage:

The login is located at the bottom of the Profile page. Create an admin user first, and log in.
After logging in, all CRUD actions are located on the Edit page. Once images have been uploaded, `react-beautiful-dnd` allows editing the image order via dragging and dropping.
[![Demonstration](https://user-images.githubusercontent.com/17731837/264174575-c52b57a2-d846-4686-b29c-cefcbf10dec9.mp4)]

Image types can be filtered via the menu on the left or top if on mobile on the home page. Image types can be edited in `client/data/index.js`. This affects the menu bar and the select options on the image upload component.

## Optimizations:

As the portfolio grows bigger with time, pagination will be added so that load times and server response times can be kept minimal.
