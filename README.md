#FCCUserEditor

This project has been written as an introduction to Node.js, MongoDB and Express based apps.

*Based on Christopher Buecheler's [sample project](https://github.com/cwbuecheler/node-tutorial-for-frontend-devs). Also here I've used code portions from FreeCodeCamp's [COM100]() challenge editor. And Contributing guidelines are from [FreeCodeCamp](https://github.com/FreeCodeCamp/FreeCodeCamp).*

### Table of contents
1. [About the project](#user-content-about-the-project)
2. [How to have it up and running?](#user-content-how-to-have-it-up-and-running)
3. [How to use FCCUserEditor?](#user-content-how-to-use-fccusereditor)
4. [To-Do](#user-content-to-do)
5. [Contributing](#user-content-contributing)

## About the project

After we've merged in [#6592](https://github.com/FreeCodeCamp/FreeCodeCamp/pull/6592) which adds auto-collapsing feature for completed superblocks (and I thought for blocks too) @hallaathrad founded out that, actually, blocks are not being collapsed in case that superblock's all blocks are not completed. I haven't noticed this issue in my local FCC instance because I had only one block completed and it was the only block in it's parent superblock :)

Therefore, I decided to write a project which will help to easily mark challenges as completed/uncompleted. But I went even far and now **FCCUserEditor** not only does that but also is able to edit user object's properties and remove the user from the DB entirely.

## How to have it up and running?

1. Clone this repository to the same directory where your Free Code Camp directory is (ex> `/Users/bugron/dev`)
  * The directory should be something like:
  ```
  /Users/bugron/dev
  |- FCCUserEditor
  |- freecodecamp
  ```
  * `git clone https://github.com/bugron/FCCUserEditor.git`
2. `<yourFCC_FOLDER_NAME>` is whatever you named your Free Code Camp repository locally (see `freecodecamp` above).
  * `echo 'FCC_FOLDER_NAME = "<yourFCC_FOLDER_NAME>"' >> .env`
3. Install dependencies: `npm install` and `bower install`.
4. **IMPORTANT!**: Make sure you have `mongod` running and FreeCodeCamp's DB is located at `localhost:27017/freecodecamp`.
5. In your cloned repository's folder run: `npm start`. By default It will start serving at `http://localhost:3005`.
6. Go to `http://localhost:3005/files` to start using the editor.

## How to use FCCUserEditor?
![](http://i.imgur.com/uGcn5hi.png)
<p align="center"><i><b>FCCUserEditor's initial state</b></i></p>
Visually editor is divided into three parts. I call them simple. Left, middle and right :)
On the left side you can see a dropdown menu which elements consist of FCC `username`s found in the DB. **To get started you have to click that dropdown and select a user you want to edit.**
![](http://i.imgur.com/CEeUBH1.png)
<p align="center"><i><b>FCCUserEditor has simple interface</b></i></p>
As result on the left side are now visible inputs which contain information fetched from the DB (the only inputs which are *required* are username, email and password inputs and password **is not** filled automatically). Loopback encrypts passwords in [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) and this project uses Daniel Wirtz's [bcrypt.js](https://github.com/dcodeIO/bcrypt.js) to encrypt entered passwords.

On the middle you see nested checkboxes which are (surprisingly) accordions (*only* 'superblock' and 'block' checkboxes). Checking a block/superblock checkbox will also check all children checkboxes. `Check/uncheck all checkboxes` checkbox, as expected, checks or unchecks **all** checkboxes.

On the right side you see that buttons are now active:

 - `Check random challenges`, as expected, checks random amount of checkboxes.
 - `Save/Add user` saves all the changes to the DB.
 - `Delete user` removes current selected user form the DB.
 
**Note:** if you want to reset all changes without saving just select the user from the dropdown menu.
When you click any of `Save/Add user` or `Delete user` buttons the page will be reloaded.
`Save user` button has two states. When `username` input's text is an existing `username` from the menu it is `Save user`. Otherwise it becomes `Add user` and clicking it will create a new user with the specified `username`. This means that, currently, changing user's `username` is not available. This is in To-Do list :) The workaround is creating a new user and removing the old one.

## To-Do
1. Save fetched `JSON` files to `localStorage` and load from there when possible and add the logic to decide either load from `localStorage` or from local files (to have all changes (if such) made to original `JSON` files fetched).
2. Add ability to change user's `username` (something like 'Rename mode' checkbox).
3. Make host, port, DB URL configurable.
4. Better error handling (ex. `http://localhost:3005/files` will fail if DB is not available or there are no users in the DB).
5. Add a notification if changes are/aren't saved successfully in the DB (modal, popup, toast, something like that, [toastr](https://github.com/codeseven/toastr/) is a nice one).
6. Ability to set `JSON` files location in web interface.
7. Cache jQuery objects for better performance
8. Implement rest of user object's properties (see `common/models/user.json` in FCC's main repository) and explain all of them here.
9. Use [basket.js](https://github.com/addyosmani/basket.js) to load JS and CSS files (as an experiment).

## Contributing
See [CONTRIBUTING.md](https://github.com/bugron/FCCUserEditor/blob/master/CONTRIBUTING.md)