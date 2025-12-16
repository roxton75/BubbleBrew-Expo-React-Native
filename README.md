# ☕🧋 BubbleBrew

![Expo](https://img.shields.io/badge/Expo-SDK%2054-black?logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.76-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue?logo=typescript)
![Realm](https://img.shields.io/badge/Database-Realm-purple)
![License](https://img.shields.io/badge/License-MIT-green)

**BubbleBrew** is a minimalist café order management mobile app built with **Expo + React Native**, designed for small coffee and boba stalls that need a fast, clean, and offline-first workflow — without heavy POS systems.

---

## ✨ Features

- 📋 **Order Lifecycle Management**  
  New → Preparing → Ready → Paid / Cancelled

- 🕘 **Order History**  
  View paid and cancelled orders with expandable detail cards

- 🔄 **Live Updates**  
  Orders update instantly across tabs using Realm listeners

- 🍵 **Menu Management**  
  Add, edit, and manage menu items easily

- 🎨 **Clean & Modern UI**  
  Dark-mode–friendly design focused on clarity and speed

- ⚡ **Offline-First**  
  Fully functional without internet using local Realm DB

---

## 📱 Screens

- **Home**
  - Active Orders
  - Ready Orders

- **History**
  - Paid Orders
  - Cancelled Orders

- **Menu**
  - Menu item management

---

<!-- ## 🖼️ Screenshots

> *(Screenshots coming soon)*

```md
![Home Screen](./screenshots/home.png)
![History Screen](./screenshots/history.png)
![Menu Screen](./screenshots/menu.png)
````

Recommended size:

- **Android:** 1080 × 1920
- Dark mode preferred

--- -->

## 🧱 Tech Stack

- **Expo (SDK 54)**
- **React Native**
- **Expo Router**
- **Realm Database**
- **TypeScript**

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/roxton75/BubbleBrew-Expo-React-Native.git
cd BubbleBrew-Expo-React-Native
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start the app

```bash
npx expo start
```

Run on:

- Android Emulator
- Physical Android device (recommended: Expo Dev Build)

---

## 🧪 Development Notes

- Development builds may briefly show a white screen after splash — this does **not** occur in production builds.
- Realm listeners keep Home and History tabs in sync.
- Designed for **small café workflows**, not enterprise POS systems.

---

## 🛠️ Customization & Client Services

If you’re a **café owner, small business, or startup** looking for a customized version of BubbleBrew, I provide **freelance development services** at reasonable rates.

### Customization options include

- 🎨 Brand colors & logo integration
- 🧾 Custom order flow or statuses
- 📊 Sales summary & reports
- 🖨️ Printer / receipt support (where applicable)
- 🌐 Cloud sync or multi-device support
- 📦 Feature requests specific to your business

This app is ideal for:

- Coffee shops ☕
- Boba / beverage stalls 🧋
- Small food kiosks 🍔
- Local cafés needing a lightweight POS

📩 **Contact:**
Reach out via GitHub or email to discuss requirements and pricing.

> *I focus on clean UI, practical features, and affordable solutions for small businesses.*

---

## 📦 Build for Production

### Android (local)

```bash
npx expo prebuild
npx expo run:android
```

### Using EAS (recommended)

```bash
npx expo prebuild
npx expo build
```

---

## 🎯 Vision

BubbleBrew aims to be:

> **A fast, distraction-free order system for local cafés and beverage stalls.**

No clutter.
No learning curve.
Just orders.

---

## 📄 License

MIT License
You’re free to fork, modify, and build upon this project.

---

### ☕ Built with care for café owners, freelancers & indie developers
