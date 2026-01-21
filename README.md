# 🎮 Neon Arcade – Serverless 3-Tier Cloud Architecture (AWS)

Neon Arcade is a fully deployed **serverless 3-tier web application** built with AWS and Vite + React.  
It demonstrates real, production-grade cloud engineering using:

- CloudFront (CDN)
- S3 (Static Hosting)
- API Gateway (REST API)
- Lambda (Backend Compute)
- DynamoDB (NoSQL Database)
- IAM (Access Control)
- GitHub Actions (CI/CD Pipeline)

This project is built to showcase modern cloud architecture for resume, portfolio, and interview preparation.

---

## 🚀 Project Architecture

This is a complete **3-tier architecture**:

### **Frontend (Presentation Layer)**
- Vite + React + TypeScript
- Hosted on S3
- Delivered via CloudFront CDN
- Connected to backend using API Gateway URL

### **Backend (Application Layer)**
- AWS Lambda (Node.js 24)
- REST API with AWS API Gateway
- Clean JSON responses using DynamoDB unmarshall
- Full create/get/update functions

### **Database (Persistence Layer)**
- Amazon DynamoDB
- Stores player profile
- Auto-updated timestamps

---

## 🏗️ Architecture Diagram

             ┌─────────────────────────┐
             │     CloudFront CDN      │
             └─────────────┬───────────┘
                           │
                           ▼
                  ┌─────────────┐
                  │     S3      │
                  │ Static Site │
                  └──────┬──────┘
                         │
                         ▼
                ┌────────────────┐
                │  API Gateway   │
                └──────┬─────────┘
                       │
                       ▼
                 ┌──────────┐
                 │  Lambda  │
                 └────┬─────┘
                      │
                      ▼
               ┌──────────────┐
               │  DynamoDB    │
               └──────────────┘


---

## 🔥 Features

### ✔ **Player Profile API**
- Create new player
- Load existing player from DynamoDB
- Update name, avatar, and points

### ✔ **Clean Backend Responses**
- Uses AWS SDK v3 + unmarshall
- Full JSON output (no raw DynamoDB format)

### ✔ **Production-Grade CI/CD**
Automatic deployment on every Git push using GitHub Actions:

- Build Vite app
- Sync to S3
- Invalidate CloudFront cache
- Instant deployment

### ✔ **Secure IAM Setup**
- Dedicated CI/CD IAM user
- Least-privilege permissions
- No secret exposure in code

---

## 📂 Folder Structure
/src
/utils
api.ts # REST API handlers for frontend
storage.ts # Local playerId storage
App.tsx # Player load logic
constants.ts # Game list + API base URL

/.github
/workflows
deploy.yml # CI/CD pipeline


---

## 🧪 REST API Endpoints

Base URL: https://qta2nx5q11.execute-api.us-east-1.amazonaws.com/prod


### **POST /player**
Create a player

### **GET /player/{playerId}**
Get player details

### **PUT /player/{playerId}**
Update name, avatar, and points

---

## 🌐 Live Website (CloudFront)
https://d27q3jqtyjvtcj.cloudfront.net/


---

## 🛠️ CI/CD Pipeline

The GitHub Actions workflow:

- Runs on push to `main`
- Installs Node & dependencies
- Builds Vite app
- Uploads to S3 bucket
- Invalidates CloudFront cache

This ensures fully automated deployments.

---

## 📌 Technologies Used

### **AWS**
- CloudFront
- S3
- API Gateway
- Lambda (Node.js)
- DynamoDB
- IAM

### **Frontend**
- React
- Vite
- TypeScript

### **DevOps**
- GitHub Actions
- Automation pipelines

---

## 👤 Author
**Buddy (Akshay)**  
Aspiring Cloud Engineer • Full-Stack Developer  
Project built for learning, portfolio, and deployment skills.

---

## ⭐ Future Enhancements
- Game leaderboard API  
- Cognito authentication  
- Admin dashboard  
- Lambda CI/CD automation  
