import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

console.log('OpenAI API Key:', process.env.NEXT_PUBLIC_OPEN_AI_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: any): Promise<{ fields: any; files: any }> => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = './uploads';
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        reject(err);
      }
      resolve({ fields, files });
    });
  });
};

export async function POST(req: Request) {
  try {
    const { fields, files } = await parseForm(req);
    const { framework } = fields;
    const file = files.file;

    if (!file || !framework) {
      throw new Error('File or framework not provided');
    }

    console.log('File uploaded:', file);
    console.log('Framework selected:', framework);

    const filePath = file.filepath;
    const fileData = fs.readFileSync(filePath);
    const base64File = fileData.toString('base64');

    const prompt = `Convert the following design into ${framework} code:\n\n${base64File}`;

    const { text } = await generateText({
      model: openai('gpt-4-turbo'),
      prompt,
    });

    console.log('Generated text:', text);

    fs.unlinkSync(filePath);

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    if (error.response) {
      // API-specific error
      const errorData = await error.response.json();
      console.error('OpenAI API Error:', errorData);
      return new Response(JSON.stringify({ message: 'OpenAI API Error', details: errorData }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      // General error
      return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }
}