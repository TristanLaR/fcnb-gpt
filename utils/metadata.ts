import * as fs from 'fs';
import csv from 'csv-parser';

interface Row {
    name: string;
    url: string;
    title: string;
}

export async function findRowByName(name: string): Promise<{ url: string; title: string; } | null> {
    const results: Row[] = [];

    fs.createReadStream('/Users/trilar/Documents/development/projects/fcnb-gpt/data/metadata.csv')
        .pipe(csv())
        .on('data', (data: Row) => results.push(data))
        .on('end', () => {
            const row = results.find((r) => r.name === name);

            if (row) {
                console.log("Found row: ", row);
                return { url: row.url, title: row.title };
            } else {
                console.log("No row found for name: ", name);
                return null;
            }
        });
    return null;
}