<p align="center"><img height="144" width="368" src="https://user-images.githubusercontent.com/218656/29310158-9811c7a2-81a4-11e7-80cb-3f72752bdee6.png"></p>
<p align="center">Static site behind Google OAuth2 for allowed email domains</p>

---

**Static sites are awesome**. Fast, secure, versioned in git. Great way to present information that doesn't need to be dynamic — documentation, assets, event agendas.

But sometimes you want to have a static site inaccessible publicly. Something that can be **accessed only if the user is part of your G Suite domain**.

That's the Restricted Section. A very simple Node app that you can **host on Heroku with a click**, and start publishing content that is only accessible with the right email domain.

![Screenshots](https://user-images.githubusercontent.com/218656/29317628-c177bdd4-81c4-11e7-9c6e-4129d01b58f8.png)

<p align="center">
  <a href="https://heroku.com/deploy"><img src="https://www.herokucdn.com/deploy/button.svg" /></a>
</p>

## Deploying and configuring

#### Registering a Google Application

 First you should [register a new Google Application](https://console.developers.google.com/projectcreate). 
 
 💡 *Tip: you should create the application under the organization you are trying to restrict access to. It's not required, just a good practice.*
 
 Click **Enable and manage APIs**, and make sure **Contacts API** and **Google+ API** are on.
 
 Then, you should [create a new **OAuth2 Client ID**](https://console.developers.google.com/apis/credentials/oauthclient) in the Developer Console. [Google provides handy instructions](https://developers.google.com/identity/sign-in/web/devconsole-project). Note Client ID and Secret, you will need these. 
 
 For Authorized URLs you should enter 
 ```
 http://localhost:3000/authenticate/google/callback
 http[S]://[HOST]/authenticate/google/callback
 ```
 replacing `HOST` and protocol with public URL you want. It may take up to 10 minutes for Google to propagate settings.
 
 #### Deploy

The fastest way to get started is to **press that Deploy on Heroku button above**. You will need a Heroku account. 

On the next page enter required environment variables:

1. Client ID and Secret are from the Google OAuth2 you just created.
2. Session signing key can be [any random string](https://www.random.org/strings/?num=1&len=16&digits=on&upperalpha=on&loweralpha=on&unique=off&format=html&rnd=new).
3. `HOST` and `HOSTPROTOCOL` environment variables should be eventual public URL and whether you want it to be HTTPS-only (you should want that, but it requires paid Heroku plan).
4. Click the big **Deploy** button and wait! Heroku should deploy successfully, and opening the app should greet you with "Authentication required" page.

☝️ *Note: If you don't want to host your page under any memorable URL (e.g. something.example.com), you can of course use address provided by Heroku. Go in and add appropriate URLs to Google Developer Console and set HOST to `[APP_NAME].herokuapp.com`.*

Next, go to Settings tab of your newly deployed app, scroll to **Domains and Certificates**, and press Add domain. Once you add it, you will be given a DNS Target to set. Go to wherever you manage your domain, create a new CNAME record with given Target and wait a couple of minutes for new records to take effect.

#### Configure the authentication

On your local machine, clone this repository and switch to it.

Make sure [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) is installed and you are logged in with `heroku login` command. Then run `heroku git:remote -a [APP_NAME]`.

Update your config for local development:

1. In `config.json` set your Site `title` and `allowedDomains`.
2. To run authentication server locally (not required if you want to just work on static content), duplicate a file called `.env.example` to `.env` in root of repository and update it with correct values (can be the same as in Heroku). This file will not be committed to git.

Commit changes and do your first code push with `git push heroku master`. Once the new deploy goes live you should be able to do everything: open your new app at the correct URL, authenticate with Google, and see protected content if domain matches those included in config. 🎉

## Running locally

#### Without authentication

#### With authentication
