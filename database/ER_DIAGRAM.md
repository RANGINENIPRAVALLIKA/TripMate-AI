# TripMate AI entity relationships

```text
User --< Trip >-- Destination
Trip --< Itinerary --< Activity
Trip --|| Budget
Trip --< Expense >-- ExpenseCategory
Trip --< TravelGroup --< GroupMember >-- User
TravelGroup --< GroupExpense --< GroupExpenseShare >-- GroupMember
Trip --< PackingChecklist --< PackingItem
Trip --< TravelJournal --< JournalPhoto
Trip --< Booking
User --< SavedTrip >-- Trip
User --< Favorite >-- Destination | Hotel | Restaurant | Attraction
User --< Review >-- Destination | Hotel | Restaurant | Attraction
Destination --< Hotel | Restaurant | Attraction | NearbyPlace
User --< ChatHistory >-- Trip
User --< Notification | RefreshToken | PasswordResetToken
User >--< Role (user_roles)
User --< Analytics
User --< AdminLog (as admin)
```
