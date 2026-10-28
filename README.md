# ✈️ TripMate AI — Intelligent Travel Planning & Trip Management Platform

[![Java](https://img.shields.io/badge/Java-21%20LTS-007396?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.8-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%20%2F%208.4-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**TripMate AI** is an enterprise-grade, full-stack travel planning and trip management platform. Built with **Java 21**, **Spring Boot 3.4**, and **React 18** with **Vite**, the application delivers an intelligent, end-to-end workspace for modern travelers. From AI-generated day-by-day itineraries and curated Indian destination catalogs to collaborative group expense splitting, packing checklists, media-rich travel journals, and central booking management, TripMate AI streamlines the entire travel lifecycle into a single cohesive experience.

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Database Design](#-database-design)
- [Prerequisites](#-prerequisites)
- [Local Setup & Installation](#-local-setup--installation)
  - [1. Database Configuration](#1-database-configuration)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Running the Application](#-running-the-application)
- [API Reference Summary](#-api-reference-summary)
- [Security Architecture](#-security-architecture)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Future Enhancements](#-future-enhancements)
- [Team & Acknowledgments](#-team--acknowledgments)

---

## 🌟 Project Overview

Planning memorable journeys often requires juggling fragmented tools: notes apps for itineraries, spreadsheets for expenses, chat groups for coordination, and physical notes for packing lists. 

**TripMate AI** solves this by unifying all aspects of journey planning into an intuitive web platform:
- **India-First Curated Discovery**: Preloaded catalog featuring 100+ premier Indian destinations across states and union territories with verified hotels, restaurants, attractions, seasonal advice, and estimated budgets.
- **AI-Powered Itinerary Synthesis**: Generates customized day-by-day schedules with activity suggestions, timing, and budgets based on duration, traveler count, and travel style. Includes a resilient deterministic fallback engine for uninterrupted offline/demo operation.
- **Fair Group Expense Splitting**: Simplifies group financial settlement through an automated debt-minimization algorithm ("who owes whom").
- **Unified Trip Workspace**: Real-time budget progress, interactive packing checklists, multimedia travel diaries, booking voucher storage, and community ratings.

---

## ✨ Key Features

### 1. 🤖 AI Trip Planner & Resilient Fallback Engine
- Generates tailored daily itineraries with suggested morning, afternoon, and evening activities.
- Considers travel preferences (e.g., Adventure, Heritage, Nature, Relaxation, Foodie, Spiritual).
- Integrated with OpenAI-compatible API completion providers with an automatic offline fallback mode that computes realistic travel plans even when remote API credits or network access are unavailable.

### 2. 🗺️ Curated Destination & Spot Discovery
- **Comprehensive Catalog**: 100+ authentic destinations across Indian states (Telangana, Kerala, Rajasthan, Himachal Pradesh, Goa, Uttar Pradesh, Ladakh, Tamil Nadu, Karnataka, Maharashtra, etc.).
- **Sub-Catalogs**: Dedicated discovery directories for **Hotels**, **Dining & Cafes**, and **Heritage Attractions**.
- **Custom Destinations**: Users can register unlisted towns and secret spots on the fly to plan journeys anywhere.
- **Filter & Search**: Multi-parameter search by state, season, budget, and free-text queries.

### 3. 📅 Smart Itinerary & Activity Timeline
- Day-by-day structured itinerary builder with customizable day themes and summary notes.
- Granular activity sequencing with start/end time tracking, category tags, and estimated costs.
- Non-destructive activity reordering with instant index recalculation.

### 4. 💰 Budget Management & Expense Tracking
- Dedicated budget allocation per trip with real-time spent calculation and remaining balance indicators.
- Expense logging by category (Lodging, Food, Transport, Sightseeing, Shopping, Miscellaneous).
- Visual budget utilization bars and surplus/deficit health monitors.

### 5. 👥 Collaborative Group Expense Splitter
- Create travel groups and invite travel companions to individual trips.
- Record multi-participant shared expenses with designated payers and equal/custom split shares.
- Automated balance matrix calculation that generates optimized settlement transactions to resolve group debts.

### 6. 🎒 Packing Checklist Assistant
- Interactive checklist with categorized item groups (Clothing, Toiletries, Electronics, Documents, Medicine, Travel Gear).
- Dynamic progress bar tracking completion percentage in real time.
- AI-assisted packing generator tailored to trip duration and seasonal requirements.

### 7. 📖 Travel Journal & Media Gallery
- Rich diary entries with Markdown-friendly travel logs and reflection notes.
- Multi-photo attachment upload with captioning, stored through a dedicated media storage subsystem (`/api/media`).
- Full-screen reading modal and organized trip photo albums.

### 8. 🎫 Centralized Booking Manager
- Consolidates reservation vouchers for flights, trains, hotels, car rentals, and tour admissions.
- Tracks booking confirmation codes, check-in/departure timestamps, total amounts, and provider details.

### 9. 💬 AI Travel Assistant (Chat Companion)
- Conversational assistant for trip inquiries, local cultural etiquette, weather inquiries, and packing advice.
- Persistent conversation history linked to individual trip contexts.

### 10. ⭐ Community Favorites & Reviews
- Bookmark destinations, hotels, dining spots, and attractions into a unified personal "Favorites" list.
- Submit 1-to-5 star ratings and reviews to share feedback across the platform.

### 11. 📊 Travel Analytics & Statistics
- Personal travel dashboard displaying total trips planned, destinations visited, budget efficiency metrics, and category spend breakdowns.

### 12. 🛡️ Administrator Control Center
- Role-gated dashboard (`/admin/dashboard`) restricted to `ROLE_ADMIN` users.
- Real-time platform KPI metrics: total user registrations, active trips, curated destinations, and system audit logs.

---

## 🛠️ Technology Stack

### Backend Architecture
| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Language** | Java 21 LTS | Modern Java features, records, pattern matching |
| **Framework** | Spring Boot 3.4.8 | Core inversion of control and REST framework |
| **Security** | Spring Security 6 | Stateless JWT authentication, BCrypt password hashing |
| **Persistence** | Spring Data JPA / Hibernate 6 | Object-relational mapping, transactional data layer |
| **Database** | MySQL 8.0+ / 8.4+ | Relational schema with foreign keys and cascade rules |
| **Validation** | Jakarta Bean Validation | Declarative request payload constraints (`@Valid`) |
| **AI Integration** | Java `HttpClient` + Jackson | OpenAI-compatible completions with resilient fallback |
| **Build & Dependency** | Apache Maven 3.9+ | Standardized dependency management and build lifecycle |
| **Boilerplate Reduction**| Project Lombok | Data models, builders, and constructor injections |

### Frontend Architecture
| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Core Framework** | React 18 | Functional components, custom hooks, context state |
| **Build Tool** | Vite 6 | Lightning-fast HMR and optimized production bundling |
| **Routing** | React Router DOM v7 | Declarative nested routing with protected route guards |
| **HTTP Client** | Axios | Interceptors for JWT attachment and silent token refresh |
| **Iconography** | Lucide React | Modern, consistent vector icons |
| **Styling** | Vanilla CSS3 | Custom design system, CSS variables, glassmorphism |

---

## 🏗️ System Architecture

TripMate AI follows a clean, decoupled client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                  React + Vite Frontend (SPA)               │
│  ┌──────────────┐   ┌───────────────┐   ┌────────────────┐  │
│  │ Public Pages │   │ Workspace     │   │ Admin Console  │  │
│  └──────┬───────┘   └───────┬───────┘   └────────┬───────┘  │
│         └───────────────────┼────────────────────┘          │
│                    Axios HTTP Interceptor                   │
│           (Bearer JWT Token + Silent Refresh)               │
└─────────────────────────────┼───────────────────────────────┘
                              │ JSON over HTTPS (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Spring Boot 3.4 REST Backend                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Security Filter Chain: JwtAuthenticationFilter / CORS │  │
│  └──────────────────────────┬────────────────────────────┘  │
│  ┌──────────────────────────▼────────────────────────────┐  │
│  │ REST Controllers (/api/auth, /api/trips, /api/ai, ...)│  │
│  └──────────────────────────┬────────────────────────────┘  │
│  ┌──────────────────────────▼────────────────────────────┐  │
│  │ Service Layer (Business Logic & Settlement Algorithm) │  │
│  └──────┬─────────────────────────────────────────┬──────┘  │
│         ▼                                         ▼         │
│  ┌───────────────┐                       ┌───────────────┐  │
│  │ AI Client /   │                       │ Spring Data   │  │
│  │ Fallback Hub  │                       │ JPA Repos     │  │
│  └──────┬────────┘                       └───────┬───────┘  │
└─────────┼────────────────────────────────────────┼──────────┘
          │                                        │
          ▼                                        ▼
┌──────────────────┐                     ┌────────────────────┐
│ OpenAI / Remote  │                     │   MySQL Database   │
│ AI Completions   │                     │  (utf8mb4_unicode) │
└──────────────────┘                     └────────────────────┘
```

---

## 📁 Project Structure

```
TripMate_AI/
├── backend/                              # Spring Boot 3.4 REST API Service
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/tripmateai/
│   │   │   │   ├── ai/                  # AI Client & deterministic fallback generator
│   │   │   │   ├── auth/                # Security authentication components
│   │   │   │   ├── config/              # Security, CORS, Web, & Catalog Seeder
│   │   │   │   ├── constants/           # Platform messages and global constants
│   │   │   │   ├── controller/          # 20+ REST API Controllers
│   │   │   │   ├── dto/                 # Strongly-typed Request and Response records
│   │   │   │   ├── entity/              # 30+ JPA database entity models
│   │   │   │   ├── enums/               # Business enums (RoleName, TripStatus, etc.)
│   │   │   │   ├── exception/           # Custom exceptions & GlobalExceptionHandler
│   │   │   │   ├── mapper/              # Entity-to-DTO conversion mappers
│   │   │   │   ├── repository/          # Spring Data JPA repositories
│   │   │   │   ├── security/            # JWT service, filters, and UserPrincipal
│   │   │   │   ├── service/             # Business logic interfaces and implementations
│   │   │   │   └── util/                # Response utility and date helpers
│   │   │   └── resources/
│   │   │       ├── application.properties # Main Spring configuration
│   │   │       └── postman/             # Postman test collection
│   │   └── test/                        # Comprehensive unit & service test suites
│   ├── pom.xml                          # Maven build dependencies
│   └── .env.example                     # Backend environment variable template
│
├── frontend/                             # React 18 + Vite Web Application
│   ├── src/
│   │   ├── api/                         # Axios client with automatic JWT token refresh
│   │   ├── assets/                      # Static logos and graphic resources
│   │   ├── components/                  # Design system (ui.jsx, modals, inputs, cards)
│   │   │   ├── analytics/               # Analytics visualization widgets
│   │   │   ├── favorites/               # Favorite toggle buttons and lists
│   │   │   ├── itinerary/               # Itinerary day cards and activity items
│   │   │   ├── journal/                 # Journal modals and photo uploaders
│   │   │   ├── packing/                 # Packing checklist item components
│   │   │   ├── reviews/                 # Star rating inputs and review dialogs
│   │   │   └── trips/                   # Trip cards, creation modals, filters
│   │   ├── context/                     # AuthContext for session management
│   │   ├── layouts/                     # AppLayout (navigation, sidebar) & AuthLayout
│   │   ├── pages/                       # 24 application views & routing targets
│   │   ├── routes/                      # ProtectedRoute and AdminRoute gates
│   │   ├── services/                    # API abstraction services
│   │   ├── styles.css                   # Custom CSS tokens, glassmorphism, responsive grid
│   │   ├── App.jsx                      # Main application routing declaration
│   │   └── main.jsx                     # Application bootstrap root
│   ├── package.json                     # Vite & frontend dependencies
│   ├── vite.config.js                   # Vite configuration
│   └── .env.example                     # Frontend environment variable template
│
├── database/                             # Database Schemas & Visualizations
│   ├── schema.sql                       # Complete DDL script with tables and constraints
│   └── ER_DIAGRAM.md                    # Entity-relationship documentation
│
└── README.md                            # Comprehensive project documentation
```

---

## 🗄️ Database Design

The relational database (`tripmate_ai`) is managed with strict referential integrity, explicit cascade policies, and foreign key indexes.

### Core Entity Relationships:
```text
User ────< Trip >──── Destination
Trip ────< Itinerary ────< Activity
Trip ────|| Budget
Trip ────< Expense >──── ExpenseCategory
Trip ────< TravelGroup ────< GroupMember >──── User
TravelGroup ────< GroupExpense ────< GroupExpenseShare >──── GroupMember
Trip ────< PackingChecklist ────< PackingItem
Trip ────< TravelJournal ────< JournalPhoto
Trip ────< Booking
User ────< SavedTrip >──── Trip
User ────< Favorite >──── Destination | Hotel | Restaurant | Attraction
User ────< Review >──── Destination | Hotel | Restaurant | Attraction
Destination ────< Hotel | Restaurant | Attraction | NearbyPlace
User ────< ChatHistory >──── Trip
User ────< RefreshToken | PasswordResetToken
User >────< Role (user_roles)
```

---

## 📋 Prerequisites

Before running the project locally, ensure you have the following installed:

| Tool | Minimum Version | Verification Command |
| :--- | :--- | :--- |
| **Java Development Kit (JDK)** | 21 (Temurin, Corretto, or Oracle) | `java -version` |
| **Apache Maven** | 3.9+ (or use included `mvnw`) | `mvn -version` |
| **Node.js** | v18.x or v20+ | `node -v` |
| **npm** | v9.x or v10+ | `npm -v` |
| **MySQL Server** | 8.0+ or 8.4+ | `mysql --version` |

---

## ⚙️ Local Setup & Installation

### 1. Database Configuration

Start your local MySQL service and execute the database creation query:

```sql
CREATE DATABASE IF NOT EXISTS tripmate_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

*(Optional)* You can pre-execute `database/schema.sql`, or allow Spring Boot to validate and manage the tables upon initial launch.

---

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create an environment configuration file:
   ```bash
   cp .env.example .env
   ```

3. Update the values in `.env` (or configure your system environment variables) with your local parameters:
   ```properties
   # Server Port
   SERVER_PORT=8080

   # Database Connection
   DB_URL=jdbc:mysql://localhost:3306/tripmate_ai?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   DB_USERNAME=<your-mysql-username>
   DB_PASSWORD=<your-mysql-password>

   # Security Token Key (must be at least 32 characters long)
   JWT_SECRET=<your-secure-random-32-character-secret>

   # AI Integration (Optional: Leave blank to use offline deterministic fallback)
   AI_API_KEY=<your-optional-openai-api-key>
   AI_BASE_URL=https://api.openai.com/v1/chat/completions
   AI_MODEL=gpt-4o-mini
   ```

---

### 3. Frontend Setup

1. Navigate to the `frontend` directory in a new terminal window:
   ```bash
   cd frontend
   ```

2. Create a frontend environment configuration file:
   ```bash
   cp .env.example .env
   ```

3. Confirm the backend API gateway URL:
   ```properties
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

4. Install the Node dependencies:
   ```bash
   npm install
   ```

---

## 🚀 Running the Application

### Step 1: Start the Spring Boot Backend

From the `backend` directory:
```bash
# Using Maven wrapper (Windows PowerShell):
.\mvnw.cmd spring-boot:run

# Or using global Maven:
mvn spring-boot:run
```

- The backend initializes the database schema and bootstraps the Indian destination catalog and default administrative roles.
- **Base API URL**: `http://localhost:8080/api`

### Step 2: Start the React Frontend

From the `frontend` directory in a separate terminal:
```bash
npm run dev
```

- **Frontend Application URL**: `http://localhost:5173/`

### Step 3: Accessing the Application

1. Open `http://localhost:5173/` in your browser.
2. Click **Create an account** or navigate to `/register` to create your personal traveler account.
3. Once logged in, explore the curated destinations, generate AI-powered itineraries, track expenses, and plan journeys.

---

## 🔌 API Reference Summary

All backend endpoints are mounted under the base context path `/api`:

### Authentication & Account
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT access & refresh tokens | No |
| `POST` | `/api/auth/refresh` | Rotate access token using valid refresh token | No |
| `POST` | `/api/auth/logout` | Revoke active refresh token | No |
| `POST` | `/api/auth/forgot-password` | Request password reset token | No |
| `POST` | `/api/auth/reset-password` | Complete password reset using token | No |
| `POST` | `/api/auth/change-password` | Change account password | Yes |
| `GET` | `/api/auth/me` | Fetch authenticated user profile details | Yes |

### Destination Discovery
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/destinations` | Search and paginate destination catalog | No |
| `GET` | `/api/destinations/{id}` | Get destination details | No |
| `GET` | `/api/destinations/{id}/hotels` | List hotels in destination | No |
| `GET` | `/api/destinations/{id}/restaurants` | List restaurants in destination | No |
| `GET` | `/api/destinations/{id}/attractions` | List attractions in destination | No |
| `POST` | `/api/destinations/custom` | Create a user-specified custom destination | No |
| `GET` | `/api/hotels` | Global hotel search with filters | No |
| `GET` | `/api/restaurants` | Global dining search with filters | No |
| `GET` | `/api/attractions` | Global attraction search with filters | No |

### AI Trip Planner & Chat
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/trips/generate` | Generate structured AI trip itinerary | Yes |
| `POST` | `/api/chat/message` | Send prompt to conversational AI assistant | Yes |
| `GET` | `/api/chat/history` | Retrieve past chat history | Yes |

### Trips & Itineraries
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trips` | List all trips for current user | Yes |
| `POST` | `/api/trips` | Create new travel itinerary | Yes |
| `GET` | `/api/trips/{id}` | Retrieve comprehensive trip workspace | Yes |
| `PUT` | `/api/trips/{id}` | Update trip parameters | Yes |
| `DELETE` | `/api/trips/{id}` | Delete trip and cascading records | Yes |
| `POST` | `/api/trips/{id}/duplicate` | Clone existing trip into a new itinerary | Yes |
| `GET` | `/api/trips/{id}/itineraries` | List itinerary days for trip | Yes |
| `POST` | `/api/trips/{id}/itineraries` | Add a new itinerary day | Yes |
| `POST` | `/api/itineraries/{itineraryId}/activities` | Add activity to day | Yes |
| `PUT` | `/api/itineraries/{itineraryId}/activities/reorder` | Reorder activities | Yes |

### Budgets & Group Expenses
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trips/{id}/budget` | Retrieve trip budget | Yes |
| `PUT` | `/api/trips/{id}/budget` | Update trip budget limits | Yes |
| `GET` | `/api/trips/{id}/expenses` | List logged expenses | Yes |
| `POST` | `/api/trips/{id}/expenses` | Log an expense entry | Yes |
| `POST` | `/api/trips/{id}/group` | Initialize collaborative travel group | Yes |
| `POST` | `/api/trips/{id}/group/members` | Add member to travel group | Yes |
| `POST` | `/api/trips/{id}/group/expenses` | Log shared group expense | Yes |
| `GET` | `/api/trips/{id}/group/balances` | Calculate member net balances | Yes |
| `GET` | `/api/trips/{id}/group/settlements` | Calculate optimized debt settlements | Yes |

### Packing, Journal & Media
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trips/{id}/packing` | Retrieve packing checklist | Yes |
| `POST` | `/api/trips/{id}/packing` | Add item to packing list | Yes |
| `PATCH` | `/api/trips/{id}/packing/{itemId}/toggle` | Toggle item packed state | Yes |
| `POST` | `/api/trips/{id}/packing/generate` | Generate AI packing recommendations | Yes |
| `GET` | `/api/trips/{id}/journal` | List diary entries for trip | Yes |
| `POST` | `/api/trips/{id}/journal` | Create new journal reflection | Yes |
| `POST` | `/api/trips/{id}/journal/{entryId}/photos` | Upload photo to journal entry | Yes |
| `GET` | `/api/media/{subfolder}/{filename}` | Publicly serve uploaded media assets | No |

### Admin Console
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Retrieve platform-wide KPIs and audit metrics | Admin (`ROLE_ADMIN`) |

---

## 🔒 Security Architecture

TripMate AI adheres to industry security best practices to safeguard user data:

1. **Stateless Authentication with JWT**:
   - Access tokens are cryptographically signed using **HMAC-SHA256**.
   - Short 15-minute token lifespan minimizes risk in case of token interception.
   - 30-day rotatable database-backed refresh tokens allow seamless session renewal.
   - Immediate refresh token revocation upon user logout.

2. **Credential Protection**:
   - Passwords are encrypted before database persistence using **BCrypt** with automatic salt generation.
   - Raw passwords are never logged, returned in API payloads, or exposed in error messages.

3. **Role-Based Access Control (RBAC)**:
   - System privileges are partitioned into `ROLE_USER` and `ROLE_ADMIN`.
   - Granular authorization rules enforced at the Spring Security filter chain level (`SecurityConfig.java`).
   - Frontend route protection gates (`ProtectedRoute`, `AdminRoute`) prevent unauthorized UI navigation.

4. **Resource Ownership Isolation**:
   - User-generated assets (trips, journals, expenses, bookings) are bound to authenticated `UserPrincipal` IDs to prevent horizontal privilege escalation.

5. **Cross-Origin Resource Sharing (CORS)**:
   - Whitelist-only configuration restricts cross-origin communication to trusted frontend origins (`http://localhost:5173`, `http://localhost:3000`).

6. **Defensive Validation & Sanitization**:
   - Strict Jakarta Validation constraints on all request DTO records (`@NotBlank`, `@Email`, `@Size`, `@Min`).
   - Centralized `GlobalExceptionHandler` ensures stack traces and internal database schemas are never leaked to the client.

7. **Secret Decoupling**:
   - All sensitive credentials (database passwords, JWT secret keys, AI API keys) are abstracted into environment variables and excluded from version control.

---

## 🧪 Testing & Quality Assurance

### Backend Unit & Integration Tests

The backend test suite covers authentication, trip planning, journal persistence, group expense settlement algorithms, and media handling.

Run tests using Maven:
```bash
cd backend
mvn test
```

### Frontend Production Build Verification

To verify that all JSX pages, routing, and styles bundle correctly without syntax errors:
```bash
cd frontend
npm run build
```

---

## 🔮 Future Enhancements

- [ ] **Interactive Geospatial Maps**: Integration with Mapbox or Leaflet for interactive visual routing and day-by-day map overlays.
- [ ] **Live Flight & Hotel Booking APIs**: Integration with real-time flight and hotel GDS providers for live rates and one-click bookings.
- [ ] **Multi-Currency Real-Time Conversion**: Live exchange rate updates for international travelers.
- [ ] **Calendar Synchronization**: Export itineraries directly to `.ics`, Google Calendar, or Apple Calendar.
- [ ] **Progressive Web App (PWA)**: Offline caching and mobile installability for travel on the go with spotty cellular coverage.
- [ ] **Collaborative Real-Time Workspace**: WebSocket-based simultaneous itinerary editing with travel companions.

---

## 👥 Team & Acknowledgments

TripMate AI was designed and developed as a comprehensive full-stack software engineering project showcasing modern architectural patterns across Java, Spring Boot, and React.

- **Backend Architecture & Security**: Spring Boot 3.4 REST APIs, Spring Security 6, JWT Filter, Data Integrity.
- **Frontend & UI/UX Design**: React 18, Vite, responsive layouts, glassmorphic design system.
- **Data Engineering**: MySQL schema optimization, cascade configurations, and indexed entity relationships.
- **AI Synthesis**: Intelligent itinerary generation and resilient fallback architecture.

---

<div align="center">
  <sub>Built with ❤️ for passionate travelers exploring the rich culture and heritage of India and beyond.</sub>
</div>
