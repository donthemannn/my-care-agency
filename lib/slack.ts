export interface SlackMessage {
  text: string;
  channel?: string;
  username?: string;
  icon_emoji?: string;
}

export async function sendSlackNotification(message: SlackMessage) {
  const slackToken = process.env.SLACK_BOT_TOKEN;
  const defaultChannel = process.env.SLACK_CHANNEL_ID;

  if (!slackToken) {
    console.log('Slack notification (no token):', message.text);
    return { success: false, error: 'No Slack token configured' };
  }

  try {
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: message.channel || defaultChannel,
        text: message.text,
        username: message.username || 'Friday AI',
        icon_emoji: message.icon_emoji || ':robot_face:',
      }),
    });

    const data = await response.json();

    if (data.ok) {
      return { success: true, data };
    } else {
      console.error('Slack API error:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Slack notification error:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function notifyNewChat(userMessage: string, aiResponse: string) {
  const message = {
    text: `🤖 *New Chat Interaction*\n\n*User:* ${userMessage}\n\n*Friday AI:* ${aiResponse.substring(0, 200)}${aiResponse.length > 200 ? '...' : ''}`,
    username: 'Friday AI Assistant',
    icon_emoji: ':speech_balloon:'
  };

  return await sendSlackNotification(message);
}

export async function notifyNewLead(leadData: any) {
  const message = {
    text: `🎯 *New Lead Generated*\n\n*Name:* ${leadData.name || 'Unknown'}\n*Email:* ${leadData.email || 'Not provided'}\n*Phone:* ${leadData.phone || 'Not provided'}\n*Source:* Friday AI Chat`,
    username: 'Lead Generator',
    icon_emoji: ':dart:'
  };

  return await sendSlackNotification(message);
}

export async function notifySystemAlert(alert: string, severity: 'info' | 'warning' | 'error' = 'info') {
  const emoji = severity === 'error' ? ':rotating_light:' : severity === 'warning' ? ':warning:' : ':information_source:';
  
  const message = {
    text: `${emoji} *System Alert*\n\n${alert}`,
    username: 'System Monitor',
    icon_emoji: emoji
  };

  return await sendSlackNotification(message);
}
