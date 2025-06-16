# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development**: `npm run dev` (uses nodemon for auto-restart)
- **Start production**: `npm start`
- **Install dependencies**: `npm install`

Note: Test and lint commands are placeholders (`echo` statements) - no actual testing or linting is configured.

## Architecture Overview

This is a Stripe webhook API service for the AgendaZap subscription system. The architecture follows a service-oriented pattern:

### Core Flow
1. **Webhook Reception**: Express server receives Stripe webhooks at `/webhook/stripe` with raw body parsing
2. **Event Processing**: `webhookController.js` validates signatures and delegates to `subscriptionService.js`
3. **Business Logic**: `subscriptionService.js` handles subscription lifecycle events (created/deleted)
4. **User Management**: Integrates with PostgreSQL database and Supabase authentication

### Key Services
- **SubscriptionService**: Main business logic for processing webhook events
  - Handles new subscriptions by creating companies, users, and auth accounts
  - Manages subscription cancellations and user reactivation
  - Determines plan types based on Stripe price IDs
- **UserService**: Database operations for users and companies
- **StripeService**: Wrapper for Stripe API calls
- **EmailService**: Handles notification emails (welcome, reactivation, duplicates)

### Database Integration
- Uses PostgreSQL with connection pooling
- Main tables: `usuarios` (users), `empresas` (companies)
- Integrates with Supabase for authentication (`auth_id` field)

### Important Implementation Details
- Raw body parsing specifically configured for Stripe webhook endpoint
- Plan type determined by price ID: `price_1RZwkZQZgpVccQF8UK7COqL3` = 'profissional', others = 'essencial'
- Handles both new user creation and existing user reactivation flows
- Custom logger utility for consistent logging format

### Environment Variables Required
- Database: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- Stripe: webhook secret and API configuration in `src/config/stripe.js`
- Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- Server: `PORT` (defaults to 3000)