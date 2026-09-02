# 🔐 SecureVault: Enterprise Blockchain-Based Secure File Sharing System

[![Version](https://img.shields.io/badge/version-2.0.0-cyan.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-emerald.svg)](LICENSE)
[![Security](https://img.shields.io/badge/AES--256-CBC-purple.svg)](#security)
[![Decentralized](https://img.shields.io/badge/IPFS-Pinata-teal.svg)](#ipfs)
[![Blockchain](https://img.shields.io/badge/EVM-Smart%20Contract-amber.svg)](#blockchain)

An enterprise-ready, zero-knowledge, decentralized file sharing platform combining **AES-256-CBC stream encryption**, **SHA-256 cryptographic integrity verification**, **IPFS decentralized storage**, **Ethereum smart contract file registration**, **Role-Based Access Control (RBAC)**, **AI Security Intelligence**, and **Intrusion Detection System (IDS)** telemetry.

---

## 🌟 Key Features

### 🔐 Cryptography & Storage
- **AES-256-CBC Stream Encryption**: Direct byte-stream encryption with random IVs per file. Zero plaintext write to disk.
- **SHA-256 Multi-Hash Integrity**: Computes SHA-256, SHA-512, and MD5 hashes simultaneously for proof of non-tampering.
- **IPFS Pinning Integration**: Decentralized file chunk distribution via Pinata Cloud API with local node failover.
- **Ethereum Smart Contract Registry**: Solidity `FileRegistry.sol` contract deployed on EVM networks for immutable timestamp and ownership proof.

### 🛡️ Enterprise Security & Telemetry
- **Role-Based Access Control (RBAC)**: Fine-grained permissions (`User`, `Auditor`, `Admin`).
- **Intrusion Detection System (IDS)**: Middleware monitoring rate limits, unauthorized attempts, SQL/NoSQL injection signatures, and brute-force patterns.
- **AI Security Intelligence**: Real-time telemetry analyzer offering security scores (0–100) and actionable defense recommendations.
- **Audit File Timeline**: Immutable per-file lifecycle logs tracking uploads, encryptions, shares, downloads, and deletions.

### 🎨 Enterprise UI & UX
- **Real-Time Upload Pipeline**: 6-stage animated progress visualization with live transfer speed tracking (KB/s).
- **Interactive Notification Center**: Live polling header notification center with unread badge counters and severity alerts.
- **AI Security Assistant**: Floating interactive chatbot providing instant plain-language security guidance.
- **Role-Tailored Dashboards**: Specialized views for standard Users, Auditors, and System Administrators.

---

## 🏗️ System Architecture

```
                                  +-----------------------+
                                  | React + Vite Frontend |
                                  |  (TailwindCSS & Glass)|
                                  +-----------+-----------+
                                              |
                                              | REST / JWT
                                              v
                                  +-----------+-----------+
                                  | Node.js / Express API |
                                  +-----+-----+-----+-----+
                                        |     |     |
              +-------------------------+     |     +-------------------------+
              |                               |                               |
              v                               v                               v
    +---------+---------+           +---------+---------+           +---------+---------+
    |  MongoDB Database |           |   IPFS (Pinata)   |           | Ethereum Blockchain|
    | (Files/Users/Logs)|           | Decentralized P2P |           | (Smart Contract)  |
    +-------------------+           +-------------------+           +-------------------+
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+
- MongoDB instance (Local `mongodb://localhost:27017` or MongoDB Atlas)
- Metamask Browser Extension (Optional for Web3 authentication)

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*Backend server will listen on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend dev server will launch on `http://localhost:5173`*

---

## 🐳 Docker Deployment

To launch the complete stack (MongoDB + Backend API + Frontend) with Docker Compose:

```bash
docker-compose up --build -d
```

---

## 📋 API Route Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | User registration with password hashing |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `POST` | `/api/files/ipfs/upload` | User | AES-256 encrypt & pin file to IPFS |
| `GET`  | `/api/files/user-files` | User | List user's active/starred files |
| `PATCH`| `/api/files/:id/favorite` | User | Toggle file favorite status |
| `PATCH`| `/api/files/:id/trash` | User | Move file to Trash Bin |
| `GET`  | `/api/files/:id/timeline` | User | View file activity lifecycle audit log |
| `GET`  | `/api/dashboard/user` | User | Retrieve user dashboard stats & score |
| `GET`  | `/api/dashboard/admin` | Admin | Retrieve enterprise telemetry & IDS alerts |
| `GET`  | `/api/ai/recommendations`| User | Fetch AI security analysis |
| `GET`  | `/api/notifications` | User | Retrieve unread notification feed |

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
