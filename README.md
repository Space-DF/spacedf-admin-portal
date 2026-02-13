# SpaceDF Portal

A modern device management portal built with Next.js, providing comprehensive IoT device management, organization administration, and user authentication capabilities.

## 🚀 Features

### Device Management

- **Device Listing**: View and manage devices with active and inventory tabs
- **Device Details**: Comprehensive device information, activation details, and event tracking
- **Add Devices**: Multiple methods to add devices:
  - QR code scanning
  - Manual entry
  - CSV import
- **Device Operations**: Update, delete, and manage device configurations
- **Network Server Integration**: Connect devices to network servers
- **Device Models**: Manage and select from available device models

### Authentication & User Management

- **Email/Password Authentication**: Secure sign-in and sign-up
- **Social Authentication**: Sign in with Google and Apple
- **Password Recovery**: Forgot password and reset password flows
- **OTP Verification**: Email-based OTP for account verification
- **Session Management**: Secure session handling with NextAuth.js

### User Experience

- **Internationalization**: Full support for English (en) and Vietnamese (vi)
- **Modern UI**: Built with shadcn/ui components and Radix UI primitives
- **Animations**: Smooth transitions powered by Framer Motion

### Account Settings

- **Profile Management**: Update user profile information
- **Preferences**: Customize account settings and preferences

## 🛠️ Tech Stack

### Core

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[React 18](https://react.dev/)** - UI library

### Authentication & API

- **[NextAuth.js v5](https://next-auth.js.org/)** - Authentication framework
- **[SWR](https://swr.vercel.app/)** - Data fetching and caching
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management

### UI & Styling

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide React](https://lucide.dev/)** - Icon library

### Forms & Validation

- **[React Hook Form](https://react-hook-form.com/)** - Form state management
- **[Zod](https://zod.dev/)** - Schema validation
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** - Form validation resolvers

### Internationalization

- **[next-intl](https://next-intl-docs.vercel.app/)** - Internationalization for Next.js

### Additional Libraries

- **[TanStack Table](https://tanstack.com/table)** - Powerful table/data grid
- **[Day.js](https://day.js.org/)** - Date manipulation
- **[PapaParse](https://www.papaparse.com/)** - CSV parsing
- **[QR Scanner](https://github.com/yudiel-curiel/react-qr-scanner)** - QR code scanning
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- Yarn (recommended) or npm/pnpm/bun

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Space-DF/spacedf-admin-portal.git
cd spacedf-admin-portal
```

2. Install dependencies:

```bash
yarn install
# or
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the required environment variables. Refer to your project's environment configuration for the specific variables needed.

4. Run the development server:

```bash
yarn dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using SpaceDF UI components

This project is configured to use the SpaceDF shadcn/ui registry (`@spacedf`) defined in `components.json`.

To install a new UI component from the SpaceDF registry (for example, `button`), run:

```bash
npx shadcn@latest add @spacedf/button
```

You can replace `button` with any other component name exposed by the SpaceDF registry.

## 📜 Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors and format code
- `yarn format` - Format code with Prettier

## 🏗️ Project Structure

```
spacedf-portal/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/           # Internationalized routes
│   │   │   ├── (withLayout)/   # Layout-wrapped pages
│   │   │   │   └── devices/    # Device management pages
│   │   │   └── auth/           # Authentication pages
│   │   └── api/                # API routes
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layouts/            # Layout components
│   │   └── icons/              # Custom icons
│   ├── containers/             # Feature containers
│   │   ├── devices/            # Device management
│   │   ├── auth/               # Authentication flows
│   │   └── components/         # Shared containers
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   ├── stores/                 # Zustand stores
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions
│   ├── configs/                # Configuration files
│   ├── contexts/               # React contexts
│   ├── i18n/                   # Internationalization config
│   └── styles/                 # Global styles
├── messages/                   # Translation files
│   ├── en/                     # English translations
│   └── vi/                     # Vietnamese translations
├── public/                     # Static assets
└── ...config files
```

## 🌍 Internationalization

The application supports multiple languages:

- **English (en)** - Default locale
- **Vietnamese (vi)**

To add a new language:

1. Add the locale to `src/i18n/request.ts`
2. Update the middleware matcher in `src/middleware.ts`
3. Create translation files in `messages/<locale>/`
4. Update `src/types/global.d.ts` with the new locale type

## 🎨 Styling

The project uses Tailwind CSS with a custom design system:

- Custom color palette defined in `src/configs/tailwindcss/color.ts`
- Custom animations and keyframes
- CSS variables for theming

## 🔐 Authentication

Authentication is handled by NextAuth.js v5 with:

- Credentials provider (email/password)
- OAuth providers (Google, Apple)
- JWT-based sessions
- Protected routes via middleware

## 📝 Code Quality

- **ESLint** - Code linting with Next.js and Prettier configs
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **Commitlint** - Conventional commit messages

## License

Licensed under the Apache License, Version 2.0  
See the LICENSE file for details.

[![SpaceDF - A project from Digital Fortress](https://df.technology/images/SpaceDF.png)](https://df.technology/)
