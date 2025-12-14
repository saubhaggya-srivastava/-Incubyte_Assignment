# Sweet Shop Management System

A full-stack TDD kata project implementing a complete sweet shop management system with authentication, inventory management, and admin capabilities.

## Technology Stack

### Backend

- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **Prisma ORM** - Database ORM
- **SQLite** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Zod** - Validation
- **Jest** & **Supertest** - Testing

### Frontend

- **React** with **TypeScript**
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

## Features

### User Features

- User registration and login with JWT authentication
- Browse all available sweets
- Search sweets by name, category, and price range
- Purchase sweets (decrements quantity)
- View real-time stock availability

### Admin Features

- All user features
- Create new sweets
- Update sweet details
- Delete sweets
- Restock inventory

## Project Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
PORT=3000
```

4. Run database migrations:

```bash
npm run migrate:dev
```

5. Seed the database with sample data:

```bash
npm run seed
```

This creates:

- Admin user: `admin@sweetshop.com` / `admin123456`
- Regular user: `user@sweetshop.com` / `user123456`
- 8 sample sweets

6. Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Running Tests

### Backend Tests

```bash
cd backend
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

Run tests sequentially (recommended):

```bash
npm test -- --runInBand
```

**Test Results:**

- ✅ 196 tests passing
- ✅ 81% overall coverage
- ✅ 12 test suites

### Test Structure

- Unit tests for services, repositories, and middleware
- Integration tests for controllers and routes
- Comprehensive error handling tests

## API Documentation

### Authentication Endpoints

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Sweet Management Endpoints

#### Get All Sweets (Authenticated)

```http
GET /api/sweets
Authorization: Bearer <token>
```

#### Search Sweets (Authenticated)

```http
GET /api/sweets/search?name=chocolate&category=Chocolate&minPrice=1&maxPrice=5
Authorization: Bearer <token>
```

#### Create Sweet (Admin Only)

```http
POST /api/sweets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Chocolate Bar",
  "category": "Chocolate",
  "price": 2.50,
  "quantity": 100
}
```

#### Update Sweet (Admin Only)

```http
PUT /api/sweets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 3.00
}
```

#### Delete Sweet (Admin Only)

```http
DELETE /api/sweets/:id
Authorization: Bearer <token>
```

### Inventory Endpoints

#### Purchase Sweet (Authenticated)

```http
POST /api/sweets/:id/purchase
Authorization: Bearer <token>
```

#### Restock Sweet (Admin Only)

```http
POST /api/sweets/:id/restock
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 50
}
```

## My AI Usage

### AI Tools Used

I used **Kiro AI Assistant** (powered by Claude) throughout this project for code generation, testing, and architecture decisions.

### How I Used AI

#### 1. Project Architecture & Planning

- Used AI to help design the overall architecture following clean code principles
- Generated the initial project structure with proper separation of concerns
- Created comprehensive task breakdown following TDD methodology

#### 2. Backend Development

- **Test-Driven Development**: AI helped write tests first, then implementation
- Generated repository layer with Prisma ORM integration
- Created service layer with business logic and validation
- Implemented controller layer with proper error handling
- Set up middleware for authentication and authorization
- Configured Express server with all routes

#### 3. Frontend Development

- Generated React components with TypeScript
- Created API client service with Axios
- Implemented authentication context with localStorage persistence
- Built protected routes and admin-only routes
- Designed responsive UI with Tailwind CSS
- Added loading states and error handling

#### 4. Testing Strategy

- AI generated comprehensive unit tests for all services
- Created integration tests for API endpoints
- Achieved 81% test coverage with 196 passing tests
- Followed Red-Green-Refactor TDD cycle

#### 5. Code Quality

- AI helped ensure TypeScript type safety throughout
- Generated proper error handling and validation
- Implemented security best practices (JWT, bcrypt, input validation)
- Followed RESTful API conventions

### Reflection on AI Impact

**Positive Impacts:**

- **Speed**: Dramatically accelerated development time while maintaining quality
- **Consistency**: AI helped maintain consistent code style and patterns
- **Best Practices**: AI suggested industry-standard approaches for authentication, validation, and error handling
- **Testing**: Generated comprehensive test suites that I might have skipped manually
- **Documentation**: Helped create clear, detailed documentation

**Learning Points:**

- AI is excellent for boilerplate and repetitive code
- Still need human oversight for business logic and architecture decisions
- AI-generated tests caught several edge cases I hadn't considered
- Combining AI assistance with TDD methodology produced high-quality, well-tested code

**Challenges:**

- Occasionally needed to refine AI suggestions to match specific requirements
- Had to ensure AI-generated code followed project conventions
- Required manual review to ensure all pieces integrated correctly

## Project Structure

```
-Incubyte_Assignment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── dev.db
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── sweet.controller.ts
│   │   │   └── inventory.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── authorization.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── repositories/
│   │   │   ├── user.repository.ts
│   │   │   └── sweet.repository.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── sweet.routes.ts
│   │   │   └── inventory.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── password.service.ts
│   │   │   ├── token.service.ts
│   │   │   ├── sweet.service.ts
│   │   │   └── inventory.service.ts
│   │   ├── validators/
│   │   │   ├── auth.validator.ts
│   │   │   ├── sweet.validator.ts
│   │   │   └── inventory.validator.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── SweetCard.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── SweetForm.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── AdminPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## Development Workflow

This project was built following Test-Driven Development (TDD) principles:

1. **Red**: Write failing tests first
2. **Green**: Implement minimal code to pass tests
3. **Refactor**: Improve code while keeping tests green

All commits include AI co-authorship attribution as requested.

## License

MIT

## Author

Built as a TDD kata project with AI assistance (Kiro AI powered by Claude).
