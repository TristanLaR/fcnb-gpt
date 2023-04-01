import * as redis from 'redis';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';

interface Metadata {
  source: string;
}

interface CsvRecord {
  name: string;
  url: string;
  title: string;
}

interface Document {
  metadata: Metadata;
  pageContent: string;
  // other properties
}

const redisClient = redis.createClient();

function getUrlAndTitle(document: Document, csvFilePath: string, callback: (err: Error | null, result: { url: string, title: string } | null) => void): void {
  const metadata = document.metadata;
  if (!metadata || !metadata.source) {
    return callback(new Error('Invalid metadata'), null);
  }

  // First, try to retrieve the data from Redis
  const redisKey = `document:${metadata.source}`;
  redisClient.get(redisKey, (err, redisResult) => {
    if (err) {
      return callback(err, null);
    }

    if (redisResult) {
      // If the data is found in Redis, return it
      const result = JSON.parse(redisResult);
      return callback(null, result);
    }

    // If the data is not found in Redis, read it from the CSV file
    const csvData: CsvRecord[] = [];
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (data: CsvRecord) => csvData.push(data))
      .on('end', () => {
        const matchingRecord = csvData.find(record => record.name === metadata.source);
        if (matchingRecord) {
          // If a matching record is found, store it in Redis for future use and return it
          const result = { url: matchingRecord.url, title: matchingRecord.title };
          redisClient.set(redisKey, JSON.stringify(result), (redisErr) => {
            if (redisErr) {
              console.error(`Error storing data in Redis: ${redisErr}`);
            }
          });
          return callback(null, result);
        } else {
          // If no matching record is found, return null
          return callback(null, null);
        }
      });
  });
}
