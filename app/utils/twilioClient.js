import { Client } from '@twilio/conversations';

let conversationsClient;
let currentChannel;

// Initialize the Twilio Conversations client
export const initTwilioClient = async (token) => {
  try {
    conversationsClient = new Client(token);
    await conversationsClient.initialize();
    return conversationsClient;
  } catch (error) {
    console.error('Error initializing Twilio client:', error);
    throw error;
  }
};

// Join or create a conversation channel
export const joinOrCreateConversation = async (channelName) => {
  try {
    // Try to get the channel if it exists
    const channels = await conversationsClient.getSubscribedConversations();
    let channel = channels.items.find(c => c.friendlyName === channelName);
    
    // If channel doesn't exist, create it
    if (!channel) {
      channel = await conversationsClient.createConversation({
        friendlyName: channelName
      });
      await channel.join();
    }
    
    currentChannel = channel;
    return channel;
  } catch (error) {
    console.error('Error joining/creating conversation:', error);
    throw error;
  }
};

// Send a message to the current channel
export const sendMessageToChannel = async (messageText) => {
  if (!currentChannel) {
    throw new Error('No active channel');
  }
  
  try {
    const message = await currentChannel.sendMessage(messageText);
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get the current channel
export const getCurrentChannel = () => currentChannel;

// Object containing all utility functions
const TwilioClient = {
  initTwilioClient,
  joinOrCreateConversation,
  sendMessageToChannel,
  getCurrentChannel
};

// Default export
export default TwilioClient; 