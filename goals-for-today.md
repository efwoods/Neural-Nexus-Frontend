# KPI
## Primary KPI
- Users Signing Up then Revenue Growth 
  
## Secondary KPI
- Retension/churn (Payback acquisition cost & tell friends [word of mouth])
- Engagement
- Unit Economics (Cost Per Unit of Product/ Service; Tokens)
- Customer Acquisition Cost
- Payback Period
  
<!-- 5-7% week over week growth is good -->
<!-- 10% week over week growth is exceptional -->

# What will get my users using my product every day instead of once per week.

---

# PRIORITIZED LIST

---

## Tier 1: Demo-Critical (must be working today to impress VCs)

### CHAT AREA

I need the ChatArea messages to receive websocket requests from the backend API (create standalone messaging API) <--- currently working on 
I want to post a message with a post request and receive responses from the backend API via websocket connection.  <--- currently working on 

I need lower latency for the chat area

I need to be able to see a small user icon bubble of the avatar I am chatting with
I need to be able to see a small user icon bubble of the user

I need the Live Chat button to say Live Chat on hover
I need the upload button to say Upload on hover
I need the chat area window to not need a scroll bar on mobile



### DEPLOYMENT

<!-- I need the current deployment to be deployed to cloud for the backend & frontend (create standalone DB api) -->
I need to create a standalone api for messaging (uses chromadb vectorstore, websockets, qlora models, llama models, rest api)

### LIVE CHAT

I need LiveChat input audio to be collected
I need LiveChat input audio to be sent to avatar/post\_message
I need the LiveChat to receive responses from avatar/post\_message
I need LiveChat to audibly play the responses with an audible default voice
<!-- I need to be able to use the current conversation context and grok imagine to move the image of the avatar -->
I need the avatar image to not be so zoomed in if not on mobile
I need "Hey {AvatarName}" to for the avatar input or "(optional Hey) {Avatar First Name or Avatar Last Name only}" to trigger the input to the Live Chat
I need to see any LiveChat messages as persisted in the ChatArea

### CHAT AREA

I need the ChatArea messages to receive websocket requests from the backend API
I want to post a message with a post request and receive responses from the backend API via websocket connection.
I need lower latency for the chat area
I need to be able to see a small user icon bubble of the avatar I am chatting with
I need to be able to see a small user icon bubble of the user
I need the Live Chat button to say Live Chat on hover
I need the upload button to say Upload on hover
I need the chat area window to not need a scroll bar on mobile


---

## Tier 2: Strong Demo Enhancers (next layer of polish + credibility)

### AVATAR SELECTION COMPONENT

I need the cards on the circular gallery to be icons that have a transparent background (they are currently black) if the avatar does not have an image.
I need the cards on the circular gallery to be a plus icon for the create avatar card (it is currently black)
I need to be able to see "Community Avatars" in the search bar
I need to be able to select one or more "Community Avatars" in the search bar and add all at once
I need to be able to use the arrows on the keyboard to navigate the circular gallery
I need the circular gallery to be larger
I need to be able to see the edges of the other cards of the circular gallery
I need less space between the top and bottom of the circular gallery

### ACCOUNT SETTINGS

I need a button in the top left-hand corner to have a cancel button to navigate back to avatar-selection in Account Settings
I need a button in the top right-hand corner to have a done button to update the user settings (if anything changed) and navigate back to avatar-selection in Account Settings
I need all the update buttons in the Account Settings to call user settings with the update
I need to Download my Data with the Download Data in the Account Settings view
I need to Delete Account with the Delete Account in the Account Settings view (delete all avatars and the user)

### BILLING DASHBOARD

I need to be able to see API usage
I need to be able to allow users to create API keys to call the avatar/post\_message endpoint
I need to monitor API usage
I need to see billing history
I need to allow users to add a credit card in the Billing Dashboard
I need to integrate this with the Stripe API
I need to allow users to subscripe for three tiers Free, Pro, and Enterprise
I need an "X" button to return to avatar-selection

---

## Tier 3: Differentiators (shows your unique vision vs. competition)

### AVATAR SETTINGS (creating avatars on sparse data for nostalgic purposes; true value of talking to your loved ones)

I need to be able to drag and drop media files
I need to be able to add social media links
I need to be able to add youtube links
I need to be able to see the current avatar icon and update it with the same text (Drag and drop icon here or click to upload)
I need to be able to see the current avatar description and update it
I need to be able to preprocess any data that is added to the avatar settings (automatically navigate links and scrape data, preprocess the data into a useful format)
I need to be able to edit data that has been scraped from automated processes
I need to be able to add my own context as a document for the avatar (window with custom context)
I need to be able to train the avatar on this data.
I need to be able to delete data that the avatar has been trained on
I need to be able to update data that the avatar has been trained on
I need the avatar settings to not be white as a background.
I need to process github documents as text
I need to process youtube videos from links into text and audio
I need to be able to subscribe to content and automatically train and update the model with the subscription. (Whenever a creator creates new content, the model is updated to reflect the individual)

### NEURAL NEXUS DB API

I need to be able to train QLoRA adapters from a /train endpoint
I need to be able to add documents to the chromadb vector store
I need the responses from the avatar at post message to be contextually relevant using the chromadb vectorstore
I need the responses from the avatar at post\_message to be fine-tuned to allow for messages to be in the style of writing of the avatar
I need rate-limiting on the api endpoints
I need cost monitoring to prevent over monthly usage of the api given the container size
I need to split the api to allow for the model inference to be its own endpoint
I need to split the api to allow for the data collection to be its own endpoint
I need to split the api to allow for avatar management/ user management to be its own endpoint (so the app is always available)
I need to create a research agent with langchain to automate the process of taking a name, sample image (optional), audio sample (optional), then search the web for the target individual, collect data (audio, video, images, text), process the data into structured text for fine-tuning, generate synthetic data samples & weight the synthetic vs. non-synthetic for model fine-tuning (optional),  fine-tune the model.

### INTEGRATIONS (financial use to keep the app profitable and generally useful)

I need to create integrations with social media apps for

* custom email responses
* responses to tweets
* custom voicemail
* responses to instagram messages
* responses to twitch chat with twitch chat context (twitch bot)
  These need to use the API and charge a fee per call.

---

## Tier 4: Long-Term Trust & Security

### AUDITING, ABUSE, & FRAUD prevention (safety and security)

I need an immutable blockchain to trace user activity
I need to be able to detect and prevent prohibited use such as child-abuse/child-pornography/ or illegal activity
I need to be able to prevent the application from fraudulent use
I need to use end-to-end encryption to secure the user's details and sensitive information

### Terms and Conditions and Privacy Policy

I need to update the Terms and Conditions and Privacy Policy to prevent abuse, fraud, and illegal activity.
I need to update the Privacy Policy to ensure the user is aware of auditing (immutable blockchain)
I need to allow people to create any avatar but state that it is against terms and conditions for creating the likeness of others and/or sharing the likeness of other for non-personal use

add message above text input bar such as "By messaging ChatGPT, you agree to our Terms and have read our Privacy Policy. Don't share sensitive info. Chats may be reviewed and used to train our models. Learn more"

add browser permissions: allow neural nexus to use persistent storage?
enable browser notifications from avatar

---

## Tier 5: Future Roadmap (show vision beyond demo)

### NEURAL DATA (the true value of the application to the neuroscience community and those in need; future use)

I need thought to text api to no longer use skip connections and use inpainting instead to create the image and leave-one-out to associate the receptive field of the image with with the neural signal
I need a data set for thought-to-text to train encoder/decoder models on neural data to allow BCI conceptual telepathy
I need to integrate thought-to-motion into the app in a useful way.

### COMMUNITY AVATARS (financial aspect of the application to allow it to exist)

I need to create community avatars that are publicly available to all users (chick-fil-a, starbucks, outback (sit-down restaurant use), kanji ordering (local restaurant use);
I need to onboard celebrities or otherwise public figures & present royalties for use of their content in the application)
coinbase voice assistant for transactions

### LOGIN SCREEN

<!-- I need the icon to be the icon of the last used avatar, the user if the user has added an icon and the last used avatar is not available, or -->
I need the icon to be the community avatar icons that auto scroll position (chick-fil-a; onboarded community celebrities)
I need to be able to login with social media accounts (github, google, twitter, apple, etc.)
I need the login screen on mobile to not have a scroll bar or have cut-off content (needs to fill the screen properly and be the correct size for the mobile device)
---

## GATHERING DATA AND TRAINING REQUIREMENTS (Elon Avatar Example)

*(kept at the bottom as originally provided, supporting the Neural Nexus DB API research agent)*
\[full text unchanged from your original list]

---

Would you like me to also **map these tiers into milestone timelines** (e.g., Tier 1 = this week, Tier 2 = next 2 weeks, etc.) so you can show investors exactly when you’ll deliver?

