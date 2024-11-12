# PHS Adminstrator Interface

The management and configuration for the associated [phs_backend](https://github.com/WoodyTheCat/phs_backend). It handles user management, page creation and deployment, blog-writing, and logging for networking and host utilisation. The page builder is forked from [Puck](https://github.com/measuredco/puck) and [Lexical](https://lexical.dev) is used for the WYSIWYG editor.

## Features (Quite a few to go...)

- [ ] Page creation
  - [x] MVP page builder
  - [ ] Save state to local storage
  - [ ] Backend integration
- [ ] Page deployment
  - [ ] Deployment queue
  - [ ] Conflict resolution
- [ ] User management
  - [x] Password resets
  - [x] Metadata editing
  - [ ] User creation
  - [x] User kicking
  - [ ] Permission assignment
  - [ ] Group creation
  - [ ] Group assignment
- [ ] Blogging
  - [x] Basic WYSIWYG with Lexical
  - [ ] Article list
  - [ ] Deployment queue and conflict resolution
- [ ] Logging
  - [ ] Blocking: Backend tracking of requests
  - [ ] ShadCN graphs
  - [ ] Fuzzy search
  - [ ] Rate limiting controls
  - [ ] Saturation warnings
- [ ] Machine management
  - [ ] Disk
    - [ ] Utilisation
    - [ ] Capacity
    - [ ] Cleanup
  - [ ] CPU utilisation
  - [ ] RAM utilisation
  - [ ] Network bandwidth
  - [ ] Uptime and events
  - [ ] Scheduled updates
- [ ] Dashboard
  - [ ] Summary items depending on the user's permissions
- [ ] Authentication
  - [ ] A proper login screen
  - [ ] Not hardcoding "admin" "admin" into said login screen
  - [ ] Session timeout handling
  - [ ] Remote logout handling
  - [ ] Account deletion
  - [ ] User-side profile management
  - [ ] Toggling nav item visiblity depending on permissions
