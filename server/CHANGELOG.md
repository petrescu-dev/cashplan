# Changelog

## [Unreleased] - 2026-01-08

### Added
- **Plan Start Date Feature**: Plans now have a `start_date` field for calculation reference
  - Added `start_date` column to `plans` table in database schema
  - Created Plan model (`src/models/plan.ts`) with TypeScript types and helper functions
  - Database migration script (`src/db/migrate.ts`) to handle existing databases
  - Automatic migration execution on database initialization

### Changed
- **Financial Calculator**: Updated to use plan start date instead of current date
  - `calculateLiquidityAndAssets()` now accepts `startDate` parameter (string or Date)
  - All calculations are now relative to the plan's start date, not the current date
  - This enables future scenario planning and historical analysis

### Technical Details
- Migration script automatically adds `start_date` column to existing databases
- Backward compatibility maintained with default value for existing plans
- All TypeScript types updated and verified
- Example usage provided in `src/examples/calculator-example.ts`

### Benefits
- Users can create plans for future dates (e.g., planning for retirement in 2030)
- Users can analyze historical scenarios
- Consistent reference point for all calculations
- More flexible and powerful planning capabilities

### Files Modified
- `src/db/schema.sql` - Added start_date column to plans table
- `src/db/connection.ts` - Added automatic migration execution
- `src/services/calculator.ts` - Updated to accept and use plan start date
- `README.md` - Updated documentation

### Files Added
- `src/models/plan.ts` - Plan type definitions and helpers
- `src/db/migrate.ts` - Database migration script
- `src/examples/calculator-example.ts` - Usage example
- `CHANGELOG.md` - This file

