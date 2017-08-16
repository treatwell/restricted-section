<p align="center"><img height="144" width="368" src="https://user-images.githubusercontent.com/218656/29310158-9811c7a2-81a4-11e7-80cb-3f72752bdee6.png"></p>
<p align="center">Static site behind Google OAuth2 for allowed email domains</p>

---

**Static sites are awesome**. Fast, secure, versioned in git. Great way to present information that doesn't need to be dynamic, such as documentation, assets, event agendas. **Restricted Section** is a simple Node app that you can host on Heroku with a click, and start publishing content that can be **accessed only if the user is part of your G Suite domain**.

![Screenshots](https://user-images.githubusercontent.com/218656/29317628-c177bdd4-81c4-11e7-9c6e-4129d01b58f8.png)

<p align="center">
  <a href="https://heroku.com/deploy"><img src="https://www.herokucdn.com/deploy/button.svg" /></a>
</p>

## Deploying and configuring

### Registering a Google Application

 First you should [register a new Google Application](https://console.developers.google.com/projectcreate). 
 
 💡 *Tip: you should create the application under the organization you are trying to restrict access to. It's not required, just a good practice.*
 
 Click **Enable and manage APIs**, and make sure **Contacts API** and **Google+ API** are enabled.
 
 Then, you should [create a new **OAuth2 Client ID**](https://console.developers.google.com/apis/credentials/oauthclient) in the Developer Console. [Google provides handy instructions](https://developers.google.com/identity/sign-in/web/devconsole-project). Pick a name for your site, it will be visible to users when logging in. Note Client ID and Secret, you will need these. 
 
 Authorised JavaScript origins can be left blank. For Authorised redirect URIs you should enter 
 ```
 http://localhost:3000/authenticate/google/callback
 http[S]://[HOST]/authenticate/google/callback
 ```
 replacing `HOST` and protocol with public URL you want. It may take up to 10 minutes for Google to propagate settings.
 
 ### Deploy

The fastest way to get started is to **press that Deploy on Heroku button above**. You will need a Heroku account. 

On the next page enter required environment variables:

1. **Allowed domains** is a domain, or comma-separated list of domains to which the site will be restricted to.
2. **Client ID and Secret** from the Google OAuth2 you just created.
3. **Session signing key** can be [any random string](https://www.random.org/strings/?num=1&len=16&digits=on&upperalpha=on&loweralpha=on&unique=off&format=html&rnd=new).
4. `HOST` and `HOSTPROTOCOL` environment variables should be eventual public URL and whether you want it to be HTTPS-only (you should want that, but it requires paid Heroku plan).
5. Click the big **Deploy** button and wait! Heroku should deploy successfully, and opening the app should greet you with "Authentication required" page.

☝️ *Note: If you don't want to host your page under any memorable URL (e.g. something.example.com), you can use the address provided by Heroku. Be sure to add herokuapp.com URI to Google Developer Console and set HOST to `[APP_NAME].herokuapp.com`.*

Next, go to the Settings tab of your newly deployed app, scroll to **Domains and Certificates**, and press **Add domain**. Once you add it, you will be given a DNS Target to set. Go to wherever you manage your domain, create a new CNAME record with given Target and wait a couple of minutes for new records to take effect.

**That's it, the site is ready!** Once everything propagates you should be able to click the blue authentication button, login with an allowed Google account and see example content 🎉

## Working on the site

### Setup working environment

On your local machine, clone this repository and switch to it. Run `npm install` to install all dependencies.

Make sure [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) is installed and you are logged in with `heroku login` command. Then run `heroku git:remote -a [APP_NAME]` to add Heroku as a git remote.

After you make any changes, commit, and push with `git push heroku master`. Each Heroku deploy builds the site, so you don't need to commit the `public` repository.

### Running without authentication

For most sites, all you want to work on is the static content behind the lock. Just run `npm run dev` and open [localhost:8080](http://localhost:8080). There is no authentication needed when running local server this way.

Local server supports LiveReload. Every time you modify a file it will be compiled and page will automatically reload changed resources. 🍭 Sweet!

**Pages** are in `source/content`. By default Gulp is configured to compile files with [Pug](https://pugjs.org/api/getting-started.html). **Stylesheets** (built with SCSS) live under `source/assets/stylesheets`, **Scripts** (built with Browserify) are under `source/assets/scripts`. You should use `source/assets/icons` for favicon, apple-touch-icons and similar resources. Other assets folder should be self-explanatory.

Have fun! ✨

### Running with authentication

If you want to test authentication locally, duplicate a file called `.env.example` to `.env` in the root of the repository and update it with working values. They can be the same as in the Heroku instance, but you may want to create a separate OAuth2 Client and Secret just for sanity. This file will not be committed to git.

Then, run `npm start` and open [localhost:3000](http://localhost:3000). If localhost was added to your OAuth2 list of Authorized redirect URIs, everything should work as expected.
