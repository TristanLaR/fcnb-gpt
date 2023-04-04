import * as fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

interface Row {
    name: string;
    url: string;
    title: string;
}

export function findRowByName(name: string): Promise<{ url: string; title: string; } | null> {
    return new Promise<{ url: string, title: string }>((resolve, reject) => {
    const results: Row[] = [];

    const metadata = path.resolve('./data', "metadata.csv");

    fs.createReadStream(metadata)
        .pipe(csv())
        .on('data', (data: Row) => results.push(data))
        .on('end', () => {
            const row = results.find((r) => r.name === name);

            if (row) {
                // console.log("Found row: ", row);
                resolve({ url: row.url, title: row.title });
            } else {
                console.log("No row found for name: ", name);
                reject();
            }
        })
        .on('error', (err) => {
            reject(err);
        });
    });
}