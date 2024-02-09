# Steam Profile Spoofer / Steam Profile Editor

A Node.js script for automating the process of logging into a Steam account and periodically changing profile details such as username, real name, avatar, custom URL, and profile summary. This script utilizes the SteamCommunity library for interaction with the Steam Community API. This was initially made for Rust to hide username/steam profile when players would F7 and try and find your username.

## Features

- Randomly generates profile details using the `faker` library.
- Handles Steam Guard, CAPTCHA, and other login-related scenarios.
- Periodically updates the Steam profile with new random details.
- Supports customization through a configuration file.

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- Steam account credentials (account name and password).

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/R3DActual/steam-profile-editor.git

2. `npm i`

3. Update `config.json` with your account information 

4. Then either run `npm run start` or `npm run build` to build an EXE file.
