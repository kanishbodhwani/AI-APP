import axios from "axios";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import * as MediaLibrary from "expo-media-library";

export const fetchEmails = async (
  type,
  userEmail,
  accessToken,
  maxResults,
  nextPageToken = ""
) => {
  try {
    const emails = [];

    const res = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages`,
      {
        params: {
          maxResults: maxResults,
          pageToken: nextPageToken,
          labelIds: type,
          q: "-category:social -category:promotions",
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { messages, nextPageToken: newNextPageToken } = res.data;

    if (messages && messages.length > 0) {
      for (const message of messages) {
        const messageRes = await axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages/${message.id}`,
          {
            params: {
              format: "full",
            },
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const { payload } = messageRes.data;
        const sentTime = new Date(
          getHeaderValue(payload.headers, "Date")
        ).toISOString();

        const attachments = [];
        if (payload?.parts) {
          for (const part of payload.parts) {
            if (part.body.attachmentId) {
              const attachment = await getAttachment(
                userEmail,
                message.id,
                part.body.attachmentId,
                accessToken,
                part.filename
              );

              if (attachment) {
                attachments.push(attachment);
              }
            }
          }
        }

        const email = {
          id: message.id,
          threadId: message.threadId,
          emailFrom: getHeaderValue(payload.headers, "From"),
          subject: getHeaderValue(payload.headers, "Subject"),
          sentTime,
          body: getBodyContent(payload),
          attachments,
        };

        emails.push(email);
      }
    }

    return { emails, newNextPageToken: newNextPageToken };
  } catch (error) {
    console.error("Error fetching emails:", error);
  }
};

// export const fetchEmails = async (type, userEmail, accessToken, maxResults, nextPageToken = '') => {
//   try {
//     const emails = [];

//     const res = await axios.get(
//       `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages`,
//       {
//         params: {
//           maxResults: maxResults, // Specify the maximum number of results to retrieve
//           pageToken: nextPageToken, // Provide the nextPageToken for pagination
//           labelIds: type, // Specify the category
//           q: '-category:social -category:promotions',
//         },
//         headers: {
//           Accept: 'application/json',
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     const { messages, nextPageToken: newNextPageToken } = res.data;

//     if (messages && messages.length > 0) {
//       for (const message of messages) {
//         const messageRes = await axios.get(
//           `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages/${message.id}`,
//           {
//             params: {
//               format: 'full', // Retrieve full email content
//             },
//             headers: {
//               Accept: 'application/json',
//               Authorization: `Bearer ${accessToken}`,
//               'Content-Type': 'application/json',
//             },
//           }
//         );

//         const { payload } = messageRes.data;
//         const sentTime = new Date(getHeaderValue(payload.headers, 'Date')).toISOString();

//         const email = {
//           id: message.id,
//           threadId: message.threadId,
//           emailFrom: getHeaderValue(payload.headers, 'From'),
//           subject: getHeaderValue(payload.headers, 'Subject'),
//           sentTime,
//           body: await getBodyContent(payload, accessToken),
//         };

//         emails.push(email);
//       }
//     }
//     return { emails, newNextPageToken: newNextPageToken };
//   } catch (error) {
//     console.error('Error fetching emails:', error);
//   }
// };

export const fetchTodaysMails = async (type, userEmail, accessToken) => {
  try {
    console.log("Fetching todays emails...", type);
    const emails = [];

    const currentDate = new Date(); // Get the current date
    currentDate.setHours(0, 0, 0, 0); // Set the time to the start of the day

    const res = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages`,
      {
        params: {
          labelIds: type, // Specify the category
          q: `after:${
            currentDate.getTime() / 1000
          } -category:social -category:promotions`, // Filter emails after the current date
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { messages, nextPageToken: newNextPageToken } = res.data;

    if (messages && messages.length > 0) {
      for (const message of messages) {
        const messageRes = await axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages/${message.id}`,
          {
            params: {
              format: "full", // Retrieve full email content
            },
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const { payload } = messageRes.data;
        const sentTime = new Date(
          getHeaderValue(payload.headers, "Date")
        ).toISOString();

        const email = {
          id: message.id,
          threadId: message.threadId,
          emailFrom: getHeaderValue(payload.headers, "From"),
          subject: getHeaderValue(payload.headers, "Subject"),
          sentTime,
          body: await getBodyContent(payload),
        };

        emails.push(email);
      }
    }
    return { emails, newNextPageToken: newNextPageToken };
  } catch (error) {
    console.error("Error fetching emails:", error);
  }
};

export const markEmailAsRead = async (userEmail, messageId, accessToken) => {
  try {
    await axios.post(
      `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages/${messageId}/modify`,
      {
        removeLabelIds: ["UNREAD"], // Remove the UNREAD label to mark the email as read
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error marking email as read:", error);
  }
};

const getHeaderValue = (headers, headerName) => {
  const header = headers.find(
    (h) => h.name.toLowerCase() === headerName.toLowerCase()
  );
  return header ? header.value : "";
};

const getBodyContent = (payload) => {
  let bodyContent = "";

  if (payload.parts && payload.parts.length > 0) {
    const mixedPart = payload.mimeType === "multipart/mixed" ? payload : null;
    if (mixedPart && mixedPart.parts && mixedPart.parts.length > 0) {
      const alternativePart = mixedPart.parts.find((part) => {
        return part.mimeType === "multipart/alternative";
      });
      if(alternativePart) {
        const content = getAlternativePart(alternativePart);
        bodyContent += content;
      } else {
        const htmlPart = mixedPart.parts.find((part) => {
          return part.mimeType === "text/html";
        });
        const textPart = mixedPart.parts.find((part) => {
          return part.mimeType === "text/plain";
        });

        if(htmlPart) {
          const decodeHtml = decodeBase64String(htmlPart.body.data)
          bodyContent += decodeHtml;
        } else if (textPart) {
          const decodeHtml = decodeBase64String(textPart.body.data)
          bodyContent += decodeHtml; 
        }
      }
    }
    const alternativePart = payload.mimeType === "multipart/alternative" ? payload : null;
    if (alternativePart && alternativePart.parts && alternativePart.parts.length > 0) {
      const content = getAlternativePart(alternativePart);
      bodyContent += content;
    }
  }
  if (!bodyContent && payload.body && payload.body.data) {
    bodyContent += decodeBase64String(payload.body.data);
  }
  return bodyContent;
};

const getAlternativePart = (payload) => {
  let content = "";
  if (payload && payload.parts && payload.parts.length > 0) {
    const textPart = payload.parts.find((part) => part.mimeType === "text/plain");
    const htmlPart = payload.parts.find((part) => part.mimeType === "text/html");
    if (
      textPart &&
      textPart.body &&
      textPart.body.data &&
      textPart.body.data.length > 0 &&
      htmlPart &&
      htmlPart.body &&
      htmlPart.body.data &&
      htmlPart.body.data.length > 0
    ) {
      const decodeText = decodeBase64String(textPart.body.data);
      const decodeHtml = decodeBase64String(htmlPart.body.data);
      content += decodeText + ' HTML:START ' + decodeHtml;
    }
  }
  return content;
};

const decodeBase64String = (base64String) => {
  const buffer = Buffer.from(base64String, "base64");
  return buffer?.toString("utf8");
};

const getAttachment = async (
  userId,
  messageId,
  attachmentId,
  accessToken,
  fName
) => {
  try {
    const response = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${messageId}/attachments/${attachmentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const attachmentData = response.data.data;
    const dataBase64Rep = attachmentData.replace(/-/g, "+").replace(/_/g, "/");
    const attachmentUri = `${FileSystem.documentDirectory}${fName.replace(/\s/g, '_')}`;
    
    await FileSystem.writeAsStringAsync(attachmentUri, dataBase64Rep, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const { exists } = await FileSystem.getInfoAsync(attachmentUri);
    if (exists) {
      return {
        uri: attachmentUri,
        name: attachmentId,
      };
    } else {
      console.error("Failed to download attachment: File does not exist");
      return null;
    }
  } catch (error) {
    console.error("Error fetching attachment:", error);
    return null;
  }
};

export const getNewAccessToken = async (refreshToken: string) => {
  try {
    const clientId =
      "973384691133-1kb68sbmsuhev2q77ldm4ovk3r652gph.apps.googleusercontent.com";
    const clientSecret = "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";
    const refreshTokenUrl = "https://oauth2.googleapis.com/token";

    const response = await axios.post(refreshTokenUrl, {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    });

    const { access_token: accessToken, expires_in: expiresIn } = response.data;

    return { accessToken, expiresIn };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
};

export const sendEmail = async (
  userEmail,
  accessToken,
  recipientEmail,
  subject,
  body,
  attachments
) => {
  try {
    console.log("Sending email...");

    const formattedBody = `<div style="width: 100%; padding: 10px; margin: 0;">
      <pre style="width: 100%; white-space: pre-wrap; word-wrap: break-word; font-family: Arial, sans-serif; font-size: 14px; user-scalable: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; margin: 0;">${body.trim()}</pre>
    </div>`;

    let message = {
      raw: Buffer.from(
        `From: ${userEmail}\r\n` +
          `To: ${recipientEmail}\r\n` +
          `Subject: ${subject}\r\n` +
          `Content-Type: text/html; charset=utf-8\r\n\r\n` +
          `${formattedBody}`
      ).toString("base64"),
    };

    if (attachments && attachments.length > 0) {
      const attachmentSections = [];

      for (const attachment of attachments) {
        const { name } = attachment;
        const fileUri = attachment.uri;

        attachmentSections.push(
          `--boundary\r\n` +
            `Content-Type: application/octet-stream\r\n` +
            `Content-Disposition: attachment; filename="${name}"\r\n` +
            `Content-Transfer-Encoding: base64\r\n\r\n` +
            `${fileUri}\r\n`
        );
      }

      const attachmentSectionsStr = attachmentSections.join("");

      message = {
        raw: Buffer.from(
          `From: ${userEmail}\r\n` +
            `To: ${recipientEmail}\r\n` +
            `Subject: ${subject}\r\n` +
            `Content-Type: multipart/mixed; boundary="boundary"\r\n\r\n` +
            `--boundary\r\n` +
            `Content-Type: text/html; charset=utf-8\r\n\r\n` +
            `${formattedBody}\r\n\r\n` +
            attachmentSectionsStr +
            `--boundary--`
        ).toString("base64"),
      };
    }

    const res = await axios.post(
      `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages/send`,
      message,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

const readDocumentFile = async (fileUri) => {
  try {
    const { exists } = await FileSystem.getInfoAsync(fileUri);
    if (!exists) {
      console.error("File does not exist");
      return null;
    }
    console.log(exists);
    const fileData = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return fileData;
  } catch (error) {
    console.error("Error reading document file:", error);
    return null;
  }
};

export const fetchUnasnweredEmails = async (type, userEmail, accessToken) => {
  try {
    console.log("Fetching emails...", type);
    const emails = [];

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const res = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages`,
      {
        params: {
          labelIds: type,
          q: `after:${
            currentDate.getTime() / 1000
          } -category:social -category:promotions`,
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { messages, nextPageToken: newNextPageToken } = res.data;

    if (messages && messages.length > 0) {
      for (const message of messages) {
        const messageRes = await axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages/${message.id}`,
          {
            params: {
              format: "full",
            },
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const { payload } = messageRes.data;
        const sentTime = new Date(
          getHeaderValue(payload.headers, "Date")
        ).toISOString();

        // Check if the email has been replied to
        const isReplied = await checkIfEmailReplied(
          userEmail,
          message.threadId,
          accessToken
        );

        if (!isReplied) {
          const email = {
            id: message.id,
            threadId: message.threadId,
            emailFrom: getHeaderValue(payload.headers, "From"),
            subject: getHeaderValue(payload.headers, "Subject"),
            sentTime,
            body: await getBodyContent(payload),
          };

          emails.push(email);
        }
      }
    }
    return { emails, newNextPageToken: newNextPageToken };
  } catch (error) {
    console.error("Error fetching emails:", error);
  }
};

// Helper function to check if an email has been replied to
const checkIfEmailReplied = async (userEmail, threadId, accessToken) => {
  try {
    const res = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/threads/${threadId}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { messages } = res.data;

    // Check if any message in the thread has a 'REPLY' label
    const replied = messages.some((message) => {
      return message.labelIds.includes("REPLY");
    });

    return replied;
  } catch (error) {
    console.error("Error checking email replied status:", error);
    return false;
  }
};

export const getTodaysUnreadEmails = async (type, userEmail, accessToken) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const res = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages`,
      {
        params: {
          labelIds: type,
          q: `is:unread after:${
            currentDate.getTime() / 1000
          } -category:social -category:promotions`,
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { messages } = res.data;

    const unreadEmails = [];

    if (messages && messages.length > 0) {
      for (const message of messages) {
        const messageRes = await axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages/${message.id}`,
          {
            params: {
              format: "full",
            },
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const { payload } = messageRes.data;
        const sentTime = new Date(
          getHeaderValue(payload.headers, "Date")
        ).toISOString();

        const email = {
          id: message.id,
          threadId: message.threadId,
          emailFrom: getHeaderValue(payload.headers, "From"),
          subject: getHeaderValue(payload.headers, "Subject"),
          sentTime,
          body: await getBodyContent(payload),
        };

        unreadEmails.push(email);
      }
    }

    return unreadEmails;
  } catch (error) {
    console.error("Error fetching unread emails:", error);
    return [];
  }
};

export const fetchLatestEmails = async (type, userEmail, accessToken) => {
  try {
    const res = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages`,
      {
        params: {
          labelIds: type,
          maxResults: 10, // Maximum number of results to retrieve
          q: "-category:social -category:promotions",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { messages } = res.data;
    const unreadEmails = [];

    // Process the new emails
    if (messages && messages.length > 0) {
      for (const message of messages) {
        const messageRes = await axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages/${message.id}`,
          {
            params: {
              format: "full",
            },
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const { payload } = messageRes.data;
        const sentTime = new Date(
          getHeaderValue(payload.headers, "Date")
        ).toISOString();

        const email = {
          id: message.id,
          threadId: message.threadId,
          emailFrom: getHeaderValue(payload.headers, "From"),
          subject: getHeaderValue(payload.headers, "Subject"),
          sentTime,
          body: await getBodyContent(payload),
        };

        unreadEmails.push(email);
      }
    }

    return unreadEmails;
  } catch (error) {
    console.error("Error fetching new emails:", error);
  }
};
