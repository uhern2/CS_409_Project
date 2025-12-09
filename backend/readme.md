# 📘 Backend Setup & MongoDB Atlas Guide

This backend uses **Node.js + Express + MongoDB Atlas + Mongoose**.

Because `node_modules/` and `.env` are **gitignored**, each teammate must individually set up:

- MongoDB Atlas access  
- Their own database user  
- Their own `.env` file  
- Local backend dependencies  

Follow all steps below to run the backend successfully.

---

# 📦 1. Install Backend Dependencies

From the project root folder:

```bash
cd backend
npm install


## 🗂 2. Set Up Your MongoDB Atlas Access

The MongoDB Atlas **cluster already exists**, but every teammate must create **their own database user**.  
Being added to the Atlas project is not enough — you still need a DB user.

### 2.1 Log In to Atlas

1. Go to: https://cloud.mongodb.com  
2. Log in with your own MongoDB account.  
3. Switch to the **organization/project** used for this class project (the one the team owner shared).

### 2.2 Create Your Own Database User

1. In the left sidebar, go to:  
   **Security → Database & Network Access**
2. Click **“Database Users → Add New Database User”**.
3. Under **Authentication Method**, select **“Password”**.
4. Choose:
   - **Username**: any unique value, for example: `yourname-dev`
   - **Password**: create a strong password (save it somewhere safe)
5. Under **Database User Privileges**:
   - Click **Atlas Admin**
6. Click **“Add User”**.

Each teammate must use their own username + password.  
Do **not** share credentials or reuse someone else’s DB user.

---

## 🔗 3. Generate Your Personal Connection String

Now you’ll get the connection URI that your backend will use.

### 3.1 Get the Base Connection String

1. In the left sidebar, go to:  
   **Database → (Your Cluster) → Connect**
2. Click **“Connect your application”**.
3. Choose the driver: **Node.js** and a version.
4. Copy the connection string that looks like this:

   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

## 4. Create Your .env File

Everyone keeps their own connection string in a private .env file.
This file is not committed to Git (it’s in .gitignore).

### 4.1 Create the .env File

From the backend/ folder:

```bash
touch .env

### 4.2 Add Required Environment Variables

Open .env in your editor and add:

```text
MONGODB_URI=mongodb+srv://<your-username>:<your-password>@cluster0.xxxxx.mongodb.net/booklog?retryWrites=true&w=majority
PORT=4000
JWT_SECRET=dev-secret-key


Replace:

<your-username> → your Atlas DB username

<your-password> → your Atlas DB password

cluster0.xxxxx.mongodb.net → whatever your cluster host is

🔒 Do not commit .env to GitHub.
Everyone on the team will have their own .env with their own credentials.

## 5. Run the Backend Server

Once your dependencies and .env are set up, you can start the backend.

### 5.1 Start the Dev Server

From the backend/ folder:

```bash
npm run dev

If everything is configured correctly, you should see logs similar to:

```text
Server running on port 4000
MongoDB connected successfully

### 5.2 Test the Health Route

Open your browser and go to:

```text
http://localhost:4000/health


You should see JSON like:
```text
{ "ok": true }


If you see that, your backend and MongoDB connection are working.

## 7. Backend Project Structure (Overview)

Typical structure:

```text
backend/
  src/
    server.js       # Express app + routes
    db.js           # Mongo connection via Mongoose
    models/         # Mongoose models (User, Book, ReadingLog, etc.)
    routes/         # Route handlers (e.g., /books, /logs, /auth)
  .env              # your local environment variables (ignored by Git)
  .gitignore        # ensures node_modules and .env are not committed
  package.json
  package-lock.json

## 8. Files That Must NOT Be Committed

Ensure that .gitignore in backend/ contains at least:

```text
node_modules/
.env


node_modules/ is huge and is recreated from package.json using npm install.

.env contains secrets (DB credentials, JWT secret, API keys, etc.).