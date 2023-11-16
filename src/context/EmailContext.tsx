import React, { createContext, useState, useContext, ReactNode } from 'react';
import { fetchEmails, fetchLatestEmails, fetchUnasnweredEmails, getTodaysUnreadEmails } from '../services/gmailService';
import { Email } from '../types/Email';

interface EmailContextValue {
  getAllEmails: (userEmail: string, accessToken: string, maxResults: number) => Promise<{inbox, sent, spam}>;
  getEmails: (type: string, userEmail: string, accessToken: string, maxResults: number) => Promise<Email[]>;
  getMessagesWithIndex: (type: string, userEmail: string, accessToken: string, maxResults: number) => Promise<Email[]>;
  getUnasnweredEmails: (type: string, userEmail: string, accessToken: string) => Promise<number>;
  getUnreadEmails: (type: string, userEmail: string, accessToken: string) => Promise<number>;
  getLatestEmails: (type: string, userEmail: string, accessToken: string) => Promise<any>;
  inboxEmails: Email[];
  sentEmails: Email[];
  spamEmails: Email[];
}

const EmailContext = createContext<EmailContextValue | undefined>(undefined);

export const useEmailContext = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmailContext must be used within a EmailContextProvider');
  }
  return context;
};

interface EmailProviderProps {
  children: ReactNode;
}

export const EmailProvider: React.FC<EmailProviderProps> = ({ children }) => {
  const [inboxToken, setInboxToken] = useState<string>('');
  const [sentToken, setSentToken] = useState<string>('');
  const [spamToken, setSpamToken] = useState<string>('');
  const [inboxEmails, setInboxEmails] = useState<any[]>([]);
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [spamEmails, setSpamEmails] = useState<any[]>([]);

  const [unansweredEmails, setUnansweredEmails] = useState<number>(0);
  const [unreadEmails, setUnreadEmails] = useState<number>(0);

  const getEmails = async (type, userEmail, accessToken, maxResults) => {
    try {
      if(type === 'INBOX') {
        const userEmails = await fetchEmails(type, userEmail, accessToken, maxResults, inboxToken);
        setInboxToken(userEmails.newNextPageToken);
        if(userEmails.newNextPageToken === undefined) {
          setInboxToken('');
        }
        setInboxEmails(userEmails.emails);
        return userEmails.emails;
      }
      if(type === 'SENT') {
        const userEmails = await fetchEmails(type, userEmail, accessToken, maxResults, sentToken);
        setSentToken(userEmails.newNextPageToken);
        if(userEmails.newNextPageToken === undefined) {
          setSentToken('');
        }
        setSentEmails(userEmails.emails);
        return userEmails.emails;
      }
      if(type === 'SPAM') {
        const userEmails = await fetchEmails(type, userEmail, accessToken, maxResults, spamToken);
        setSpamToken(userEmails.newNextPageToken);
        if(userEmails.newNextPageToken === undefined) {
          setSpamToken('');
        }
        setSpamEmails(userEmails.emails);
        return userEmails.emails;
      }
    } catch (err) {
      console.log('Error getting chat instances: ', err);
    }
  };

  const getAllEmails = async (userEmail, accessToken, maxResults) => {
    try {
      const inbox = await fetchEmails("INBOX", userEmail, accessToken, maxResults);
      const sent = await fetchEmails("SENT", userEmail, accessToken, maxResults);
      const spam = await fetchEmails("SPAM", userEmail, accessToken, maxResults);
      
      const allEmails = {
        inbox,
        sent,
        spam,
      }
      setInboxToken(inbox.newNextPageToken);
      setSentToken(sent.newNextPageToken);
      return allEmails;
    } catch (err) {
      console.log('Error getting chat instances: ', err);
    } 
  }

  const getMessagesWithIndex = async (type, userEmail, accessToken, maxResults) => {
    if(type === 'INBOX') {
      if(inboxToken === '') {
        return [];
      }
      const mails = await fetchEmails(type, userEmail, accessToken, maxResults, inboxToken);
      setInboxEmails([...inboxEmails, ...mails.emails]);
      setInboxToken(mails.newNextPageToken);
      if(mails.newNextPageToken === undefined) {
        setInboxToken('');
      }
      return mails.emails;
    }
    if(type === 'SENT') {
      if(sentToken === '') {
        return [];
      }
      const mails = await fetchEmails(type, userEmail, accessToken, maxResults, sentToken);
      setSentEmails([...sentEmails, ...mails.emails]);
      setSentToken(mails.newNextPageToken);
      if(mails.newNextPageToken === undefined) {
        setSentToken('');
      }
      return mails.emails;
    }
    if(type === 'SPAM') {
      if(spamToken === '') {
        return [];
      }
      const mails = await fetchEmails(type, userEmail, accessToken, maxResults, sentToken);
      setSpamEmails([...spamEmails, ...mails.emails]);
      setSentToken(mails.newNextPageToken);
      if(mails.newNextPageToken === undefined) {
        setSpamToken('');
      }
      return mails.emails;
    }
  }

  // returns only the number of unanswered emails
  const getUnasnweredEmails = async (type, userEmail, accessToken) => {
    const {emails} = await fetchUnasnweredEmails(type, userEmail, accessToken);
    setUnansweredEmails(emails.length);
    return emails.length;
  }

  // returns only the number of unread emails
  const getUnreadEmails = async (type, userEmail, accessToken) => {
    const unreadEmails = await getTodaysUnreadEmails(type, userEmail, accessToken);
    setUnreadEmails(unreadEmails.length);
    return unreadEmails.length;
  }

  const getLatestEmails = async (type, userEmail, accessToken) => {
      const mails = await fetchLatestEmails(type, userEmail, accessToken);
      return mails;
  }

  const value: EmailContextValue = {
    getAllEmails,
    getEmails,
    getMessagesWithIndex,
    getUnasnweredEmails,
    getUnreadEmails,
    getLatestEmails,
    inboxEmails,
    sentEmails,
    spamEmails,
  };

  return <EmailContext.Provider value={value}>{children}</EmailContext.Provider>;
};