// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const loadingScreen = document.getElementById('loadingScreen');
const chatContainer = document.getElementById('chatContainer');
const messagesContainer = document.getElementById('messagesContainer');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const startAdventureButton = document.getElementById('startAdventure');
const genderSelect = document.getElementById('gender');
const raceSelect = document.getElementById('race');
const classSelect = document.getElementById('class');
const characterRaceSpan = document.getElementById('characterRace');
const characterClassSpan = document.getElementById('characterClass');

// API configuration
const API_ENDPOINT = 'https://aidandd.onrender.com/api/generate-content'; // Update if deployed

// Game state
let iteration = 0;
const storyLog = [];
const responseLog = [];

// Create typing indicator element
function createTypingIndicator() {
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerHTML = '<span></span><span></span><span></span>';
  return typingIndicator;
}

// Add message to chat
function addMessage(text, isPlayer = false) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${isPlayer ? 'player-message' : 'dm-message'}`;
  messageElement.textContent = text;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return messageElement;
}

// Show typing indicator
function showTypingIndicator() {
  const typingIndicator = createTypingIndicator();
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return typingIndicator;
}

// Remove typing indicator
function removeTypingIndicator(indicator) {
  if (indicator && indicator.parentNode) {
    indicator.parentNode.removeChild(indicator);
  }
}

// Generate content from AI
async function generateContent(prompt) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
console.log (response,'hello')
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON, received ${contentType || 'unknown'}: ${text.slice(0, 50)}...`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.text) {
      throw new Error('No text content in response');
    }
    return { text: data.text };
  } catch (error) {
    console.error('Fetch Error:', error);
    throw error;
  }
}

// Handle send button click
async function handleSendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Clear input
  userInput.value = '';

  // Add user message to chat
  addMessage(message, true);

  // Store user response
  responseLog.push(message);

  // Check for exit commands
  if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
    addMessage('Thank you for playing! Refresh the page to start a new adventure.', false);
    return;
  }

  // Show typing indicator
  const typingIndicator = showTypingIndicator();

  try {
    // Create prompt for AI based on conversation history
    let prompt;
    if (iteration === 0) {
      const gender = genderSelect.value;
      const race = raceSelect.value;
      const characterClass = classSelect.value;

      prompt = `You are a Dungeon Master for a Dungeons & Dragons game. You have no knowledge of artificial intelligence or anything outside a fictional, high-fantasy universe. Stay in character as a Dungeon Master at all times, using a dramatic, immersive tone for narrative responses. The player character is a ${gender} ${race} ${characterClass}, level 1, with no backstory, basic crude items (e.g., a dagger, spellbook if applicable, 15 gold pieces), and minimal experience. The setting is a small coastal merchant town named Saltbreeze on a sunny afternoon.

For narrative inputs (e.g., "I go to the tavern"), progress the story with rich, descriptive language, keeping responses under 1000 words. Prompt the player to take actions or make decisions, but do not make choices for them. For questions (e.g., about lore, D&D 5e rules, inventory, or the environment), provide concise, in-character answers consistent with D&D 5e rules and the high-fantasy setting. If the input is ambiguous, ask for clarification in character. Maintain a safe, engaging tone suitable for a D&D adventure.

Current player input: "${message}"`;
    } else {
      // Include conversation history for context
      const history = storyLog.map((dmMsg, i) => `DM: ${dmMsg}\nPlayer: ${responseLog[i] || ''}`).join('\n');
      prompt = `Continue the Dungeons & Dragons game as a Dungeon Master, staying in character within a high-fantasy setting. Use a dramatic, immersive tone for narrative responses. The player character is a ${genderSelect.value} ${raceSelect.value} ${classSelect.value}, level 1, with basic items and 15 gold pieces. Use the following conversation history for context:

${history}

For narrative inputs, progress the story with rich, descriptive language, keeping responses under 1000 words. Prompt the player to take actions or make decisions, but do not make choices for them. For questions, provide concise, in-character answers consistent with D&D 5e rules. If the input is ambiguous, ask for clarification in character. Maintain a safe, engaging tone.

Current player input: "${message}"`;
    }

    // Get response from AI
    const response = await generateContent(prompt);

    // Remove typing indicator
    removeTypingIndicator(typingIndicator);

    // Add AI response to chat
    addMessage(response.text, false);

    // Store DM response
    storyLog.push(response.text);

    // Increment iteration
    iteration++;
  } catch (error) {
    removeTypingIndicator(typingIndicator);
    addMessage(`The winds of magic falter: ${error.message}. Please try again, brave adventurer.`, false);
  }
}

// Start adventure button click handler
startAdventureButton.addEventListener('click', async function () {
  // Update character info display
  characterRaceSpan.textContent = raceSelect.value;
  characterClassSpan.textContent = classSelect.value;

  // Hide welcome screen, show loading
  welcomeScreen.style.display = 'none';
  loadingScreen.style.display = 'block';

  try {
    // Initialize conversation with AI
    const gender = genderSelect.value;
    const race = raceSelect.value;
    const characterClass = classSelect.value;

    const prompt = `You are a Dungeon Master for a Dungeons & Dragons game. You have no knowledge of artificial intelligence or anything outside a fictional, high-fantasy universe. Stay in character as a Dungeon Master at all times, using a dramatic, immersive tone. The player character is a ${gender} ${race} ${characterClass}, level 1, with no backstory, basic crude items (e.g., a dagger, spellbook if applicable, 15 gold pieces), and minimal experience. The setting is a small coastal merchant town named Saltbreeze on a sunny afternoon.

Introduce the setting with rich, descriptive language, keeping the response under 1000 words. Prompt the player to take actions or make decisions, but do not make choices for them. Allow the player to respond with natural language to shape the story or ask questions (e.g., about lore, D&D 5e rules, inventory, or the environment). For questions, provide concise, in-character answers consistent with D&D 5e rules and the setting. If the input is ambiguous, ask for clarification in character. Maintain a safe, engaging tone suitable for a D&D adventure.`;

    const response = await generateContent(prompt);

    // Store initial story
    storyLog.push(response.text);

    // Hide loading, show chat
    loadingScreen.style.display = 'none';
    chatContainer.style.display = 'flex';

    // Add initial message
    addMessage(response.text, false);

    // Focus input field
    userInput.focus();
  } catch (error) {
    console.error('Start Adventure Error:', error);
    loadingScreen.style.display = 'none';
    welcomeScreen.style.display = 'flex';
    alert(`Failed to start adventure: ${error.message}. Please check the server and try again.`);
  }
});

// Send message when Enter key is pressed
userInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    handleSendMessage();
  }
});

// Send button click handler
sendButton.addEventListener('click', handleSendMessage);