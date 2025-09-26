import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.resolve(__dirname, '..', '..', '..', 'data', 'messages.json');

export const messageController = {
  async getMessages(req, res) {
    try {
      const content = await fs.readFile(dataFilePath, 'utf-8');
      const data = JSON.parse(content);
      res.json(data);
    } catch (err) {
      console.error('Failed to read messages.json', err);
      res.status(500).json({ error: 'Failed to load messages' });
    }
  },

  async createMessage(req, res) {
    try {
      const newRecord = req.body;
      const content = await fs.readFile(dataFilePath, 'utf-8');
      const data = JSON.parse(content);
      data.push(newRecord);
      await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
      res.status(201).json(newRecord);
    } catch (err) {
      console.error('Failed to write messages.json', err);
      res.status(500).json({ error: 'Failed to save message' });
    }
  }
};
