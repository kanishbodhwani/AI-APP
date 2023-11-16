import axios from 'axios';
import {API_URL} from "../constants/urls";

const apikey = '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';

interface Quote {
    quote: string;
    author: string;
}

export const getRandomQuote = async (): Promise<Quote> => {
    const prompt = 'Give me a random motivational quote for businessman and reply me in the format, quote: quote and by: name of person who said it.';
    const response = await axios.post(
        API_URL,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + apikey,
          },
        }
    );
    const res = response.data.choices[0].message["content"];
    const quoteStartIndex = res.indexOf('"'); // Find the index of the opening quotation mark
    const quoteEndIndex = res.lastIndexOf('"'); // Find the index of the closing quotation mark
    
    // Extract the quote using substring
    const quote = res.substring(quoteStartIndex + 1, quoteEndIndex);
    
    const byStartIndex = res.lastIndexOf(':') + 1; // Find the index where the author's name starts
    const author = res.substring(byStartIndex).trim();
    return {quote, author};
}