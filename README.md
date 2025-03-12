# DayEduTechBe
serverside untuk komponen dayedutechfe, lms platform education technologi, services API untuk membeli course dan access to lms for learning, berisikan authentication dan order management


# Table Of Contents
-   🚀 Features
-   📚 API Documentation
-   🧪 Unit Testing
-   🔐 Environment Variables
-   ⚙️ Installation
-   🔗 Frontend Repository

# Features
🔐Authentication: fitur register dan login with JWT Token dan security payload
🙎‍♂️addImage: upload gambar  untuk course dan profile menggunakan multer
💵payment gateway: midtrans payment gateway
📩email verification: melakukan verifikasi pada saat register berhasil sebelum melakukan login menggunakan nodemailer dan handlebars sebagai template
🔥firebase: configurasi untuk login with google

# 📚 APi documentation
![Image](https://github.com/user-attachments/assets/2e5c78b4-7dff-4757-a83f-1589ce421435)


# 🧪 Unit Testing

![Image](https://github.com/user-attachments/assets/f0faad7f-206e-427e-9405-6f4052303f39)


# 🔐 Environment Variables
NODE_ENV=you_node_env

PORT=you_port

#postman api

POSTMAN_API_URL=you_postman_api_url

POSTMAN_ACCESS_KEY=you_postman_access_key

SWAGGER_OUTPUT_PATH= you_swagger_output_path

  

#app_url

APP_URL=you_app_url

API_URL=you_api_url

#previxApp

PREFIX_APP=you_prefix_app

#midtrans

MIDTRANS_SNAP_URL=you_midtrans_snap_url

MIDTRANS_BASE_URL=you_midtrans_base_url

MIDTRANS_SERVER_KEY= you_midtrans_server_key

  

DB_USERNAME_DEVELOPMENT = you_uisername_development

DB_PASSWORD_DEVELOPMENT =you_password_development

DB_DATABASE_DEVELOPMENT = you_database_development

DB_HOST_DEVELOPMENT =you_host_development

DB_DIALECT_DEVELOPMENT = you_dialect_development

#jwtsecret

JWT_SECRET=you_jwt_secret

#setting Firebase

FIREBASE_TYPE= you_firebase_type

FIREBASE_PROJECT_ID=you_firebase_project_id

FIREBASE_PRIVATE_KEY_ID=you_firebase_private_key_id

FIREBASE_PRIVATE_KEY=you_firebase_private_key

FIREBASE_CLIENT_EMAIL=you_firebase_client_email

FIREBASE_CLIENT_ID=you_firebase_client_id

FIREBASE_AUTH_URI=you_firebase_auth_uri

FIREBASE_TOKEN_URI=you_firebase_token_uri

FIREBASE_AUTH_PROVIDER_X509_CERT_URL= you_firebase_auth_provider_x509_cert_url

FIREBASE_CLIENT_X509_CERT_URL=you_firebase_client_X509_CERT_URL

FIREBASE_UNIVERSE_DOMAIN=you_firebase_universe_domain

  
  

MAIL_APP_PASSWORD= you_mail_app_password

MAIL_SERVICE= you_mail_service

MAIL_USER=you_mail_user
  

COOKIE_NAME=you_cookie_name

APP_PRIVATE_KEY=you_app_private_key==

  

APP_PUBLIC_KEY=you_app_public_key==

  

APP_SECRET_KEY=you_app_secret_key

## ⚙️ Installation


1.  Clone the repository:

```
git clone https://github.com/your-username/day-edu-tech-be.git
cd day-edu-tech-be

```

2.  Install dependencies:

```
npm install

```

3.  Set up your environment variables as described in the section above.
4.  Run database migrations:

```
npm run migrate:up
npm run seed:up

```

5.  Start the development server:

```
npm run dev
```

The server should now be running on  `http://localhost:5000`.

## 💻 Frontend Repository

🔗  [day-edu-tech-fe](https://github.com/rofiday/day-edu-tech-fe.git)
