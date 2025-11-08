# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.0] - 2023-11-08

### Added
- **Star Rating System**: Replaced thumbs up/down with a 1-5 star rating system in the Editor Panel for more granular feedback.
- **Delete Content Piece**: Added a delete button with a confirmation dialog to the Editor Panel.
- **Google Search Grounding**: Added a toggle in the New Project form to use Google Search for up-to-date, accurate information during content generation.
- **URL as Source**: Users can now paste a URL as a source when creating a new project; the app will fetch and parse the article content.
- **Bulk Actions in Export Center**: Implemented a "Mark as Exported" bulk action for selected content pieces.
- **Collapsible Sources**: The "Sources from Google Search" section in the Editor Panel is now collapsible and includes a placeholder icon for adding custom resources.
- **New Project Button**: Added a persistent "+ New Project" button to the main header on the projects page for easier access.
- **Chat History Management**: Added a context menu to each chat in the chat history sidebar with options to delete or archive conversations.
- **Custom AI Instructions**: Added a new modal in the Chat page for users to provide custom instructions to the AI assistant.

### Changed
- **Simplified Project Creation**: Removed the "Brand Voice" input from the New Project form to streamline the process.
- **Relocated Chat "Thinking Mode"**: Moved the "Thinking Mode" toggle in the Chat page to the input area for easier access before sending a message.
- **Real User Accounts**: Removed the concept of a "demo user". All sign-ups and logins are now treated as standard user accounts. The Google Sign-In button, previously tied to the demo account, has been removed.
- **UI/UX Improvements**:
    - Added a drag-and-drop indicator icon to the Key Points Summary card on the Kanban page.
    - Refactored the project page's empty state to be cleaner and more consistent with the new header button.

### Fixed
- **Critical Sign-In Flow**: Implemented a comprehensive fix for the sign-in process. The application is now significantly more robust, correctly handling asynchronous operations, and sanitizing older or malformed user data on login to prevent failures. This ensures users can reliably access their accounts and all their projects.
- **Account Creation Reliability**: Refactored the sign-up process to be "future-proof", ensuring all new user accounts are created with a consistent and up-to-date data structure to prevent future compatibility issues.
- **Sidebar Navigation Highlighting**: Corrected a bug where both "Profile" and "Settings" links were highlighted simultaneously in the sidebar.

## [1.8.0] - 2023-11-03

### Fixed
- User project and chat histories are now correctly persisted across sessions. Data is saved to and loaded from local storage based on the logged-in user, ensuring work is not lost after logging out.

### Added
- Re-instated the login functionality to support multiple users on the same browser.

## [1.7.0] - 2023-11-02

### Added
- **AI-Powered Brainstorming**: Added a "Brainstorm Ideas" button on the Kanban board to generate 3-5 new content ideas from the project's source text using Gemini.
- **Source Text Summary**: Implemented a "Key Points Summary" feature on the Kanban board to automatically summarize the source text into key bullet points for a quick overview.
- **Kanban Card Sorting**: Introduced sorting options on the Kanban page, allowing users to sort content cards by title, date created, or format in ascending/descending order.
- **Enhanced Brand Voice Input**: Improved the "Brand Voice" input in the new project form with clickable tone suggestions and more descriptive examples to guide users.
- **Audio Transcription in Chat**: Added a microphone button to the AI Assistant Chat for real-time audio input and transcription using the Gemini Live API.

### Changed
- **Chat Performance**: Upgraded the default AI Assistant Chat model to `gemini-2.5-flash-lite` for faster, lower-latency responses.
- **"Thinking Mode" for Chat**: The AI Assistant Chat now features a "Thinking Mode" toggle, which utilizes the `gemini-2.5-pro` model with a maximum `thinkingBudget` to handle more complex user queries.
- **Chat UI**: Removed the default welcome message from the AI Assistant Chat for a cleaner starting experience.

## [1.6.0] - 2023-11-01

### Added
- **Export Center**: A dedicated page to view, manage, and export all content pieces marked as "Ready to Schedule" or "Exported".
- **CSV Export**: Added the ability to select multiple content pieces from the Export Center and download them as a single CSV file, perfect for bulk uploads or external tracking.
- **Copy to Clipboard**: Added a "Copy" button for each item in the Export Center to quickly grab content for immediate use.

### Changed
- **Sidebar Navigation**: Added a new "Export Center" link under the "Manage" section for easy access to the new functionality.
- **Internal Data Handling**: Refactored content update logic to support actions across multiple projects simultaneously.

## [1.5.0] - 2023-10-31

### Added
- **Password Visibility**: Added an 'eye' icon to password fields on the login page to allow users to view their password.
- **Persistent Multi-Chat**: The main 'Chat' page now saves all conversation histories. Users can create new chats and switch between them.

### Changed
- **Simplified Login**: Removed Apple and Microsoft social login options to focus on Google and email-based authentication.
- **Improved Sidebar UX**: "Coming soon" features in the sidebar are now visually dimmed and disabled. A close button has been added for better navigation on mobile devices.

### Removed
- Apple and Microsoft social login buttons from the login page.

## [1.4.0] - 2023-10-30

### Added
- **Floating AI Assistant**: Integrated a persistent, floating chatbot accessible from anywhere in the app via a new floating action button. This provides immediate access to the AI for brainstorming and quick questions without navigating away from the current view.

## [1.3.0] - 2023-10-29

### Added
- **Expanded Navigation**: Added several new navigation links to the sidebar for existing and future features, including Chat, History, Kanban Board, Templates, Workflow, Agent, Collaboration, and Team.

### Changed
- **Centralized Navigation**: Reorganized the sidebar to be the primary navigation hub, grouping items into logical sections for a more scalable layout.
- **Streamlined Header**: Simplified the main header by removing the standalone Settings and Profile icons.

### Removed
- Redundant Settings and Profile icons from the top header to focus all navigation within the sidebar.