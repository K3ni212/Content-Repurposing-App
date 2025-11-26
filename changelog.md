
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.7.0] - 2023-11-16

### Added
- **[Feature] Performance Layer**: Added a strategic layer to the AI generation engine to ensure content drives real-world results (Leads, Reach, Conversion).
- **[UI] Goal Selection**: Users can now select a specific "Content Goal" (e.g., Lead Gen, Thought Leadership) when creating a new project.
- **[AI] Strategic Intelligence**: The AI now analyzes source text for tension points, belief shifts, and emotional triggers before writing.
- **[AI] Persuasion Frameworks**: The system automatically applies frameworks like AIDA, PAS, and Story-Lesson based on the selected goal.
- **[AI] Performance Validation**: The generation prompt now includes a self-validation step to ensure hooks, CTAs, and tone align with the desired outcome.

## [2.6.0] - 2023-11-15

### Added
- **[Feature] AI Agents Dashboard**: Added a new "AI Agents" section to the dashboard with 7 specialized agents:
    - **Content Intake (Strategist)**: Breaks down content into key points, tone, and angles.
    - **Repurposing (Creator)**: Converts content into multi-platform assets (LinkedIn, X, IG, Email).
    - **Brand Consistency (Guardian)**: Audits text against brand rules and tone.
    - **Workflow Automation (Connector)**: Structures data for webhooks and suggests automations.
    - **Review & Feedback (Editor)**: Provides clarity/engagement scores and improvement suggestions.
    - **Distribution (Publisher)**: Generates metadata, hashtags, and visual ideas.
    - **Analytics (Analyst)**: Predicts performance and suggests tracking metrics.
- **[Feature] Agent Interaction UI**: Created a dedicated modal for interacting with agents, allowing users to input text and receive specialized, markdown-formatted outputs.
- **[Service] Agent Service**: Implemented a new `agentService.ts` containing tailored Gemini prompts for each agent persona.

## [2.5.0] - 2023-11-14

### Added
- **[Feature] Customizable Onboarding**: Added a "Customize your workspace" step to the onboarding flow. Users can now manually select the features they want (e.g., Automation, Templates, Analytics), giving them full control over their dashboard layout instead of it being strictly defined by their role.
- **[Feature] Feature Management Settings**: Added a new "Features" tab in the Settings page, allowing users to toggle specific tools on or off at any time after onboarding.
- **[UX] Skeleton Loading Screen**: Implemented a skeleton dashboard loader during the sign-up process to reduce perceived latency and improve the initial user experience.
- **[UX] Customization Loader**: Added a "Customizing your dashboard" loading state that appears immediately after onboarding while the application configures the user's workspace.

### Changed
- **Sidebar Navigation Logic**: The sidebar now dynamically renders navigation items based on the user's `enabledFeatures` list rather than just their job title.

### Fixed
- **Render Error #310**: Fixed a critical React error caused by state updates occurring during the render phase. The logic for redirecting from an empty Kanban view has been moved to a `useEffect` hook to ensure stability.

## [2.4.0] - 2023-11-13

### Added
- **[Feature] Adaptive Onboarding Flow**: Implemented a new multi-step onboarding process that captures user role, goals, company details, and a content sample. This data is used to personalize the user experience from the start.
- **[Feature] Role-Based Dashboard Interface**: The dashboard sidebar now dynamically adapts to the user's role (e.g., Writer, Social Media Manager), showing the most relevant tools and workspaces for their function. Placeholder pages have been added for upcoming features like a Content Planner and Performance Analytics.
- **[Feature] Brand Intelligence Memory**: A new "Brand Intelligence" tab has been added to the Settings page. This allows users to store brand voice descriptors, preferred CTAs, and tone samples. This data is now automatically used by the AI to generate more consistent, on-brand content.
- **[Feature] Performance Intelligence & Smart Score (UI)**: The foundation for performance analytics has been laid by adding a "Smart Score" metric to content pieces, which is now displayed on each content card. This score is currently simulated and will be integrated with platform analytics in the future.
- **[Feature] Content Collaboration Hub (UI)**: The content editor now includes a "Collaboration" tab with a commenting system, allowing users to leave and view feedback on drafts. This provides the groundwork for a future real-time collaboration workspace.
- **[Feature] Content Ops Marketplace (UI)**: A placeholder page for a "Marketplace" has been added, setting the stage for a future feature connecting brands with verified content creators, editors, and designers.
- **[Feature] Zapier Automation Connector (UI)**: A new "Automation Hub" section has been added to Settings, displaying pre-built Zap templates to prepare for future integration with Zapier.
- **[Feature] Resume Project**: The main projects dashboard now features a "Resume Project" card, which highlights the most recently modified project, allowing users to quickly get back to their work.

### Changed
- **Data Persistence**: The data model has been enhanced to include a `lastModified` timestamp for projects to support the "Resume Project" feature.
- **Gemini Service**: The content generation prompt has been upgraded to incorporate the new `BrandIntelligence` data, resulting in more personalized AI outputs.

## [2.3.0] - 2023-11-12

### Added
- **[Feature] Expanded Workflow Node Library**: Massively expanded the capabilities of the Workflow Builder by adding over 40 new, specialized nodes across several categories. This transforms the feature into a comprehensive automation engine.
  - **Input/Source Nodes**: Added nodes for URL Scraping, File Uploads, Google Drive, YouTube, RSS Feeds, and more to provide flexible content entry points.
  - **Processing/AI Nodes**: Implemented a suite of Gemini-powered nodes for repurposing, summarizing, translating, fact-checking, and generating hooks/CTAs.
  - **Human-in-the-Loop Nodes**: Introduced nodes for manual reviews, checklists, and feedback collection to ensure brand safety and quality control.
  - **Output/Distribution Nodes**: Added nodes for exporting to Google Docs, triggering Zapier webhooks, scheduling, and publishing to social media.
  - **Logic & Automation Nodes**: Implemented essential logic nodes like Triggers, Conditions (If-Else), Timers, and Merging for building complex, dynamic workflows.
  - **Analytics & Utility Nodes**: Added nodes for tracking metrics, managing user data, and sending notifications to provide platform insights and stability.
  - **Categorized Sidebar**: The Workflow Builder's sidebar has been reorganized to group nodes by category, making the extensive new library easy to navigate.

## [2.2.0] - 2023-11-11

### Added
- **[Feature] Workflow Builder (Visual Automation Canvas)**: Implemented a visual, drag-and-drop workflow builder, enabling users to create, connect, and configure automated content processes.
  - **Drag-and-Drop Canvas**: A main canvas area where users can place and arrange nodes.
  - **Node Library**: A sidebar provides draggable nodes representing key stages (Project, Review Assistant, Human Review, Finalize, Schedule, Publish).
  - **Node Configuration**: A contextual side panel appears when a node is selected, allowing users to configure its name, trigger, and other properties.
  - **Node Connections**: Users can visually connect nodes with SVG lines to define the workflow sequence.
  - **Workflow Persistence**: Workflows are automatically saved to the user's account and are fully restored upon login.
- **[Feature] Dashboard Search Bar**: Integrated a global search bar into the main header for quick navigation.
  - **Real-time Search**: Provides instant search results for projects and workflows as the user types.
  - **Quick Navigation**: Search results are displayed in a dropdown and link directly to the respective project or workflow.

## [2.1.0] - 2023-11-10

### Added
- **[Feature] Smart Review Assistant (ToneCheck AI)**: Integrated a new "Smart Review" feature into the content editor. This assistant analyzes draft content against previously approved posts to ensure brand consistency.
  - **Tone Matching**: Automatically revises drafts to align with the brand's tone, using up to 5 approved content pieces as examples.
  - **Side-by-Side Comparison**: Displays the original draft and the AI-revised version side-by-side for easy comparison.
  - **Detailed Feedback**: Provides a summary and a list of specific changes with educational explanations, helping users understand the revisions.
  - **Manual Tone Control**: Allows users to select a specific tone (e.g., Formal, Conversational) to guide the revision process.
  - **Seamless Integration**: The assistant is accessible via a "Smart Review" button within the editor panel, providing a streamlined workflow for reviewing and approving content.

## [2.0.0] - 2023-11-09

### Added
- **Google Sign-In**: Re-implemented the "Sign-In with Google" functionality on the login page. This feature simulates a Google OAuth flow, allowing users to sign up or log in with a mock Google account. New Google users are automatically registered, and their data is stored under their account.
- **Persistent User Data**: Strengthened the data persistence model. All user-specific data, including projects, settings, and brand voices, is now reliably saved to and loaded from the browser's `localStorage`. The system uses a unique key for each user (`<email>_projects`), ensuring data is isolated and automatically reloaded upon subsequent logins.
- **Auto-Saving**: All changes to projects, content pieces, settings, and brand voices are automatically saved to `localStorage` in real-time using React's `useEffect` hooks, providing a seamless auto-save experience without manual intervention.

### Changed
- **Authentication Flow**: The application's core authentication logic in `App.tsx` was updated to handle email/password and simulated Google sign-in methods. A new `handleGoogleLogin` function was introduced to manage this process.
- **Login UI**: The `LoginPage.tsx` component was updated to include the "Sign in with Google" button and associated UI elements, restoring a key authentication pathway.

### Fixed
- **Session Management**: User sessions are now persistent. A logged-in user will remain authenticated across browser restarts until they explicitly log out. This is managed by storing the current user's email in `localStorage`.
- **Data Integrity on Login**: Added checks (`ensureUserDataExists`) to verify that a user's data structures exist in `localStorage` upon login, creating them if they are missing to prevent application errors and ensure a smooth user experience, especially for users from older versions.

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
