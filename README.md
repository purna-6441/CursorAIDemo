# POS Retail Mobile Application

A comprehensive Point of Sale (POS) retail mobile application built with React Native (frontend) and ASP.NET Core (backend), featuring role-based authentication, inventory management, sales processing, and reporting capabilities.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React Native CLI with TypeScript
- **Backend**: ASP.NET Core Web API (.NET 6)
- **Database**: SQL Server
- **Authentication**: JWT-based authentication
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation v6
- **Target Platform**: Android (primary), iOS (optional)

### Project Structure
```
CursorPracticeApp/
├── Backend/
│   └── POSRetailAPI/
│       ├── Controllers/
│       ├── Data/
│       ├── DTOs/
│       ├── Models/
│       ├── Services/
│       └── Program.cs
└── Frontend/
    └── POSRetailApp/
        ├── src/
        │   ├── components/
        │   ├── screens/
        │   ├── services/
        │   ├── store/
        │   ├── navigation/
        │   └── types/
        ├── package.json
        └── tsconfig.json
```

## 🚀 Quick Start

### Backend Setup (ASP.NET Core)

1. **Prerequisites**
   - .NET 6 SDK
   - SQL Server (LocalDB or full instance)
   - Visual Studio 2022 or VS Code

2. **Installation**
   ```bash
   cd Backend/POSRetailAPI
   dotnet restore
   dotnet build
   ```

3. **Database Setup**
   ```bash
   # Create and seed the database
   dotnet ef database update
   # Or run the application and it will auto-create the database
   dotnet run
   ```

4. **Configuration**
   Update `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=POSRetailDB;Trusted_Connection=true;MultipleActiveResultSets=true"
     },
     "Jwt": {
       "SecretKey": "your-super-secret-key-that-is-at-least-32-characters-long-for-production",
       "Issuer": "POSRetailAPI",
       "Audience": "POSRetailClient",
       "ExpirationMinutes": 60
     }
   }
   ```

5. **Run the API**
   ```bash
   dotnet run
   ```
   API will be available at `https://localhost:5001` with Swagger UI at the root.

### Frontend Setup (React Native)

1. **Prerequisites**
   - Node.js 16+
   - React Native CLI
   - Android Studio (for Android development)
   - Xcode (for iOS development, Mac only)

2. **Installation**
   ```bash
   cd Frontend/POSRetailApp
   npm install
   ```

3. **Configuration**
   Update API base URL in `src/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'https://your-api-base-url.com/api';
   ```

4. **Run the Application**
   ```bash
   # For Android
   npm run android
   
   # For iOS (Mac only)
   npm run ios
   
   # Start Metro bundler
   npm start
   ```

## 👥 User Roles & Permissions

| Role              | Permissions                                      |
|-------------------|--------------------------------------------------|
| **Admin**         | Full access to inventory, sales, user management|
| **Cashier**       | Create sales, scan products, view reports       |
| **Inventory Manager** | Add/edit stock, view inventory levels       |

## 📱 Features

### 1. Authentication
- ✅ JWT-based login/logout
- ✅ Role-based access control
- ✅ Token refresh and storage
- ✅ Password reset (backend only)

### 2. Product & Inventory Management
- ✅ Searchable and filterable product list
- ✅ Add/edit products with fields: name, SKU, category, price, quantity
- ✅ Stock level adjustments
- ✅ Barcode scanning for product lookup
- ✅ Low inventory alerts
- ✅ Product categories management

### 3. Sales Processing
- ✅ Create new sales transactions
- ✅ Add items via manual entry or barcode scan
- ✅ Apply discounts (item-level and cart-level)
- ✅ Payment processing UI (cash/card placeholders)
- ✅ Receipt generation (PDF)
- ✅ Cart management with quantity controls
- 🔄 Offline sales storage and sync (planned)

### 4. Reporting & Analytics
- ✅ Daily sales summary reports
- ✅ Top-selling products analysis
- ✅ Low inventory alerts
- ✅ Export reports as CSV/JSON
- ✅ Sales trends and analytics

### 5. User Management (Admin Only)
- ✅ Add, edit, remove users
- ✅ Assign user roles
- ✅ Reset user passwords

## 🔌 API Endpoints

### Authentication
```http
POST /api/auth/login
GET  /api/auth/users
POST /api/auth/users
PUT  /api/auth/users/{id}
DELETE /api/auth/users/{id}
```

### Products
```http
GET    /api/products
GET    /api/products/{id}
GET    /api/products/barcode/{barcode}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
POST   /api/products/adjust-stock
GET    /api/products/categories
GET    /api/products/low-stock
```

### Sales
```http
POST /api/sales
GET  /api/sales
GET  /api/sales/{id}
GET  /api/sales/{id}/receipt
GET  /api/sales/reports/daily
GET  /api/sales/reports/top-selling
```

## 📊 Sample API Requests

### Login
```json
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

### Create Product
```json
POST /api/products
{
  "name": "Premium Coffee",
  "sku": "COFFEE001",
  "category": "Beverages",
  "price": 4.99,
  "quantity": 50,
  "description": "Premium blend coffee",
  "barcode": "1234567890123"
}
```

### Create Sale
```json
POST /api/sales
{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "discountAmount": 0
    }
  ],
  "paymentMethod": "cash",
  "discountAmount": 0,
  "total": 11.98
}
```

## 🗂️ Navigation Flow
```
Login Screen → Home Dashboard
├── Sales → Cart → Payment → Receipt
├── Inventory → Product List → Add/Edit Product
├── Reports → Summary View → Filters
└── Profile → User Settings
```

## 🔧 Development

### Default Login Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin

### Backend Development
```bash
# Add new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Run tests
dotnet test
```

### Frontend Development
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Run tests
npm test
```

## 📱 Mobile App Features

### Core Screens
- **✅ Login Screen**: JWT authentication with form validation
- **✅ Dashboard**: Sales overview, quick actions, role-based UI
- **✅ Sales Screen**: Product search, cart management, barcode scanning
- **✅ Cart Screen**: Item management, quantity controls, discount application
- **✅ Payment Screen**: Payment method selection (UI placeholder)
- **✅ Receipt Screen**: Transaction completion (UI placeholder)
- **✅ Inventory Screen**: Product management (placeholder)
- **✅ Reports Screen**: Analytics and reports (placeholder)
- **✅ Profile Screen**: User settings and logout functionality

### Components
- ✅ Product search and filtering
- ✅ Form validation with react-hook-form
- ✅ Loading states and error handling
- ✅ Role-based UI rendering
- ✅ Redux state management with async thunks
- ✅ Navigation with React Navigation v6
- ✅ Responsive UI with Material Design icons
- 🔄 Barcode scanner integration (placeholder ready)

## 🚀 Deployment

### Backend Deployment
1. Update connection string for production database
2. Update JWT secret key for production
3. Configure CORS for production domain
4. Deploy to Azure App Service or similar

### Frontend Deployment
1. Update API base URL for production
2. Build release APK/IPA
3. Deploy to Google Play Store / App Store

## 📝 Environment Variables

### Backend (.NET)
```json
{
  "ConnectionStrings__DefaultConnection": "production-connection-string",
  "Jwt__SecretKey": "production-secret-key",
  "Jwt__Issuer": "POSRetailAPI",
  "Jwt__Audience": "POSRetailClient"
}
```

### Frontend (React Native)
```typescript
const API_BASE_URL = process.env.REACT_NATIVE_API_URL || 'https://api.yourapp.com/api';
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This is a demo application. For production use, implement additional security measures, error handling, and testing. 