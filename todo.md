# PurrpleCalm - Project TODO

## Database Schema
- [x] Create journal entries table
- [x] Create migraine logs table
- [x] Create mood tracking table
- [x] Create breathing exercises table
- [x] Create sleep sessions table
- [x] Create chat messages table

## Backend API (tRPC Procedures)
- [x] Journal CRUD operations
- [x] Migraine tracking operations
- [x] Mood tracking operations
- [x] Breathing exercises operations
- [x] Sleep session operations
- [x] AI cat chat integration
- [x] Journal trends analytics
- [x] Migraine pattern analysis

## Frontend Pages
- [x] Home page with navigation cards
- [x] Calm exercises page (breathing, meditation)
- [x] Sleep support page with ambient sounds
- [x] Migraine tracker page
- [x] Journal page with entry form
- [x] Journal trends page with charts
- [x] Settings page with theme toggle
- [x] Cat chat page with AI companion

## UI Components
- [x] Navigation layout
- [x] Breathing exercise component
- [x] Audio player for sleep sounds
- [x] Migraine log form
- [x] Journal entry editor
- [x] Mood selector
- [x] Trend charts
- [x] Chat interface

## Features
- [x] Mobile-responsive design
- [x] Dark/light theme support
- [x] Data persistence
- [x] Real-time chat with AI cat
- [x] Analytics and insights
- [ ] Export journal entries
- [ ] Notification reminders

## Testing & Deployment
- [x] Write vitest tests for key procedures
- [x] Test mobile responsiveness
- [x] Create deployment checkpoint

## Bug Fixes
- [x] Fix audio loading error on sleep page - replace external CDN with reliable audio solution

## Mobile Enhancements
- [x] Apply mobile-first design from EnhanceThemedAppDesign.zip
- [x] Optimize all pages for mobile viewport
- [x] Improve touch targets and spacing for mobile
- [x] Add mobile-friendly navigation

## Cat Chat Improvements
- [x] Fix glitchy behavior in cat chat
- [x] Improve chat UX for mobile
- [x] Add better loading states
- [x] Optimize message rendering

## New Features
- [x] Add BTS Army journal page for daily quotes
- [x] Add weight gain journey tracker
- [x] Integrate both journals into a combined page

## Complete Redesign to Match Uploaded Design
- [x] Apply exact purple gradient theme from uploaded design
- [x] Replace current home page with cat emoji design (😺)
- [x] Add daily inspiration quote card at top of home
- [x] Implement bottom navigation bar (Home, Calm, Journal, Mood)
- [x] Update all pages to match the uploaded design aesthetic
- [x] Use rounded cards and purple/pink gradients throughout
- [x] Replace icon-based navigation with bottom tab bar

## Audio Features for Sleep Support
- [x] Upload goodnight_ko.mp3 to public folder
- [x] Upload winter_bear.mp3 to public folder
- [x] Upload soft_kitty.mp3 to public folder
- [x] Add "goodnight" cat feature with long-press interaction
- [x] Play goodnight_ko.mp3 when goodnight cat is pressed
- [x] Add Winter Bear and Soft Kitty as sleep sound options
- [x] Update sleep support page with new audio files

## Cat Companion Fixes
- [x] Rename "Mochi" to "Rani" throughout entire app
- [x] Fix cat companion page layout and alignment issues
- [x] Redesign chat page to match uploaded design with clean layout
- [x] Add "Rani the Cat" title with cat emoji
- [x] Add "A gentle place to talk" subtitle
- [x] Implement purple message bubble design from image
- [x] Add Back button and Reset button to chat page
- [x] Update home page card for "Chat with Rani" with purple gradient

## Rani Personality Modes
- [x] Add personality mode selector to chat interface
- [x] Create three modes: Comforting (💜), Funny (😹), Playfully Rude (😼)
- [x] Add small icons for mode selection
- [x] Update chat system prompt based on selected mode
- [x] Store user's preferred mode in database
- [x] Add visual indicator showing current active mode

## Chat Response Improvements
- [x] Make Rani's responses shorter and more concise
- [x] Update system prompts to limit response length
- [x] Keep responses to 2-3 sentences maximum

## Chat Response Bug Fixes
- [x] Remove thinking process from Rani's responses
- [x] Eliminate meta-commentary and refinement notes
- [x] Ensure only final, clean responses are shown
- [x] Add strict instructions to prevent reasoning steps in output

## Convert to Local-Only App
- [x] Remove authentication requirement
- [x] Convert all data storage to localStorage
- [x] Remove login/logout UI elements
- [x] Make chat history local-only
- [x] Make journal entries local-only
- [x] Make all features work without database

## Journal Page Redesign
- [x] Add streak counter display (e.g., "2 Day Streak!")
- [x] Add daily writing prompts with heart icon
- [x] Add large text area for journal entry
- [x] Add inspirational quote at bottom
- [x] Match the clean design from uploaded image
- [x] Remove test/debug UI elements

## Bug Fixes
- [x] Fix missing /mood route (404 error)
- [x] Create mood tracking page
- [x] Add route to App.tsx

## Mood Tracker Improvements
- [x] Add inspirational quote/song lyric when saving mood
- [x] Show motivational message after mood is logged

## Weight Gain Challenge Redesign
- [x] Convert weight tracker to goal-oriented challenge system
- [x] Add goal setting (target weight, deadline)
- [x] Add progress bar showing percentage complete
- [x] Show days remaining and weight left to gain
- [x] Add daily check-in with weight and notes
- [x] Add milestone celebrations (25%, 50%, 75%, 100%)
- [x] Make it motivating and useful for 45-day challenges

## Weight Challenge Integration
- [x] Replace old weight tracker in My Journeys with link to new Weight Challenge
- [x] Add Weight Challenge card to My Journeys page
- [x] Remove old weight tracking UI with graphs and notes

## UI Navigation Fixes
- [x] Restore side-by-side tabs layout in My Journeys (BTS Army | Weight Journey)
- [x] Integrate new Weight Challenge into tab instead of separate page
- [x] Add back button to all pages that don't have one
- [x] Ensure consistent navigation across all pages
