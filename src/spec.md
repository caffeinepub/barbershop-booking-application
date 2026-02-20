# Specification

## Summary
**Goal:** Add a personalized salon dashboard with analytics for sales, bookings, and customer reviews.

**Planned changes:**
- Create a new salon-specific dashboard route accessible after salon registration
- Add backend data models and query methods to track sales data per month (revenue and transaction counts)
- Display a graph showing sales per month for the last 12 months
- Add backend query method to retrieve booking counts per month
- Display a graph showing bookings per month for the last 12 months
- Add backend data model and methods to store and retrieve customer reviews (rating, comment, reviewer name, timestamp)
- Display customer reviews on the dashboard sorted by most recent first
- Implement authentication and authorization to ensure salon owners can only access their own dashboard data

**User-visible outcome:** Salon owners can access their personalized dashboard after registration to view sales trends, booking analytics, and customer reviews specific to their salon.
